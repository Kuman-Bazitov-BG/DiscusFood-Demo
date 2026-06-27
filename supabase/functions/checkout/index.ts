// Supabase Edge Function: create a Stripe Checkout session (guest checkout).
// Replaces the old Express /api/checkout route. Prices come from the DB via the
// service-role client, never from the client, so they can't be tampered with.
import Stripe from 'npm:stripe@17'
import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders, json } from '../_shared/cors.ts'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
  apiVersion: '2025-06-30.basil',
})

// SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY are injected automatically by the
// Edge runtime. Service role bypasses RLS (server-trusted price lookup).
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
)

interface CartItem { productId: string; quantity: number }

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405)

  try {
    const body = await req.json().catch(() => ({}))
    const items: CartItem[] = Array.isArray(body.items) ? body.items : []
    if (items.length === 0) return json({ error: 'No items' }, 400)

    const ids = items.map((i) => i.productId)
    const { data: rows, error } = await supabase
      .from('products')
      .select('id, name, price_cents, currency, is_active')
      .in('id', ids)
    if (error) throw error

    const byId = new Map((rows ?? []).map((p) => [p.id, p]))
    const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = []
    for (const item of items) {
      const p = byId.get(item.productId)
      if (!p || !p.is_active) {
        return json({ error: `Product unavailable: ${item.productId}` }, 400)
      }
      const qty = Math.min(Math.max(1, Math.floor(item.quantity) || 1), 99)
      line_items.push({
        price_data: {
          currency: p.currency,
          unit_amount: p.price_cents,
          product_data: { name: p.name },
        },
        quantity: qty,
      })
    }

    // Carry the cart + optional billing snapshot to the webhook via metadata.
    const metadata: Record<string, string> = {
      cart: JSON.stringify(items.map((i) => ({ id: i.productId, q: i.quantity }))),
    }
    if (body.userId) metadata.userId = String(body.userId)
    if (body.billing) metadata.billing = JSON.stringify(body.billing)

    const origin = req.headers.get('origin') ?? Deno.env.get('CLIENT_URL') ?? ''
    const customerEmail = body.email || body.billing?.email || undefined
    const billing = body.billing

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items,
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/cart`,
      ...(customerEmail ? { customer_email: customerEmail } : {}),
      billing_address_collection: 'required',
      ...(billing
        ? {
            invoice_creation: {
              enabled: true,
              invoice_data: {
                custom_fields: [
                  { name: 'Company', value: String(billing.company ?? '').slice(0, 30) },
                  { name: 'VAT / Tax ID', value: String(billing.vatNumber ?? '').slice(0, 30) },
                ],
                footer: billing.registrationNumber
                  ? `Company registration: ${billing.registrationNumber}`
                  : undefined,
              },
            },
          }
        : {}),
      metadata,
    })

    return json({ id: session.id, url: session.url })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Checkout failed'
    return json({ error: message }, 500)
  }
})
