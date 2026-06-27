import { useEffect } from 'react'
import { Link, useOutletContext, useParams } from 'react-router-dom'
import { useTranslation } from '../i18n/LanguageContext'
import { formatPrice } from '../lib/format'
import { catalogPagesForSlug, catalogPageImage } from '../data/catalogPages'
import type { StorefrontContext } from '../layouts/StorefrontLayout'

export function ProductDetail() {
  const { slug = '' } = useParams()
  const { products, addToCart } = useOutletContext<StorefrontContext>()
  const { t } = useTranslation()

  const product = products.find((p) => p.slug.toLowerCase() === slug.toLowerCase())

  // Jump to the top whenever a different product is opened.
  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [slug])

  const backLink = (
    <Link
      to="/Cataloge/Products"
      className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-300 transition hover:text-cyan-200"
    >
      <span aria-hidden="true">←</span> {t('product.back')}
    </Link>
  )

  // The catalog data loads asynchronously; show a gentle state until it arrives.
  if (!product) {
    return (
      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-5 sm:py-12">
        {backLink}
        <p className="mt-10 rounded-2xl border border-white/10 bg-white/5 px-4 py-16 text-center text-sm text-slate-400 sm:text-base">
          {products.length === 0 ? t('product.loading') : t('product.notFound')}
        </p>
      </section>
    )
  }

  const comingSoon = product.isComingSoon
  const soldOut = product.stock <= 0
  const pages = catalogPagesForSlug(product.slug)

  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-5 sm:py-12">
      {backLink}

      {/* Header: package shot + product summary */}
      <div className="mt-6 grid gap-6 sm:mt-8 sm:grid-cols-2 sm:gap-10">
        <div className="relative flex items-center justify-center overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900 to-black p-6 sm:p-10">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="max-h-[24rem] w-auto max-w-full object-contain drop-shadow-2xl"
            />
          ) : (
            <span className="text-6xl opacity-40" aria-hidden="true">
              🐟
            </span>
          )}
          {comingSoon && (
            <span className="absolute left-4 top-4 rounded-full bg-cyan-400/90 px-3 py-1 text-xs font-bold text-slate-900">
              {t('product.comingSoon')}
            </span>
          )}
        </div>

        <div className="flex flex-col justify-center">
          <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-4xl">
            {product.name}
          </h1>

          {product.weightGrams ? (
            <span className="mt-3 w-fit rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white">
              {product.weightGrams} g
            </span>
          ) : null}

          {product.description && (
            <p className="mt-4 text-sm leading-relaxed text-slate-300 sm:text-base">
              {product.description}
            </p>
          )}
          {product.details && (
            <p className="mt-3 text-sm leading-relaxed text-slate-400">{product.details}</p>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-4">
            {comingSoon ? (
              <span className="text-xl font-extrabold text-cyan-300 sm:text-2xl">
                {t('product.comingSoon')}
              </span>
            ) : (
              <span className="text-2xl font-extrabold text-white sm:text-3xl">
                {formatPrice(product.priceCents, product.currency)}
              </span>
            )}
            <button
              type="button"
              disabled={comingSoon || soldOut}
              onClick={() => addToCart(product)}
              className="rounded-full bg-cyan-400 px-6 py-2.5 text-sm font-bold text-slate-900 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:bg-slate-600 disabled:text-slate-300 sm:py-3"
            >
              {comingSoon
                ? t('product.comingSoon')
                : soldOut
                  ? t('product.soldOut')
                  : t('product.addToCart')}
            </button>
          </div>
        </div>
      </div>

      {/* Full catalog pages for this product */}
      <div className="mt-12 sm:mt-16">
        <h2 className="text-xl font-extrabold tracking-tight text-white sm:text-2xl">
          {t('product.fromCatalog')}
        </h2>
        <p className="mt-2 text-sm text-slate-400">{t('product.fromCatalogSub')}</p>

        {pages.length === 0 ? (
          <p className="mt-6 rounded-2xl border border-white/10 bg-white/5 px-4 py-12 text-center text-sm text-slate-400">
            {t('product.noCatalog')}
          </p>
        ) : (
          <div className="mt-6 space-y-5 sm:space-y-7">
            {pages.map((page) => (
              <a
                key={page}
                href={catalogPageImage(page)}
                target="_blank"
                rel="noreferrer"
                className="block overflow-hidden rounded-2xl border border-white/10 bg-black/40 shadow-xl shadow-black/30 transition hover:border-cyan-400/40"
              >
                <img
                  src={catalogPageImage(page)}
                  alt={`${product.name} — ${t('product.details')} (${page})`}
                  loading="lazy"
                  className="w-full"
                />
              </a>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
