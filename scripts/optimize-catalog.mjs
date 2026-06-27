// Convert rendered catalog page PNGs to web-optimized WebP, then remove the PNGs.
// Keeps full 1920px width so the bilingual catalog text stays legible when zoomed.
// Usage: node scripts/optimize-catalog.mjs [quality]
import sharp from 'sharp'
import { readdirSync, rmSync } from 'node:fs'

const quality = Number(process.argv[2] ?? 80)
const dir = 'public/pictures/catalog2025'

const pngs = readdirSync(dir).filter((f) => f.endsWith('.png')).sort()
for (const f of pngs) {
  const out = f.replace('.png', '.webp')
  await sharp(`${dir}/${f}`).webp({ quality }).toFile(`${dir}/${out}`)
  rmSync(`${dir}/${f}`)
}
console.log(`converted ${pngs.length} pages to webp (q${quality}) and removed PNGs`)
