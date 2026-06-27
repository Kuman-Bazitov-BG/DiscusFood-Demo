// ─────────────────────────────────────────────────────────────
//  Discus Fish DEMO seed.
//  1) Imports the real catalog (categories + products + shipping + coupons)
//     from supabase/seed-data/*.json, preserving IDs so links stay intact.
//  2) Generates SAMPLE orders / order_items / payments / reviews with
//     entirely FAKE customer data (no real personal data) so the admin
//     panel looks populated for the portfolio demo.
//
//  Run AFTER applying the schema migrations to the demo Supabase project:
//    node scripts/seed-demo.mjs
//
//  Credentials: reads SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY from the
//  environment, falling back to server/.env (service role bypasses RLS).
// ─────────────────────────────────────────────────────────────
import { createClient } from '@supabase/supabase-js'
import { readFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const root = join(here, '..')
const seedDir = join(root, 'supabase', 'seed-data')

function fromServerEnv(key) {
  const p = join(root, 'server', '.env')
  if (!existsSync(p)) return undefined
  for (const line of readFileSync(p, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z_]+)\s*=\s*(.*)\s*$/)
    if (m && m[1] === key) return m[2].replace(/^["']|["']$/g, '')
  }
}

const URL = process.env.SUPABASE_URL || fromServerEnv('SUPABASE_URL')
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || fromServerEnv('SUPABASE_SERVICE_ROLE_KEY')
if (!URL || !KEY || URL.includes('your-') || KEY.includes('your-')) {
  console.error('ERROR: set SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY (env or server/.env)')
  process.exit(1)
}
const sb = createClient(URL, KEY, { auth: { persistSession: false } })
const read = (f) => JSON.parse(readFileSync(join(seedDir, f), 'utf8'))

async function must(label, p) {
  const { error } = await p
  if (error) { console.error(`  ${label}: ${error.message}`); throw error }
  console.log(`  ${label}: ok`)
}

// ── 1. Catalog (clear migration's base seed, then import the real catalog) ──
console.log('Importing catalog…')
// Clear sample/transactional rows first (idempotent re-seed). Deleting the
// demo orders cascades to their order_items; payments/reviews cleared directly.
await sb.from('reviews').delete().like('author_name', 'Demo:%')
await sb.from('payments').delete().neq('id', '00000000-0000-0000-0000-000000000000')
await sb.from('orders').delete().like('stripe_session_id', 'demo_seed_%')
// Reset catalog tables (demo only — safe).
await sb.from('shipping_methods').delete().neq('id', '00000000-0000-0000-0000-000000000000')
await sb.from('shipping_zones').delete().neq('id', '00000000-0000-0000-0000-000000000000')
await sb.from('products').delete().neq('id', '00000000-0000-0000-0000-000000000000')
await sb.from('categories').delete().neq('id', '00000000-0000-0000-0000-000000000000')
await sb.from('coupons').delete().neq('id', '00000000-0000-0000-0000-000000000000')

await must('categories', sb.from('categories').insert(read('categories.json')))
await must('products', sb.from('products').insert(read('products.json')))
await must('shipping_zones', sb.from('shipping_zones').insert(read('shipping_zones.json')))
await must('shipping_methods', sb.from('shipping_methods').insert(read('shipping_methods.json')))
await must('coupons', sb.from('coupons').insert(read('coupons.json')))

// ── 2. Sample transactional data (FAKE customers) ──
console.log('Generating sample orders + reviews (fake data)…')
const products = read('products.json').filter((p) => p.is_active && !p.is_coming_soon && p.price_cents > 0)
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)]
const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1))

const FAKE_CUSTOMERS = [
  ['Alex Rivers', 'alex.rivers@example.com', 'Berlin', 'DE'],
  ['Maria Costa', 'maria.costa@example.com', 'Lisbon', 'PT'],
  ['Liam Walsh', 'liam.walsh@example.com', 'Dublin', 'IE'],
  ['Sofia Rossi', 'sofia.rossi@example.com', 'Milan', 'IT'],
  ['Noah Meyer', 'noah.meyer@example.com', 'Vienna', 'AT'],
  ['Elena Popova', 'elena.popova@example.com', 'Sofia', 'BG'],
  ['Hugo Martin', 'hugo.martin@example.com', 'Lyon', 'FR'],
  ['Ana Garcia', 'ana.garcia@example.com', 'Madrid', 'ES'],
]
const FULFILLMENT = ['unfulfilled', 'processing', 'shipped', 'delivered']

let madeOrders = 0
let madeItems = 0
for (let i = 1; i <= 14; i++) {
  const [name, email, city, country] = pick(FAKE_CUSTOMERS)
  const nItems = rnd(1, 3)
  const chosen = Array.from({ length: nItems }, () => pick(products))
  let subtotal = 0
  const itemRows = chosen.map((p) => {
    const q = rnd(1, 2)
    subtotal += p.price_cents * q
    return { name: p.name, product_id: p.id, unit_price_cents: p.price_cents, quantity: q }
  })
  const shipping = subtotal >= 3500 ? 0 : 490
  const total = subtotal + shipping
  const daysAgo = rnd(1, 60)
  const created = new Date(Date.now() - daysAgo * 86400000).toISOString()

  const { data: order, error: oErr } = await sb
    .from('orders')
    .insert({
      stripe_session_id: `demo_seed_${i}`,
      email,
      amount_total_cents: total,
      subtotal_cents: subtotal,
      shipping_cents: shipping,
      currency: 'eur',
      status: 'paid',
      fulfillment_status: pick(FULFILLMENT),
      ship_name: name,
      ship_city: city,
      ship_country: country,
      created_at: created,
    })
    .select('id')
    .single()
  if (oErr) { console.error('  order:', oErr.message); continue }

  await sb.from('order_items').insert(itemRows.map((r) => ({ ...r, order_id: order.id })))
  await sb.from('payments').insert({
    order_id: order.id,
    amount_cents: total,
    currency: 'eur',
    status: 'succeeded',
    method: 'card',
    created_at: created,
  })
  madeOrders++
  madeItems += itemRows.length
}
console.log(`  orders: ${madeOrders}, order_items: ${madeItems}`)

const COMMENTS = [
  'My discus love this — colours really popped after two weeks.',
  'Great quality, low waste, fish go crazy for it.',
  'Fast shipping and the granules do not cloud the water.',
  'Switched my whole tank to this. Highly recommended.',
  'Good value. Will order again.',
  'Noticeable growth in my juveniles.',
]
let madeReviews = 0
for (let i = 0; i < 10; i++) {
  const p = pick(products)
  const [name] = pick(FAKE_CUSTOMERS)
  const { error } = await sb.from('reviews').insert({
    product_id: p.id,
    author_name: `Demo: ${name}`,
    rating: rnd(4, 5),
    comment: pick(COMMENTS),
    status: 'approved',
  })
  if (!error) madeReviews++
}
console.log(`  reviews: ${madeReviews}`)

console.log('\nDEMO SEED COMPLETE.')
