import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Product } from '../types'
import { useTranslation } from '../i18n/LanguageContext'
import { formatPrice } from '../lib/format'
import { productMatches } from '../lib/productSearch'

type Scope = 'products' | 'coming'

const TAB_PATH: Record<Scope, string> = {
  products: '/Cataloge/Products',
  coming: '/Cataloge/NewProductsComingsoon',
}

const FALLBACK_IMG = '/pictures/discus-closeup.webp'

/**
 * Customer-facing catalogue search for the home page. Two scope filters map to
 * the two catalogue tabs (Products / New Products Coming Soon). Typing shows a
 * live suggestion dropdown; submitting opens the matching catalogue tab with
 * the query applied (`?q=`).
 */
export function ProductSearch({ products }: { products: Product[] }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const wrapRef = useRef<HTMLDivElement>(null)

  const [term, setTerm] = useState('')
  const [scope, setScope] = useState<Scope>('products')
  const [open, setOpen] = useState(false)

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDocClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [])

  const pool = products.filter((p) =>
    scope === 'products' ? !p.isComingSoon : !!p.isComingSoon,
  )
  const q = term.trim()
  const results = q ? pool.filter((p) => productMatches(p, q)).slice(0, 6) : []

  function openAll() {
    const path = TAB_PATH[scope]
    navigate(q ? `${path}?q=${encodeURIComponent(q)}` : path)
    setOpen(false)
  }

  function openProduct(p: Product) {
    navigate(`${TAB_PATH[scope]}?q=${encodeURIComponent(p.name)}`)
    setOpen(false)
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    openAll()
  }

  const chip = (s: Scope, label: string) => (
    <button
      type="button"
      onClick={() => setScope(s)}
      className={`rounded-full px-4 py-1.5 text-xs font-semibold transition sm:text-sm ${
        scope === s
          ? 'bg-cyan-400 text-slate-900'
          : 'border border-white/15 bg-white/5 text-slate-300 hover:bg-white/10'
      }`}
    >
      {label}
    </button>
  )

  return (
    <section className="relative bg-slate-950/60">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
        <h2 className="text-center text-lg font-extrabold text-white sm:text-2xl">
          {t('search.heading')}
        </h2>

        {/* Two scope filters */}
        <div className="mt-4 flex justify-center gap-2.5">
          {chip('products', t('catalog.tabProducts'))}
          {chip('coming', t('catalog.tabComing'))}
        </div>

        {/* Search field + dropdown */}
        <div ref={wrapRef} className="relative mx-auto mt-4 max-w-xl">
          <form onSubmit={onSubmit}>
            <div className="relative">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                🔎
              </span>
              <input
                type="search"
                value={term}
                onChange={(e) => {
                  setTerm(e.target.value)
                  setOpen(true)
                }}
                onFocus={() => setOpen(true)}
                placeholder={t('search.placeholder')}
                aria-label={t('search.placeholder')}
                className="w-full rounded-full border border-white/15 bg-slate-900/80 py-3 pl-11 pr-28 text-sm text-white placeholder-slate-400 outline-none transition focus:border-cyan-400 sm:text-base"
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-full bg-cyan-400 px-4 py-2 text-xs font-bold text-slate-900 transition hover:bg-cyan-300 sm:text-sm"
              >
                {t('search.button')}
              </button>
            </div>
          </form>

          {open && q && (
            <div className="absolute z-40 mt-2 w-full overflow-hidden rounded-2xl border border-white/10 bg-slate-900 shadow-2xl">
              {results.length === 0 ? (
                <p className="px-4 py-5 text-center text-sm text-slate-400">
                  {t('search.noResults')}
                </p>
              ) : (
                <ul className="max-h-[60vh] divide-y divide-white/5 overflow-y-auto">
                  {results.map((p) => (
                    <li key={p.id}>
                      <button
                        type="button"
                        onClick={() => openProduct(p)}
                        className="flex w-full items-center gap-3 px-3 py-2.5 text-left hover:bg-white/5"
                      >
                        <img
                          src={p.imageUrl ?? FALLBACK_IMG}
                          alt=""
                          className="h-10 w-10 shrink-0 rounded-lg object-cover"
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium text-white">
                            {p.name}
                          </span>
                          <span className="block truncate text-xs text-slate-400">
                            {p.isComingSoon
                              ? t('search.comingSoon')
                              : formatPrice(p.priceCents, p.currency)}
                          </span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              <button
                type="button"
                onClick={openAll}
                className="block w-full border-t border-white/10 bg-slate-800/40 px-4 py-3 text-center text-sm font-semibold text-cyan-300 hover:bg-slate-800"
              >
                {t('search.viewAll')}
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
