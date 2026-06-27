import { useTranslation } from '../i18n/LanguageContext'
import type { TranslationKey } from '../i18n/translations'

function CatalogFileIcon() {
  return (
    <svg
      viewBox="0 0 56 56"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="h-14 w-14 shrink-0"
    >
      {/* Document body */}
      <rect x="8" y="4" width="36" height="48" rx="5" fill="#164e63" />
      {/* Folded top-right corner */}
      <path d="M35 4 L44 13 L35 13 Z" fill="#0e7490" />
      <path d="M35 4 L35 13 L44 13" stroke="#22d3ee" strokeWidth="1" fill="none" />
      {/* Horizontal lines (page content illusion) */}
      <rect x="13" y="18" width="18" height="2" rx="1" fill="#22d3ee" opacity="0.35" />
      <rect x="13" y="23" width="14" height="2" rx="1" fill="#22d3ee" opacity="0.25" />
      {/* Fish body */}
      <ellipse cx="26" cy="37" rx="9" ry="5.5" fill="#22d3ee" />
      {/* Fish tail */}
      <path d="M35 37 L41 31 L41 43 Z" fill="#22d3ee" />
      {/* Fish eye */}
      <circle cx="20" cy="35.5" r="1.4" fill="#164e63" />
      {/* Fish fin (top) */}
      <path d="M24 31.5 Q27 28 30 31.5" stroke="#67e8f9" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      {/* Fish gill line */}
      <path d="M22 33 Q22 38 22.5 41" stroke="#0e7490" strokeWidth="1.2" fill="none" strokeLinecap="round" />
    </svg>
  )
}

interface CatalogFile {
  href: string
  download: string
  titleKey: TranslationKey
  descKey: TranslationKey
}

// Static PDFs served from /public. The folder name contains spaces, so the
// path is URL-encoded.
const FILES: CatalogFile[] = [
  {
    href: '/pictures/products/Discusfood-Katalog-2025.pdf',
    download: 'Discusfood-Katalog-2025.pdf',
    titleKey: 'catalog.dlProducts',
    descKey: 'catalog.dlProductsDesc',
  },
  {
    href: '/pictures/New%20products%20Coming%20Soon/Katalog-2026-EN-v1.pdf',
    download: 'New-Products-Coming-Soon-Katalog-2026-EN.pdf',
    titleKey: 'catalog.dlNew',
    descKey: 'catalog.dlNewDesc',
  },
]

interface CatalogDownloadDrawerProps {
  open: boolean
  onClose: () => void
}

export function CatalogDownloadDrawer({ open, onClose }: CatalogDownloadDrawerProps) {
  const { t } = useTranslation()

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
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-slate-900 text-slate-100 shadow-2xl transition-transform duration-300 ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
        role="dialog"
        aria-label={t('catalog.download')}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <div>
            <h2 className="text-lg font-bold text-white">{t('catalog.download')}</h2>
            <p className="mt-0.5 text-xs text-slate-400">{t('catalog.downloadSub')}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-full text-slate-400 transition hover:bg-white/10 hover:text-white"
            aria-label={t('catalog.close')}
          >
            ✕
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
          {FILES.map((file) => (
            <div
              key={file.href}
              className="flex gap-4 rounded-2xl border border-white/10 bg-white/5 p-4"
            >
              <CatalogFileIcon />
              <div className="flex flex-1 flex-col">
                <p className="text-sm font-semibold text-white">{t(file.titleKey)}</p>
                <p className="mt-0.5 text-xs text-slate-400">{t(file.descKey)}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <a
                    href={file.href}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-4 py-2 text-xs font-bold text-slate-200 transition hover:bg-white/10"
                  >
                    ↗ {t('catalog.dlOpen')}
                  </a>
                  <a
                    href={file.href}
                    download={file.download}
                    className="inline-flex items-center gap-1.5 rounded-full bg-cyan-400 px-4 py-2 text-xs font-bold text-slate-900 transition hover:bg-cyan-300"
                  >
                    ⬇ {t('catalog.dlButton')}
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </aside>
    </>
  )
}
