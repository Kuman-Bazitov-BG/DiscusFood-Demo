// Rasterize the 2025 catalog PDF to page PNGs so product packaging can be cropped.
// Usage: node scripts/render-catalog.mjs [scale] [maxPages]
import { pdf } from 'pdf-to-img'
import { writeFileSync, mkdirSync } from 'node:fs'

const scale = Number(process.argv[2] ?? 2)
const maxPages = Number(process.argv[3] ?? 999)
const out = 'public/pictures/catalog2025'
mkdirSync(out, { recursive: true })

const doc = await pdf('public/pictures/products/Discusfood-Katalog-2025.pdf', { scale })
let i = 0
for await (const page of doc) {
  i++
  writeFileSync(`${out}/page-${String(i).padStart(2, '0')}.png`, page)
  if (i >= maxPages) break
}
console.log(`rendered ${i} pages at scale ${scale} -> ${out}`)
