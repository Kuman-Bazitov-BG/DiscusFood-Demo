import { useNavigate } from 'react-router-dom'
import type { Product } from '../types'
import { formatPrice } from '../lib/format'
import { useTranslation } from '../i18n/LanguageContext'

// Subtle discus photos used only as a faint backdrop when a product has no
// packaging shot of its own. Kept low-opacity so they never dominate the card.
const FALLBACK_IMAGES = [
  '/pictures/discus-closeup.webp',
  '/pictures/discus-tank.jpg',
  '/pictures/hero-wide.jpg',
  '/pictures/discus-row.webp',
]

interface ProductCardProps {
  product: Product
  index: number
  onAdd: (product: Product) => void
}

export function ProductCard({ product, index, onAdd }: ProductCardProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const comingSoon = product.isComingSoon
  const soldOut = product.stock <= 0

  // A real packaging shot is shown in full (contained) on a near-black panel so
  // the studio photos — which are shot on black — blend in seamlessly. The
  // generic discus fallback stays faint so it reads only as a backdrop.
  const hasImage = Boolean(product.imageUrl)
  const image = product.imageUrl ?? FALLBACK_IMAGES[index % FALLBACK_IMAGES.length]
  const needsBreathingRoom =
    product.slug.toLowerCase().includes('probiotic') ||
    product.name.toLowerCase().includes('probiotic')
  const imagePadding = needsBreathingRoom ? 'p-9 sm:p-10' : 'p-3'

  const openDetail = () => navigate(`/Cataloge/Products/${product.slug}`)

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={openDetail}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          openDetail()
        }
      }}
      className="group flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-xl shadow-black/30 backdrop-blur-md transition duration-300 hover:-translate-y-1 hover:border-cyan-400/40 hover:bg-white/[0.08]"
    >
      {/* Image panel — transparent so the card's own tint (the site colours,
          same as behind the description) shows through. White-bg product photos
          have had their background removed to transparency; dark studio pouches
          blend into the tint on their own. */}
      <div className="relative aspect-square overflow-hidden">
        <img
          src={image}
          alt={product.name}
          loading="lazy"
          className={`absolute inset-0 h-full w-full object-contain ${imagePadding} drop-shadow-2xl transition duration-300 group-hover:scale-[1.04] ${
            hasImage ? 'opacity-100' : 'opacity-25'
          }`}
        />

        {/* Badges */}
        {comingSoon && (
          <span className="absolute left-3 top-3 z-10 rounded-full bg-cyan-400/90 px-2.5 py-1 text-xs font-bold text-slate-900 backdrop-blur">
            {t('product.comingSoon')}
          </span>
        )}
        {product.weightGrams ? (
          <span className="absolute right-3 top-3 z-10 rounded-full bg-slate-950/70 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur">
            {product.weightGrams}g
          </span>
        ) : null}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <h3 className="text-sm font-bold text-white sm:text-base">{product.name}</h3>
        <p className="mt-1.5 line-clamp-3 flex-1 text-xs leading-relaxed text-slate-300 sm:text-sm">
          {product.description}
        </p>

        <div className="mt-3 flex items-center justify-between gap-3 sm:mt-4">
          {comingSoon ? (
            <span className="text-sm font-bold text-cyan-300 sm:text-base">
              {t('product.comingSoon')}
            </span>
          ) : (
            <span className="text-base font-extrabold text-white sm:text-lg">
              {formatPrice(product.priceCents, product.currency)}
            </span>
          )}
          <button
            type="button"
            disabled={comingSoon || soldOut}
            onClick={(e) => {
              e.stopPropagation()
              onAdd(product)
            }}
            className="rounded-full bg-cyan-400 px-3 py-1.5 text-xs font-semibold text-slate-900 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:bg-slate-600 disabled:text-slate-300 sm:px-4 sm:py-2 sm:text-sm"
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
  )
}
