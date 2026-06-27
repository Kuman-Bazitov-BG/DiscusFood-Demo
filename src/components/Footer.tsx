import { Link } from 'react-router-dom'
import { useTranslation } from '../i18n/LanguageContext'

export function Footer() {
  const { t } = useTranslation()
  return (
    <footer id="footer" className="bg-slate-900/70 text-slate-300">
      <div className="mx-auto max-w-6xl px-5 py-14">
        <div className="flex flex-col items-start justify-between gap-8 sm:flex-row">
          <div className="max-w-xs">
            <div className="flex items-center">
              <img
                src="/pictures/Logo/viber_image_2026-06-20_16-16-33-937.jpg"
                alt="DiscusFish logo"
                className="h-28 w-auto rounded-2xl object-contain ring-1 ring-white/15 sm:h-36"
              />
            </div>
            <p className="mt-4 text-sm leading-relaxed text-slate-400">
              {t('footer.tagline')}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-10 text-sm">
            <div>
              <h4 className="font-semibold text-white">{t('footer.shop')}</h4>
              <ul className="mt-3 space-y-2 text-slate-400">
                <li>
                  <a href="#products" className="hover:text-teal-400">
                    {t('footer.allFoods')}
                  </a>
                </li>
                <li>
                  <a href="#products" className="hover:text-teal-400">
                    {t('footer.bestSellers')}
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white">{t('footer.support')}</h4>
              <ul className="mt-3 space-y-2 text-slate-400">
                <li>
                  <Link to="/why-us" className="hover:text-teal-400">
                    {t('footer.whyUs')}
                  </Link>
                </li>
                <li>
                  <a
                    href="mailto:hello@discusfish.app"
                    className="hover:text-teal-400"
                  >
                    {t('footer.contact')}
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-6 text-sm text-slate-500">
          © {new Date().getFullYear()} DiscusFish. {t('footer.rights')}
        </div>
      </div>
    </footer>
  )
}
