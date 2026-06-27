import { useTranslation } from '../i18n/LanguageContext'
import type { TranslationKey } from '../i18n/translations'

const FEATURES: { icon: string; titleKey: TranslationKey; textKey: TranslationKey }[] = [
  { icon: '🎨', titleKey: 'features.color.title', textKey: 'features.color.text' },
  { icon: '🧬', titleKey: 'features.vet.title', textKey: 'features.vet.text' },
  { icon: '💧', titleKey: 'features.water.title', textKey: 'features.water.text' },
  {
    icon: '🚚',
    titleKey: 'features.shipping.title',
    textKey: 'features.shipping.text',
  },
]

export function Features() {
  const { t } = useTranslation()
  return (
    <section id="features" className="relative overflow-hidden">
      {/* Discus photo background with a strong dark overlay */}
      <div
        className="absolute inset-0 bg-fixed bg-cover bg-center"
        style={{ backgroundImage: "url('/pictures/hero-wide.jpg')" }}
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-slate-950/88" />

      <div className="relative mx-auto max-w-6xl px-4 py-14 sm:px-5 sm:py-20">
        <div className="mb-8 text-center sm:mb-12">
          <h2 className="text-2xl font-extrabold tracking-tight text-white sm:text-4xl">
            {t('features.title')}
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-slate-300 sm:mt-3 sm:text-base">
            {t('features.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <div
              key={f.titleKey}
              className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center backdrop-blur-md transition hover:border-cyan-400/40 hover:bg-white/10 sm:p-6"
            >
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-white/10 text-xl ring-1 ring-white/10 sm:h-14 sm:w-14 sm:text-2xl">
                {f.icon}
              </div>
              <h3 className="mt-3 text-sm font-bold text-white sm:mt-4 sm:text-base">{t(f.titleKey)}</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-300 sm:text-sm">
                {t(f.textKey)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
