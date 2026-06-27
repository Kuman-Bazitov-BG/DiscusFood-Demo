// Maps each product (by slug) to the page(s) of the Discusfood 2024/25
// "Product and Info Book" catalog where its full bilingual description and
// packaging photos appear. The catalog PDF was rasterised to one WebP per page
// (see scripts/render-catalog.mjs + scripts/optimize-catalog.mjs) under
// public/pictures/catalog2025/page-NN.webp. Page numbers are 1-based and match
// the PDF order. Products without a catalog entry (e.g. new "coming soon"
// items) simply have no mapping and fall back to their own description only.

export const CATALOG_PAGE_DIR = '/pictures/catalog2025'

/** Public path to a rendered catalog page image (1-based page number). */
export function catalogPageImage(page: number): string {
  return `${CATALOG_PAGE_DIR}/page-${String(page).padStart(2, '0')}.webp`
}

/** Catalog page numbers for a product slug (empty when it isn't in the book). */
export function catalogPagesForSlug(slug: string): number[] {
  return CATALOG_PAGES[slug.toLowerCase()] ?? []
}

export const CATALOG_PAGES: Record<string, number[]> = {
  // Artemia 50% range
  'artemia-50-soft-tabs': [10, 11],
  'artemia-50-cysts': [12],
  'decapsulated-artemia-eggs': [12],
  'artemia-50-micro-granulate-soft': [13],
  'artemia-50-flat-granulate': [14, 15, 16],
  'artemia-50-soft-granulate': [17, 18, 19],

  // Frutti di Mare / Buffet di Insect
  'frutti-di-mare': [20, 21, 22, 25],
  'buffet-di-insect': [23, 24, 25],

  // Best Heart Flakes range
  'best-heart-flakes': [26, 27, 28],
  'super-growth': [29, 35],
  'best-heart-flakes-blue-dream': [30, 31, 35],
  'best-heart-flakes-red-dream': [32, 33, 35],
  'best-heart-flakes-pro-breed': [34, 35],

  // Daily / heart granulates
  'for-discus-daily-granulate': [37, 38],
  'beef-heart-soft-granulate': [39, 40],
  'grand-champion-granulate': [41],
  'turkey-heart-soft-granulate': [42],

  // Breeder starter foods
  'breeder-starter-food-1': [43, 44, 45],
  'breeder-starter-food-2': [43, 44, 46],

  // Special ornamental fish foods
  'angelfish-special-soft-granulate': [47, 48, 49],
  'american-cichlids-spirulina-soft-pearls': [50],
  'american-cichlids-color-soft-pearls': [51],
  'african-cichlids-spirulina-soft-pearls': [52],
  'african-cichlids-color-soft-pearls': [53],
  'betta-special-all-colors-soft': [54, 55, 56, 59],
  'guppy-super-special-soft': [57, 59],
  'guppy-super-color-soft': [58, 59],

  // Catfish / pleco
  'wels-special-soft': [60, 61, 64],
  'pleco-catfish-algae-wafers': [62, 64],
  'pleco-catfish-carni-wafers': [63, 64],

  // Cichlids XL
  'cichlids-xl-granulate-1': [65],
  'cichlids-xl-granulate-2': [66],

  // Additives / colour boosters
  'additive-1-probiotics': [67, 68],
  'additive-d7-pro-breeding': [67, 69],
  'golden-color-booster': [67, 70],
  'blue-color-booster': [67, 71],
  'red-color-booster': [67, 72],

  // Water conditioners
  'royal-catappa': [73, 74, 75],
  'natural-humin': [76, 77, 78, 80, 81],
  'amazon-tonic': [82, 83],
  'organic-clear': [85, 86],
  'anti-tox': [87],
  'discus-minerals': [88, 89, 90],

  // Filters & equipment
  'breeding-filter': [95, 96],
  'bio-sponge-filter-150': [97, 98, 99],
  'bio-sponge-filter-350': [100, 101, 102],

  // Discus Protector (quarantine)
  'discus-protector': [103, 104, 105, 106, 107, 108, 109],
}
