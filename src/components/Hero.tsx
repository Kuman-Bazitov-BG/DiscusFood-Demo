import { useTranslation } from '../i18n/LanguageContext'

export function Hero() {
  const { t } = useTranslation()
  return (
    <section
      id="top"
      className="relative overflow-hidden text-white"
    >
      {/* Photo background */}
      <img
        src="/pictures/hero-wide.jpg"
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover"
      />
      {/* Dark teal gradient overlay keeps text readable over the photo */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950/92 via-teal-950/80 to-cyan-900/65" />
      <div className="pointer-events-none absolute -right-16 bottom-0 h-80 w-80 rounded-full bg-cyan-400/20 blur-3xl" />

      <div className="relative mx-auto grid max-w-6xl items-center gap-8 px-4 py-14 sm:px-5 sm:py-20 md:grid-cols-2 md:py-28">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-wider text-cyan-200 sm:px-3 sm:text-xs">
            {t('hero.badge')}
          </span>
          <h1 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight drop-shadow-sm sm:mt-5 sm:text-5xl md:text-6xl">
            {t('hero.title1')}
            <br />
            <span className="bg-gradient-to-r from-cyan-300 to-teal-200 bg-clip-text text-transparent">
              {t('hero.title2')}
            </span>
          </h1>
          <p className="mt-4 max-w-md text-base leading-relaxed text-slate-200 sm:mt-5 sm:text-lg">
            {t('hero.subtitle')}
          </p>
          <div className="mt-6 flex flex-wrap gap-2.5 sm:mt-8 sm:gap-3">
            <a
              href="#products"
              className="rounded-full bg-cyan-400 px-5 py-2.5 text-xs font-bold text-slate-900 shadow-lg shadow-cyan-500/30 transition hover:bg-cyan-300 sm:px-6 sm:py-3 sm:text-sm"
            >
              {t('hero.shop')}
            </a>
            <a
              href="#features"
              className="rounded-full border border-white/25 bg-white/5 px-5 py-2.5 text-xs font-semibold text-white backdrop-blur transition hover:bg-white/10 sm:px-6 sm:py-3 sm:text-sm"
            >
              {t('hero.why')}
            </a>
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-4 text-xs text-slate-300 sm:mt-8 sm:gap-6 sm:text-sm">
            <span>{t('hero.rating')}</span>
            <span>{t('hero.shipping')}</span>
          </div>
        </div>

        {/* Floating product highlight card with a real discus photo */}
        <div className="relative hidden md:block">
          <div className="animate-float mx-auto w-64 rounded-3xl bg-white/10 p-4 backdrop-blur-md ring-1 ring-white/20">
            <img
              src="/pictures/discus-closeup.webp"
              alt="Vibrant red and turquoise discus fish"
              className="h-44 w-full rounded-2xl object-cover shadow-inner"
            />
            <p className="mt-4 px-1 text-sm font-semibold text-white">
              {t('hero.cardTitle')}
            </p>
            <p className="px-1 text-xs text-slate-300">
              {t('hero.cardSubtitle')}
            </p>
            <p className="mt-2 px-1 text-lg font-bold text-cyan-200">$14.99</p>
          </div>
        </div>
      </div>
    </section>
  )
}
