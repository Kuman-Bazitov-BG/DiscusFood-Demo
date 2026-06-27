import { Link } from 'react-router-dom'
import type { Product } from '../types'
import { formatPrice } from '../lib/format'
import { useTranslation } from '../i18n/LanguageContext'

interface HomeProductShowcaseProps {
  products: Product[]
  onAdd: (product: Product) => void
}

// A small, curated set of hero products for the Home page, shown as large,
// wide showcase blocks (discusfood.com style) instead of the full catalogue
// grid. Each uses a clean, full-package studio photo (shot on black) so the
// whole packaging is visible — not a tight crop. Live data from Supabase is
// merged in by slug so price/description stay in sync; the fields here are the
// offline fallback and the (better) image always wins.
interface Featured {
  slug: string
  name: string
  description: string
  image: string
  weightGrams?: number
  priceCents: number
  currency: string
}

const FEATURED: Featured[] = [
  {
    slug: 'grand-champion-granulate',
    name: 'Grand Champion Granulate',
    description:
      'Balanced staple granulate for discus with carefully selected vitamins, trace elements and animal/plant energy sources — formulated to grow champions. Sizes 80 g / 230 g.',
    image: '/pictures/products/clean/grand-champion-granulate.jpg',
    priceCents: 1000,
    currency: 'eur',
  },
  {
    slug: 'for-discus-daily-granulate',
    name: 'For Discus Daily Granulate',
    description:
      'Balanced complete granulate especially for discus and all granulate-loving fish, with vitamins, minerals, trace elements and probiotics for everyday nutrition. Sizes 80 g / 230 g / 2800 g.',
    image: '/pictures/products/clean/for-discus-daily-granulate.jpg',
    priceCents: 1000,
    currency: 'eur',
  },
  {
    slug: 'turkey-heart-soft-granulate',
    name: 'Turkey Heart Soft Granulate',
    description:
      'Soft granulate staple for keepers who want animal protein without beef — only the digestible parts of turkey protein, with far lower water load than frozen turkey heart. Sizes 80 g / 230 g.',
    image: '/pictures/products/clean/turkey-heart-soft-granulate.jpg',
    priceCents: 1000,
    currency: 'eur',
  },
  {
    slug: 'betta-special-all-colors-soft',
    name: 'Betta Special All Colors Soft',
    description:
      'Soft granulate tuned to labyrinth fish (bettas). The soft texture protects the delicate mouth; omega-3 fish oil and digestible krill support vitality and intense colour. 50 g.',
    image: '/pictures/products/clean/betta-special-all-colors-soft.jpg',
    weightGrams: 50,
    priceCents: 1000,
    currency: 'eur',
  },
  {
    slug: 'cichlids-xl-granulate-1',
    name: 'Cichlids XL Premium Granulate · Comp. 1',
    description:
      'High-quality complete granulate for cichlids and large fish — plant-forward with 13.5% Chlorella, fennel and a little zeolite for healthy digestion. Ideal paired with Composition 2. 500 g.',
    image: '/pictures/products/clean/cichlids-xl-granulate-1.jpg',
    weightGrams: 500,
    priceCents: 1000,
    currency: 'eur',
  },
]

// One accent palette per block, cycled by position, to keep the long list of
// dark blocks lively without overwhelming the photography.
const ACCENTS = [
  { tag: 'text-rose-200', price: 'text-rose-200', button: 'bg-rose-400 hover:bg-rose-300', glow: 'bg-rose-400/25', border: 'from-rose-500/30 via-white/10 to-amber-400/20' },
  { tag: 'text-cyan-200', price: 'text-cyan-200', button: 'bg-cyan-400 hover:bg-cyan-300', glow: 'bg-cyan-400/25', border: 'from-cyan-500/30 via-white/10 to-teal-400/20' },
  { tag: 'text-amber-200', price: 'text-amber-200', button: 'bg-amber-300 hover:bg-amber-200', glow: 'bg-amber-300/25', border: 'from-amber-400/30 via-white/10 to-lime-400/20' },
  { tag: 'text-fuchsia-200', price: 'text-fuchsia-200', button: 'bg-fuchsia-400 hover:bg-fuchsia-300', glow: 'bg-fuchsia-400/25', border: 'from-fuchsia-500/30 via-white/10 to-sky-400/20' },
  { tag: 'text-sky-200', price: 'text-sky-200', button: 'bg-sky-400 hover:bg-sky-300', glow: 'bg-sky-400/25', border: 'from-sky-500/30 via-white/10 to-emerald-400/20' },
]

// Build the cart payload from the curated entry, overlaid with any live fields.
function toProduct(item: Featured, live?: Product): Product {
  return {
    id: live?.id ?? `home-${item.slug}`,
    slug: item.slug,
    name: live?.name ?? item.name,
    description: live?.description ?? item.description,
    priceCents: live?.priceCents ?? item.priceCents,
    currency: live?.currency ?? item.currency,
    imageUrl: item.image,
    weightGrams: live?.weightGrams ?? item.weightGrams ?? null,
    stock: live?.stock ?? 100,
    isActive: true,
  }
}

export function HomeProductShowcase({ products, onAdd }: HomeProductShowcaseProps) {
  const { t } = useTranslation()
  return (
    <section id="products" className="relative overflow-hidden bg-slate-950/60">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(34,211,238,0.16),transparent_30%),radial-gradient(circle_at_85%_30%,rgba(244,114,182,0.12),transparent_28%),radial-gradient(circle_at_50%_95%,rgba(250,204,21,0.08),transparent_32%)]" />

      <div className="relative mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-24">
        {/* Section intro */}
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-cyan-200 sm:text-sm">
            {t('home.eyebrow')}
          </p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
            {t('home.heading')}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-slate-300 sm:text-lg">
            {t('home.subtitle')}
          </p>
        </div>

        {/* Large alternating showcase blocks */}
        <div className="mt-12 space-y-6 sm:mt-16 sm:space-y-8">
          {FEATURED.map((item, index) => {
            const accent = ACCENTS[index % ACCENTS.length]
            const live = products.find((p) => p.slug === item.slug)
            const product = toProduct(item, live)
            const imageRight = index % 2 === 1

            return (
              <article
                key={item.slug}
                className={`group relative overflow-hidden rounded-3xl bg-gradient-to-br ${accent.border} p-px shadow-2xl shadow-black/50 transition duration-300`}
              >
                <div className="grid items-stretch gap-0 overflow-hidden rounded-3xl bg-slate-950/85 sm:grid-cols-2">
                  {/* Image panel — package shot floats on near-black so the whole
                      packaging is visible, never cropped. */}
                  <div
                    className={`relative flex items-center justify-center bg-gradient-to-br from-slate-900 to-black p-4 sm:p-8 ${
                      imageRight ? 'sm:order-2' : ''
                    }`}
                  >
                    <div
                      className={`pointer-events-none absolute left-1/2 top-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full ${accent.glow} blur-3xl`}
                    />
                    <img
                      src={item.image}
                      alt={item.name}
                      loading="lazy"
                      className="relative z-10 max-h-[22rem] w-auto max-w-full object-contain drop-shadow-2xl transition duration-500 group-hover:scale-[1.03] sm:max-h-[26rem]"
                    />
                  </div>

                  {/* Text panel */}
                  <div
                    className={`flex flex-col justify-center p-6 sm:p-10 ${
                      imageRight ? 'sm:order-1' : ''
                    }`}
                  >
                    <div className="flex flex-wrap items-center gap-3">
                      <span
                        className={`text-xs font-bold uppercase tracking-[0.18em] ${accent.tag}`}
                      >
                        {t('home.featured')}
                      </span>
                      {product.weightGrams ? (
                        <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs font-semibold text-white">
                          {product.weightGrams} g
                        </span>
                      ) : null}
                    </div>

                    <h3 className="mt-3 text-2xl font-extrabold leading-tight text-white sm:text-3xl">
                      {product.name}
                    </h3>
                    <p className="mt-4 text-sm leading-relaxed text-slate-300 sm:text-base">
                      {product.description}
                    </p>

                    <div className="mt-6 flex flex-wrap items-center gap-4 sm:mt-8">
                      <span className={`text-2xl font-extrabold sm:text-3xl ${accent.price}`}>
                        {formatPrice(product.priceCents, product.currency)}
                      </span>
                      <button
                        type="button"
                        onClick={() => onAdd(product)}
                        className={`rounded-full px-5 py-2.5 text-sm font-bold text-slate-900 shadow-lg shadow-black/30 transition sm:px-6 sm:py-3 ${accent.button}`}
                      >
                        {t('product.addToCart')}
                      </button>
                      <Link
                        to={`/Cataloge/Products/${item.slug}`}
                        className="rounded-full border border-white/25 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/10 sm:px-6 sm:py-3"
                      >
                        {t('home.viewDetails')}
                      </Link>
                    </div>
                  </div>
                </div>
              </article>
            )
          })}
        </div>

        {/* Catalogue link */}
        <div className="mt-12 text-center sm:mt-16">
          <Link
            to="/Cataloge/Products"
            className="inline-flex items-center gap-2 rounded-full bg-cyan-400 px-7 py-3 text-sm font-bold text-slate-900 shadow-lg shadow-cyan-500/30 transition hover:bg-cyan-300"
          >
            {t('home.browseAll')}
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </section>
  )
}
