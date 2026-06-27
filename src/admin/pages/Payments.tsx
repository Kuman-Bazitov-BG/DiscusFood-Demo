import { useEffect, useState } from 'react'
import { fetchAll, updateRow, fmtDate } from '../lib/adminApi'
import { formatPrice } from '../../lib/format'
import {
  PageHeader,
  ErrorNote,
  Card,
  Pill,
  TableState,
  fieldCls,
  tableCls,
  theadCls,
  thCls,
  tbodyCls,
  trCls,
} from '../components/ui'
import { PageSearch } from '../components/PageSearch'
import { useQuery, matchQuery } from '../lib/pageQuery'

type PayStatus = 'pending' | 'succeeded' | 'failed' | 'refunded' | 'partially_refunded'

interface Payment {
  id: string
  created_at: string
  amount_cents: number
  amount_refunded_cents: number
  currency: string
  status: PayStatus
  method: string | null
  stripe_payment_intent_id: string | null
  order_id: string | null
  orders: { order_number: string | null } | null
}

const STATUSES: PayStatus[] = ['pending', 'succeeded', 'failed', 'refunded', 'partially_refunded']
const tone = (s: PayStatus) =>
  s === 'succeeded' ? 'green' : s === 'failed' ? 'rose' : s.includes('refund') ? 'amber' : 'slate'

export function Payments() {
  const [rows, setRows] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [q, setQ] = useQuery()

  async function refresh() {
    setLoading(true)
    try {
      setRows(
        await fetchAll<Payment>(
          'payments',
          '*, orders(order_number)',
          { col: 'created_at', asc: false },
        ),
      )
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

  async function setStatus(p: Payment, status: PayStatus) {
    try {
      await updateRow('payments', p.id, { status })
      setRows((list) => list.map((x) => (x.id === p.id ? { ...x, status } : x)))
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Update failed')
    }
  }

  const shown = rows.filter((p) =>
    matchQuery(q, [
      p.orders?.order_number,
      p.stripe_payment_intent_id,
      p.method,
      p.status,
    ]),
  )

  return (
    <div>
      <PageHeader
        icon="💳"
        title="Order Payments"
        description="Stripe payment records. These are created automatically by the payment webhook; you can reconcile status here."
        action={<PageSearch q={q} setQ={setQ} placeholder="Search payments…" />}
      />
      <ErrorNote msg={error} />
      <Card>
        <table className={tableCls}>
          <thead className={theadCls}>
            <tr>
              <th className={thCls}>Date</th>
              <th className={thCls}>Order</th>
              <th className={thCls}>Amount</th>
              <th className={thCls}>Refunded</th>
              <th className={thCls}>Stripe intent</th>
              <th className={thCls}>Status</th>
            </tr>
          </thead>
          <tbody className={tbodyCls}>
            {loading ? (
              <TableState colSpan={6} text="Loading…" />
            ) : shown.length === 0 ? (
              <TableState colSpan={6} text={q ? 'No matching payments.' : 'No payments yet.'} />
            ) : (
              shown.map((p) => (
                <tr key={p.id} className={trCls}>
                  <td className="px-4 py-3 text-slate-300">{fmtDate(p.created_at)}</td>
                  <td className="px-4 py-3 text-slate-300">
                    {p.orders?.order_number ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-slate-200">
                    {formatPrice(p.amount_cents, p.currency)}
                  </td>
                  <td className="px-4 py-3 text-slate-400">
                    {p.amount_refunded_cents ? formatPrice(p.amount_refunded_cents, p.currency) : '—'}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-500">
                    {p.stripe_payment_intent_id ?? '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Pill tone={tone(p.status) as 'green' | 'rose' | 'amber' | 'slate'}>
                        {p.status}
                      </Pill>
                      <select
                        className={`${fieldCls} w-auto py-1 text-xs`}
                        value={p.status}
                        onChange={(e) => setStatus(p, e.target.value as PayStatus)}
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>
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
