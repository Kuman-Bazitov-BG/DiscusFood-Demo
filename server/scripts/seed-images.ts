/**
 * Uploads the storefront's discus photos from the client's public/pictures
 * folder into the Supabase Storage bucket at product-images/pictures/.
 * The product rows already reference these via their public URLs.
 *
 * Idempotent (upsert). The logo is intentionally excluded.
 *
 * Run with:  npm run seed:images   (needs a real SUPABASE_SERVICE_ROLE_KEY)
 */
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { supabaseAdmin, STORAGE_BUCKET } from '../src/lib/supabase.js'

const here = dirname(fileURLToPath(import.meta.url))
const PICTURES_DIR = join(here, '../../public/pictures')

const IMAGES: Array<{ file: string; contentType: string }> = [
  { file: 'discus-closeup.webp', contentType: 'image/webp' },
  { file: 'discus-row.webp', contentType: 'image/webp' },
  { file: 'discus-tank.jpg', contentType: 'image/jpeg' },
  { file: 'hero-wide.jpg', contentType: 'image/jpeg' },
]

async function main() {
  let failed = false

  for (const img of IMAGES) {
    const buffer = await readFile(join(PICTURES_DIR, img.file))
    const { error } = await supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .upload(`pictures/${img.file}`, buffer, {
        contentType: img.contentType,
        upsert: true,
      })

    if (error) {
      console.error(`✗ pictures/${img.file} — ${error.message}`)
      failed = true
    } else {
      console.log(`✓ uploaded pictures/${img.file}`)
    }
  }

  if (failed) {
    console.error(
      '\nSome uploads failed. Check SUPABASE_SERVICE_ROLE_KEY in server/.env.',
    )
    process.exit(1)
  }
  console.log('\nAll product images uploaded to Storage.')
}

main()
