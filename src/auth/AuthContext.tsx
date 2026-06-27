import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import type { Session, User } from '@supabase/supabase-js'
import {
  supabase,
  type BusinessDetails,
  type Profile,
} from '../lib/supabase'

interface AuthContextValue {
  user: User | null
  profile: Profile | null
  loading: boolean
  isAdmin: boolean
  signUp: (args: {
    username: string
    email: string
    password: string
    business?: BusinessDetails
  }) => Promise<void>
  signIn: (args: { email: string; password: string }) => Promise<void>
  resetPassword: (args: { email: string }) => Promise<void>
  changePassword: (args: {
    email?: string
    currentPassword: string
    newPassword: string
  }) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

async function loadProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select(
      'id, username, email, role, account_type, company_name, vat_number, registration_number, contact_name, phone, billing_email, address_line1, address_line2, city, state, postal_code, country',
    )
    .eq('id', userId)
    .single()
  if (error) return null
  return data as Profile
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Pick up an existing session on first load.
    supabase.auth.getSession().then(({ data }) => {
      applySession(data.session)
    })

    // React to sign-in / sign-out across tabs.
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      applySession(session)
    })

    return () => sub.subscription.unsubscribe()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function applySession(session: Session | null) {
    const nextUser = session?.user ?? null
    setUser(nextUser)
    setProfile(nextUser ? await loadProfile(nextUser.id) : null)
    setLoading(false)
  }

  async function signUp({
    username,
    email,
    password,
    business,
  }: {
    username: string
    email: string
    password: string
    business?: BusinessDetails
  }) {
    const data: Record<string, string> = {
      username,
      account_type: business ? 'business' : 'personal',
    }

    if (business) {
      data.company_name = business.companyName
      data.vat_number = business.vatNumber
      data.contact_name = business.contactName
      data.phone = business.phone
      data.address_line1 = business.addressLine1
      data.city = business.city
      data.postal_code = business.postalCode
      data.country = business.country
      if (business.registrationNumber)
        data.registration_number = business.registrationNumber
      if (business.billingEmail) data.billing_email = business.billingEmail
      if (business.addressLine2) data.address_line2 = business.addressLine2
      if (business.state) data.state = business.state
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data },
    })
    if (error) throw error
  }

  async function signIn({
    email,
    password,
  }: {
    email: string
    password: string
  }) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }

  async function resetPassword({ email }: { email: string }) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin,
    })
    if (error) throw error
  }

  async function changePassword({
    email: accountEmail,
    currentPassword,
    newPassword,
  }: {
    email?: string
    currentPassword: string
    newPassword: string
  }) {
    const email = accountEmail?.trim() || user?.email
    if (!email) throw new Error('You must be logged in to change your password.')

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password: currentPassword,
    })
    if (signInError) throw signInError

    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) throw error
  }

  async function signOut() {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
  }

  const value: AuthContextValue = {
    user,
    profile,
    loading,
    isAdmin: profile?.role === 'admin',
    signUp,
    signIn,
    resetPassword,
    changePassword,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
