import { useTranslation } from '../i18n/LanguageContext'
import { LANGUAGES } from '../i18n/translations'

interface LanguageDrawerProps {
  open: boolean
  onClose: () => void
}

export function LanguageDrawer({ open, onClose }: LanguageDrawerProps) {
  const { lang, setLang, t } = useTranslation()

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-50 bg-slate-950/70 transition-opacity duration-300 ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        aria-hidden="true"
      />

      {/* Panel */}
      <aside
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-xs flex-col bg-slate-900 text-slate-100 shadow-2xl transition-transform duration-300 ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
        role="dialog"
        aria-label={t('lang.title')}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <h2 className="text-lg font-bold text-white">{t('lang.title')}</h2>
          <button
            type="button"
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-full text-slate-400 transition hover:bg-white/10 hover:text-white"
            aria-label={t('lang.close')}
          >
            ✕
          </button>
        </div>

        <p className="px-5 pt-4 text-sm text-slate-400">{t('lang.subtitle')}</p>

        <ul className="flex flex-col gap-2 px-3 py-4">
          {LANGUAGES.map((option) => {
            const active = option.code === lang
            return (
              <li key={option.code}>
                <button
                  type="button"
                  onClick={() => {
                    setLang(option.code)
                    onClose()
                  }}
                  aria-current={active}
                  className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition ${
                    active
                      ? 'border-cyan-400/60 bg-cyan-400/10'
                      : 'border-white/10 bg-white/5 hover:border-cyan-400/40 hover:bg-white/10'
                  }`}
                >
                  <span className="text-2xl" aria-hidden="true">
                    {option.flag}
                  </span>
                  <span className="flex flex-1 flex-col">
                    <span className="text-sm font-semibold text-white">
                      {option.nativeLabel}
                    </span>
                    <span className="text-xs text-slate-400">{option.label}</span>
                  </span>
                  {active && (
                    <span className="text-cyan-300" aria-hidden="true">
                      ✓
                    </span>
                  )}
                </button>
              </li>
            )
          })}
        </ul>
      </aside>
    </>
  )
}
