import { useEffect, useMemo, useState } from 'react'
import { formatPrice } from '../../lib/format'
import {
  type AdminProduct,
  type Category,
  type ProductInput,
  listProducts,
  listCategories,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImage,
  slugify,
  eurosToCents,
  centsToEuros,
} from '../lib/adminProducts'
import { PageSearch } from '../components/PageSearch'
import { useQuery, matchQuery } from '../lib/pageQuery'

export function Products() {
  const [products, setProducts] = useState<AdminProduct[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState<AdminProduct | 'new' | null>(null)
  const [q, setQ] = useQuery()

  const categoryName = useMemo(() => {
    const map = new Map(categories.map((c) => [c.id, c.name]))
    return (id: string | null) => (id ? map.get(id) ?? '—' : '—')
  }, [categories])

  async function refresh() {
    setLoading(true)
    setError('')
    try {
      const [p, c] = await Promise.all([listProducts(), listCategories()])
      setProducts(p)
      setCategories(c)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
  }, [])

  async function handleToggle(p: AdminProduct, field: 'is_active' | 'is_coming_soon') {
    try {
      await updateProduct(p.id, { [field]: !p[field] })
      setProducts((list) =>
        list.map((x) => (x.id === p.id ? { ...x, [field]: !x[field] } : x)),
      )
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Update failed')
    }
  }

  async function handleDelete(p: AdminProduct) {
    if (!confirm(`Delete "${p.name}"? This cannot be undone.`)) return
    try {
      await deleteProduct(p.id)
      setProducts((list) => list.filter((x) => x.id !== p.id))
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Delete failed')
    }
  }

  const shown = products.filter((p) => matchQuery(q, [p.name, p.sku, p.slug]))

  return (
    <div>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2.5 text-2xl font-extrabold text-white">
            <span aria-hidden="true">🐟</span> Products
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Create and edit the fish foods and preparations you sell.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <PageSearch q={q} setQ={setQ} placeholder="Search products…" />
          <button
            type="button"
            onClick={() => setEditing('new')}
            className="rounded-full bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-cyan-300"
          >
            + Add product
          </button>
        </div>
      </div>

      {error && (
        <p className="mb-4 rounded-lg bg-rose-500/10 px-3 py-2 text-sm text-rose-300">
          {error}
        </p>
      )}

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/50">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-white/10 text-xs uppercase tracking-wide text-slate-400">
            <tr>
              <th className="px-4 py-3 font-semibold">Product</th>
              <th className="hidden px-4 py-3 font-semibold sm:table-cell">Category</th>
              <th className="px-4 py-3 font-semibold">Price</th>
              <th className="hidden px-4 py-3 font-semibold md:table-cell">Stock</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                  Loading…
                </td>
              </tr>
            ) : shown.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                  {q
                    ? 'No products match your search.'
                    : 'No products yet. Click “Add product” to create your first one.'}
                </td>
              </tr>
            ) : (
              shown.map((p) => (
                <tr key={p.id} className="hover:bg-white/5">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-lg bg-slate-950">
                        {p.image_url ? (
                          <img
                            src={p.image_url}
                            alt={p.name}
                            className="h-full w-full object-contain"
                          />
                        ) : (
                          <span className="text-slate-600">🐟</span>
                        )}
                      </div>
                      <div>
                        <div className="font-semibold text-white">{p.name}</div>
                        <div className="text-xs text-slate-500">
                          {p.sku ? `SKU ${p.sku}` : 'No SKU'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="hidden px-4 py-3 text-slate-300 sm:table-cell">
                    {categoryName(p.category_id)}
                  </td>
                  <td className="px-4 py-3 text-slate-300">
                    {p.is_coming_soon ? (
                      <span className="text-cyan-300">Coming soon</span>
                    ) : (
                      formatPrice(p.price_cents, p.currency)
                    )}
                  </td>
                  <td className="hidden px-4 py-3 md:table-cell">
                    <span
                      className={
                        p.stock <= p.low_stock_threshold
                          ? 'font-semibold text-amber-300'
                          : 'text-slate-300'
                      }
                    >
                      {p.stock}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleToggle(p, 'is_active')}
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          p.is_active
                            ? 'bg-emerald-500/15 text-emerald-300'
                            : 'bg-slate-700/50 text-slate-400'
                        }`}
                      >
                        {p.is_active ? 'Active' : 'Hidden'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggle(p, 'is_coming_soon')}
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          p.is_coming_soon
                            ? 'bg-cyan-500/15 text-cyan-300'
                            : 'bg-slate-700/50 text-slate-400'
                        }`}
                      >
                        {p.is_coming_soon ? 'Coming soon' : 'On sale'}
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => setEditing(p)}
                      className="rounded-lg border border-white/15 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-white/10"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(p)}
                      className="ml-2 rounded-lg border border-white/15 px-3 py-1.5 text-xs font-semibold text-rose-300 hover:border-rose-400/40"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {editing && (
        <ProductForm
          product={editing === 'new' ? null : editing}
          categories={categories}
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

// ── Add / edit modal ──────────────────────────────────────────────────

interface ProductFormProps {
  product: AdminProduct | null
  categories: Category[]
  onClose: () => void
  onSaved: () => void
}

function ProductForm({ product, categories, onClose, onSaved }: ProductFormProps) {
  const isEdit = !!product
  const [name, setName] = useState(product?.name ?? '')
  const [slug, setSlug] = useState(product?.slug ?? '')
  const [slugTouched, setSlugTouched] = useState(isEdit)
  const [sku, setSku] = useState(product?.sku ?? '')
  const [categoryId, setCategoryId] = useState(product?.category_id ?? '')
  const [description, setDescription] = useState(product?.description ?? '')
  const [details, setDetails] = useState(product?.details ?? '')
  const [price, setPrice] = useState(centsToEuros(product?.price_cents))
  const [compareAt, setCompareAt] = useState(
    centsToEuros(product?.compare_at_price_cents),
  )
  const [weight, setWeight] = useState(
    product?.weight_grams != null ? String(product.weight_grams) : '',
  )
  const [stock, setStock] = useState(String(product?.stock ?? 0))
  const [lowStock, setLowStock] = useState(String(product?.low_stock_threshold ?? 5))
  const [isActive, setIsActive] = useState(product?.is_active ?? true)
  const [isComingSoon, setIsComingSoon] = useState(product?.is_coming_soon ?? true)
  const [imageUrl, setImageUrl] = useState(product?.image_url ?? '')

  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // Keep slug in sync with name until the user edits it manually.
  const effectiveSlug = slugTouched ? slug : slugify(name)

  async function handleImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError('')
    try {
      const url = await uploadProductImage(file)
      setImageUrl(url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Image upload failed')
    } finally {
      setUploading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!name.trim()) {
      setError('Name is required.')
      return
    }
    if (!price || Number.isNaN(Number(price))) {
      setError('Enter a valid price (you can change it later).')
      return
    }

    const input: ProductInput = {
      name: name.trim(),
      slug: effectiveSlug || slugify(name),
      sku: sku.trim() || null,
      category_id: categoryId || null,
      description: description.trim(),
      details: details.trim() || null,
      price_cents: eurosToCents(price),
      compare_at_price_cents: compareAt ? eurosToCents(compareAt) : null,
      image_url: imageUrl || null,
      weight_grams: weight ? parseInt(weight, 10) : null,
      stock: parseInt(stock, 10) || 0,
      low_stock_threshold: parseInt(lowStock, 10) || 0,
      is_active: isActive,
      is_coming_soon: isComingSoon,
    }

    setSaving(true)
    try {
      if (product) await updateProduct(product.id, input)
      else await createProduct(input)
      onSaved()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const field =
    'w-full rounded-lg border border-white/15 bg-slate-800 px-3 py-2 text-sm text-white placeholder-slate-500 outline-none focus:border-cyan-400'
  const label = 'mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-400'

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4">
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm"
      />
      <form
        onSubmit={handleSubmit}
        className="relative my-6 w-full max-w-2xl rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-2xl"
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-extrabold text-white">
            {isEdit ? 'Edit product' : 'New product'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-full text-slate-400 hover:bg-white/10 hover:text-white"
          >
            ✕
          </button>
        </div>

        {error && (
          <p className="mb-4 rounded-lg bg-rose-500/10 px-3 py-2 text-sm text-rose-300">
            {error}
          </p>
        )}

        <div className="grid gap-4">
          {/* Image */}
          <div className="flex items-center gap-4">
            <div className="grid h-24 w-24 shrink-0 place-items-center overflow-hidden rounded-xl border border-white/10 bg-slate-950">
              {imageUrl ? (
                <img src={imageUrl} alt="" className="h-full w-full object-contain" />
              ) : (
                <span className="text-3xl text-slate-700">🐟</span>
              )}
            </div>
            <div>
              <label className={label}>Product picture</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImage}
                className="block text-sm text-slate-300 file:mr-3 file:rounded-lg file:border-0 file:bg-cyan-400 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-slate-900 hover:file:bg-cyan-300"
              />
              {uploading && (
                <p className="mt-1 text-xs text-cyan-300">Uploading…</p>
              )}
              <p className="mt-1 text-xs text-slate-500">
                PNG/JPG. Stored in Supabase. Shown on the product card.
              </p>
            </div>
          </div>

          <div>
            <label className={label}>Name *</label>
            <input className={field} value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={label}>Slug (URL)</label>
              <input
                className={field}
                value={effectiveSlug}
                onChange={(e) => {
                  setSlugTouched(true)
                  setSlug(e.target.value)
                }}
              />
            </div>
            <div>
              <label className={label}>SKU / Article no.</label>
              <input className={field} value={sku} onChange={(e) => setSku(e.target.value)} />
            </div>
          </div>

          <div>
            <label className={label}>Category</label>
            <select
              className={field}
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
            >
              <option value="">— None —</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={label}>Short description (shown on card)</label>
            <textarea
              className={field}
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div>
            <label className={label}>Details (long, supports markdown)</label>
            <textarea
              className={field}
              rows={5}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className={label}>Price (€)</label>
              <input
                className={field}
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>
            <div>
              <label className={label}>Compare-at (€)</label>
              <input
                className={field}
                type="number"
                step="0.01"
                min="0"
                placeholder="optional"
                value={compareAt}
                onChange={(e) => setCompareAt(e.target.value)}
              />
            </div>
            <div>
              <label className={label}>Weight (g)</label>
              <input
                className={field}
                type="number"
                min="0"
                placeholder="optional"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={label}>Stock</label>
              <input
                className={field}
                type="number"
                min="0"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
              />
            </div>
            <div>
              <label className={label}>Low-stock threshold</label>
              <input
                className={field}
                type="number"
                min="0"
                value={lowStock}
                onChange={(e) => setLowStock(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-5 pt-1">
            <label className="flex items-center gap-2 text-sm text-slate-200">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="h-4 w-4 accent-cyan-400"
              />
              Active (visible in store)
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-200">
              <input
                type="checkbox"
                checked={isComingSoon}
                onChange={(e) => setIsComingSoon(e.target.checked)}
                className="h-4 w-4 accent-cyan-400"
              />
              Coming soon (hide price, disable buy)
            </label>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-white/15 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-white/5"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving || uploading}
            className="rounded-lg bg-cyan-400 px-5 py-2 text-sm font-semibold text-slate-900 hover:bg-cyan-300 disabled:opacity-60"
          >
            {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Create product'}
          </button>
        </div>
      </form>
    </div>
  )
}
