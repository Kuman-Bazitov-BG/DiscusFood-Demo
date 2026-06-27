import { useEffect, useState } from 'react'
import {
  fetchAll,
  insertRow,
  updateRow,
  deleteRow,
  uploadImage,
  eurosToCents,
  centsToEuros,
  toTs,
  tsLocal,
  fmtDate,
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
interface Offer {
  id: string
  title: string
  description: string
  discount_type: DType
  value: number
  category_id: string | null
  product_id: string | null
  banner_image_url: string | null
  starts_at: string | null
  ends_at: string | null
  is_active: boolean
}
interface Opt {
  id: string
  name: string
}

export function Offers() {
  const [rows, setRows] = useState<Offer[]>([])
  const [categories, setCategories] = useState<Opt[]>([])
  const [products, setProducts] = useState<Opt[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState<Offer | 'new' | null>(null)
  const [q, setQ] = useQuery()

  async function refresh() {
    setLoading(true)
    try {
      const [o, c, p] = await Promise.all([
        fetchAll<Offer>('offers', '*', { col: 'created_at', asc: false }),
        fetchAll<Opt>('categories', 'id, name', { col: 'sort_order' }),
        fetchAll<Opt>('products', 'id, name', { col: 'name' }),
      ])
      setRows(o)
      setCategories(c)
      setProducts(p)
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

  const scope = (o: Offer) =>
    o.product_id
      ? products.find((p) => p.id === o.product_id)?.name ?? 'Product'
      : o.category_id
        ? categories.find((c) => c.id === o.category_id)?.name ?? 'Category'
        : 'Whole store'

  async function remove(o: Offer) {
    if (!confirm(`Delete offer "${o.title}"?`)) return
    try {
      await deleteRow('offers', o.id)
      setRows((r) => r.filter((x) => x.id !== o.id))
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Delete failed')
    }
  }

  const shown = rows.filter((o) => matchQuery(q, [o.title, o.description]))

  return (
    <div>
      <PageHeader
        icon="✨"
        title="Offers"
        description="Automatic promotions on products or categories."
        action={
          <div className="flex flex-wrap items-center gap-2">
            <PageSearch q={q} setQ={setQ} placeholder="Search offers…" />
            <button className={btnPrimary} onClick={() => setEditing('new')}>
              + Add offer
            </button>
          </div>
        }
      />
      <ErrorNote msg={error} />
      <Card>
        <table className={tableCls}>
          <thead className={theadCls}>
            <tr>
              <th className={thCls}>Offer</th>
              <th className={thCls}>Discount</th>
              <th className={thCls}>Applies to</th>
              <th className={thCls}>Ends</th>
              <th className={thCls}>Status</th>
              <th className={`${thCls} text-right`}>Actions</th>
            </tr>
          </thead>
          <tbody className={tbodyCls}>
            {loading ? (
              <TableState colSpan={6} text="Loading…" />
            ) : shown.length === 0 ? (
              <TableState colSpan={6} text={q ? 'No matching offers.' : 'No offers yet.'} />
            ) : (
              shown.map((o) => (
                <tr key={o.id} className={trCls}>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-white">{o.title}</div>
                    <div className="text-xs text-slate-500">{o.description}</div>
                  </td>
                  <td className="px-4 py-3 text-cyan-300">
                    {o.discount_type === 'percent' ? `${o.value}%` : `€${centsToEuros(o.value)}`}
                  </td>
                  <td className="px-4 py-3 text-slate-300">{scope(o)}</td>
                  <td className="px-4 py-3 text-slate-400">{fmtDate(o.ends_at)}</td>
                  <td className="px-4 py-3">
                    {o.is_active ? <Pill tone="green">Active</Pill> : <Pill tone="slate">Off</Pill>}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button className={btnSmall} onClick={() => setEditing(o)}>
                      Edit
                    </button>
                    <button className={`${btnSmall} ml-2 text-rose-300`} onClick={() => remove(o)}>
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
        <OfferForm
          row={editing === 'new' ? null : editing}
          categories={categories}
          products={products}
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

function OfferForm({
  row,
  categories,
  products,
  onClose,
  onSaved,
}: {
  row: Offer | null
  categories: Opt[]
  products: Opt[]
  onClose: () => void
  onSaved: () => void
}) {
  const [title, setTitle] = useState(row?.title ?? '')
  const [description, setDescription] = useState(row?.description ?? '')
  const [dType, setDType] = useState<DType>(row?.discount_type ?? 'percent')
  const [value, setValue] = useState(
    row ? (row.discount_type === 'percent' ? String(row.value) : centsToEuros(row.value)) : '10',
  )
  const [scopeKind, setScopeKind] = useState<'all' | 'category' | 'product'>(
    row?.product_id ? 'product' : row?.category_id ? 'category' : 'all',
  )
  const [categoryId, setCategoryId] = useState(row?.category_id ?? '')
  const [productId, setProductId] = useState(row?.product_id ?? '')
  const [banner, setBanner] = useState(row?.banner_image_url ?? '')
  const [startsAt, setStartsAt] = useState(tsLocal(row?.starts_at))
  const [endsAt, setEndsAt] = useState(tsLocal(row?.ends_at))
  const [isActive, setIsActive] = useState(row?.is_active ?? true)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function onImage(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    setUploading(true)
    try {
      setBanner(await uploadImage(f))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return setError('Title is required.')
    const payload = {
      title: title.trim(),
      description: description.trim(),
      discount_type: dType,
      value: dType === 'percent' ? parseInt(value, 10) || 0 : eurosToCents(value || 0),
      category_id: scopeKind === 'category' ? categoryId || null : null,
      product_id: scopeKind === 'product' ? productId || null : null,
      banner_image_url: banner || null,
      starts_at: toTs(startsAt),
      ends_at: toTs(endsAt),
      is_active: isActive,
    }
    setSaving(true)
    try {
      if (row) await updateRow('offers', row.id, payload)
      else await insertRow('offers', payload)
      onSaved()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      title={row ? 'Edit offer' : 'New offer'}
      onClose={onClose}
      footer={
        <>
          <button className={btnGhost} onClick={onClose} type="button">
            Cancel
          </button>
          <button className={btnPrimary} form="off-form" disabled={saving || uploading}>
            {saving ? 'Saving…' : 'Save'}
          </button>
        </>
      }
    >
      <form id="off-form" onSubmit={submit} className="grid gap-4">
        <ErrorNote msg={error} />
        <Field label="Title">
          <input className={fieldCls} value={title} onChange={(e) => setTitle(e.target.value)} />
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
            <input className={fieldCls} type="number" step={dType === 'percent' ? '1' : '0.01'} value={value} onChange={(e) => setValue(e.target.value)} />
          </Field>
        </div>
        <Field label="Applies to">
          <select className={fieldCls} value={scopeKind} onChange={(e) => setScopeKind(e.target.value as 'all' | 'category' | 'product')}>
            <option value="all">Whole store</option>
            <option value="category">A category</option>
            <option value="product">A single product</option>
          </select>
        </Field>
        {scopeKind === 'category' && (
          <Field label="Category">
            <select className={fieldCls} value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
              <option value="">— Select —</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
        )}
        {scopeKind === 'product' && (
          <Field label="Product">
            <select className={fieldCls} value={productId} onChange={(e) => setProductId(e.target.value)}>
              <option value="">— Select —</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </Field>
        )}
        <div className="flex items-center gap-4">
          <div className="h-16 w-28 shrink-0 overflow-hidden rounded-lg border border-white/10 bg-slate-950">
            {banner && <img src={banner} alt="" className="h-full w-full object-cover" />}
          </div>
          <Field label="Banner image (optional)">
            <input type="file" accept="image/*" onChange={onImage} className="text-sm text-slate-300 file:mr-3 file:rounded-lg file:border-0 file:bg-cyan-400 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-slate-900" />
            {uploading && <p className="mt-1 text-xs text-cyan-300">Uploading…</p>}
          </Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Starts at">
            <input className={fieldCls} type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} />
          </Field>
          <Field label="Ends at">
            <input className={fieldCls} type="datetime-local" value={endsAt} onChange={(e) => setEndsAt(e.target.value)} />
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
