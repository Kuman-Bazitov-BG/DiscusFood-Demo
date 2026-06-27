import { config } from 'dotenv'
import { z } from 'zod'

config({ quiet: true })

const schema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3000),

  // Front-end origin — used for CORS and Stripe redirect URLs.
  CLIENT_URL: z.string().url().default('http://localhost:5173'),

  // Postgres (Supabase) — used by Drizzle.
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),

  // Supabase service-role access (server-only: Auth verification + Storage).
  SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  SUPABASE_STORAGE_BUCKET: z.string().default('product-images'),

  // Comma-separated list of emails allowed to act as admin.
  ADMIN_EMAILS: z.string().min(1, 'Set at least one admin email'),

  // Stripe.
  STRIPE_SECRET_KEY: z.string().min(1),
  STRIPE_WEBHOOK_SECRET: z.string().min(1),
})

const parsed = schema.safeParse(process.env)

if (!parsed.success) {
  console.error('❌ Invalid environment variables:')
  console.error(z.flattenError(parsed.error).fieldErrors)
  process.exit(1)
}

export const env = parsed.data

export const adminEmails = new Set(
  env.ADMIN_EMAILS.split(',').map((e) => e.trim().toLowerCase()).filter(Boolean),
)
