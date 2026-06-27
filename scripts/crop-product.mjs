// Crop a product's packaging out of a catalog page screenshot.
// Usage: node scripts/crop-product.mjs "<srcFile>" <slug> <left> <top> <width> <height>
// Saves to public/pictures/products/<slug>.png
import sharp from 'sharp'
import { mkdirSync } from 'node:fs'

const [, , src, slug, left, top, width, height] = process.argv
const dir = 'public/pictures'
const out = 'public/pictures/products'
mkdirSync(out, { recursive: true })

const img = sharp(`${dir}/${src}`)
const meta = await img.metadata()
const L = Math.max(0, parseInt(left, 10))
const T = Math.max(0, parseInt(top, 10))
const W = Math.min(parseInt(width, 10), meta.width - L)
const H = Math.min(parseInt(height, 10), meta.height - T)

await img
  .extract({ left: L, top: T, width: W, height: H })
  .png()
  .toFile(`${out}/${slug}.png`)

console.log(`Saved ${out}/${slug}.png (${W}x${H}) from ${src} [${meta.width}x${meta.height}]`)
