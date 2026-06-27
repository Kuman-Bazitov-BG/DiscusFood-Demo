import { useEffect, useState } from 'react'
import { fetchAll, updateRow, fmtDate, eurosToCents, centsToEuros } from '../lib/adminApi'
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

type ReturnStatus = 'requested' | 'approved' | 'rejected' | 'received' | 'refunded'

interface Return {
  id: string
  reason: string
  status: ReturnStatus
  refund_amount_cents: number | null
  admin_note: string | null
  created_at: string
  order_id: string
  orders: { order_number: string | null } | null
}

const STATUSES: ReturnStatus[] = ['requested', 'approved', 'rejected', 'received', 'refunded']
const tone = (s: ReturnStatus) =>
  s === 'refunded' ? 'green' : s === 'rejected' ? 'rose' : s === 'requested' ? 'amber' : 'cyan'

export function Returns() {
  const [rows, setRows] = useState<Return[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [open, setOpen] = useState<Return | null>(null)
  const [q, setQ] = useQuery()

  async function refresh() {
    setLoading(true)
    try {
      setRows(
        await fetchAll<Return>('returns', '*, orders(order_number)', {
          col: 'created_at',
          asc: false,
        }),
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

  const shown = rows.filter((r) =>
    matchQuery(q, [r.orders?.order_number, r.reason, r.status]),
  )

  return (
    <div>
      <PageHeader
        icon="↩️"
        title="Returns"
        description="Review return requests, approve or reject them, and record refunds."
        action={<PageSearch q={q} setQ={setQ} placeholder="Search returns…" />}
      />
      <ErrorNote msg={error} />
      <Card>
        <table className={tableCls}>
          <thead className={theadCls}>
            <tr>
              <th className={thCls}>Order</th>
              <th className={thCls}>Reason</th>
              <th className={thCls}>Refund</th>
              <th className={thCls}>Status</th>
              <th className={thCls}>Requested</th>
              <th className={`${thCls} text-right`}>Actions</th>
            </tr>
          </thead>
          <tbody className={tbodyCls}>
            {loading ? (
              <TableState colSpan={6} text="Loading…" />
            ) : shown.length === 0 ? (
              <TableState colSpan={6} text={q ? 'No matching returns.' : 'No return requests yet.'} />
            ) : (
              shown.map((r) => (
                <tr key={r.id} className={trCls}>
                  <td className="px-4 py-3 font-semibold text-white">
                    {r.orders?.order_number ?? r.order_id.slice(0, 8)}
                  </td>
                  <td className="max-w-xs px-4 py-3 text-slate-300">{r.reason || '—'}</td>
                  <td className="px-4 py-3 text-slate-300">
                    {r.refund_amount_cents != null ? formatPrice(r.refund_amount_cents, 'eur') : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <Pill tone={tone(r.status) as 'green' | 'rose' | 'amber' | 'cyan'}>{r.status}</Pill>
                  </td>
                  <td className="px-4 py-3 text-slate-400">{fmtDate(r.created_at)}</td>
                  <td className="px-4 py-3 text-right">
                    <button className={btnSmall} onClick={() => setOpen(r)}>
                      Manage
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>

      {open && (
        <ReturnForm
          row={open}
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

function ReturnForm({
  row,
  onClose,
  onSaved,
}: {
  row: Return
  onClose: () => void
  onSaved: () => void
}) {
  const [status, setStatus] = useState<ReturnStatus>(row.status)
  const [refund, setRefund] = useState(centsToEuros(row.refund_amount_cents))
  const [note, setNote] = useState(row.admin_note ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function save() {
    setSaving(true)
    try {
      await updateRow('returns', row.id, {
        status,
        refund_amount_cents: refund ? eurosToCents(refund) : null,
        admin_note: note.trim() || null,
      })
      onSaved()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      title={`Return · ${row.orders?.order_number ?? row.order_id.slice(0, 8)}`}
      onClose={onClose}
      footer={
        <>
          <button className={btnGhost} onClick={onClose}>
            Cancel
          </button>
          <button className={btnPrimary} onClick={save} disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </button>
        </>
      }
    >
      <ErrorNote msg={error} />
      <div className="grid gap-4">
        <Field label="Customer reason">
          <p className="rounded-lg bg-slate-800 px-3 py-2 text-sm text-slate-300">{row.reason || '—'}</p>
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Status">
            <select className={fieldCls} value={status} onChange={(e) => setStatus(e.target.value as ReturnStatus)}>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Refund amount (€)">
            <input className={fieldCls} type="number" step="0.01" value={refund} onChange={(e) => setRefund(e.target.value)} />
          </Field>
        </div>
        <Field label="Internal note">
          <textarea className={fieldCls} rows={2} value={note} onChange={(e) => setNote(e.target.value)} />
        </Field>
      </div>
    </Modal>
  )
}
