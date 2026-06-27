import { useState } from 'react'
import type { CartItem } from '../hooks/useCart'
import { formatPrice } from '../lib/format'
import { createCheckout, type CheckoutCustomer } from '../lib/api'
import { useAuth } from '../auth/AuthContext'
import { useTranslation } from '../i18n/LanguageContext'

const ITEM_FALLBACK = '/pictures/discus-closeup.webp'

// Shipping policy — change these two constants to update the whole cart UI.
const FREE_SHIPPING_CENTS = 7500   // €75.00
const SHIPPING_FEE_CENTS  = 990    // €9.90

interface CartDrawerProps {
  open: boolean
  onClose: () => void
  items: CartItem[]
  totalCents: number
  onSetQuantity: (id: string, quantity: number) => void
  onRemove: (id: string) => void
  onClear: () => void
}

export function CartDrawer({
  open,
  onClose,
  items,
  totalCents,
  onSetQuantity,
  onRemove,
  onClear,
}: CartDrawerProps) {
  const { t } = useTranslation()
  const { user, profile } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleCheckout() {
    setLoading(true)
    setError(null)
    try {
      // Attach the logged-in customer, plus company billing for business accounts.
      let customer: CheckoutCustomer | undefined
      if (user) {
        customer = { userId: user.id, email: user.email ?? undefined }
        if (profile?.account_type === 'business' && profile.company_name) {
          customer.billing = {
            company: profile.company_name,
            vatNumber: profile.vat_number ?? '',
            registrationNumber: profile.registration_number ?? undefined,
            contactName: profile.contact_name ?? undefined,
            phone: profile.phone ?? undefined,
            email: profile.billing_email ?? profile.email ?? undefined,
            address1: profile.address_line1 ?? undefined,
            address2: profile.address_line2 ?? undefined,
            city: profile.city ?? undefined,
            state: profile.state ?? undefined,
            postalCode: profile.postal_code ?? undefined,
            country: profile.country ?? undefined,
          }
        }
      }

      const { url } = await createCheckout(
        items.map((i) => ({ productId: i.product.id, quantity: i.quantity })),
        customer,
      )
      window.location.href = url
    } catch {
      setError(t('cart.error'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-50 bg-slate-950/70 transition-opacity duration-300 ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        aria-hidden="true"
      />

      {/* Panel */}
      <aside
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-slate-900 text-slate-100 shadow-2xl transition-transform duration-300 ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
        role="dialog"
        aria-label={t('cart.title')}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <h2 className="text-lg font-bold text-white">{t('cart.title')}</h2>
          <button
            type="button"
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-full text-slate-400 transition hover:bg-white/10 hover:text-white"
            aria-label={t('cart.close')}
          >
            ✕
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-5 text-center">
            <span className="text-5xl">🛒</span>
            <p className="font-semibold text-slate-200">{t('cart.empty')}</p>
            <p className="text-sm text-slate-400">{t('cart.emptyHint')}</p>
          </div>
        ) : (
          <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
            {items.map((item) => (
              <div
                key={item.product.id}
                className="flex gap-3 rounded-xl border border-white/10 bg-white/5 p-3"
              >
                <img
                  src={item.product.imageUrl ?? ITEM_FALLBACK}
                  alt={item.product.name}
                  className="h-16 w-16 shrink-0 rounded-lg object-cover"
                />
                <div className="flex flex-1 flex-col">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-white">
                      {item.product.name}
                    </p>
                    <button
                      type="button"
                      onClick={() => onRemove(item.product.id)}
                      className="text-xs text-slate-400 hover:text-rose-400"
                      aria-label={`${t('cart.remove')} ${item.product.name}`}
                    >
                      {t('cart.remove')}
                    </button>
                  </div>
                  <p className="text-sm text-slate-400">
                    {formatPrice(item.product.priceCents, item.product.currency)}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        onSetQuantity(item.product.id, item.quantity - 1)
                      }
                      className="grid h-7 w-7 place-items-center rounded-full border border-white/20 text-slate-200 transition hover:bg-white/10"
                      aria-label={t('cart.decrease')}
                    >
                      −
                    </button>
                    <span className="w-6 text-center text-sm font-semibold">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        onSetQuantity(item.product.id, item.quantity + 1)
                      }
                      className="grid h-7 w-7 place-items-center rounded-full border border-white/20 text-slate-200 transition hover:bg-white/10"
                      aria-label={t('cart.increase')}
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={onClear}
              className="text-xs font-medium text-slate-400 hover:text-rose-400"
            >
              {t('cart.clear')}
            </button>
          </div>
        )}

        {items.length > 0 && (
          <div className="border-t border-white/10 px-5 py-4">
            {/* Shipping progress banner */}
            {(() => {
              const freeShipping = totalCents >= FREE_SHIPPING_CENTS
              const progressPct = Math.min(100, Math.round((totalCents / FREE_SHIPPING_CENTS) * 100))
              const remaining = FREE_SHIPPING_CENTS - totalCents

              return (
                <div className="mb-4 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5">
                  {freeShipping ? (
                    <p className="text-center text-xs font-semibold text-emerald-400">
                      {t('cart.shippingUnlocked')}
                    </p>
                  ) : (
                    <>
                      <p className="mb-1.5 text-xs text-slate-300">
                        {t('cart.shippingProgress').replace(
                          '{amount}',
                          formatPrice(remaining, 'eur'),
                        )}
                      </p>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                        <div
                          className="h-full rounded-full bg-cyan-400 transition-all duration-300"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                    </>
                  )}
                </div>
              )
            })()}

            {error && (
              <p className="mb-3 rounded-lg bg-rose-500/15 px-3 py-2 text-xs text-rose-300">
                {error}
              </p>
            )}

            {/* Subtotal + shipping rows */}
            <div className="mb-1 flex items-center justify-between">
              <span className="text-sm text-slate-400">{t('cart.subtotal')}</span>
              <span className="text-sm font-semibold text-white">
                {formatPrice(totalCents, 'eur')}
              </span>
            </div>
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm text-slate-400">{t('cart.shipping')}</span>
              {totalCents >= FREE_SHIPPING_CENTS ? (
                <span className="text-sm font-bold text-emerald-400">{t('cart.shippingFree')}</span>
              ) : (
                <span className="text-sm font-semibold text-white">
                  {formatPrice(SHIPPING_FEE_CENTS, 'eur')}
                </span>
              )}
            </div>
            <div className="mb-4 flex items-center justify-between border-t border-white/10 pt-3">
              <span className="text-sm font-bold text-white">{t('cart.total')}</span>
              <span className="text-xl font-extrabold text-white">
                {formatPrice(
                  totalCents >= FREE_SHIPPING_CENTS
                    ? totalCents
                    : totalCents + SHIPPING_FEE_CENTS,
                  'eur',
                )}
              </span>
            </div>

            <button
              type="button"
              onClick={handleCheckout}
              disabled={loading}
              className="w-full rounded-full bg-cyan-400 py-3 text-sm font-bold text-slate-900 transition hover:bg-cyan-300 disabled:opacity-60"
            >
              {loading ? t('cart.redirecting') : t('cart.checkout')}
            </button>
            <p className="mt-2 text-center text-xs text-slate-500">
              {t('cart.securePayment')}
            </p>
          </div>
        )}
      </aside>
    </>
  )
}
