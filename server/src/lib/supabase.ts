// Server-side Supabase client using the SERVICE ROLE key.
// This bypasses Row-Level Security, so it must NEVER run in the browser.
// Used for: verifying admin JWTs and uploading product images to Storage.
import { createClient } from '@supabase/supabase-js'
import { env } from '../env.js'

export const supabaseAdmin = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  },
)

export const STORAGE_BUCKET = env.SUPABASE_STORAGE_BUCKET
