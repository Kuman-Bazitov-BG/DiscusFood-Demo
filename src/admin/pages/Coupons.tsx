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

type DType = 'percent' | 'fixed'
interface Coupon {
  id: string
  code: string
  description: string
  discount_type: DType
  value: number
  min_order_cents: number
  max_redemptions: number | null
  times_redeemed: number
  per_user_limit: number | null
  starts_at: string | null
  expires_at: string | null
  is_active: boolean
}

const showValue = (c: Coupon) =>
  c.discount_type === 'percent' ? `${c.value}%` : `€${centsToEuros(c.value)}`

export function Coupons() {
  const [rows, setRows] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState<Coupon | 'new' | null>(null)
  const [q, setQ] = useQuery()

  async function refresh() {
    setLoading(true)
    try {
      setRows(await fetchAll<Coupon>('coupons', '*', { col: 'created_at', asc: false }))
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

  async function remove(c: Coupon) {
    if (!confirm(`Delete coupon ${c.code}?`)) return
    try {
      await deleteRow('coupons', c.id)
      setRows((r) => r.filter((x) => x.id !== c.id))
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Delete failed')
    }
  }

  const shown = rows.filter((c) => matchQuery(q, [c.code, c.description]))

  return (
    <div>
      <PageHeader
        icon="🏷️"
        title="Coupons"
        description="Discount codes customers enter at checkout."
        action={
          <div className="flex flex-wrap items-center gap-2">
            <PageSearch q={q} setQ={setQ} placeholder="Search coupons…" />
            <button className={btnPrimary} onClick={() => setEditing('new')}>
              + Add coupon
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
              <th className={thCls}>Discount</th>
              <th className={thCls}>Min order</th>
              <th className={thCls}>Used</th>
              <th className={thCls}>Expires</th>
              <th className={thCls}>Status</th>
              <th className={`${thCls} text-right`}>Actions</th>
            </tr>
          </thead>
          <tbody className={tbodyCls}>
            {loading ? (
              <TableState colSpan={7} text="Loading…" />
            ) : shown.length === 0 ? (
              <TableState colSpan={7} text={q ? 'No matching coupons.' : 'No coupons yet.'} />
            ) : (
              shown.map((c) => (
                <tr key={c.id} className={trCls}>
                  <td className="px-4 py-3">
                    <div className="font-mono font-semibold text-white">{c.code}</div>
                    <div className="text-xs text-slate-500">{c.description}</div>
                  </td>
                  <td className="px-4 py-3 text-cyan-300">{showValue(c)}</td>
                  <td className="px-4 py-3 text-slate-300">€{centsToEuros(c.min_order_cents)}</td>
                  <td className="px-4 py-3 text-slate-400">
                    {c.times_redeemed}
                    {c.max_redemptions ? ` / ${c.max_redemptions}` : ''}
                  </td>
                  <td className="px-4 py-3 text-slate-400">{fmtDate(c.expires_at)}</td>
                  <td className="px-4 py-3">
                    {c.is_active ? <Pill tone="green">Active</Pill> : <Pill tone="slate">Off</Pill>}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button className={btnSmall} onClick={() => setEditing(c)}>
                      Edit
                    </button>
                    <button className={`${btnSmall} ml-2 text-rose-300`} onClick={() => remove(c)}>
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
        <CouponForm
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

function CouponForm({
  row,
  onClose,
  onSaved,
}: {
  row: Coupon | null
  onClose: () => void
  onSaved: () => void
}) {
  const [code, setCode] = useState(row?.code ?? '')
  const [description, setDescription] = useState(row?.description ?? '')
  const [dType, setDType] = useState<DType>(row?.discount_type ?? 'percent')
  const [value, setValue] = useState(
    row ? (row.discount_type === 'percent' ? String(row.value) : centsToEuros(row.value)) : '10',
  )
  const [minOrder, setMinOrder] = useState(centsToEuros(row?.min_order_cents ?? 0))
  const [maxRedemptions, setMaxRedemptions] = useState(
    row?.max_redemptions != null ? String(row.max_redemptions) : '',
  )
  const [perUser, setPerUser] = useState(row?.per_user_limit != null ? String(row.per_user_limit) : '')
  const [startsAt, setStartsAt] = useState(tsLocal(row?.starts_at))
  const [expiresAt, setExpiresAt] = useState(tsLocal(row?.expires_at))
  const [isActive, setIsActive] = useState(row?.is_active ?? true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!code.trim()) return setError('Code is required.')
    const payload = {
      code: code.trim().toUpperCase(),
      description: description.trim(),
      discount_type: dType,
      value: dType === 'percent' ? parseInt(value, 10) || 0 : eurosToCents(value || 0),
      min_order_cents: eurosToCents(minOrder || 0),
      max_redemptions: maxRedemptions ? parseInt(maxRedemptions, 10) : null,
      per_user_limit: perUser ? parseInt(perUser, 10) : null,
      starts_at: toTs(startsAt),
      expires_at: toTs(expiresAt),
      is_active: isActive,
    }
    setSaving(true)
    try {
      if (row) await updateRow('coupons', row.id, payload)
      else await insertRow('coupons', payload)
      onSaved()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      title={row ? 'Edit coupon' : 'New coupon'}
      onClose={onClose}
      footer={
        <>
          <button className={btnGhost} onClick={onClose} type="button">
            Cancel
          </button>
          <button className={btnPrimary} form="cpn-form" disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </button>
        </>
      }
    >
      <form id="cpn-form" onSubmit={submit} className="grid gap-4">
        <ErrorNote msg={error} />
        <Field label="Code">
          <div className="flex gap-2">
            <input className={fieldCls} value={code} onChange={(e) => setCode(e.target.value)} />
            <button type="button" className={btnSmall} onClick={() => setCode(randomCode())}>
              Generate
            </button>
          </div>
        </Field>
        <Field label="Description">
          <input className={fieldCls} value={description} onChange={(e) => setDescription(e.target.value)} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Discount type">
            <select className={fieldCls} value={dType} onChange={(e) => setDType(e.target.value as DType)}>
              <option value="percent">Percent (%)</option>
              <option value="fixed">Fixed (€)</option>
            </select>
          </Field>
          <Field label={dType === 'percent' ? 'Value (%)' : 'Value (€)'}>
            <input
              className={fieldCls}
              type="number"
              step={dType === 'percent' ? '1' : '0.01'}
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
          </Field>
        </div>
        <Field label="Minimum order (€)">
          <input className={fieldCls} type="number" step="0.01" value={minOrder} onChange={(e) => setMinOrder(e.target.value)} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Max total redemptions">
            <input className={fieldCls} type="number" placeholder="unlimited" value={maxRedemptions} onChange={(e) => setMaxRedemptions(e.target.value)} />
          </Field>
          <Field label="Per-customer limit">
            <input className={fieldCls} type="number" placeholder="unlimited" value={perUser} onChange={(e) => setPerUser(e.target.value)} />
          </Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Starts at">
            <input className={fieldCls} type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} />
          </Field>
          <Field label="Expires at">
            <input className={fieldCls} type="datetime-local" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} />
          </Field>
        </div>
        <label className="flex items-center gap-2 text-sm text-slate-200">
          <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="h-4 w-4 accent-cyan-400" />
          Active
        </label>
      </form>
    </Modal>
  )
}
