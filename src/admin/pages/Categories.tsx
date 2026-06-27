import { useEffect, useState } from 'react'
import {
  fetchAll,
  insertRow,
  updateRow,
  deleteRow,
  uploadImage,
} from '../lib/adminApi'
import {
  PageHeader,
  ErrorNote,
  Field,
  Card,
  Pill,
  Modal,
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

interface Category {
  id: string
  slug: string
  name: string
  description: string
  image_url: string | null
  sort_order: number
  is_active: boolean
}

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')

export function Categories() {
  const [rows, setRows] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState<Category | 'new' | null>(null)

  async function refresh() {
    setLoading(true)
    try {
      setRows(await fetchAll<Category>('categories', '*', { col: 'sort_order' }))
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

  async function remove(c: Category) {
    if (!confirm(`Delete category "${c.name}"?`)) return
    try {
      await deleteRow('categories', c.id)
      setRows((r) => r.filter((x) => x.id !== c.id))
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Delete failed')
    }
  }

  return (
    <div>
      <PageHeader
        icon="🗂️"
        title="Categories"
        description="Organise products into shoppable categories."
        action={
          <button className={btnPrimary} onClick={() => setEditing('new')}>
            + Add category
          </button>
        }
      />
      <ErrorNote msg={error} />
      <Card>
        <table className={tableCls}>
          <thead className={theadCls}>
            <tr>
              <th className={thCls}>Category</th>
              <th className={thCls}>Slug</th>
              <th className={thCls}>Order</th>
              <th className={thCls}>Status</th>
              <th className={`${thCls} text-right`}>Actions</th>
            </tr>
          </thead>
          <tbody className={tbodyCls}>
            {loading ? (
              <TableState colSpan={5} text="Loading…" />
            ) : rows.length === 0 ? (
              <TableState colSpan={5} text="No categories yet." />
            ) : (
              rows.map((c) => (
                <tr key={c.id} className={trCls}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-lg bg-slate-950">
                        {c.image_url ? (
                          <img src={c.image_url} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <span className="text-slate-600">🗂️</span>
                        )}
                      </div>
                      <span className="font-semibold text-white">{c.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-400">{c.slug}</td>
                  <td className="px-4 py-3 text-slate-300">{c.sort_order}</td>
                  <td className="px-4 py-3">
                    {c.is_active ? <Pill tone="green">Active</Pill> : <Pill tone="slate">Hidden</Pill>}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button className={btnSmall} onClick={() => setEditing(c)}>
                      Edit
                    </button>
                    <button
                      className={`${btnSmall} ml-2 text-rose-300`}
                      onClick={() => remove(c)}
                    >
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
        <CategoryForm
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

function CategoryForm({
  row,
  onClose,
  onSaved,
}: {
  row: Category | null
  onClose: () => void
  onSaved: () => void
}) {
  const [name, setName] = useState(row?.name ?? '')
  const [slug, setSlug] = useState(row?.slug ?? '')
  const [slugTouched, setSlugTouched] = useState(!!row)
  const [description, setDescription] = useState(row?.description ?? '')
  const [sortOrder, setSortOrder] = useState(String(row?.sort_order ?? 0))
  const [isActive, setIsActive] = useState(row?.is_active ?? true)
  const [imageUrl, setImageUrl] = useState(row?.image_url ?? '')
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const effSlug = slugTouched ? slug : slugify(name)

  async function onImage(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    setUploading(true)
    try {
      setImageUrl(await uploadImage(f))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return setError('Name is required.')
    const payload = {
      name: name.trim(),
      slug: effSlug || slugify(name),
      description: description.trim(),
      sort_order: parseInt(sortOrder, 10) || 0,
      is_active: isActive,
      image_url: imageUrl || null,
    }
    setSaving(true)
    try {
      if (row) await updateRow('categories', row.id, payload)
      else await insertRow('categories', payload)
      onSaved()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      title={row ? 'Edit category' : 'New category'}
      onClose={onClose}
      footer={
        <>
          <button className={btnGhost} onClick={onClose} type="button">
            Cancel
          </button>
          <button className={btnPrimary} form="cat-form" disabled={saving || uploading}>
            {saving ? 'Saving…' : 'Save'}
          </button>
        </>
      }
    >
      <form id="cat-form" onSubmit={submit} className="grid gap-4">
        <ErrorNote msg={error} />
        <div className="flex items-center gap-4">
          <div className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-xl border border-white/10 bg-slate-950">
            {imageUrl ? (
              <img src={imageUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="text-2xl text-slate-700">🗂️</span>
            )}
          </div>
          <Field label="Category image">
            <input type="file" accept="image/*" onChange={onImage} className="text-sm text-slate-300 file:mr-3 file:rounded-lg file:border-0 file:bg-cyan-400 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-slate-900" />
            {uploading && <p className="mt-1 text-xs text-cyan-300">Uploading…</p>}
          </Field>
        </div>
        <Field label="Name *">
          <input className={fieldCls} value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Slug">
            <input
              className={fieldCls}
              value={effSlug}
              onChange={(e) => {
                setSlugTouched(true)
                setSlug(e.target.value)
              }}
            />
          </Field>
          <Field label="Sort order">
            <input
              className={fieldCls}
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            />
          </Field>
        </div>
        <Field label="Description">
          <textarea
            className={fieldCls}
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </Field>
        <label className="flex items-center gap-2 text-sm text-slate-200">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="h-4 w-4 accent-cyan-400"
          />
          Active (visible in store)
        </label>
      </form>
    </Modal>
  )
}
