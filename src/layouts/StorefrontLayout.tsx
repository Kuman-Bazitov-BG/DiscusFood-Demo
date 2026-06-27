import { useEffect, useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { Navbar } from '../components/Navbar'
import { Footer } from '../components/Footer'
import { CartDrawer } from '../components/CartDrawer'
import { LanguageDrawer } from '../components/LanguageDrawer'
import { AuthModal, type AuthMode } from '../components/AuthModal'
import { DemoBanner } from '../components/DemoBanner'
import { useCart } from '../hooks/useCart'
import { fetchProducts } from '../lib/api'
import { sampleProducts } from '../data/sampleProducts'
import type { Product } from '../types'

/** Data shared with every storefront page via the router Outlet. */
export interface StorefrontContext {
  products: Product[]
  addToCart: (product: Product) => void
}

export function StorefrontLayout() {
  const cart = useCart()
  const navigate = useNavigate()
  const [products, setProducts] = useState<Product[]>(sampleProducts)
  const [cartOpen, setCartOpen] = useState(false)
  const [languageOpen, setLanguageOpen] = useState(false)
  const [authOpen, setAuthOpen] = useState(false)
  const [authMode, setAuthMode] = useState<AuthMode>('login')

  // Load the live catalog; fall back to sample data if the API isn't up yet.
  useEffect(() => {
    fetchProducts()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) setProducts(data)
      })
      .catch(() => {
        /* keep sample data */
      })
  }, [])

  const ctx: StorefrontContext = { products, addToCart: cart.add }

  return (
    <div className="min-h-screen bg-slate-950/35 text-slate-100">
      <DemoBanner />
      <Navbar
        cartCount={cart.count}
        onCartClick={() => setCartOpen(true)}
        onLanguageClick={() => setLanguageOpen(true)}
        onCatalogClick={() => navigate('/Cataloge/Products')}
        onAuthClick={(mode) => {
          setAuthMode(mode)
          setAuthOpen(true)
        }}
        onAdminClick={() => navigate('/admin')}
      />
      <main>
        <Outlet context={ctx} />
      </main>
      <Footer />

      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        items={cart.items}
        totalCents={cart.totalCents}
        onSetQuantity={cart.setQuantity}
        onRemove={cart.remove}
        onClear={cart.clear}
      />
      <LanguageDrawer open={languageOpen} onClose={() => setLanguageOpen(false)} />
      <AuthModal
        open={authOpen}
        mode={authMode}
        onClose={() => setAuthOpen(false)}
        onModeChange={setAuthMode}
      />
    </div>
  )
}
