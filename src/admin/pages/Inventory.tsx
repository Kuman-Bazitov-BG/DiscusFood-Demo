import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { fetchAll, updateRow, insertRow } from '../lib/adminApi'
import {
  PageHeader,
  ErrorNote,
  Card,
  Pill,
  TableState,
  fieldCls,
  btnSmall,
  tableCls,
  theadCls,
  thCls,
  tbodyCls,
  trCls,
} from '../components/ui'
import { PageSearch } from '../components/PageSearch'
import { useQuery, matchQuery } from '../lib/pageQuery'

interface Row {
  id: string
  name: string
  sku: string | null
  stock: number
  low_stock_threshold: number
}

export function Inventory() {
  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [drafts, setDrafts] = useState<Record<string, string>>({})
  const [savingId, setSavingId] = useState('')
  const [q, setQ] = useQuery()

  async function refresh() {
    setLoading(true)
    try {
      const data = await fetchAll<Row>(
        'products',
        'id, name, sku, stock, low_stock_threshold',
        { col: 'name' },
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

  async function save(r: Row) {
    const next = parseInt(drafts[r.id] ?? String(r.stock), 10)
    if (Number.isNaN(next) || next === r.stock) return
    setSavingId(r.id)
    try {
      await updateRow('products', r.id, { stock: next })
      // Log the movement for the audit trail.
      await insertRow('stock_movements', {
        product_id: r.id,
        change: next - r.stock,
        reason: next > r.stock ? 'restock' : 'correction',
        created_by: (await supabase.auth.getUser()).data.user?.id ?? null,
      })
      setRows((list) => list.map((x) => (x.id === r.id ? { ...x, stock: next } : x)))
      setDrafts((d) => {
        const n = { ...d }
        delete n[r.id]
        return n
      })
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Save failed')
    } finally {
      setSavingId('')
    }
  }

  const lowCount = rows.filter((r) => r.stock <= r.low_stock_threshold).length
  const shown = rows.filter((r) => matchQuery(q, [r.name, r.sku]))

  return (
    <div>
      <PageHeader
        icon="📦"
        title="Stock & Inventory"
        description="Track and adjust stock levels. Changes are logged to the movement history."
        action={<PageSearch q={q} setQ={setQ} placeholder="Search inventory…" />}
      />
      {lowCount > 0 && (
        <p className="mb-4 rounded-lg bg-amber-500/10 px-3 py-2 text-sm text-amber-300">
          ⚠️ {lowCount} product{lowCount > 1 ? 's are' : ' is'} at or below the low-stock threshold.
        </p>
      )}
      <ErrorNote msg={error} />
      <Card>
        <table className={tableCls}>
          <thead className={theadCls}>
            <tr>
              <th className={thCls}>Product</th>
              <th className={thCls}>Current</th>
              <th className={thCls}>Low at</th>
              <th className={thCls}>Status</th>
              <th className={thCls}>Set new stock</th>
            </tr>
          </thead>
          <tbody className={tbodyCls}>
            {loading ? (
              <TableState colSpan={5} text="Loading…" />
            ) : shown.length === 0 ? (
              <TableState colSpan={5} text={q ? 'No matching products.' : 'No products yet.'} />
            ) : (
              shown.map((r) => {
                const low = r.stock <= r.low_stock_threshold
                const out = r.stock <= 0
                return (
                  <tr key={r.id} className={trCls}>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-white">{r.name}</div>
                      <div className="text-xs text-slate-500">{r.sku ? `SKU ${r.sku}` : '—'}</div>
                    </td>
                    <td className={`px-4 py-3 font-semibold ${low ? 'text-amber-300' : 'text-white'}`}>
                      {r.stock}
                    </td>
                    <td className="px-4 py-3 text-slate-400">{r.low_stock_threshold}</td>
                    <td className="px-4 py-3">
                      {out ? (
                        <Pill tone="rose">Out of stock</Pill>
                      ) : low ? (
                        <Pill tone="amber">Low</Pill>
                      ) : (
                        <Pill tone="green">In stock</Pill>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="0"
                          className={`${fieldCls} w-24`}
                          value={drafts[r.id] ?? String(r.stock)}
                          onChange={(e) =>
                            setDrafts((d) => ({ ...d, [r.id]: e.target.value }))
                          }
                        />
                        <button
                          className={btnSmall}
                          disabled={savingId === r.id}
                          onClick={() => save(r)}
                        >
                          {savingId === r.id ? '…' : 'Save'}
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </Card>
    </div>
  )
}
