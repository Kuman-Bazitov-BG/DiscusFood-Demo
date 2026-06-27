import type { ReactNode } from 'react'

export const fieldCls =
  'w-full rounded-lg border border-white/15 bg-slate-800 px-3 py-2 text-sm text-white placeholder-slate-500 outline-none focus:border-cyan-400'
export const labelCls =
  'mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-400'
export const btnPrimary =
  'rounded-lg bg-cyan-400 px-5 py-2 text-sm font-semibold text-slate-900 transition hover:bg-cyan-300 disabled:opacity-60'
export const btnGhost =
  'rounded-lg border border-white/15 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-white/5'
export const btnSmall =
  'rounded-lg border border-white/15 px-3 py-1.5 text-xs font-semibold text-slate-200 transition hover:bg-white/10'

export function PageHeader({
  icon,
  title,
  description,
  action,
}: {
  icon: string
  title: string
  description: string
  action?: ReactNode
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 className="flex items-center gap-2.5 text-xl font-extrabold text-white sm:text-2xl">
          <span aria-hidden="true">{icon}</span> {title}
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-slate-400">{description}</p>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}

export function ErrorNote({ msg }: { msg: string }) {
  if (!msg) return null
  return (
    <p className="mb-4 rounded-lg bg-rose-500/10 px-3 py-2 text-sm text-rose-300">{msg}</p>
  )
}

export function Field({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      {children}
    </div>
  )
}

export function Card({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-white/10 bg-slate-900/50">
      {children}
    </div>
  )
}

export function Pill({ tone, children }: { tone: 'green' | 'amber' | 'cyan' | 'rose' | 'slate'; children: ReactNode }) {
  const map = {
    green: 'bg-emerald-500/15 text-emerald-300',
    amber: 'bg-amber-500/15 text-amber-300',
    cyan: 'bg-cyan-500/15 text-cyan-300',
    rose: 'bg-rose-500/15 text-rose-300',
    slate: 'bg-slate-700/50 text-slate-300',
  }
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${map[tone]}`}>
      {children}
    </span>
  )
}

export function Modal({
  title,
  onClose,
  children,
  footer,
}: {
  title: string
  onClose: () => void
  children: ReactNode
  footer?: ReactNode
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4">
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm"
      />
      <div className="relative my-6 w-full max-w-2xl rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-extrabold text-white">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-full text-slate-400 hover:bg-white/10 hover:text-white"
          >
            ✕
          </button>
        </div>
        {children}
        {footer && <div className="mt-6 flex justify-end gap-3">{footer}</div>}
      </div>
    </div>
  )
}

/** Standard empty/loading row for tables. */
export function TableState({ colSpan, text }: { colSpan: number; text: string }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-4 py-8 text-center text-slate-400">
        {text}
      </td>
    </tr>
  )
}

export const thCls = 'px-4 py-3 font-semibold'
export const theadCls =
  'border-b border-white/10 text-left text-xs uppercase tracking-wide text-slate-400'
export const tbodyCls = 'divide-y divide-white/5'
export const trCls = 'hover:bg-white/5'
export const tableCls = 'w-full text-left text-sm'
