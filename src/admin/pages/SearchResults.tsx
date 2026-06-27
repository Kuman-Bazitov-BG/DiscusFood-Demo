import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { PageHeader, Card, ErrorNote, TableState } from '../components/ui'
import {
  searchAdmin,
  SEARCH_CATS,
  type AdminCat,
  type SearchGroup,
} from '../lib/adminSearch'

function parseCats(raw: string | null): Set<AdminCat> {
  if (!raw) return new Set()
  const valid = new Set(SEARCH_CATS.map((c) => c.key))
  return new Set(raw.split(',').filter((c): c is AdminCat => valid.has(c as AdminCat)))
}

export function SearchResults() {
  const [params, setParams] = useSearchParams()
  const navigate = useNavigate()
  const q = params.get('q') ?? ''
  const filters = parseCats(params.get('cats'))

  const [groups, setGroups] = useState<SearchGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    const run = async () => {
      if (!q.trim()) {
        setGroups([])
        setLoading(false)
        return
      }
      setLoading(true)
      try {
        const res = await searchAdmin(q, {
          cats: filters.size ? [...filters] : undefined,
          perCat: 50,
        })
        if (!cancelled) {
          setGroups(res)
          setError('')
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Search failed')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    run()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, params.get('cats')])

  function toggleFilter(cat: AdminCat) {
    const next = new Set(filters)
    if (next.has(cat)) next.delete(cat)
    else next.add(cat)
    const p = new URLSearchParams(params)
    if (next.size) p.set('cats', [...next].join(','))
    else p.delete('cats')
    setParams(p, { replace: true })
  }

  const total = groups.reduce((n, g) => n + g.hits.length, 0)

  return (
    <div>
      <PageHeader
        icon="🔎"
        title="Search results"
        description={
          q.trim()
            ? `${total} result${total === 1 ? '' : 's'} for “${q.trim()}”`
            : 'Enter a search term to see results.'
        }
      />

      {/* Filters */}
      <div className="mb-5 flex flex-wrap gap-2">
        {SEARCH_CATS.map((c) => {
          const on = filters.has(c.key)
          return (
            <button
              key={c.key}
              type="button"
              onClick={() => toggleFilter(c.key)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                on
                  ? 'bg-cyan-400 text-slate-900'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <span aria-hidden="true">{c.icon}</span> {c.label}
            </button>
          )
        })}
      </div>

      <ErrorNote msg={error} />

      {loading ? (
        <Card>
          <TableStateBlock text="Searching…" />
        </Card>
      ) : !q.trim() ? (
        <Card>
          <TableStateBlock text="Nothing to search for yet." />
        </Card>
      ) : total === 0 ? (
        <Card>
          <TableStateBlock text={`No matches for “${q.trim()}”.`} />
        </Card>
      ) : (
        <div className="space-y-6">
          {groups.map((g) => (
            <div key={g.key}>
              <div className="mb-2 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-sm font-bold text-white">
                  <span aria-hidden="true">{g.icon}</span> {g.label}
                  <span className="rounded-full bg-slate-800 px-2 py-0.5 text-xs font-semibold text-slate-300">
                    {g.hits.length}
                  </span>
                </h2>
                <Link
                  to={`${g.to}?q=${encodeURIComponent(q.trim())}`}
                  className="text-xs font-semibold text-cyan-300 hover:text-cyan-200"
                >
                  Open {g.label} →
                </Link>
              </div>
              <Card>
                <ul className="divide-y divide-white/5">
                  {g.hits.map((h) => (
                    <li key={h.id}>
                      <button
                        type="button"
                        onClick={() => navigate(h.to)}
                        className="flex w-full flex-col px-4 py-3 text-left hover:bg-white/5"
                      >
                        <span className="text-sm font-medium text-slate-100">
                          {h.title}
                        </span>
                        <span className="text-xs text-slate-400">{h.subtitle}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function TableStateBlock({ text }: { text: string }) {
  return (
    <table className="w-full">
      <tbody>
        <TableState colSpan={1} text={text} />
      </tbody>
    </table>
  )
}
