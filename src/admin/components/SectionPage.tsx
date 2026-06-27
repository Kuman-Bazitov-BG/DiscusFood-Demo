interface SectionPageProps {
  icon: string
  title: string
  description: string
  /** What this section will let the admin do (shows the planned capabilities). */
  capabilities: string[]
}

/**
 * Professional placeholder for an admin section whose interactive UI is being
 * built in a later phase. The underlying database tables already exist, so each
 * of these becomes a working CRUD screen as the phases land.
 */
export function SectionPage({
  icon,
  title,
  description,
  capabilities,
}: SectionPageProps) {
  return (
    <div>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2.5 text-2xl font-extrabold text-white">
            <span aria-hidden="true">{icon}</span>
            {title}
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-400">{description}</p>
        </div>
        <span className="shrink-0 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-xs font-semibold text-amber-300">
          Next phase
        </span>
      </div>

      <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-6">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
          Planned in this section
        </h2>
        <ul className="grid gap-2 sm:grid-cols-2">
          {capabilities.map((c) => (
            <li
              key={c}
              className="flex items-start gap-2 rounded-lg bg-white/5 px-3 py-2.5 text-sm text-slate-200"
            >
              <span className="mt-0.5 text-cyan-400">✓</span>
              {c}
            </li>
          ))}
        </ul>
        <p className="mt-4 text-xs text-slate-500">
          The database tables backing this screen are already live — this view
          becomes fully interactive in an upcoming build phase.
        </p>
      </div>
    </div>
  )
}
