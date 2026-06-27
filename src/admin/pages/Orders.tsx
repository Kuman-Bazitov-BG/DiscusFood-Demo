import { useEffect, useState } from 'react'
import { fetchAll, updateRow, fmtDate } from '../lib/adminApi'
import { formatPrice } from '../../lib/format'
import {
  PageHeader,
  ErrorNote,
  Card,
  Pill,
  Modal,
  Field,
  TableState,
  fieldCls,
  btnPrimary,
  btnGhost,
  btnSmall,
  tableCls,
  theadCls,
  thCls,
  tbodyCls,
  trCls,
} from '../components/ui'
import { PageSearch } from '../components/PageSearch'
import { useQuery, matchQuery } from '../lib/pageQuery'

type Fulfillment = 'unfulfilled' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned'

interface OrderItem {
  name: string
  quantity: number
  unit_price_cents: number
}
interface Order {
  id: string
  order_number: string | null
  created_at: string
  email: string | null
  currency: string
  status: string
  fulfillment_status: Fulfillment
  amount_total_cents: number
  subtotal_cents: number
  shipping_cents: number
  discount_cents: number
  tax_cents: number
  ship_name: string | null
  ship_address1: string | null
  ship_address2: string | null
  ship_city: string | null
  ship_postal_code: string | null
  ship_country: string | null
  admin_note: string | null
  order_items: OrderItem[]
}

const FULFILL: Fulfillment[] = [
  'unfulfilled',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
  'returned',
]

const payTone = (s: string) =>
  s === 'paid' ? 'green' : s === 'failed' ? 'rose' : 'amber'

export function Orders() {
  const [rows, setRows] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [open, setOpen] = useState<Order | null>(null)
  const [q, setQ] = useQuery()

  async function refresh() {
    setLoading(true)
    try {
      const data = await fetchAll<Order>(
        'orders',
        '*, order_items(name, quantity, unit_price_cents)',
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

  const shown = rows.filter((o) =>
    matchQuery(q, [
      o.order_number,
      o.email,
      o.ship_name,
      o.status,
      o.fulfillment_status,
    ]),
  )

  return (
    <div>
      <PageHeader
        icon="🧾"
        title="Manage Orders"
        description="View and process customer orders. Orders appear here once checkout is live."
        action={<PageSearch q={q} setQ={setQ} placeholder="Search orders…" />}
      />
      <ErrorNote msg={error} />
      <Card>
        <table className={tableCls}>
          <thead className={theadCls}>
            <tr>
              <th className={thCls}>Order</th>
              <th className={thCls}>Customer</th>
              <th className={thCls}>Total</th>
              <th className={thCls}>Payment</th>
              <th className={thCls}>Fulfillment</th>
              <th className={`${thCls} text-right`}>Actions</th>
            </tr>
          </thead>
          <tbody className={tbodyCls}>
            {loading ? (
              <TableState colSpan={6} text="Loading…" />
            ) : shown.length === 0 ? (
              <TableState colSpan={6} text={q ? 'No matching orders.' : 'No orders yet.'} />
            ) : (
              shown.map((o) => (
                <tr key={o.id} className={trCls}>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-white">{o.order_number ?? o.id.slice(0, 8)}</div>
                    <div className="text-xs text-slate-500">{fmtDate(o.created_at)}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-300">{o.email ?? '—'}</td>
                  <td className="px-4 py-3 text-slate-200">
                    {formatPrice(o.amount_total_cents, o.currency)}
                  </td>
                  <td className="px-4 py-3">
                    <Pill tone={payTone(o.status) as 'green' | 'rose' | 'amber'}>{o.status}</Pill>
                  </td>
                  <td className="px-4 py-3">
                    <Pill tone="slate">{o.fulfillment_status}</Pill>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button className={btnSmall} onClick={() => setOpen(o)}>
                      View / edit
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>

      {open && (
        <OrderDetail
          order={open}
          onClose={() => setOpen(null)}
          onSaved={() => {
            setOpen(null)
            refresh()
          }}
        />
      )}
    </div>
  )
}

function OrderDetail({
  order,
  onClose,
  onSaved,
}: {
  order: Order
  onClose: () => void
  onSaved: () => void
}) {
  const [fulfillment, setFulfillment] = useState<Fulfillment>(order.fulfillment_status)
  const [note, setNote] = useState(order.admin_note ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function save() {
    setSaving(true)
    try {
      await updateRow('orders', order.id, {
        fulfillment_status: fulfillment,
        admin_note: note.trim() || null,
      })
      onSaved()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const money = (c: number) => formatPrice(c, order.currency)

  return (
    <Modal
      title={`Order ${order.order_number ?? order.id.slice(0, 8)}`}
      onClose={onClose}
      footer={
        <>
          <button className={btnGhost} onClick={onClose}>
            Close
          </button>
          <button className={btnPrimary} onClick={save} disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </button>
        </>
      }
    >
      <ErrorNote msg={error} />
      <div className="grid gap-5">
        <div>
          <h3 className="mb-2 text-sm font-semibold text-slate-300">Items</h3>
          <div className="rounded-lg border border-white/10">
            {order.order_items.length === 0 ? (
              <p className="px-3 py-3 text-sm text-slate-500">No line items.</p>
            ) : (
              order.order_items.map((it, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between border-b border-white/5 px-3 py-2 text-sm last:border-0"
                >
                  <span className="text-slate-200">
                    {it.quantity} × {it.name}
                  </span>
                  <span className="text-slate-400">{money(it.unit_price_cents * it.quantity)}</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm">
          <span className="text-slate-400">Subtotal</span>
          <span className="text-right text-slate-200">{money(order.subtotal_cents)}</span>
          <span className="text-slate-400">Shipping</span>
          <span className="text-right text-slate-200">{money(order.shipping_cents)}</span>
          <span className="text-slate-400">Discount</span>
          <span className="text-right text-slate-200">-{money(order.discount_cents)}</span>
          <span className="text-slate-400">Tax</span>
          <span className="text-right text-slate-200">{money(order.tax_cents)}</span>
          <span className="font-semibold text-white">Total</span>
          <span className="text-right font-semibold text-white">{money(order.amount_total_cents)}</span>
        </div>

        {order.ship_name && (
          <div className="text-sm">
            <h3 className="mb-1 text-sm font-semibold text-slate-300">Shipping address</h3>
            <p className="text-slate-400">
              {order.ship_name}
              <br />
              {order.ship_address1} {order.ship_address2}
              <br />
              {order.ship_postal_code} {order.ship_city}, {order.ship_country}
            </p>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Fulfillment status">
            <select
              className={fieldCls}
              value={fulfillment}
              onChange={(e) => setFulfillment(e.target.value as Fulfillment)}
            >
              {FULFILL.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <Field label="Internal note">
          <textarea
            className={fieldCls}
            rows={2}
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </Field>
      </div>
    </Modal>
  )
}
