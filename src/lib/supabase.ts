import { createClient } from '@supabase/supabase-js'

// Browser-side Supabase client. Uses the PUBLIC (publishable/anon) key — every
// data access is still protected by Row-Level Security on the server.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  // Surfaced in the console during local dev if the .env isn't filled in.
  console.warn(
    'Supabase env vars are missing — set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env',
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})

export type UserRole = 'user' | 'admin'

export type AccountType = 'personal' | 'business'

export interface Profile {
  id: string
  username: string | null
  email: string | null
  role: UserRole
  account_type: AccountType
  // Business / invoicing details (null for personal accounts)
  company_name: string | null
  vat_number: string | null
  registration_number: string | null
  contact_name: string | null
  phone: string | null
  billing_email: string | null
  address_line1: string | null
  address_line2: string | null
  city: string | null
  state: string | null
  postal_code: string | null
  country: string | null
}

/** Company / invoicing fields collected when creating a business account. */
export interface BusinessDetails {
  companyName: string
  vatNumber: string
  registrationNumber?: string
  contactName: string
  phone: string
  billingEmail?: string
  addressLine1: string
  addressLine2?: string
  city: string
  state?: string
  postalCode: string
  country: string
}
