import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { adminNav } from './adminNav'
import { GlobalSearch } from './components/GlobalSearch'
import { DemoBanner } from '../components/DemoBanner'

/** Shared navigation list, used by both the desktop sidebar and the mobile drawer. */
function NavGroups({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <>
      {adminNav.map((group) => (
        <div key={group.title}>
          <div className="px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            {group.title}
          </div>
          <div className="space-y-0.5">
            {group.items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/admin'}
                onClick={onNavigate}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition ${
                    isActive
                      ? 'bg-cyan-400/15 text-cyan-200'
                      : 'text-slate-300 hover:bg-white/5 hover:text-white'
                  }`
                }
              >
                <span aria-hidden="true">{item.icon}</span>
                {item.label}
              </NavLink>
            ))}
          </div>
        </div>
      ))}
    </>
  )
}

/** Footer with the signed-in user and the store/logout actions. */
function SidebarFooter({
  username,
  onSignOut,
  onNavigate,
}: {
  username: string
  onSignOut: () => void
  onNavigate?: () => void
}) {
  return (
    <div className="border-t border-white/10 p-3">
      <div className="px-2 pb-2 text-xs text-slate-400">{username}</div>
      <div className="flex gap-2">
        <Link
          to="/"
          onClick={onNavigate}
          className="flex-1 rounded-lg border border-white/15 px-3 py-2 text-center text-xs font-semibold text-slate-200 hover:bg-white/5"
        >
          View store
        </Link>
        <button
          type="button"
          onClick={onSignOut}
          className="flex-1 rounded-lg border border-white/15 px-3 py-2 text-xs font-semibold text-slate-200 hover:border-rose-400/40 hover:text-white"
        >
          Log out
        </button>
      </div>
    </div>
  )
}

export function AdminLayout() {
  const { user, profile, loading, isAdmin, signOut } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)

  // Close on Escape and lock body scroll while the drawer is open.
  useEffect(() => {
    if (!menuOpen) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [menuOpen])

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-950/55 text-slate-300">
        Loading…
      </div>
    )
  }

  // Gate: only the admin may enter.
  if (!user || !isAdmin) {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-950/55 px-6 text-center text-slate-200">
        <div className="max-w-sm">
          <div className="mb-3 text-4xl">🔒</div>
          <h1 className="mb-2 text-xl font-bold text-white">Admins only</h1>
          <p className="mb-5 text-sm text-slate-400">
            You need to be signed in as an administrator to view this page.
          </p>
          <Link
            to="/"
            className="inline-flex rounded-full bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-cyan-300"
          >
            ← Back to store
          </Link>
        </div>
      </div>
    )
  }

  const username = profile?.username ?? user.email ?? ''

  return (
    <div className="flex min-h-screen bg-slate-950/45 text-slate-100">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-white/10 bg-slate-900/60 lg:flex">
        <div className="flex items-center gap-2.5 px-5 py-4">
          <Link to="/" aria-label="Go to main page">
            <img
              src="/pictures/Logo/viber_image_2026-06-20_16-16-33-937.jpg"
              alt="DiscusFish"
              className="h-24 w-auto rounded-xl object-contain"
            />
          </Link>
          <div>
            <div className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
              Admin Panel
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-3">
          <NavGroups />
        </nav>

        <SidebarFooter username={username} onSignOut={() => signOut()} />
      </aside>

      {/* Mobile drawer (nav) */}
      <div className="lg:hidden">
        {/* Overlay */}
        <div
          onClick={() => setMenuOpen(false)}
          className={`fixed inset-0 z-50 bg-slate-950/70 transition-opacity duration-300 ${
            menuOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
          }`}
          aria-hidden="true"
        />
        {/* Panel */}
        <aside
          className={`fixed left-0 top-0 z-50 flex h-full w-72 max-w-[85%] flex-col border-r border-white/10 bg-slate-900 shadow-2xl transition-transform duration-300 ${
            menuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
          role="dialog"
          aria-label="Admin navigation"
        >
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <span className="font-extrabold text-white">
              Discus<span className="text-cyan-400">Fish</span> Admin
            </span>
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              className="grid h-8 w-8 place-items-center rounded-full text-slate-400 transition hover:bg-white/10 hover:text-white"
              aria-label="Close menu"
            >
              ✕
            </button>
          </div>

          <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-3">
            <NavGroups onNavigate={() => setMenuOpen(false)} />
          </nav>

          <SidebarFooter
            username={username}
            onSignOut={() => signOut()}
            onNavigate={() => setMenuOpen(false)}
          />
        </aside>
      </div>

      {/* Content */}
      <main className="min-w-0 flex-1">
        <DemoBanner sticky={false} />
        {/* Mobile top bar */}
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 lg:hidden">
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className="grid h-9 w-9 place-items-center rounded-lg border border-white/15 text-slate-200 transition hover:bg-white/10"
            aria-label="Open menu"
          >
            <span className="text-lg leading-none">☰</span>
          </button>
          <span className="font-extrabold text-white">
            Discus<span className="text-cyan-400">Fish</span> Admin
          </span>
          <Link to="/" className="text-sm text-cyan-300">
            Store →
          </Link>
        </div>

        {/* Search header */}
        <div className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/70 px-4 py-3 backdrop-blur sm:px-5 lg:px-8">
          <GlobalSearch />
        </div>

        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-5 lg:px-8 lg:py-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
