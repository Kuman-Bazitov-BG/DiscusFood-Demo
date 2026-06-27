import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

interface Stats {
  products: number
  orders: number
  pendingReviews: number
  openReturns: number
  coupons: number
  giftCards: number
  lowStock: number
}

const EMPTY: Stats = {
  products: 0,
  orders: 0,
  pendingReviews: 0,
  openReturns: 0,
  coupons: 0,
  giftCards: 0,
  lowStock: 0,
}

// Count rows for a table with an optional filter, using a HEAD request.
async function count(
  table: string,
  filter?: (q: any) => any,
): Promise<number> {
  let query: any = supabase.from(table).select('*', { count: 'exact', head: true })
  if (filter) query = filter(query)
  const { count: c } = await query
  return c ?? 0
}

export function Dashboard() {
  const [stats, setStats] = useState<Stats>(EMPTY)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    Promise.all([
      count('products'),
      count('orders'),
      count('reviews', (q) => q.eq('status', 'pending')),
      count('returns', (q) => q.in('status', ['requested', 'approved', 'received'])),
      count('coupons', (q) => q.eq('is_active', true)),
      count('gift_cards', (q) => q.eq('status', 'active')),
      count('products', (q) => q.lte('stock', 5)),
    ])
      .then(([products, orders, pendingReviews, openReturns, coupons, giftCards, lowStock]) => {
        if (active)
          setStats({ products, orders, pendingReviews, openReturns, coupons, giftCards, lowStock })
      })
      .catch(() => {/* keep zeros */})
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [])

  const cards = [
    { label: 'Products', value: stats.products, to: '/admin/products', icon: '🐟' },
    { label: 'Orders', value: stats.orders, to: '/admin/orders', icon: '🧾' },
    { label: 'Low stock', value: stats.lowStock, to: '/admin/inventory', icon: '📦', warn: stats.lowStock > 0 },
    { label: 'Pending reviews', value: stats.pendingReviews, to: '/admin/reviews', icon: '💬', warn: stats.pendingReviews > 0 },
    { label: 'Open returns', value: stats.openReturns, to: '/admin/returns', icon: '↩️', warn: stats.openReturns > 0 },
    { label: 'Active coupons', value: stats.coupons, to: '/admin/coupons', icon: '🏷️' },
    { label: 'Active gift cards', value: stats.giftCards, to: '/admin/gift-cards', icon: '🎁' },
  ]

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-white">Dashboard</h1>
      <p className="mt-1 text-sm text-slate-400">
        Overview of your store. {loading ? 'Loading live data…' : 'Live from your database.'}
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Link
            key={c.label}
            to={c.to}
            className="rounded-2xl border border-white/10 bg-slate-900/50 p-5 transition hover:border-cyan-400/40 hover:bg-slate-900"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-400">{c.label}</span>
              <span aria-hidden="true">{c.icon}</span>
            </div>
            <div
              className={`mt-2 text-3xl font-extrabold ${
                c.warn ? 'text-amber-300' : 'text-white'
              }`}
            >
              {c.value}
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-8 rounded-2xl border border-white/10 bg-slate-900/50 p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
          Getting started
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-slate-300">
          Use the sidebar to manage your catalog, sales and marketing. Add your
          first products and categories, then configure shipping and coupons.
          Stripe payments and order management come online as the next phases
          land.
        </p>
      </div>
    </div>
  )
}
