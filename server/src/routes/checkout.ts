import { Router } from 'express'
import { z } from 'zod'
import { inArray } from 'drizzle-orm'
import { db } from '../db/index.js'
import { products } from '../db/schema.js'
import { stripe } from '../lib/stripe.js'
import { env } from '../env.js'

export const checkoutRouter = Router()

const billingInput = z.object({
  company: z.string().trim().min(1).max(200),
  vatNumber: z.string().trim().min(1).max(64),
  registrationNumber: z.string().trim().max(64).optional().default(''),
  contactName: z.string().trim().max(200).optional().default(''),
  phone: z.string().trim().max(64).optional().default(''),
  email: z.string().trim().email().max(200).optional().or(z.literal('')),
  address1: z.string().trim().max(200).optional().default(''),
  address2: z.string().trim().max(200).optional().default(''),
  city: z.string().trim().max(120).optional().default(''),
  state: z.string().trim().max(120).optional().default(''),
  postalCode: z.string().trim().max(32).optional().default(''),
  country: z.string().trim().max(120).optional().default(''),
})

const checkoutInput = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().uuid(),
        quantity: z.number().int().positive().max(99),
      }),
    )
    .min(1),
  // Optional: logged-in customer + business billing details for invoicing.
  userId: z.string().uuid().optional(),
  email: z.string().trim().email().max(200).optional(),
  billing: billingInput.optional(),
})

// --- Public: create a Stripe Checkout session (guest checkout) ---
// Prices come from the DB, never the client, so they can't be tampered with.
checkoutRouter.post('/', async (req, res) => {
  const parsed = checkoutInput.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: z.flattenError(parsed.error) })
  }
  const { items, userId, email, billing } = parsed.data

  const ids = items.map((i) => i.productId)
  const rows = await db
    .select()
    .from(products)
    .where(inArray(products.id, ids))

  const byId = new Map(rows.map((p) => [p.id, p]))

  const lineItems: Array<{
    price_data: {
      currency: string
      unit_amount: number
      product_data: { name: string }
    }
    quantity: number
  }> = []

  for (const item of items) {
    const product = byId.get(item.productId)
    if (!product || !product.isActive) {
      return res
        .status(400)
        .json({ error: `Product unavailable: ${item.productId}` })
    }
    lineItems.push({
      price_data: {
        currency: product.currency,
        unit_amount: product.priceCents,
        product_data: { name: product.name },
      },
      quantity: item.quantity,
    })
  }

  // Carry the customer + billing snapshot through to the webhook via metadata.
  const metadata: Record<string, string> = {
    cart: JSON.stringify(items.map((i) => ({ id: i.productId, q: i.quantity }))),
  }
  if (userId) metadata.userId = userId
  if (billing) metadata.billing = JSON.stringify(billing)

  const customerEmail = email || billing?.email || undefined

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: lineItems,
    success_url: `${env.CLIENT_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${env.CLIENT_URL}/cart`,
    ...(customerEmail ? { customer_email: customerEmail } : {}),
    billing_address_collection: 'required',
    // Generate a Stripe invoice with the company's tax details on it.
    ...(billing
      ? {
          invoice_creation: {
            enabled: true,
            invoice_data: {
              custom_fields: [
                { name: 'Company', value: billing.company.slice(0, 30) },
                { name: 'VAT / Tax ID', value: billing.vatNumber.slice(0, 30) },
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

  res.json({ id: session.id, url: session.url })
})
