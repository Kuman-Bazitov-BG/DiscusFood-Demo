import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  searchAdmin,
  getRecentSearches,
  addRecentSearch,
  clearRecentSearches,
  SEARCH_CATS,
  type AdminCat,
  type SearchGroup,
} from '../lib/adminSearch'

export function GlobalSearch() {
  const navigate = useNavigate()
  const wrapRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const [term, setTerm] = useState('')
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [groups, setGroups] = useState<SearchGroup[]>([])
  const [recent, setRecent] = useState<string[]>([])
  // Empty set means "all categories".
  const [filters, setFilters] = useState<Set<AdminCat>>(new Set())

  // Close on outside click / Escape.
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

  // Debounced search whenever the term or filters change. All state updates
  // happen asynchronously inside the timer so the effect body stays pure.
  useEffect(() => {
    const q = term.trim()
    const cats = filters.size ? [...filters] : undefined
    const handle = setTimeout(async () => {
      if (!q) {
        setGroups([])
        setLoading(false)
        return
      }
      setLoading(true)
      try {
        const res = await searchAdmin(q, { cats, perCat: 4 })
        setGroups(res)
      } finally {
        setLoading(false)
      }
    }, q ? 250 : 0)
    return () => clearTimeout(handle)
  }, [term, filters])

  function toggleFilter(cat: AdminCat) {
    setFilters((prev) => {
      const next = new Set(prev)
      if (next.has(cat)) next.delete(cat)
      else next.add(cat)
      return next
    })
  }

  function go(to: string) {
    addRecentSearch(term)
    setOpen(false)
    navigate(to)
  }

  function viewAll() {
    const q = term.trim()
    if (!q) return
    addRecentSearch(q)
    const params = new URLSearchParams({ q })
    if (filters.size) params.set('cats', [...filters].join(','))
    setOpen(false)
    navigate(`/admin/search?${params.toString()}`)
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    viewAll()
  }

  const hasTerm = term.trim().length > 0
  const totalHits = groups.reduce((n, g) => n + g.hits.length, 0)

  return (
    <div ref={wrapRef} className="relative w-full max-w-xl">
      <form onSubmit={onSubmit}>
        <div className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
            🔎
          </span>
          <input
            ref={inputRef}
            type="search"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            onFocus={() => {
              setRecent(getRecentSearches())
              setOpen(true)
            }}
            placeholder="Search orders, invoices, payments, comments…"
            className="w-full rounded-xl border border-white/15 bg-slate-800/80 py-2.5 pl-10 pr-3 text-sm text-white placeholder-slate-500 outline-none transition focus:border-cyan-400"
            aria-label="Global admin search"
          />
        </div>
      </form>

      {open && (
        <div className="absolute z-50 mt-2 w-full overflow-hidden rounded-2xl border border-white/10 bg-slate-900 shadow-2xl">
          {/* Category filters */}
          <div className="flex flex-wrap gap-1.5 border-b border-white/10 px-3 py-2.5">
            {SEARCH_CATS.map((c) => {
              const on = filters.has(c.key)
              return (
                <button
                  key={c.key}
                  type="button"
                  onClick={() => toggleFilter(c.key)}
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold transition ${
                    on
                      ? 'bg-cyan-400 text-slate-900'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                  title={c.label}
                >
                  <span aria-hidden="true">{c.icon}</span> {c.label}
                </button>
              )
            })}
            {filters.size > 0 && (
              <button
                type="button"
                onClick={() => setFilters(new Set())}
                className="rounded-full px-2.5 py-1 text-xs font-medium text-slate-400 hover:text-white"
              >
                Clear filters
              </button>
            )}
          </div>

          <div className="max-h-[60vh] overflow-y-auto">
            {/* Recent searches (no term yet) */}
            {!hasTerm && (
              <div className="px-2 py-2">
                <div className="flex items-center justify-between px-2 pb-1">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    Recent searches
                  </span>
                  {recent.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        clearRecentSearches()
                        setRecent([])
                      }}
                      className="text-[11px] text-slate-500 hover:text-slate-300"
                    >
                      Clear
                    </button>
                  )}
                </div>
                {recent.length === 0 ? (
                  <p className="px-2 py-3 text-sm text-slate-500">
                    Start typing to search across orders, payments, shipments,
                    invoices, returns and comments.
                  </p>
                ) : (
                  recent.map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => {
                        setTerm(r)
                        inputRef.current?.focus()
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm text-slate-300 hover:bg-white/5"
                    >
                      <span className="text-slate-500">🕘</span> {r}
                    </button>
                  ))
                )}
              </div>
            )}

            {/* Results */}
            {hasTerm && (
              <div className="py-1">
                {loading ? (
                  <p className="px-4 py-6 text-center text-sm text-slate-400">
                    Searching…
                  </p>
                ) : totalHits === 0 ? (
                  <p className="px-4 py-6 text-center text-sm text-slate-400">
                    No matches for “{term.trim()}”.
                  </p>
                ) : (
                  groups.map((g) => (
                    <div key={g.key} className="px-2 py-1.5">
                      <div className="flex items-center gap-2 px-2 pb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                        <span aria-hidden="true">{g.icon}</span> {g.label}
                      </div>
                      {g.hits.map((h) => (
                        <button
                          key={h.id}
                          type="button"
                          onClick={() => go(h.to)}
                          className="flex w-full flex-col rounded-lg px-2 py-1.5 text-left hover:bg-white/5"
                        >
                          <span className="truncate text-sm font-medium text-slate-100">
                            {h.title}
                          </span>
                          <span className="truncate text-xs text-slate-400">
                            {h.subtitle}
                          </span>
                        </button>
                      ))}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* View all */}
          {hasTerm && (
            <button
              type="button"
              onClick={viewAll}
              className="block w-full border-t border-white/10 bg-slate-800/40 px-4 py-3 text-center text-sm font-semibold text-cyan-300 hover:bg-slate-800"
            >
              View all results for “{term.trim()}”
            </button>
          )}
        </div>
      )}
    </div>
  )
}
