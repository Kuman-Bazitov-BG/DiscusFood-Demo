/**
 * Database seeder — `npm run db:seed`
 *
 * Creates sample auth users and fills the major commerce tables with enough
 * realistic data to exercise queries, joins and indexes.
 *
 * Idempotent: re-running first removes the data it previously created (users by
 * their known emails, and rows tagged with the `seed_` / `SEED-` markers) and
 * then recreates a fresh dataset, so you always get a clean, consistent state.
 *
 * Requires a real SUPABASE_SERVICE_ROLE_KEY (and DATABASE_URL) in server/.env —
 * the service-role client bypasses RLS and can manage auth users.
 *
 * Run:  npm run db:seed
 */
import { supabaseAdmin } from '../src/lib/supabase.js'

const PASSWORD = 'pass123'

// The accounts requested for development/testing.
const NAMED_USERS = [
  { email: 'steve@gmail.com', username: 'steve' },
  { email: 'peter@gmail.com', username: 'peter' },
  { email: 'dave@gmail.com', username: 'dave' },
  { email: 'john@gmail.com', username: 'john' },
  { email: 'nick@gmail.com', username: 'nick' },
]
const NUMBERED_USERS = Array.from({ length: 9 }, (_, i) => ({
  email: `user${i + 1}@gmail.com`,
  username: `user${i + 1}`,
}))
const SAMPLE_USERS = [...NAMED_USERS, ...NUMBERED_USERS]

// Volume of generated commerce data.
const ORDER_COUNT = 160
const REVIEW_COUNT = 120
const GIFT_CARD_COUNT = 12

// A couple of users get a full business profile to exercise that flow.
const BUSINESS_PROFILES: Record<
  string,
  {
    company_name: string
    vat_number: string
    registration_number: string
    contact_name: string
    phone: string
    billing_email: string
    address_line1: string
    city: string
    state: string
    postal_code: string
    country: string
  }
> = {
  'steve@gmail.com': {
    company_name: 'Stevenson Aquatics Ltd',
    vat_number: 'GB123456789',
    registration_number: 'CRN-8842017',
    contact_name: 'Steve Stevenson',
    phone: '+44 20 7946 0991',
    billing_email: 'billing@stevensonaquatics.co.uk',
    address_line1: '14 Wharf Road',
    city: 'London',
    state: 'England',
    postal_code: 'N1 7GR',
    country: 'United Kingdom',
  },
  'peter@gmail.com': {
    company_name: 'AquaPeter GmbH',
    vat_number: 'DE298765432',
    registration_number: 'HRB-220155',
    contact_name: 'Peter Bauer',
    phone: '+49 30 901820',
    billing_email: 'rechnung@aquapeter.de',
    address_line1: 'Friedrichstraße 12',
    city: 'Berlin',
    state: 'Berlin',
    postal_code: '10117',
    country: 'Germany',
  },
}

// ── small helpers ───────────────────────────────────────────────────────────
const randInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min
const pick = <T>(arr: T[]): T => arr[randInt(0, arr.length - 1)]
const chance = (p: number) => Math.random() < p
const daysAgo = (n: number) =>
  new Date(Date.now() - n * 86_400_000).toISOString()

function sampleMany<T>(arr: T[], n: number): T[] {
  const copy = [...arr]
  const out: T[] = []
  while (copy.length && out.length < n) {
    out.push(copy.splice(randInt(0, copy.length - 1), 1)[0])
  }
  return out
}

function die(label: string, error: { message: string } | null) {
  if (error) {
    console.error(`✗ ${label}: ${error.message}`)
    process.exit(1)
  }
}

// ── users ───────────────────────────────────────────────────────────────────
async function findUserIdByEmail(email: string): Promise<string | null> {
  // Auth admin has no get-by-email, so page through the directory.
  for (let page = 1; page <= 50; page++) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({
      page,
      perPage: 200,
    })
    if (error) return null
    const match = data.users.find(
      (u) => u.email?.toLowerCase() === email.toLowerCase(),
    )
    if (match) return match.id
    if (data.users.length < 200) break
  }
  return null
}

async function ensureUsers(): Promise<Record<string, string>> {
  const ids: Record<string, string> = {}

  for (const u of SAMPLE_USERS) {
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: u.email,
      password: PASSWORD,
      email_confirm: true,
      user_metadata: { username: u.username },
    })

    if (error) {
      // Already exists → reuse the account (keeps the seeder idempotent).
      if (/already|registered|exists/i.test(error.message)) {
        const existing = await findUserIdByEmail(u.email)
        if (!existing) die(`resolve existing user ${u.email}`, error)
        ids[u.email] = existing!
        console.log(`• user exists ${u.email}`)
        continue
      }
      die(`create user ${u.email}`, error)
    }

    ids[u.email] = data.user!.id
    console.log(`✓ created user ${u.email}`)
  }

  // Promote a couple of accounts to full business profiles.
  for (const [email, biz] of Object.entries(BUSINESS_PROFILES)) {
    if (!ids[email]) continue
    const { error } = await supabaseAdmin
      .from('profiles')
      .update({ account_type: 'business', email, ...biz })
      .eq('id', ids[email])
    die(`set business profile ${email}`, error)
  }

  return ids
}

// ── cleanup of previous seed data ────────────────────────────────────────────
async function cleanupPreviousSeed(userIds: string[]) {
  // Find orders we created previously (tagged via stripe_session_id).
  const { data: seedOrders } = await supabaseAdmin
    .from('orders')
    .select('id')
    .like('stripe_session_id', 'seed_%')
  const orderIds = (seedOrders ?? []).map((o) => o.id as string)

  if (orderIds.length) {
    // Delete children first in case FKs aren't ON DELETE CASCADE.
    for (const table of ['invoices', 'payments', 'shipments', 'order_items']) {
      await supabaseAdmin.from(table).delete().in('order_id', orderIds)
    }
    await supabaseAdmin.from('orders').delete().in('id', orderIds)
  }

  // Reviews + returns belonging to the seeded users.
  if (userIds.length) {
    await supabaseAdmin.from('reviews').delete().in('user_id', userIds)
  }

  // Marker-tagged marketing rows.
  await supabaseAdmin.from('gift_cards').delete().like('code', 'SEED-%')
  await supabaseAdmin.from('coupons').delete().like('code', 'SEED-%')
}

// ── commerce data ────────────────────────────────────────────────────────────
async function seedCommerce(userIds: Record<string, string>) {
  const userIdList = Object.values(userIds)

  // Reference data needed to build realistic rows.
  const { data: products, error: prodErr } = await supabaseAdmin
    .from('products')
    .select('id, name, price_cents, currency')
    .eq('is_active', true)
    .eq('is_coming_soon', false)
  die('load products', prodErr)
  if (!products?.length) {
    console.error('✗ no buyable products found — add products before seeding.')
    process.exit(1)
  }

  const { data: methods } = await supabaseAdmin
    .from('shipping_methods')
    .select('id, price_cents, free_over_cents')
    .eq('is_active', true)

  const countries = ['Cyprus', 'Germany', 'Greece', 'France', 'United Kingdom']
  const firstNames = ['Maria', 'Georgios', 'Elena', 'Nikos', 'Sofia', 'Andreas']
  const lastNames = ['Papadopoulos', 'Müller', 'Dubois', 'Smith', 'Ivanova']

  // Coupons (marker-tagged).
  await supabaseAdmin.from('coupons').insert([
    {
      code: 'SEED-SUMMER15',
      description: 'Seed: 15% summer discount',
      discount_type: 'percent',
      value: 15,
      min_order_cents: 2000,
      is_active: true,
    },
    {
      code: 'SEED-SHIPFREE',
      description: 'Seed: €5 off',
      discount_type: 'fixed',
      value: 500,
      is_active: true,
    },
  ])

  // Gift cards (marker-tagged).
  const giftCards = Array.from({ length: GIFT_CARD_COUNT }, (_, i) => {
    const initial = pick([2000, 2500, 5000, 10000])
    return {
      code: `SEED-GC-${String(i + 1).padStart(4, '0')}`,
      initial_balance_cents: initial,
      balance_cents: chance(0.3) ? randInt(0, initial) : initial,
      currency: 'eur',
      status: 'active',
    }
  })
  await supabaseAdmin.from('gift_cards').insert(giftCards)

  // Orders + items (+ payment/invoice/shipment for paid ones).
  const fulfilments = ['unfulfilled', 'processing', 'shipped', 'delivered']
  let createdOrders = 0
  let createdItems = 0

  for (let i = 0; i < ORDER_COUNT; i++) {
    const userId = chance(0.85) ? pick(userIdList) : null // some guest orders
    const created = daysAgo(randInt(0, 180))
    const lineProducts = sampleMany(products, randInt(1, 4))

    const items = lineProducts.map((p) => ({
      product_id: p.id,
      name: p.name,
      unit_price_cents: p.price_cents,
      quantity: randInt(1, 3),
    }))
    const subtotal = items.reduce(
      (s, it) => s + it.unit_price_cents * it.quantity,
      0,
    )
    const method = methods?.length ? pick(methods) : null
    const shipping =
      method && method.free_over_cents && subtotal >= method.free_over_cents
        ? 0
        : (method?.price_cents ?? 490)
    const total = subtotal + shipping

    const paid = chance(0.8)
    const fulfilment = paid ? pick(fulfilments) : 'unfulfilled'
    const fname = pick(firstNames)
    const lname = pick(lastNames)

    const { data: orderRows, error: orderErr } = await supabaseAdmin
      .from('orders')
      .insert({
        stripe_session_id: `seed_${crypto.randomUUID()}`,
        stripe_payment_intent_id: paid ? `pi_seed_${crypto.randomUUID()}` : null,
        email: `${fname}.${lname}@example.com`.toLowerCase(),
        amount_total_cents: total,
        subtotal_cents: subtotal,
        shipping_cents: shipping,
        currency: 'eur',
        status: paid ? 'paid' : 'pending',
        fulfillment_status: fulfilment,
        user_id: userId,
        shipping_method_id: method?.id ?? null,
        ship_name: `${fname} ${lname}`,
        ship_address1: `${randInt(1, 200)} Harbor Street`,
        ship_city: pick(['Limassol', 'Berlin', 'Athens', 'Paris', 'London']),
        ship_postal_code: String(randInt(10000, 99999)),
        ship_country: pick(countries),
        created_at: created,
      })
      .select('id')
      .single()
    die('insert order', orderErr)
    const orderId = orderRows!.id as string

    const { error: itemsErr } = await supabaseAdmin
      .from('order_items')
      .insert(items.map((it) => ({ ...it, order_id: orderId })))
    die('insert order_items', itemsErr)

    if (paid) {
      await supabaseAdmin.from('payments').insert({
        order_id: orderId,
        stripe_payment_intent_id: `pi_seed_${crypto.randomUUID()}`,
        amount_cents: total,
        currency: 'eur',
        status: 'succeeded',
        method: 'card',
        created_at: created,
      })
      await supabaseAdmin.from('invoices').insert({
        order_id: orderId,
        total_cents: total,
        currency: 'eur',
        issued_at: created,
      })
      if (fulfilment === 'shipped' || fulfilment === 'delivered') {
        await supabaseAdmin.from('shipments').insert({
          order_id: orderId,
          carrier: 'UPS',
          tracking_number: `1Z${randInt(10 ** 9, 10 ** 10 - 1)}`,
          shipped_at: created,
          delivered_at: fulfilment === 'delivered' ? daysAgo(randInt(0, 3)) : null,
        })
      }
    }

    createdOrders++
    createdItems += items.length
  }

  // Reviews — only from logged-in sample users, mostly approved.
  const reviews = Array.from({ length: REVIEW_COUNT }, () => {
    const product = pick(products)
    return {
      product_id: product.id,
      user_id: pick(userIdList),
      rating: randInt(3, 5),
      comment: pick([
        'My discus love this — great colour boost.',
        'Fast delivery, fish are thriving.',
        'Good quality, will reorder.',
        'Noticeable difference within a week.',
        'Solid staple food at a fair price.',
      ]),
      status: chance(0.8) ? 'approved' : 'pending',
      created_at: daysAgo(randInt(0, 150)),
    }
  })
  const { error: revErr } = await supabaseAdmin.from('reviews').insert(reviews)
  die('insert reviews', revErr)

  return { createdOrders, createdItems, reviews: reviews.length }
}

// ── main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log('Seeding database…\n')

  const userIds = await ensureUsers()
  console.log(`\n${Object.keys(userIds).length} sample users ready.\n`)

  await cleanupPreviousSeed(Object.values(userIds))
  const stats = await seedCommerce(userIds)

  console.log('\n──────────── seed complete ────────────')
  console.log(`users:        ${SAMPLE_USERS.length} (password: ${PASSWORD})`)
  console.log(`orders:       ${stats.createdOrders}`)
  console.log(`order_items:  ${stats.createdItems}`)
  console.log(`reviews:      ${stats.reviews}`)
  console.log(`gift_cards:   ${GIFT_CARD_COUNT}`)
  console.log('coupons:      2  (SEED-SUMMER15, SEED-SHIPFREE)')
  console.log('───────────────────────────────────────')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
