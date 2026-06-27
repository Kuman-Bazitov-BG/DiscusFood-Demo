import { useTranslation } from '../i18n/LanguageContext'
import { DEMO_MODE, DEMO_TEST_CARD } from '../lib/demo'

// Self-contained copy (kept out of translations.ts so the demo layer stays
// isolated and easy to drop when promoting the demo to production).
const COPY: Record<string, { badge: string; title: string; message: string }> = {
  en: {
    badge: 'DEMO',
    title: 'Demo / Test mode',
    message: `This is a demonstration store for portfolio purposes. Payments are simulated — no real charges are made. Try checkout with the Stripe test card ${DEMO_TEST_CARD} (any future date / any CVC).`,
  },
  bg: {
    badge: 'ДЕМО',
    title: 'Демо / Тестов режим',
    message: `Това е демонстрационен магазин за портфолио. Плащанията са симулирани — не се правят реални такси. Пробвай checkout с тестовата карта на Stripe ${DEMO_TEST_CARD} (произволна бъдеща дата / произволен CVC).`,
  },
  el: {
    badge: 'DEMO',
    title: 'Demo / Δοκιμαστική λειτουργία',
    message: `Αυτό είναι ένα demo κατάστημα για χαρτοφυλάκιο. Οι πληρωμές είναι προσομοιωμένες — δεν γίνονται πραγματικές χρεώσεις. Δοκιμάστε το checkout με τη δοκιμαστική κάρτα Stripe ${DEMO_TEST_CARD} (οποιαδήποτε μελλοντική ημερομηνία / CVC).`,
  },
}

/**
 * Always-visible top banner shown only when DEMO_MODE is on. Makes it
 * unmistakable that the store is a simulated demo and that payments are fake.
 */
export function DemoBanner({ sticky = true }: { sticky?: boolean }) {
  const { lang } = useTranslation()
  if (!DEMO_MODE) return null
  const copy = COPY[lang] ?? COPY.en

  return (
    <div
      role="status"
      aria-live="polite"
      className={`${sticky ? 'sticky top-0' : ''} z-[70] border-b border-amber-300/40 bg-amber-400 text-amber-950`}
    >
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-3 gap-y-1 px-4 py-2 text-sm">
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-950 px-2.5 py-0.5 text-xs font-bold tracking-wide text-amber-50">
          <span aria-hidden>🐟</span> {copy.badge}
        </span>
        <span className="font-semibold">{copy.title}</span>
        <span className="opacity-90">— {copy.message}</span>
      </div>
    </div>
  )
}
