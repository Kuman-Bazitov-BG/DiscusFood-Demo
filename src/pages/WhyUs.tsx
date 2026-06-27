import { useTranslation } from '../i18n/LanguageContext'
import type { TranslationKey } from '../i18n/translations'

const CARDS: {
  icon: string
  titleKey: TranslationKey
  textKey: TranslationKey
  bullets?: TranslationKey[]
}[] = [
  { icon: '🌟', titleKey: 'whyUs.ingredients.title', textKey: 'whyUs.ingredients.text' },
  {
    icon: '🧬',
    titleKey: 'whyUs.formulas.title',
    textKey: 'whyUs.formulas.text',
    bullets: ['whyUs.formulas.immune', 'whyUs.formulas.color', 'whyUs.formulas.growth'],
  },
  { icon: '💧', titleKey: 'whyUs.water.title', textKey: 'whyUs.water.text' },
  { icon: '🚀', titleKey: 'whyUs.delivery.title', textKey: 'whyUs.delivery.text' },
  { icon: '🤝', titleKey: 'whyUs.expertise.title', textKey: 'whyUs.expertise.text' },
]

export function WhyUs() {
  const { t } = useTranslation()

  return (
    <section className="relative overflow-hidden">
      <div
        className="absolute inset-0 bg-fixed bg-cover bg-center"
        style={{ backgroundImage: "url('/pictures/hero-wide.jpg')" }}
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-slate-950/90" />

      <div className="relative mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
        <div className="mb-12 text-center sm:mb-16">
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
            {t('whyUs.heading')}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-slate-300 sm:text-base">
            {t('whyUs.intro')}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {CARDS.map((card) => (
            <div
              key={card.titleKey}
              className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-md transition hover:border-cyan-400/40 hover:bg-white/10 sm:p-6"
            >
              <div className="mb-3 flex items-center gap-3">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white/10 text-xl ring-1 ring-white/10 sm:h-14 sm:w-14 sm:text-2xl">
                  {card.icon}
                </div>
                <h2 className="text-sm font-bold text-white sm:text-base">{t(card.titleKey)}</h2>
              </div>
              <p className="text-xs leading-relaxed text-slate-300 sm:text-sm">{t(card.textKey)}</p>
              {card.bullets && (
                <ul className="mt-3 space-y-2">
                  {card.bullets.map((bulletKey) => (
                    <li
                      key={bulletKey}
                      className="flex items-start gap-2 text-xs leading-relaxed text-slate-300 sm:text-sm"
                    >
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-400" />
                      {t(bulletKey)}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
