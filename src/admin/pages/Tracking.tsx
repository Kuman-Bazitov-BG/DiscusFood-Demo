import { useEffect, useState } from 'react'
import { fetchAll, insertRow, updateRow, deleteRow, fmtDate, toTs } from '../lib/adminApi'
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

interface Shipment {
  id: string
  order_id: string
  carrier: string | null
  tracking_number: string | null
  tracking_url: string | null
  shipped_at: string | null
  delivered_at: string | null
  orders: { order_number: string | null } | null
}
interface OrderOpt {
  id: string
  order_number: string | null
}

export function Tracking() {
  const [rows, setRows] = useState<Shipment[]>([])
  const [orders, setOrders] = useState<OrderOpt[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [adding, setAdding] = useState(false)

  const [q, setQ] = useQuery()

  async function refresh() {
    setLoading(true)
    try {
      const [s, o] = await Promise.all([
        fetchAll<Shipment>('shipments', '*, orders(order_number)', {
          col: 'created_at',
          asc: false,
        }),
        fetchAll<OrderOpt>('orders', 'id, order_number', { col: 'created_at', asc: false }),
      ])
      setRows(s)
      setOrders(o)
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

  async function markDelivered(s: Shipment) {
    try {
      await updateRow('shipments', s.id, { delivered_at: new Date().toISOString() })
      await updateRow('orders', s.order_id, { fulfillment_status: 'delivered' })
      refresh()
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Update failed')
    }
  }
  async function remove(s: Shipment) {
    if (!confirm('Delete this shipment?')) return
    try {
      await deleteRow('shipments', s.id)
      setRows((r) => r.filter((x) => x.id !== s.id))
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Delete failed')
    }
  }

  const shown = rows.filter((s) =>
    matchQuery(q, [s.orders?.order_number, s.carrier, s.tracking_number]),
  )

  return (
    <div>
      <PageHeader
        icon="🚚"
        title="Track Orders"
        description="Add carriers and tracking numbers, and mark orders shipped or delivered."
        action={
          <div className="flex flex-wrap items-center gap-2">
            <PageSearch q={q} setQ={setQ} placeholder="Search shipments…" />
            <button className={btnPrimary} onClick={() => setAdding(true)} disabled={orders.length === 0}>
              + Add shipment
            </button>
          </div>
        }
      />
      {orders.length === 0 && !loading && (
        <p className="mb-4 rounded-lg bg-slate-800/60 px-3 py-2 text-sm text-slate-400">
          No orders yet — shipments can be created once orders exist.
        </p>
      )}
      <ErrorNote msg={error} />
      <Card>
        <table className={tableCls}>
          <thead className={theadCls}>
            <tr>
              <th className={thCls}>Order</th>
              <th className={thCls}>Carrier</th>
              <th className={thCls}>Tracking</th>
              <th className={thCls}>Status</th>
              <th className={`${thCls} text-right`}>Actions</th>
            </tr>
          </thead>
          <tbody className={tbodyCls}>
            {loading ? (
              <TableState colSpan={5} text="Loading…" />
            ) : shown.length === 0 ? (
              <TableState colSpan={5} text={q ? 'No matching shipments.' : 'No shipments yet.'} />
            ) : (
              shown.map((s) => (
                <tr key={s.id} className={trCls}>
                  <td className="px-4 py-3 font-semibold text-white">
                    {s.orders?.order_number ?? s.order_id.slice(0, 8)}
                  </td>
                  <td className="px-4 py-3 text-slate-300">{s.carrier ?? '—'}</td>
                  <td className="px-4 py-3 text-slate-300">
                    {s.tracking_url ? (
                      <a href={s.tracking_url} target="_blank" rel="noreferrer" className="text-cyan-300 hover:underline">
                        {s.tracking_number ?? 'Track'}
                      </a>
                    ) : (
                      s.tracking_number ?? '—'
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {s.delivered_at ? (
                      <Pill tone="green">Delivered {fmtDate(s.delivered_at)}</Pill>
                    ) : (
                      <Pill tone="cyan">Shipped {fmtDate(s.shipped_at)}</Pill>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {!s.delivered_at && (
                      <button className={`${btnSmall} text-emerald-300`} onClick={() => markDelivered(s)}>
                        Mark delivered
                      </button>
                    )}
                    <button className={`${btnSmall} ml-2 text-rose-300`} onClick={() => remove(s)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>

      {adding && (
        <ShipmentForm
          orders={orders}
          onClose={() => setAdding(false)}
          onSaved={() => {
            setAdding(false)
            refresh()
          }}
        />
      )}
    </div>
  )
}

function ShipmentForm({
  orders,
  onClose,
  onSaved,
}: {
  orders: OrderOpt[]
  onClose: () => void
  onSaved: () => void
}) {
  const [orderId, setOrderId] = useState(orders[0]?.id ?? '')
  const [carrier, setCarrier] = useState('')
  const [trackingNumber, setTrackingNumber] = useState('')
  const [trackingUrl, setTrackingUrl] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!orderId) return setError('Choose an order.')
    setSaving(true)
    try {
      await insertRow('shipments', {
        order_id: orderId,
        carrier: carrier.trim() || null,
        tracking_number: trackingNumber.trim() || null,
        tracking_url: trackingUrl.trim() || null,
        shipped_at: toTs(new Date().toISOString().slice(0, 16)),
      })
      await updateRow('orders', orderId, { fulfillment_status: 'shipped' })
      onSaved()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      title="Add shipment"
      onClose={onClose}
      footer={
        <>
          <button className={btnGhost} onClick={onClose} type="button">
            Cancel
          </button>
          <button className={btnPrimary} form="ship-form" disabled={saving}>
            {saving ? 'Saving…' : 'Create'}
          </button>
        </>
      }
    >
      <form id="ship-form" onSubmit={submit} className="grid gap-4">
        <ErrorNote msg={error} />
        <Field label="Order">
          <select className={fieldCls} value={orderId} onChange={(e) => setOrderId(e.target.value)}>
            {orders.map((o) => (
              <option key={o.id} value={o.id}>
                {o.order_number ?? o.id.slice(0, 8)}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Carrier">
          <input className={fieldCls} value={carrier} onChange={(e) => setCarrier(e.target.value)} placeholder="DHL, ELTA, Speedy…" />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Tracking number">
            <input className={fieldCls} value={trackingNumber} onChange={(e) => setTrackingNumber(e.target.value)} />
          </Field>
          <Field label="Tracking URL">
            <input className={fieldCls} value={trackingUrl} onChange={(e) => setTrackingUrl(e.target.value)} placeholder="https://…" />
          </Field>
        </div>
      </form>
    </Modal>
  )
}
