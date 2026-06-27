import { supabase } from '../../lib/supabase'

// ── Searchable admin categories ──────────────────────────────────────
export type AdminCat =
  | 'reviews'
  | 'orders'
  | 'payments'
  | 'shipments'
  | 'invoices'
  | 'returns'
  | 'products'
  | 'inventory'
  | 'coupons'
  | 'offers'
  | 'giftcards'

export interface CatMeta {
  key: AdminCat
  label: string
  icon: string
  to: string
}

/** The categories exposed as filters (order matters for display). */
export const SEARCH_CATS: CatMeta[] = [
  { key: 'products', label: 'Products', icon: '🐟', to: '/admin/products' },
  { key: 'inventory', label: 'Stock & Inventory', icon: '📦', to: '/admin/inventory' },
  { key: 'reviews', label: 'Comments & Reviews', icon: '💬', to: '/admin/reviews' },
  { key: 'orders', label: 'Manage Orders', icon: '🧾', to: '/admin/orders' },
  { key: 'payments', label: 'Order Payments', icon: '💳', to: '/admin/payments' },
  { key: 'shipments', label: 'Track Orders', icon: '🚚', to: '/admin/tracking' },
  { key: 'invoices', label: 'Invoices', icon: '📄', to: '/admin/invoices' },
  { key: 'returns', label: 'Returns', icon: '↩️', to: '/admin/returns' },
  { key: 'coupons', label: 'Coupons', icon: '🏷️', to: '/admin/coupons' },
  { key: 'offers', label: 'Offers', icon: '✨', to: '/admin/offers' },
  { key: 'giftcards', label: 'Gift Cards', icon: '🎁', to: '/admin/gift-cards' },
]

const CAT_BY_KEY = Object.fromEntries(SEARCH_CATS.map((c) => [c.key, c])) as Record<
  AdminCat,
  CatMeta
>

export interface SearchHit {
  cat: AdminCat
  id: string
  title: string
  subtitle: string
  /** Section page this hit belongs to (with the query pre-filled). */
  to: string
}

export interface SearchGroup extends CatMeta {
  hits: SearchHit[]
}

// ── helpers ──────────────────────────────────────────────────────────
const trunc = (s: string, n = 60) =>
  s.length > n ? `${s.slice(0, n).trimEnd()}…` : s

type OrderLite = {
  id: string
  order_number: string | null
  ship_name: string | null
  billing_company: string | null
  billing_contact_name: string | null
  email: string | null
}

/** Embedded one-to-one order on related rows (PostgREST returns an object). */
type EmbeddedOrder = {
  order_number: string | null
  ship_name: string | null
  billing_company: string | null
} | null

type ReviewRow = {
  id: string
  author_name: string | null
  comment: string | null
  products: { name: string | null } | null
}
type AttachedRow = { id: string; order_id: string; orders: EmbeddedOrder }
type ShipmentRow = AttachedRow & {
  carrier: string | null
  tracking_number: string | null
}
type InvoiceRow = AttachedRow & { invoice_number: string }
type ReturnRow = AttachedRow & { reason: string | null }

type ProductRow = {
  id: string
  name: string
  slug: string | null
  sku: string | null
  stock: number | null
  low_stock_threshold: number | null
}
type CouponRow = { id: string; code: string; description: string | null }
type OfferRow = { id: string; title: string; description: string | null }
type GiftCardRow = {
  id: string
  code: string
  recipient_email: string | null
  note: string | null
  status: string | null
}

const orderName = (o?: Partial<OrderLite> | null): string =>
  o?.billing_company ||
  o?.ship_name ||
  o?.billing_contact_name ||
  o?.email ||
  o?.order_number ||
  'Order'

const orderTitle = (o?: { order_number?: string | null; id?: string } | null) =>
  `Order #${o?.order_number ?? o?.id?.slice(0, 8) ?? '—'}`

const linkTo = (cat: AdminCat, q: string) =>
  `${CAT_BY_KEY[cat].to}?q=${encodeURIComponent(q)}`

/**
 * Cross-entity admin search.
 *
 * Strategy: first find the orders whose customer/company/number matches the
 * term, then surface those orders plus everything attached to them (payments,
 * shipments, invoices, returns) — as well as direct field matches on each
 * entity (e.g. a carrier called "ABC Transport", an invoice number, a review
 * comment). Returns at most `perCat` hits per category.
 */
export async function searchAdmin(
  rawTerm: string,
  opts: { cats?: AdminCat[]; perCat?: number } = {},
): Promise<SearchGroup[]> {
  const term = rawTerm.trim()
  if (!term) return []

  const perCat = opts.perCat ?? 5
  const active = new Set<AdminCat>(
    opts.cats && opts.cats.length ? opts.cats : SEARCH_CATS.map((c) => c.key),
  )

  // PostgREST `or` filters are comma-separated, so strip characters that would
  // break the filter grammar before interpolating.
  const safe = term.replace(/[%,().*]/g, ' ').trim()
  if (!safe) return []
  const like = `%${safe}%`

  // Orders are the hub: needed directly and as parents of the other entities.
  const needOrders =
    active.has('orders') ||
    active.has('payments') ||
    active.has('shipments') ||
    active.has('invoices') ||
    active.has('returns')

  let matchedOrders: OrderLite[] = []
  if (needOrders) {
    const { data } = await supabase
      .from('orders')
      .select(
        'id, order_number, ship_name, billing_company, billing_contact_name, email',
      )
      .or(
        [
          `order_number.ilike.${like}`,
          `ship_name.ilike.${like}`,
          `billing_company.ilike.${like}`,
          `billing_contact_name.ilike.${like}`,
          `email.ilike.${like}`,
        ].join(','),
      )
      .limit(50)
    matchedOrders = (data ?? []) as OrderLite[]
  }
  const orderIds = matchedOrders.map((o) => o.id)
  const inOrders = orderIds.length ? `order_id.in.(${orderIds.join(',')})` : ''

  const groups = new Map<AdminCat, SearchHit[]>()
  const tasks: Promise<void>[] = []

  // Comments & Reviews — direct text match on author/comment.
  if (active.has('reviews')) {
    tasks.push(
      (async () => {
        const { data } = await supabase
          .from('reviews')
          .select('id, author_name, comment, products(name)')
          .or(`author_name.ilike.${like},comment.ilike.${like}`)
          .limit(perCat)
        const hits = ((data ?? []) as unknown as ReviewRow[]).map((r): SearchHit => {
          const product = r.products?.name ? ` · ${r.products.name}` : ''
          return {
            cat: 'reviews',
            id: r.id,
            title: r.comment ? `“${trunc(r.comment)}”` : '(no comment)',
            subtitle: `${r.author_name ?? 'Anonymous'}${product}`,
            to: linkTo('reviews', term),
          }
        })
        groups.set('reviews', hits)
      })(),
    )
  }

  // Manage Orders — straight from the matched orders.
  if (active.has('orders')) {
    const hits = matchedOrders.slice(0, perCat).map(
      (o): SearchHit => ({
        cat: 'orders',
        id: o.id,
        title: orderTitle(o),
        subtitle: orderName(o),
        to: linkTo('orders', term),
      }),
    )
    groups.set('orders', hits)
  }

  // Helper for the order-attached entities.
  const attached = (
    cat: AdminCat,
    table: string,
    ownFilters: string[],
    build: (row: AttachedRow) => { title: string; subtitle: string },
  ) => {
    tasks.push(
      (async () => {
        const filters = [...ownFilters]
        if (inOrders) filters.push(inOrders)
        if (!filters.length) {
          groups.set(cat, [])
          return
        }
        const { data } = await supabase
          .from(table)
          .select(
            'id, order_id, orders(order_number, ship_name, billing_company)',
          )
          .or(filters.join(','))
          .limit(perCat)
        const hits = ((data ?? []) as unknown as AttachedRow[]).map((row): SearchHit => {
          const built = build(row)
          return {
            cat,
            id: row.id,
            title: built.title,
            subtitle: built.subtitle,
            to: linkTo(cat, term),
          }
        })
        groups.set(cat, hits)
      })(),
    )
  }

  if (active.has('payments')) {
    attached(
      'payments',
      'payments',
      [`stripe_payment_intent_id.ilike.${like}`, `method.ilike.${like}`],
      (row) => ({
        title: `Payment · ${orderTitle(row.orders)}`,
        subtitle: orderName(row.orders),
      }),
    )
  }

  if (active.has('shipments')) {
    // Re-select to include carrier/tracking for display.
    tasks.push(
      (async () => {
        const filters = [`carrier.ilike.${like}`, `tracking_number.ilike.${like}`]
        if (inOrders) filters.push(inOrders)
        const { data } = await supabase
          .from('shipments')
          .select(
            'id, carrier, tracking_number, order_id, orders(order_number, ship_name, billing_company)',
          )
          .or(filters.join(','))
          .limit(perCat)
        const hits = ((data ?? []) as unknown as ShipmentRow[]).map((row): SearchHit => ({
          cat: 'shipments',
          id: row.id,
          title: orderTitle(row.orders),
          subtitle: orderName(row.orders) || row.carrier || 'Shipment',
          to: linkTo('shipments', term),
        }))
        groups.set('shipments', hits)
      })(),
    )
  }

  if (active.has('invoices')) {
    tasks.push(
      (async () => {
        const filters = [`invoice_number.ilike.${like}`]
        if (inOrders) filters.push(inOrders)
        const { data } = await supabase
          .from('invoices')
          .select(
            'id, invoice_number, order_id, orders(order_number, ship_name, billing_company)',
          )
          .or(filters.join(','))
          .limit(perCat)
        const hits = ((data ?? []) as unknown as InvoiceRow[]).map((row): SearchHit => ({
          cat: 'invoices',
          id: row.id,
          title: `Invoice #${row.invoice_number}`,
          subtitle: orderName(row.orders),
          to: linkTo('invoices', term),
        }))
        groups.set('invoices', hits)
      })(),
    )
  }

  if (active.has('returns')) {
    tasks.push(
      (async () => {
        const filters = [`reason.ilike.${like}`]
        if (inOrders) filters.push(inOrders)
        const { data } = await supabase
          .from('returns')
          .select(
            'id, reason, order_id, orders(order_number, ship_name, billing_company)',
          )
          .or(filters.join(','))
          .limit(perCat)
        const hits = ((data ?? []) as unknown as ReturnRow[]).map((row): SearchHit => ({
          cat: 'returns',
          id: row.id,
          title: `Return · ${orderTitle(row.orders)}`,
          subtitle: row.reason ? trunc(row.reason) : orderName(row.orders),
          to: linkTo('returns', term),
        }))
        groups.set('returns', hits)
      })(),
    )
  }

  // Products + Stock & Inventory share the products table.
  if (active.has('products') || active.has('inventory')) {
    tasks.push(
      (async () => {
        const { data } = await supabase
          .from('products')
          .select('id, name, slug, sku, stock, low_stock_threshold')
          .or(`name.ilike.${like},slug.ilike.${like},sku.ilike.${like}`)
          .limit(perCat)
        const products = (data ?? []) as unknown as ProductRow[]
        if (active.has('products')) {
          groups.set(
            'products',
            products.map((p): SearchHit => ({
              cat: 'products',
              id: p.id,
              title: p.name,
              subtitle: p.sku ? `SKU ${p.sku}` : (p.slug ?? '—'),
              to: linkTo('products', term),
            })),
          )
        }
        if (active.has('inventory')) {
          groups.set(
            'inventory',
            products.map((p): SearchHit => {
              const stock = p.stock ?? 0
              const low =
                p.low_stock_threshold != null && stock <= p.low_stock_threshold
              return {
                cat: 'inventory',
                id: p.id,
                title: p.name,
                subtitle: `Stock: ${stock}${low ? ' · low' : ''}`,
                to: linkTo('inventory', term),
              }
            }),
          )
        }
      })(),
    )
  }

  if (active.has('coupons')) {
    tasks.push(
      (async () => {
        const { data } = await supabase
          .from('coupons')
          .select('id, code, description')
          .or(`code.ilike.${like},description.ilike.${like}`)
          .limit(perCat)
        groups.set(
          'coupons',
          ((data ?? []) as unknown as CouponRow[]).map((c): SearchHit => ({
            cat: 'coupons',
            id: c.id,
            title: `Coupon ${c.code}`,
            subtitle: c.description || '—',
            to: linkTo('coupons', term),
          })),
        )
      })(),
    )
  }

  if (active.has('offers')) {
    tasks.push(
      (async () => {
        const { data } = await supabase
          .from('offers')
          .select('id, title, description')
          .or(`title.ilike.${like},description.ilike.${like}`)
          .limit(perCat)
        groups.set(
          'offers',
          ((data ?? []) as unknown as OfferRow[]).map((o): SearchHit => ({
            cat: 'offers',
            id: o.id,
            title: `Offer · ${o.title}`,
            subtitle: o.description || '—',
            to: linkTo('offers', term),
          })),
        )
      })(),
    )
  }

  if (active.has('giftcards')) {
    tasks.push(
      (async () => {
        const { data } = await supabase
          .from('gift_cards')
          .select('id, code, recipient_email, note, status')
          .or(
            `code.ilike.${like},recipient_email.ilike.${like},note.ilike.${like}`,
          )
          .limit(perCat)
        groups.set(
          'giftcards',
          ((data ?? []) as unknown as GiftCardRow[]).map((g): SearchHit => ({
            cat: 'giftcards',
            id: g.id,
            title: `Gift card ${g.code}`,
            subtitle: g.recipient_email || g.note || g.status || '—',
            to: linkTo('giftcards', term),
          })),
        )
      })(),
    )
  }

  await Promise.all(tasks)

  // Preserve the canonical category order; drop empty groups.
  return SEARCH_CATS.filter((c) => active.has(c.key))
    .map((c) => ({ ...c, hits: groups.get(c.key) ?? [] }))
    .filter((g) => g.hits.length > 0)
}

// ── recent searches (localStorage) ───────────────────────────────────
const RECENT_KEY = 'admin.recentSearches'
const RECENT_MAX = 6

export function getRecentSearches(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_KEY)
    return raw ? (JSON.parse(raw) as string[]) : []
  } catch {
    return []
  }
}

export function addRecentSearch(term: string): void {
  const t = term.trim()
  if (!t) return
  const next = [t, ...getRecentSearches().filter((s) => s.toLowerCase() !== t.toLowerCase())].slice(
    0,
    RECENT_MAX,
  )
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(next))
  } catch {
    /* ignore quota / private-mode errors */
  }
}

export function clearRecentSearches(): void {
  try {
    localStorage.removeItem(RECENT_KEY)
  } catch {
    /* ignore */
  }
}
