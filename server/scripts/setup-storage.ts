/**
 * Creates the folder structure inside the Supabase Storage bucket:
 *   product-images/pictures/   → product photos
 *   product-images/text/       → text info files (markdown / spec sheets)
 *
 * Storage folders are virtual, so each is "created" by uploading a tiny
 * `.keep` placeholder. Safe to run multiple times (upsert).
 *
 * Run with:  npm run setup:storage   (needs a real SUPABASE_SERVICE_ROLE_KEY)
 */
import { supabaseAdmin, STORAGE_BUCKET } from '../src/lib/supabase.js'

const FOLDERS = ['pictures', 'text'] as const

async function main() {
  let failed = false

  for (const folder of FOLDERS) {
    const path = `${folder}/.keep`
    const { error } = await supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .upload(path, Buffer.from('keep'), {
        upsert: true,
        contentType: 'text/plain',
      })

    if (error) {
      console.error(`✗ ${STORAGE_BUCKET}/${folder}/ — ${error.message}`)
      failed = true
    } else {
      console.log(`✓ ${STORAGE_BUCKET}/${folder}/`)
    }
  }

  if (failed) {
    console.error(
      '\nSome folders failed. Check SUPABASE_SERVICE_ROLE_KEY in server/.env.',
    )
    process.exit(1)
  }
  console.log('\nStorage folders ready.')
}

main()
