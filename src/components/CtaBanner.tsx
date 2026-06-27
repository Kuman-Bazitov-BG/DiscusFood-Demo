import { useTranslation } from '../i18n/LanguageContext'

export function CtaBanner() {
  const { t } = useTranslation()
  return (
    <section className="relative overflow-hidden">
      {/* Parallax photo background (discus row on black) */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-fixed"
        style={{ backgroundImage: "url('/pictures/discus-row.webp')" }}
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-slate-950/70" />

      <div className="relative mx-auto max-w-3xl px-4 py-16 text-center text-white sm:px-5 sm:py-28">
        <h2 className="text-2xl font-extrabold tracking-tight drop-shadow sm:text-4xl">
          {t('cta.title')}
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-sm text-slate-200 sm:mt-4 sm:text-base">
          {t('cta.subtitle')}
        </p>
        <a
          href="#products"
          className="mt-6 inline-block rounded-full bg-cyan-400 px-5 py-2.5 text-xs font-bold text-slate-900 shadow-lg shadow-cyan-500/30 transition hover:bg-cyan-300 sm:mt-8 sm:px-7 sm:py-3 sm:text-sm"
        >
          {t('cta.shopNow')}
        </a>
      </div>
    </section>
  )
}
