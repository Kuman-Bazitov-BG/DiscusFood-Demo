import { useEffect, useState } from 'react'
import {
  fetchAll,
  fetchOne,
  insertRow,
  deleteRow,
  fmtDate,
  eurosToCents,
  centsToEuros,
} from '../lib/adminApi'
import { formatPrice } from '../../lib/format'
import {
  printInvoice,
  downloadInvoiceHtml,
  invoiceMailto,
  invoiceRecipient,
  type InvoiceDoc,
  type InvoiceOrder,
} from '../lib/invoiceDoc'
import {
  PageHeader,
  ErrorNote,
  Card,
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

interface Invoice {
  id: string
  invoice_number: string
  total_cents: number
  currency: string
  pdf_url: string | null
  issued_at: string
  order_id: string
  orders: { order_number: string | null } | null
}

const ORDER_COLS =
  'order_number, email, created_at, currency, subtotal_cents, shipping_cents, ' +
  'discount_cents, tax_cents, amount_total_cents, customer_note, ' +
  'billing_company, billing_vat_number, billing_registration_number, billing_contact_name, ' +
  'billing_email, billing_phone, billing_address1, billing_address2, billing_city, ' +
  'billing_state, billing_postal_code, billing_country, ' +
  'ship_name, ship_phone, ship_address1, ship_address2, ship_city, ship_postal_code, ' +
  'ship_country, order_items(name, quantity, unit_price_cents)'
interface OrderOpt {
  id: string
  order_number: string | null
  amount_total_cents: number
}

export function Invoices() {
  const [rows, setRows] = useState<Invoice[]>([])
  const [orders, setOrders] = useState<OrderOpt[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [adding, setAdding] = useState(false)
  const [open, setOpen] = useState<Invoice | null>(null)
  const [q, setQ] = useQuery()

  async function refresh() {
    setLoading(true)
    try {
      const [inv, o] = await Promise.all([
        fetchAll<Invoice>('invoices', '*, orders(order_number)', { col: 'issued_at', asc: false }),
        fetchAll<OrderOpt>('orders', 'id, order_number, amount_total_cents', {
          col: 'created_at',
          asc: false,
        }),
      ])
      setRows(inv)
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

  async function remove(i: Invoice) {
    if (!confirm(`Delete invoice ${i.invoice_number}?`)) return
    try {
      await deleteRow('invoices', i.id)
      setRows((r) => r.filter((x) => x.id !== i.id))
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Delete failed')
    }
  }

  const shown = rows.filter((i) =>
    matchQuery(q, [i.invoice_number, i.orders?.order_number]),
  )

  return (
    <div>
      <PageHeader
        icon="📄"
        title="Invoices"
        description="Auto-numbered invoices (INV-1001…). Generate one for an order and attach a PDF link."
        action={
          <div className="flex flex-wrap items-center gap-2">
            <PageSearch q={q} setQ={setQ} placeholder="Search invoices…" />
            <button className={btnPrimary} onClick={() => setAdding(true)} disabled={orders.length === 0}>
              + New invoice
            </button>
          </div>
        }
      />
      <ErrorNote msg={error} />
      <Card>
        <table className={tableCls}>
          <thead className={theadCls}>
            <tr>
              <th className={thCls}>Invoice</th>
              <th className={thCls}>Order</th>
              <th className={thCls}>Total</th>
              <th className={thCls}>Issued</th>
              <th className={`${thCls} text-right`}>Actions</th>
            </tr>
          </thead>
          <tbody className={tbodyCls}>
            {loading ? (
              <TableState colSpan={5} text="Loading…" />
            ) : shown.length === 0 ? (
              <TableState colSpan={5} text={q ? 'No matching invoices.' : 'No invoices yet.'} />
            ) : (
              shown.map((i) => (
                <tr key={i.id} className={trCls}>
                  <td className="px-4 py-3 font-semibold text-white">{i.invoice_number}</td>
                  <td className="px-4 py-3 text-slate-300">{i.orders?.order_number ?? '—'}</td>
                  <td className="px-4 py-3 text-slate-200">{formatPrice(i.total_cents, i.currency)}</td>
                  <td className="px-4 py-3 text-slate-400">{fmtDate(i.issued_at)}</td>
                  <td className="px-4 py-3 text-right">
                    <button className={btnSmall} onClick={() => setOpen(i)}>
                      Open
                    </button>
                    <button className={`${btnSmall} ml-2 text-rose-300`} onClick={() => remove(i)}>
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
        <InvoiceForm
          orders={orders}
          onClose={() => setAdding(false)}
          onSaved={() => {
            setAdding(false)
            refresh()
          }}
        />
      )}

      {open && <InvoiceDetail invoice={open} onClose={() => setOpen(null)} />}
    </div>
  )
}

function InvoiceDetail({ invoice, onClose }: { invoice: Invoice; onClose: () => void }) {
  const [order, setOrder] = useState<InvoiceOrder | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const data = await fetchOne<InvoiceOrder>('orders', ORDER_COLS, { id: invoice.order_id })
        if (alive) setOrder(data)
      } catch (e) {
        if (alive) setError(e instanceof Error ? e.message : 'Failed to load order')
      } finally {
        if (alive) setLoading(false)
      }
    })()
    return () => {
      alive = false
    }
  }, [invoice.order_id])

  const doc: InvoiceDoc = {
    invoice_number: invoice.invoice_number,
    issued_at: invoice.issued_at,
    total_cents: invoice.total_cents,
    currency: invoice.currency,
    pdf_url: invoice.pdf_url,
    order_id: invoice.order_id,
    order,
  }
  const money = (c: number) => formatPrice(c, invoice.currency)
  const recipient = invoiceRecipient(doc)

  return (
    <Modal
      title={`Invoice ${invoice.invoice_number}`}
      onClose={onClose}
      footer={
        <>
          <button className={btnGhost} onClick={onClose}>
            Close
          </button>
          <button
            className={btnSmall}
            onClick={() => downloadInvoiceHtml(doc)}
            disabled={loading}
            title="Download a standalone HTML copy"
          >
            ⬇ Download
          </button>
          {invoice.pdf_url && (
            <a
              href={invoice.pdf_url}
              target="_blank"
              rel="noreferrer"
              className={`${btnSmall} text-cyan-300`}
            >
              PDF file
            </a>
          )}
          <a
            href={invoiceMailto(doc)}
            className={`${btnSmall} ${recipient ? 'text-cyan-300' : 'pointer-events-none opacity-50'}`}
            title={recipient ? `Email ${recipient}` : 'No customer email on file'}
          >
            ✉ Send
          </a>
          <button className={btnPrimary} onClick={() => printInvoice(doc)} disabled={loading}>
            🖨 Print / Save PDF
          </button>
        </>
      }
    >
      <ErrorNote msg={error} />
      {loading ? (
        <p className="py-8 text-center text-slate-400">Loading invoice…</p>
      ) : (
        <div className="grid gap-5">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">Invoice</p>
              <p className="font-semibold text-white">{invoice.invoice_number}</p>
              <p className="text-slate-400">Issued {fmtDate(invoice.issued_at)}</p>
            </div>
            <div className="text-right">
              <p className="text-xs uppercase tracking-wide text-slate-500">Order</p>
              <p className="font-semibold text-white">{order?.order_number ?? '—'}</p>
              <p className="text-slate-400">{order?.email ?? recipient ?? '—'}</p>
            </div>
          </div>

          <div>
            <h3 className="mb-2 text-sm font-semibold text-slate-300">Bill to</h3>
            <div className="rounded-lg border border-white/10 px-3 py-2 text-sm text-slate-300">
              <BillTo order={order} />
            </div>
          </div>

          <div>
            <h3 className="mb-2 text-sm font-semibold text-slate-300">Items</h3>
            <div className="rounded-lg border border-white/10">
              {!order || order.order_items.length === 0 ? (
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
            {order && (
              <>
                <span className="text-slate-400">Subtotal</span>
                <span className="text-right text-slate-200">{money(order.subtotal_cents)}</span>
                {order.discount_cents > 0 && (
                  <>
                    <span className="text-slate-400">Discount</span>
                    <span className="text-right text-slate-200">-{money(order.discount_cents)}</span>
                  </>
                )}
                <span className="text-slate-400">Shipping</span>
                <span className="text-right text-slate-200">{money(order.shipping_cents)}</span>
                {order.tax_cents > 0 && (
                  <>
                    <span className="text-slate-400">Tax</span>
                    <span className="text-right text-slate-200">{money(order.tax_cents)}</span>
                  </>
                )}
              </>
            )}
            <span className="font-semibold text-white">Total</span>
            <span className="text-right font-semibold text-white">{money(invoice.total_cents)}</span>
          </div>

          {order?.customer_note && (
            <div className="text-sm">
              <h3 className="mb-1 text-sm font-semibold text-slate-300">Customer note</h3>
              <p className="text-slate-400">{order.customer_note}</p>
            </div>
          )}
        </div>
      )}
    </Modal>
  )
}

function BillTo({ order }: { order: InvoiceOrder | null }) {
  if (!order) return <span className="text-slate-500">—</span>
  const useBilling = !!(
    order.billing_company ||
    order.billing_contact_name ||
    order.billing_address1
  )
  const lines = useBilling
    ? [
        order.billing_company,
        order.billing_contact_name,
        order.billing_address1,
        order.billing_address2,
        [order.billing_postal_code, order.billing_city].filter(Boolean).join(' '),
        [order.billing_state, order.billing_country].filter(Boolean).join(', '),
        order.billing_vat_number ? `VAT: ${order.billing_vat_number}` : null,
        order.billing_registration_number ? `Reg: ${order.billing_registration_number}` : null,
        order.billing_email || order.email,
        order.billing_phone,
      ]
    : [
        order.ship_name,
        order.ship_address1,
        order.ship_address2,
        [order.ship_postal_code, order.ship_city].filter(Boolean).join(' '),
        order.ship_country,
        order.email,
        order.ship_phone,
      ]
  const shown = lines.filter((l): l is string => !!l && l.trim() !== '')
  if (shown.length === 0) return <span className="text-slate-500">No billing details on file.</span>
  return (
    <>
      {shown.map((l, i) => (
        <div key={i}>{l}</div>
      ))}
    </>
  )
}

function InvoiceForm({
  orders,
  onClose,
  onSaved,
}: {
  orders: OrderOpt[]
  onClose: () => void
  onSaved: () => void
}) {
  const [orderId, setOrderId] = useState(orders[0]?.id ?? '')
  const [total, setTotal] = useState(centsToEuros(orders[0]?.amount_total_cents))
  const [pdfUrl, setPdfUrl] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function pickOrder(id: string) {
    setOrderId(id)
    const o = orders.find((x) => x.id === id)
    if (o) setTotal(centsToEuros(o.amount_total_cents))
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!orderId) return setError('Choose an order.')
    setSaving(true)
    try {
      await insertRow('invoices', {
        order_id: orderId,
        total_cents: eurosToCents(total || 0),
        currency: 'eur',
        pdf_url: pdfUrl.trim() || null,
      })
      onSaved()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      title="New invoice"
      onClose={onClose}
      footer={
        <>
          <button className={btnGhost} onClick={onClose} type="button">
            Cancel
          </button>
          <button className={btnPrimary} form="inv-form" disabled={saving}>
            {saving ? 'Saving…' : 'Create'}
          </button>
        </>
      }
    >
      <form id="inv-form" onSubmit={submit} className="grid gap-4">
        <ErrorNote msg={error} />
        <Field label="Order">
          <select className={fieldCls} value={orderId} onChange={(e) => pickOrder(e.target.value)}>
            {orders.map((o) => (
              <option key={o.id} value={o.id}>
                {o.order_number ?? o.id.slice(0, 8)}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Total (€)">
          <input className={fieldCls} type="number" step="0.01" value={total} onChange={(e) => setTotal(e.target.value)} />
        </Field>
        <Field label="PDF URL (optional)">
          <input className={fieldCls} value={pdfUrl} onChange={(e) => setPdfUrl(e.target.value)} placeholder="https://…" />
        </Field>
      </form>
    </Modal>
  )
}
