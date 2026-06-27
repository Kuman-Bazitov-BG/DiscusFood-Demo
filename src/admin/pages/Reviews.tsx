import { useEffect, useState } from 'react'
import { fetchAll, updateRow, deleteRow, fmtDate } from '../lib/adminApi'
import {
  PageHeader,
  ErrorNote,
  Card,
  Pill,
  TableState,
  btnSmall,
  tableCls,
  theadCls,
  thCls,
  tbodyCls,
  trCls,
} from '../components/ui'
import { PageSearch } from '../components/PageSearch'
import { useQuery, matchQuery } from '../lib/pageQuery'

interface Review {
  id: string
  author_name: string | null
  rating: number
  comment: string
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
  product_id: string
  products: { name: string } | null
}

const stars = (n: number) => '★'.repeat(n) + '☆'.repeat(5 - n)

export function Reviews() {
  const [rows, setRows] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')
  const [q, setQ] = useQuery()

  async function refresh() {
    setLoading(true)
    try {
      const data = await fetchAll<Review>(
        'reviews',
        'id, author_name, rating, comment, status, created_at, product_id, products(name)',
        { col: 'created_at', asc: false },
      )
      setRows(data)
      setError('')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load')
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    refresh()
  }, [])

  async function setStatus(r: Review, status: Review['status']) {
    try {
      await updateRow('reviews', r.id, { status })
      setRows((list) => list.map((x) => (x.id === r.id ? { ...x, status } : x)))
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Update failed')
    }
  }
  async function remove(r: Review) {
    if (!confirm('Delete this review?')) return
    try {
      await deleteRow('reviews', r.id)
      setRows((list) => list.filter((x) => x.id !== r.id))
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Delete failed')
    }
  }

  const shown = rows.filter(
    (r) =>
      (filter === 'all' || r.status === filter) &&
      matchQuery(q, [r.comment, r.author_name, r.products?.name]),
  )

  return (
    <div>
      <PageHeader
        icon="💬"
        title="Comments & Reviews"
        description="Moderate customer comments left after their orders. Only approved reviews show in the store."
        action={<PageSearch q={q} setQ={setQ} placeholder="Search comments…" />}
      />
      <ErrorNote msg={error} />
      <div className="mb-4 flex gap-2">
        {(['all', 'pending', 'approved', 'rejected'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold capitalize ${
              filter === f ? 'bg-cyan-400 text-slate-900' : 'border border-white/15 text-slate-300'
            }`}
          >
            {f}
          </button>
        ))}
      </div>
      <Card>
        <table className={tableCls}>
          <thead className={theadCls}>
            <tr>
              <th className={thCls}>Product</th>
              <th className={thCls}>Rating</th>
              <th className={thCls}>Comment</th>
              <th className={thCls}>Status</th>
              <th className={`${thCls} text-right`}>Actions</th>
            </tr>
          </thead>
          <tbody className={tbodyCls}>
            {loading ? (
              <TableState colSpan={5} text="Loading…" />
            ) : shown.length === 0 ? (
              <TableState colSpan={5} text="No reviews here yet." />
            ) : (
              shown.map((r) => (
                <tr key={r.id} className={trCls}>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-white">{r.products?.name ?? '—'}</div>
                    <div className="text-xs text-slate-500">
                      {r.author_name ?? 'Anonymous'} · {fmtDate(r.created_at)}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-amber-300">{stars(r.rating)}</td>
                  <td className="max-w-xs px-4 py-3 text-slate-300">{r.comment}</td>
                  <td className="px-4 py-3">
                    {r.status === 'approved' ? (
                      <Pill tone="green">Approved</Pill>
                    ) : r.status === 'rejected' ? (
                      <Pill tone="rose">Rejected</Pill>
                    ) : (
                      <Pill tone="amber">Pending</Pill>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {r.status !== 'approved' && (
                      <button className={`${btnSmall} text-emerald-300`} onClick={() => setStatus(r, 'approved')}>
                        Approve
                      </button>
                    )}
                    {r.status !== 'rejected' && (
                      <button className={`${btnSmall} ml-2 text-amber-300`} onClick={() => setStatus(r, 'rejected')}>
                        Reject
                      </button>
                    )}
                    <button className={`${btnSmall} ml-2 text-rose-300`} onClick={() => remove(r)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>
    </div>
  )
}
