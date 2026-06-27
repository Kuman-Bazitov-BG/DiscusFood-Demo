// Make small thumbnails of the rendered catalog pages for quick visual mapping.
// Usage: node scripts/thumb-catalog.mjs [width]
import sharp from 'sharp'
import { readdirSync, mkdirSync } from 'node:fs'

const width = Number(process.argv[2] ?? 720)
const src = 'public/pictures/catalog2025'
const out = process.env.THUMB_OUT ?? 'scratch-thumbs'
mkdirSync(out, { recursive: true })

const files = readdirSync(src).filter((f) => f.endsWith('.png')).sort()
for (const f of files) {
  await sharp(`${src}/${f}`).resize({ width }).jpeg({ quality: 70 }).toFile(`${out}/${f.replace('.png', '.jpg')}`)
}
console.log(`thumbed ${files.length} pages -> ${out}`)
