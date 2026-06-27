import { Router } from 'express'
import type Stripe from 'stripe'
import { inArray } from 'drizzle-orm'
import { db } from '../db/index.js'
import { products, orders, orderItems } from '../db/schema.js'
import { stripe } from '../lib/stripe.js'
import { env } from '../env.js'

export const webhookRouter = Router()

// NOTE: this router is mounted with `express.raw()` in index.ts, so `req.body`
// is the raw Buffer required for Stripe signature verification.
webhookRouter.post('/', async (req, res) => {
  const signature = req.headers['stripe-signature']
  if (!signature) return res.status(400).send('Missing stripe-signature')

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(
      req.body as Buffer,
      signature,
      env.STRIPE_WEBHOOK_SECRET,
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Invalid signature'
    return res.status(400).send(`Webhook Error: ${message}`)
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object
    await recordOrder(session)
  }

  res.json({ received: true })
})

async function recordOrder(session: Stripe.Checkout.Session) {
  // Parse the compact cart snapshot we stored at checkout time.
  let cart: Array<{ id: string; q: number }> = []
  try {
    cart = JSON.parse(session.metadata?.cart ?? '[]')
  } catch {
    cart = []
  }

  // Optional business billing snapshot stored at checkout time.
  let billing: Record<string, string> | null = null
  try {
    billing = session.metadata?.billing
      ? JSON.parse(session.metadata.billing)
      : null
  } catch {
    billing = null
  }
  const userId = session.metadata?.userId ?? null

  const ids = cart.map((c) => c.id)
  const productRows = ids.length
    ? await db.select().from(products).where(inArray(products.id, ids))
    : []
  const byId = new Map(productRows.map((p) => [p.id, p]))

  await db.transaction(async (tx) => {
    const [order] = await tx
      .insert(orders)
      .values({
        stripeSessionId: session.id,
        stripePaymentIntentId:
          typeof session.payment_intent === 'string'
            ? session.payment_intent
            : (session.payment_intent?.id ?? null),
        email: session.customer_details?.email ?? null,
        amountTotalCents: session.amount_total ?? 0,
        currency: session.currency ?? 'usd',
        status: 'paid',
        userId,
        billingCompany: billing?.company ?? null,
        billingVatNumber: billing?.vatNumber ?? null,
        billingRegistrationNumber: billing?.registrationNumber || null,
        billingContactName: billing?.contactName || null,
        billingPhone: billing?.phone || null,
        billingEmail: billing?.email || null,
        billingAddress1: billing?.address1 || null,
        billingAddress2: billing?.address2 || null,
        billingCity: billing?.city || null,
        billingState: billing?.state || null,
        billingPostalCode: billing?.postalCode || null,
        billingCountry: billing?.country || null,
      })
      .onConflictDoNothing({ target: orders.stripeSessionId })
      .returning()

    // If the order already existed (duplicate webhook), stop here.
    if (!order) return

    const lineRows = cart
      .map((c) => {
        const product = byId.get(c.id)
        if (!product) return null
        return {
          orderId: order.id,
          productId: product.id,
          name: product.name,
          unitPriceCents: product.priceCents,
          quantity: c.q,
        }
      })
      .filter((r): r is NonNullable<typeof r> => r !== null)

    if (lineRows.length) {
      await tx.insert(orderItems).values(lineRows)
    }
  })
}
