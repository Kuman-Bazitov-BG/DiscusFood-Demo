import { useEffect, useState } from 'react'
import {
  fetchAll,
  insertRow,
  updateRow,
  deleteRow,
  eurosToCents,
  centsToEuros,
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

interface Zone {
  id: string
  name: string
  countries: string[]
  is_active: boolean
}
interface Method {
  id: string
  zone_id: string | null
  name: string
  description: string
  price_cents: number
  free_over_cents: number | null
  estimated_days_min: number | null
  estimated_days_max: number | null
  is_active: boolean
  sort_order: number
}

export function Shipping() {
  const [zones, setZones] = useState<Zone[]>([])
  const [methods, setMethods] = useState<Method[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [zoneEdit, setZoneEdit] = useState<Zone | 'new' | null>(null)
  const [methodEdit, setMethodEdit] = useState<Method | 'new' | null>(null)

  async function refresh() {
    setLoading(true)
    try {
      const [z, m] = await Promise.all([
        fetchAll<Zone>('shipping_zones', '*', { col: 'name' }),
        fetchAll<Method>('shipping_methods', '*', { col: 'sort_order' }),
      ])
      setZones(z)
      setMethods(m)
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

  const zoneName = (id: string | null) => zones.find((z) => z.id === id)?.name ?? '—'

  async function delZone(z: Zone) {
    if (!confirm(`Delete zone "${z.name}" and its methods?`)) return
    try {
      await deleteRow('shipping_zones', z.id)
      refresh()
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Delete failed')
    }
  }
  async function delMethod(m: Method) {
    if (!confirm(`Delete method "${m.name}"?`)) return
    try {
      await deleteRow('shipping_methods', m.id)
      setMethods((list) => list.filter((x) => x.id !== m.id))
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Delete failed')
    }
  }

  return (
    <div>
      <PageHeader
        icon="🌍"
        title="Shipping & Free Shipping"
        description="Internal UPS rate reference, shipped from our Cyprus office. For your own calculations — not shown to customers."
      />
      <div className="mb-4 rounded-lg border border-cyan-400/20 bg-cyan-400/5 px-3 py-2.5 text-sm text-slate-300">
        🚚 <span className="font-semibold text-cyan-200">Carrier: UPS · Origin: Cyprus · Admin-only.</span>{' '}
        Use the calculator below to work out the shipping cost for any order: the
        destination country picks the most specific zone (e.g. CY → Cyprus, DE →
        European Union); the <em>Worldwide</em> zone (no countries listed) is the
        fallback for everywhere else. “Free over” is the order total at which a
        service becomes free.
      </div>
      <ErrorNote msg={error} />

      <ShippingCalculator zones={zones} methods={methods} />


      {/* Zones */}
      <div className="mb-3 mt-8 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Zones</h2>
        <button className={btnSmall} onClick={() => setZoneEdit('new')}>
          + Add zone
        </button>
      </div>
      <Card>
        <table className={tableCls}>
          <thead className={theadCls}>
            <tr>
              <th className={thCls}>Zone</th>
              <th className={thCls}>Countries</th>
              <th className={thCls}>Status</th>
              <th className={`${thCls} text-right`}>Actions</th>
            </tr>
          </thead>
          <tbody className={tbodyCls}>
            {loading ? (
              <TableState colSpan={4} text="Loading…" />
            ) : zones.length === 0 ? (
              <TableState colSpan={4} text="No zones yet." />
            ) : (
              zones.map((z) => (
                <tr key={z.id} className={trCls}>
                  <td className="px-4 py-3 font-semibold text-white">{z.name}</td>
                  <td className="px-4 py-3 text-slate-300">
                    {z.countries.length ? z.countries.join(', ') : 'Everywhere'}
                  </td>
                  <td className="px-4 py-3">
                    {z.is_active ? <Pill tone="green">Active</Pill> : <Pill tone="slate">Off</Pill>}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button className={btnSmall} onClick={() => setZoneEdit(z)}>
                      Edit
                    </button>
                    <button className={`${btnSmall} ml-2 text-rose-300`} onClick={() => delZone(z)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>

      {/* Methods */}
      <div className="mb-3 mt-8 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
          Methods & free shipping
        </h2>
        <button className={btnSmall} onClick={() => setMethodEdit('new')} disabled={zones.length === 0}>
          + Add method
        </button>
      </div>
      <Card>
        <table className={tableCls}>
          <thead className={theadCls}>
            <tr>
              <th className={thCls}>Method</th>
              <th className={thCls}>Zone</th>
              <th className={thCls}>Price</th>
              <th className={thCls}>Free over</th>
              <th className={thCls}>Delivery</th>
              <th className={thCls}>Status</th>
              <th className={`${thCls} text-right`}>Actions</th>
            </tr>
          </thead>
          <tbody className={tbodyCls}>
            {loading ? (
              <TableState colSpan={7} text="Loading…" />
            ) : methods.length === 0 ? (
              <TableState colSpan={7} text="No methods yet." />
            ) : (
              methods.map((m) => (
                <tr key={m.id} className={trCls}>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-white">{m.name}</div>
                    <div className="text-xs text-slate-500">{m.description}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-300">{zoneName(m.zone_id)}</td>
                  <td className="px-4 py-3 text-slate-200">€{centsToEuros(m.price_cents)}</td>
                  <td className="px-4 py-3">
                    {m.free_over_cents != null ? (
                      <Pill tone="cyan">€{centsToEuros(m.free_over_cents)}</Pill>
                    ) : (
                      <span className="text-slate-500">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-400">
                    {m.estimated_days_min != null
                      ? `${m.estimated_days_min}–${m.estimated_days_max ?? m.estimated_days_min} days`
                      : '—'}
                  </td>
                  <td className="px-4 py-3">
                    {m.is_active ? <Pill tone="green">Active</Pill> : <Pill tone="slate">Off</Pill>}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button className={btnSmall} onClick={() => setMethodEdit(m)}>
                      Edit
                    </button>
                    <button className={`${btnSmall} ml-2 text-rose-300`} onClick={() => delMethod(m)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>

      {zoneEdit && (
        <ZoneForm
          row={zoneEdit === 'new' ? null : zoneEdit}
          onClose={() => setZoneEdit(null)}
          onSaved={() => {
            setZoneEdit(null)
            refresh()
          }}
        />
      )}
      {methodEdit && (
        <MethodForm
          row={methodEdit === 'new' ? null : methodEdit}
          zones={zones}
          onClose={() => setMethodEdit(null)}
          onSaved={() => {
            setMethodEdit(null)
            refresh()
          }}
        />
      )}
    </div>
  )
}

function ShippingCalculator({ zones, methods }: { zones: Zone[]; methods: Method[] }) {
  const [country, setCountry] = useState('CY')
  const [subtotal, setSubtotal] = useState('40.00')

  const code = country.trim().toUpperCase()
  const subtotalCents = Math.round(Number(subtotal || 0) * 100)

  const zone =
    zones.find((z) => z.is_active && z.countries.includes(code)) ??
    zones.find((z) => z.is_active && z.countries.length === 0) ??
    null

  const options = zone
    ? methods
        .filter((m) => m.zone_id === zone.id && m.is_active)
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((m) => {
          const free = m.free_over_cents != null && subtotalCents >= m.free_over_cents
          return { m, costCents: free ? 0 : m.price_cents, free }
        })
    : []

  return (
    <Card>
      <div className="border-b border-white/10 px-4 py-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
          🧮 Shipping cost calculator
        </h2>
      </div>
      <div className="grid gap-4 p-4 sm:grid-cols-2">
        <Field label="Destination country code">
          <input
            className={fieldCls}
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            placeholder="CY, DE, GB, US…"
          />
        </Field>
        <Field label="Order subtotal (€)">
          <input
            className={fieldCls}
            type="number"
            step="0.01"
            value={subtotal}
            onChange={(e) => setSubtotal(e.target.value)}
          />
        </Field>
      </div>
      <div className="px-4 pb-4">
        {!code ? (
          <p className="text-sm text-slate-500">Enter a destination country code.</p>
        ) : !zone ? (
          <p className="text-sm text-amber-300">
            No active zone matches “{code}”. Add a Worldwide zone (no countries) as a fallback.
          </p>
        ) : (
          <>
            <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
              <span className="text-slate-400">
                Matched zone: <span className="font-semibold text-white">{zone.name}</span>
              </span>
              <span className="text-slate-400">
                Products (price as set): <span className="font-semibold text-white">€{centsToEuros(subtotalCents)}</span>
              </span>
              {options.some((o) => o.free) ? (
                <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-semibold text-emerald-300">
                  ✓ Within free-shipping range — customer pays product price only
                </span>
              ) : (
                <span className="rounded-full bg-amber-500/15 px-2.5 py-0.5 text-xs font-semibold text-amber-300">
                  Shipping fee applies for this destination
                </span>
              )}
            </div>
            <div className="overflow-hidden rounded-lg border border-white/10">
              <table className={tableCls}>
                <thead className={theadCls}>
                  <tr>
                    <th className={thCls}>UPS service</th>
                    <th className={thCls}>Delivery</th>
                    <th className={thCls}>Shipping fee</th>
                    <th className={`${thCls} text-right`}>Order total</th>
                  </tr>
                </thead>
                <tbody className={tbodyCls}>
                  {options.length === 0 ? (
                    <TableState colSpan={4} text="No active methods for this zone." />
                  ) : (
                    options.map(({ m, costCents, free }) => (
                      <tr key={m.id} className={trCls}>
                        <td className="px-4 py-2.5 font-semibold text-white">{m.name}</td>
                        <td className="px-4 py-2.5 text-slate-400">
                          {m.estimated_days_min != null
                            ? `${m.estimated_days_min}–${m.estimated_days_max ?? m.estimated_days_min} days`
                            : '—'}
                        </td>
                        <td className="px-4 py-2.5">
                          {free ? (
                            <span className="font-semibold text-emerald-300">FREE</span>
                          ) : (
                            <>
                              <span className="font-semibold text-white">€{centsToEuros(costCents)}</span>
                              {m.free_over_cents != null && (
                                <div className="text-xs text-slate-500">
                                  free over €{centsToEuros(m.free_over_cents)}
                                </div>
                              )}
                            </>
                          )}
                        </td>
                        <td className="px-4 py-2.5 text-right font-bold text-white">
                          €{centsToEuros(subtotalCents + costCents)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              Rates are fully editable below — update any UPS fee or free-shipping
              threshold whenever UPS changes their offers.
            </p>
          </>
        )}
      </div>
    </Card>
  )
}

function ZoneForm({
  row,
  onClose,
  onSaved,
}: {
  row: Zone | null
  onClose: () => void
  onSaved: () => void
}) {
  const [name, setName] = useState(row?.name ?? '')
  const [countries, setCountries] = useState((row?.countries ?? []).join(', '))
  const [isActive, setIsActive] = useState(row?.is_active ?? true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return setError('Name is required.')
    const payload = {
      name: name.trim(),
      countries: countries
        .split(',')
        .map((c) => c.trim().toUpperCase())
        .filter(Boolean),
      is_active: isActive,
    }
    setSaving(true)
    try {
      if (row) await updateRow('shipping_zones', row.id, payload)
      else await insertRow('shipping_zones', payload)
      onSaved()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      title={row ? 'Edit zone' : 'New zone'}
      onClose={onClose}
      footer={
        <>
          <button className={btnGhost} onClick={onClose} type="button">
            Cancel
          </button>
          <button className={btnPrimary} form="zone-form" disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </button>
        </>
      }
    >
      <form id="zone-form" onSubmit={submit} className="grid gap-4">
        <ErrorNote msg={error} />
        <Field label="Zone name">
          <input className={fieldCls} value={name} onChange={(e) => setName(e.target.value)} placeholder="Europe" />
        </Field>
        <Field label="Country codes (comma-separated, blank = everywhere)">
          <input className={fieldCls} value={countries} onChange={(e) => setCountries(e.target.value)} placeholder="GR, BG, CY, DE" />
        </Field>
        <label className="flex items-center gap-2 text-sm text-slate-200">
          <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="h-4 w-4 accent-cyan-400" />
          Active
        </label>
      </form>
    </Modal>
  )
}

function MethodForm({
  row,
  zones,
  onClose,
  onSaved,
}: {
  row: Method | null
  zones: Zone[]
  onClose: () => void
  onSaved: () => void
}) {
  const [zoneId, setZoneId] = useState(row?.zone_id ?? zones[0]?.id ?? '')
  const [name, setName] = useState(row?.name ?? '')
  const [description, setDescription] = useState(row?.description ?? '')
  const [price, setPrice] = useState(centsToEuros(row?.price_cents ?? 0))
  const [freeOver, setFreeOver] = useState(centsToEuros(row?.free_over_cents))
  const [daysMin, setDaysMin] = useState(row?.estimated_days_min != null ? String(row.estimated_days_min) : '')
  const [daysMax, setDaysMax] = useState(row?.estimated_days_max != null ? String(row.estimated_days_max) : '')
  const [sortOrder, setSortOrder] = useState(String(row?.sort_order ?? 0))
  const [isActive, setIsActive] = useState(row?.is_active ?? true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return setError('Name is required.')
    const payload = {
      zone_id: zoneId || null,
      name: name.trim(),
      description: description.trim(),
      price_cents: eurosToCents(price || 0),
      free_over_cents: freeOver ? eurosToCents(freeOver) : null,
      estimated_days_min: daysMin ? parseInt(daysMin, 10) : null,
      estimated_days_max: daysMax ? parseInt(daysMax, 10) : null,
      sort_order: parseInt(sortOrder, 10) || 0,
      is_active: isActive,
    }
    setSaving(true)
    try {
      if (row) await updateRow('shipping_methods', row.id, payload)
      else await insertRow('shipping_methods', payload)
      onSaved()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      title={row ? 'Edit method' : 'New method'}
      onClose={onClose}
      footer={
        <>
          <button className={btnGhost} onClick={onClose} type="button">
            Cancel
          </button>
          <button className={btnPrimary} form="method-form" disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </button>
        </>
      }
    >
      <form id="method-form" onSubmit={submit} className="grid gap-4">
        <ErrorNote msg={error} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Zone">
            <select className={fieldCls} value={zoneId} onChange={(e) => setZoneId(e.target.value)}>
              {zones.map((z) => (
                <option key={z.id} value={z.id}>
                  {z.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Method name">
            <input className={fieldCls} value={name} onChange={(e) => setName(e.target.value)} placeholder="Standard" />
          </Field>
        </div>
        <Field label="Description">
          <input className={fieldCls} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Tracked delivery" />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Price (€)">
            <input className={fieldCls} type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} />
          </Field>
          <Field label="Free over (€) — leave blank for never">
            <input className={fieldCls} type="number" step="0.01" placeholder="e.g. 35.00" value={freeOver} onChange={(e) => setFreeOver(e.target.value)} />
          </Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Days (min)">
            <input className={fieldCls} type="number" value={daysMin} onChange={(e) => setDaysMin(e.target.value)} />
          </Field>
          <Field label="Days (max)">
            <input className={fieldCls} type="number" value={daysMax} onChange={(e) => setDaysMax(e.target.value)} />
          </Field>
          <Field label="Sort order">
            <input className={fieldCls} type="number" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} />
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
