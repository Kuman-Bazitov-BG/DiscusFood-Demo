/** Compact search input for a page header, bound to the URL `?q=` term. */
export function PageSearch({
  q,
  setQ,
  placeholder = 'Search…',
}: {
  q: string
  setQ: (v: string) => void
  placeholder?: string
}) {
  return (
    <div className="relative w-full sm:w-64">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
        🔎
      </span>
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="w-full rounded-lg border border-white/15 bg-slate-800 py-2 pl-9 pr-8 text-sm text-white placeholder-slate-500 outline-none focus:border-cyan-400"
      />
      {q && (
        <button
          type="button"
          onClick={() => setQ('')}
          aria-label="Clear search"
          className="absolute right-2 top-1/2 grid h-5 w-5 -translate-y-1/2 place-items-center rounded-full text-slate-400 hover:bg-white/10 hover:text-white"
        >
          ✕
        </button>
      )}
    </div>
  )
}
