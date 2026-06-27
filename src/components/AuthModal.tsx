import { useEffect, useState } from 'react'
import { useAuth } from '../auth/AuthContext'
import { useTranslation } from '../i18n/LanguageContext'

export type AuthMode = 'login' | 'signup' | 'resetPassword' | 'changePassword'

type SignupKind = 'personal' | 'business'

interface AuthModalProps {
  open: boolean
  mode: AuthMode
  onClose: () => void
  onModeChange: (mode: AuthMode) => void
}

const emptyBusiness = {
  companyName: '',
  vatNumber: '',
  registrationNumber: '',
  contactName: '',
  phone: '',
  billingEmail: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  postalCode: '',
  country: '',
}

export function AuthModal({ open, mode, onClose, onModeChange }: AuthModalProps) {
  const { t } = useTranslation()
  const { user, signIn, signUp, resetPassword, changePassword } = useAuth()

  const [signupKind, setSignupKind] = useState<SignupKind>('personal')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [business, setBusiness] = useState(emptyBusiness)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [busy, setBusy] = useState(false)

  // Reset the form whenever the modal opens or the mode switches.
  useEffect(() => {
    if (open) {
      setSignupKind('personal')
      setUsername('')
      setEmail('')
      setPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setBusiness(emptyBusiness)
      setError('')
      setSuccess('')
      setBusy(false)
    }
  }, [open, mode])

  if (!open) return null

  const isSignup = mode === 'signup'
  const isResetPassword = mode === 'resetPassword'
  const isChangePassword = mode === 'changePassword'
  const isBusinessSignup = isSignup && signupKind === 'business'

  function updateBusiness(key: keyof typeof emptyBusiness, value: string) {
    setBusiness((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (mode === 'signup') {
      if (!username.trim() || !email.trim() || !password || !confirmPassword) {
        setError(t('auth.errFields'))
        return
      }
      if (password.length < 6) {
        setError(t('auth.errPasswordShort'))
        return
      }
      if (password !== confirmPassword) {
        setError(t('auth.errPasswordMatch'))
        return
      }
      if (signupKind === 'business') {
        const required = [
          business.companyName,
          business.vatNumber,
          business.contactName,
          business.phone,
          business.addressLine1,
          business.city,
          business.postalCode,
          business.country,
        ]
        if (required.some((v) => !v.trim())) {
          setError(t('auth.errFields'))
          return
        }
      }
    } else if (mode === 'resetPassword') {
      if (!email.trim()) {
        setError(t('auth.errFields'))
        return
      }
    } else if (mode === 'changePassword') {
      if (!user && !email.trim()) {
        setError(t('auth.errFields'))
        return
      }
      if (!password || !newPassword || !confirmPassword) {
        setError(t('auth.errFields'))
        return
      }
      if (newPassword.length < 6) {
        setError(t('auth.errPasswordShort'))
        return
      }
      if (newPassword !== confirmPassword) {
        setError(t('auth.errPasswordMatch'))
        return
      }
    } else if (!email.trim() || !password) {
      setError(t('auth.errFields'))
      return
    }

    setBusy(true)
    try {
      if (mode === 'signup') {
        await signUp({
          username: username.trim(),
          email: email.trim(),
          password,
          business:
            signupKind === 'business'
              ? {
                  companyName: business.companyName.trim(),
                  vatNumber: business.vatNumber.trim(),
                  registrationNumber: business.registrationNumber.trim(),
                  contactName: business.contactName.trim(),
                  phone: business.phone.trim(),
                  billingEmail: business.billingEmail.trim(),
                  addressLine1: business.addressLine1.trim(),
                  addressLine2: business.addressLine2.trim(),
                  city: business.city.trim(),
                  state: business.state.trim(),
                  postalCode: business.postalCode.trim(),
                  country: business.country.trim(),
                }
              : undefined,
        })
        setSuccess(t('auth.signupSuccess'))
      } else if (mode === 'resetPassword') {
        await resetPassword({ email: email.trim() })
        setSuccess(t('auth.resetSent'))
      } else if (mode === 'changePassword') {
        await changePassword({
          email: user ? undefined : email.trim(),
          currentPassword: password,
          newPassword,
        })
        setPassword('')
        setNewPassword('')
        setConfirmPassword('')
        setSuccess(t('auth.passwordUpdated'))
      } else {
        await signIn({ email: email.trim(), password })
        setSuccess(t('auth.loginSuccess'))
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setBusy(false)
    }
  }

  const title = isBusinessSignup
    ? t('auth.businessSignupTitle')
    : isSignup
      ? t('auth.signupTitle')
      : isResetPassword
        ? t('auth.resetPasswordTitle')
        : isChangePassword
          ? t('auth.changePasswordTitle')
          : t('auth.loginTitle')

  const inputClass =
    'w-full rounded-lg border border-white/15 bg-slate-800 px-3.5 py-2.5 text-sm text-white placeholder-slate-400 outline-none transition focus:border-cyan-400'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <button
        type="button"
        aria-label={t('auth.close')}
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
      />

      {/* Card */}
      <div
        className={`relative w-full rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-2xl ${
          isBusinessSignup ? 'max-w-lg' : 'max-w-sm'
        } max-h-[90vh] overflow-y-auto`}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label={t('auth.close')}
          className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full text-slate-400 transition hover:bg-white/10 hover:text-white"
        >
          ✕
        </button>

        <h2 className="mb-5 text-xl font-extrabold text-white">{title}</h2>

        {/* Account-type tabs (signup only) */}
        {isSignup && !success && (
          <div className="mb-5 grid grid-cols-2 gap-1 rounded-xl border border-white/10 bg-slate-800/60 p-1">
            <button
              type="button"
              onClick={() => {
                setSignupKind('personal')
                setError('')
              }}
              className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
                signupKind === 'personal'
                  ? 'bg-cyan-400 text-slate-900'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              {t('auth.personalTab')}
            </button>
            <button
              type="button"
              onClick={() => {
                setSignupKind('business')
                setError('')
              }}
              className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
                signupKind === 'business'
                  ? 'bg-cyan-400 text-slate-900'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              {t('auth.businessTab')}
            </button>
          </div>
        )}

        {success ? (
          <div className="space-y-3">
            <p className="rounded-lg bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
              {success}
            </p>
            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-lg bg-cyan-400 px-4 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-cyan-300"
            >
              {t('auth.done')}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Account credentials */}
            {isBusinessSignup && (
              <p className="pt-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
                {t('auth.accountDetails')}
              </p>
            )}

            {isSignup && (
              <input
                type="text"
                autoComplete="username"
                placeholder={t('auth.username')}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={inputClass}
              />
            )}

            {(!isChangePassword || !user) && (
              <input
                type="email"
                autoComplete="email"
                placeholder={t('auth.email')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
              />
            )}

            {!isResetPassword && (
              <div>
                <input
                  type="password"
                  autoComplete={isSignup ? 'new-password' : 'current-password'}
                  placeholder={
                    isChangePassword ? t('auth.oldPassword') : t('auth.password')
                  }
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={inputClass}
                />
                {isSignup && (
                  <p className="mt-1 pl-1 text-xs text-slate-400">
                    {t('auth.passwordHint')}
                  </p>
                )}
              </div>
            )}

            {isChangePassword && (
              <div>
                <input
                  type="password"
                  autoComplete="new-password"
                  placeholder={t('auth.newPassword')}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className={inputClass}
                />
                <p className="mt-1 pl-1 text-xs text-slate-400">
                  {t('auth.passwordHint')}
                </p>
              </div>
            )}

            {(isSignup || isChangePassword) && (
              <input
                type="password"
                autoComplete="new-password"
                placeholder={
                  isChangePassword
                    ? t('auth.confirmNewPassword')
                    : t('auth.confirmPassword')
                }
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={inputClass}
              />
            )}

            {/* Business / invoicing details */}
            {isBusinessSignup && (
              <>
                <p className="pt-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  {t('auth.companyDetails')}
                </p>
                <input
                  type="text"
                  autoComplete="organization"
                  placeholder={t('auth.companyName')}
                  value={business.companyName}
                  onChange={(e) => updateBusiness('companyName', e.target.value)}
                  className={inputClass}
                />
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <input
                    type="text"
                    placeholder={t('auth.vatNumber')}
                    value={business.vatNumber}
                    onChange={(e) => updateBusiness('vatNumber', e.target.value)}
                    className={inputClass}
                  />
                  <input
                    type="text"
                    placeholder={t('auth.registrationNumber')}
                    value={business.registrationNumber}
                    onChange={(e) =>
                      updateBusiness('registrationNumber', e.target.value)
                    }
                    className={inputClass}
                  />
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <input
                    type="text"
                    autoComplete="name"
                    placeholder={t('auth.contactName')}
                    value={business.contactName}
                    onChange={(e) =>
                      updateBusiness('contactName', e.target.value)
                    }
                    className={inputClass}
                  />
                  <input
                    type="tel"
                    autoComplete="tel"
                    placeholder={t('auth.phone')}
                    value={business.phone}
                    onChange={(e) => updateBusiness('phone', e.target.value)}
                    className={inputClass}
                  />
                </div>
                <input
                  type="email"
                  placeholder={t('auth.billingEmail')}
                  value={business.billingEmail}
                  onChange={(e) =>
                    updateBusiness('billingEmail', e.target.value)
                  }
                  className={inputClass}
                />

                <p className="pt-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  {t('auth.billingAddress')}
                </p>
                <input
                  type="text"
                  autoComplete="address-line1"
                  placeholder={t('auth.addressLine1')}
                  value={business.addressLine1}
                  onChange={(e) =>
                    updateBusiness('addressLine1', e.target.value)
                  }
                  className={inputClass}
                />
                <input
                  type="text"
                  autoComplete="address-line2"
                  placeholder={t('auth.addressLine2')}
                  value={business.addressLine2}
                  onChange={(e) =>
                    updateBusiness('addressLine2', e.target.value)
                  }
                  className={inputClass}
                />
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <input
                    type="text"
                    autoComplete="address-level2"
                    placeholder={t('auth.city')}
                    value={business.city}
                    onChange={(e) => updateBusiness('city', e.target.value)}
                    className={inputClass}
                  />
                  <input
                    type="text"
                    autoComplete="address-level1"
                    placeholder={t('auth.state')}
                    value={business.state}
                    onChange={(e) => updateBusiness('state', e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <input
                    type="text"
                    autoComplete="postal-code"
                    placeholder={t('auth.postalCode')}
                    value={business.postalCode}
                    onChange={(e) =>
                      updateBusiness('postalCode', e.target.value)
                    }
                    className={inputClass}
                  />
                  <input
                    type="text"
                    autoComplete="country-name"
                    placeholder={t('auth.country')}
                    value={business.country}
                    onChange={(e) => updateBusiness('country', e.target.value)}
                    className={inputClass}
                  />
                </div>
              </>
            )}

            {error && (
              <p className="rounded-lg bg-rose-500/10 px-3 py-2 text-sm text-rose-300">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-lg bg-cyan-400 px-4 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {busy
                ? isSignup
                  ? t('auth.creating')
                  : isResetPassword
                    ? t('auth.sendingReset')
                    : isChangePassword
                      ? t('auth.updatingPassword')
                      : t('auth.signingIn')
                : isBusinessSignup
                  ? t('auth.createBusinessAccount')
                  : isSignup
                    ? t('auth.createAccount')
                    : isResetPassword
                      ? t('auth.resetPassword')
                      : isChangePassword
                        ? t('auth.changePassword')
                        : t('auth.login')}
            </button>
          </form>
        )}

        {!success && (
          <div className="mt-4 text-center text-sm text-slate-400">
            {isResetPassword || isChangePassword ? (
              <>
                <button
                  type="button"
                  onClick={() => {
                    if (isChangePassword && user) onClose()
                    else onModeChange('login')
                  }}
                  className="font-semibold text-cyan-300 hover:text-cyan-200"
                >
                  {isChangePassword && user
                    ? t('auth.close')
                    : t('auth.backToLogin')}
                </button>
              </>
            ) : isSignup ? (
              <>
                {t('auth.haveAccount')}{' '}
                <button
                  type="button"
                  onClick={() => onModeChange('login')}
                  className="font-semibold text-cyan-300 hover:text-cyan-200"
                >
                  {t('auth.login')}
                </button>
                <span className="mx-2 text-slate-600">|</span>
                <button
                  type="button"
                  onClick={() => onModeChange('resetPassword')}
                  className="font-semibold text-cyan-300 hover:text-cyan-200"
                >
                  {t('auth.resetPassword')}
                </button>
                <span className="mx-2 text-slate-600">|</span>
                <button
                  type="button"
                  onClick={() => onModeChange('changePassword')}
                  className="font-semibold text-cyan-300 hover:text-cyan-200"
                >
                  {t('auth.changePassword')}
                </button>
              </>
            ) : (
              <>
                {t('auth.noAccount')}{' '}
                <button
                  type="button"
                  onClick={() => onModeChange('signup')}
                  className="font-semibold text-cyan-300 hover:text-cyan-200"
                >
                  {t('auth.signup')}
                </button>
                <span className="mx-2 text-slate-600">|</span>
                <button
                  type="button"
                  onClick={() => onModeChange('resetPassword')}
                  className="font-semibold text-cyan-300 hover:text-cyan-200"
                >
                  {t('auth.resetPassword')}
                </button>
                <span className="mx-2 text-slate-600">|</span>
                <button
                  type="button"
                  onClick={() => onModeChange('changePassword')}
                  className="font-semibold text-cyan-300 hover:text-cyan-200"
                >
                  {t('auth.changePassword')}
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
