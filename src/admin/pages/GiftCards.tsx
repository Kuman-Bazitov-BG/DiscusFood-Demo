import { useEffect, useState } from 'react'
import {
  fetchAll,
  insertRow,
  updateRow,
  deleteRow,
  eurosToCents,
  centsToEuros,
  toTs,
  tsLocal,
  fmtDate,
  randomCode,
} from '../lib/adminApi'
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

type GCStatus = 'active' | 'redeemed' | 'disabled' | 'expired'
interface GiftCard {
  id: string
  code: string
  initial_balance_cents: number
  balance_cents: number
  currency: string
  status: GCStatus
  recipient_email: string | null
  note: string | null
  expires_at: string | null
}

const STATUSES: GCStatus[] = ['active', 'redeemed', 'disabled', 'expired']
const tone = (s: GCStatus) =>
  s === 'active' ? 'green' : s === 'disabled' || s === 'expired' ? 'rose' : 'slate'

export function GiftCards() {
  const [rows, setRows] = useState<GiftCard[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState<GiftCard | 'new' | null>(null)
  const [q, setQ] = useQuery()

  async function refresh() {
    setLoading(true)
    try {
      setRows(await fetchAll<GiftCard>('gift_cards', '*', { col: 'created_at', asc: false }))
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

  async function remove(g: GiftCard) {
    if (!confirm(`Delete gift card ${g.code}?`)) return
    try {
      await deleteRow('gift_cards', g.id)
      setRows((r) => r.filter((x) => x.id !== g.id))
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Delete failed')
    }
  }

  const shown = rows.filter((g) =>
    matchQuery(q, [g.code, g.recipient_email, g.note, g.status]),
  )

  return (
    <div>
      <PageHeader
        icon="🎁"
        title="Gift Cards"
        description="Issue and manage store gift cards."
        action={
          <div className="flex flex-wrap items-center gap-2">
            <PageSearch q={q} setQ={setQ} placeholder="Search gift cards…" />
            <button className={btnPrimary} onClick={() => setEditing('new')}>
              + Issue gift card
            </button>
          </div>
        }
      />
      <ErrorNote msg={error} />
      <Card>
        <table className={tableCls}>
          <thead className={theadCls}>
            <tr>
              <th className={thCls}>Code</th>
              <th className={thCls}>Balance</th>
              <th className={thCls}>Recipient</th>
              <th className={thCls}>Expires</th>
              <th className={thCls}>Status</th>
              <th className={`${thCls} text-right`}>Actions</th>
            </tr>
          </thead>
          <tbody className={tbodyCls}>
            {loading ? (
              <TableState colSpan={6} text="Loading…" />
            ) : shown.length === 0 ? (
              <TableState colSpan={6} text={q ? 'No matching gift cards.' : 'No gift cards yet.'} />
            ) : (
              shown.map((g) => (
                <tr key={g.id} className={trCls}>
                  <td className="px-4 py-3 font-mono font-semibold text-white">{g.code}</td>
                  <td className="px-4 py-3 text-slate-200">
                    €{centsToEuros(g.balance_cents)}
                    <span className="text-xs text-slate-500"> / €{centsToEuros(g.initial_balance_cents)}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-300">{g.recipient_email ?? '—'}</td>
                  <td className="px-4 py-3 text-slate-400">{fmtDate(g.expires_at)}</td>
                  <td className="px-4 py-3">
                    <Pill tone={tone(g.status) as 'green' | 'rose' | 'slate'}>{g.status}</Pill>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button className={btnSmall} onClick={() => setEditing(g)}>
                      Edit
                    </button>
                    <button className={`${btnSmall} ml-2 text-rose-300`} onClick={() => remove(g)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>

      {editing && (
        <GiftCardForm
          row={editing === 'new' ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null)
            refresh()
          }}
        />
      )}
    </div>
  )
}

function GiftCardForm({
  row,
  onClose,
  onSaved,
}: {
  row: GiftCard | null
  onClose: () => void
  onSaved: () => void
}) {
  const [code, setCode] = useState(row?.code ?? randomCode('GIFT'))
  const [initial, setInitial] = useState(centsToEuros(row?.initial_balance_cents ?? 2500))
  const [balance, setBalance] = useState(centsToEuros(row?.balance_cents ?? 2500))
  const [status, setStatus] = useState<GCStatus>(row?.status ?? 'active')
  const [email, setEmail] = useState(row?.recipient_email ?? '')
  const [note, setNote] = useState(row?.note ?? '')
  const [expiresAt, setExpiresAt] = useState(tsLocal(row?.expires_at))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!code.trim()) return setError('Code is required.')
    const initCents = eurosToCents(initial || 0)
    const payload = {
      code: code.trim().toUpperCase(),
      initial_balance_cents: initCents,
      balance_cents: row ? eurosToCents(balance || 0) : initCents,
      currency: 'eur',
      status,
      recipient_email: email.trim() || null,
      note: note.trim() || null,
      expires_at: toTs(expiresAt),
    }
    setSaving(true)
    try {
      if (row) await updateRow('gift_cards', row.id, payload)
      else await insertRow('gift_cards', payload)
      onSaved()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      title={row ? 'Edit gift card' : 'Issue gift card'}
      onClose={onClose}
      footer={
        <>
          <button className={btnGhost} onClick={onClose} type="button">
            Cancel
          </button>
          <button className={btnPrimary} form="gc-form" disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </button>
        </>
      }
    >
      <form id="gc-form" onSubmit={submit} className="grid gap-4">
        <ErrorNote msg={error} />
        <Field label="Code">
          <div className="flex gap-2">
            <input className={fieldCls} value={code} onChange={(e) => setCode(e.target.value)} />
            <button type="button" className={btnSmall} onClick={() => setCode(randomCode('GIFT'))}>
              Generate
            </button>
          </div>
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Initial balance (€)">
            <input className={fieldCls} type="number" step="0.01" value={initial} onChange={(e) => setInitial(e.target.value)} />
          </Field>
          {row && (
            <Field label="Current balance (€)">
              <input className={fieldCls} type="number" step="0.01" value={balance} onChange={(e) => setBalance(e.target.value)} />
            </Field>
          )}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Status">
            <select className={fieldCls} value={status} onChange={(e) => setStatus(e.target.value as GCStatus)}>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Expires at">
            <input className={fieldCls} type="datetime-local" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} />
          </Field>
        </div>
        <Field label="Recipient email (optional)">
          <input className={fieldCls} value={email} onChange={(e) => setEmail(e.target.value)} />
        </Field>
        <Field label="Note (optional)">
          <input className={fieldCls} value={note} onChange={(e) => setNote(e.target.value)} />
        </Field>
      </form>
    </Modal>
  )
}
