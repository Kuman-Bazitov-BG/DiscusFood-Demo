// Supabase Edge Function: Stripe webhook. On checkout.session.completed it
// records the order + line items. Replaces the old Express /api/webhooks route.
// Deploy with verify_jwt = false (Stripe does not send a Supabase JWT).
import Stripe from 'npm:stripe@17'
import { createClient } from 'npm:@supabase/supabase-js@2'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
  apiVersion: '2025-06-30.basil',
})
const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') ?? ''

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
)

Deno.serve(async (req) => {
  const signature = req.headers.get('stripe-signature')
  if (!signature) return new Response('Missing stripe-signature', { status: 400 })

  const rawBody = await req.text()
  let event: Stripe.Event
  try {
    // Async variant uses the Web Crypto API (required in Deno).
    event = await stripe.webhooks.constructEventAsync(rawBody, signature, webhookSecret)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Invalid signature'
    return new Response(`Webhook Error: ${message}`, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    try {
      await recordOrder(event.data.object as Stripe.Checkout.Session)
    } catch (e) {
      console.error('recordOrder failed:', e)
      return new Response('Failed to record order', { status: 500 })
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
})

async function recordOrder(session: Stripe.Checkout.Session) {
  let cart: Array<{ id: string; q: number }> = []
  try { cart = JSON.parse(session.metadata?.cart ?? '[]') } catch { cart = [] }

  let billing: Record<string, string> | null = null
  try {
    billing = session.metadata?.billing ? JSON.parse(session.metadata.billing) : null
  } catch { billing = null }

  const userId = session.metadata?.userId ?? null

  // Idempotency: skip if this Stripe session is already recorded.
  const { data: existing } = await supabase
    .from('orders')
    .select('id')
    .eq('stripe_session_id', session.id)
    .maybeSingle()
  if (existing) return

  const paymentIntentId =
    typeof session.payment_intent === 'string'
      ? session.payment_intent
      : (session.payment_intent?.id ?? null)

  const { data: order, error: orderErr } = await supabase
    .from('orders')
    .insert({
      stripe_session_id: session.id,
      stripe_payment_intent_id: paymentIntentId,
      email: session.customer_details?.email ?? null,
      amount_total_cents: session.amount_total ?? 0,
      currency: session.currency ?? 'eur',
      status: 'paid',
      user_id: userId,
      billing_company: billing?.company ?? null,
      billing_vat_number: billing?.vatNumber ?? null,
      billing_registration_number: billing?.registrationNumber || null,
      billing_contact_name: billing?.contactName || null,
      billing_phone: billing?.phone || null,
      billing_email: billing?.email || null,
      billing_address1: billing?.address1 || null,
      billing_address2: billing?.address2 || null,
      billing_city: billing?.city || null,
      billing_state: billing?.state || null,
      billing_postal_code: billing?.postalCode || null,
      billing_country: billing?.country || null,
    })
    .select('id')
    .single()
  if (orderErr) throw orderErr

  const ids = cart.map((c) => c.id)
  if (ids.length === 0) return
  const { data: productRows } = await supabase
    .from('products')
    .select('id, name, price_cents')
    .in('id', ids)
  const byId = new Map((productRows ?? []).map((p) => [p.id, p]))

  const lineRows = cart
    .map((c) => {
      const p = byId.get(c.id)
      if (!p) return null
      return {
        order_id: order.id,
        product_id: p.id,
        name: p.name,
        unit_price_cents: p.price_cents,
        quantity: c.q,
      }
    })
    .filter((r): r is NonNullable<typeof r> => r !== null)

  if (lineRows.length) {
    const { error: itemsErr } = await supabase.from('order_items').insert(lineRows)
    if (itemsErr) throw itemsErr
  }
}
