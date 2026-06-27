import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './index.css'
import { StorefrontLayout } from './layouts/StorefrontLayout'
import { Home } from './pages/Home'
import { CatalogPage } from './pages/Catalog'
import { ProductDetail } from './pages/ProductDetail'
import { WhyUs } from './pages/WhyUs'
import { LanguageProvider } from './i18n/LanguageContext'
import { AuthProvider } from './auth/AuthContext'
import { AdminLayout } from './admin/AdminLayout'
import { Dashboard } from './admin/pages/Dashboard'
import { Products } from './admin/pages/Products'
import { Categories } from './admin/pages/Categories'
import { Inventory } from './admin/pages/Inventory'
import { Reviews } from './admin/pages/Reviews'
import { Orders } from './admin/pages/Orders'
import { Payments } from './admin/pages/Payments'
import { Tracking } from './admin/pages/Tracking'
import { Invoices } from './admin/pages/Invoices'
import { Returns } from './admin/pages/Returns'
import { Coupons } from './admin/pages/Coupons'
import { Offers } from './admin/pages/Offers'
import { GiftCards } from './admin/pages/GiftCards'
import { Shipping } from './admin/pages/Shipping'
import { SearchResults } from './admin/pages/SearchResults'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LanguageProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<StorefrontLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/why-us" element={<WhyUs />} />
              <Route path="/Cataloge" element={<Navigate to="/Cataloge/Products" replace />} />
              <Route path="/Cataloge/Products" element={<CatalogPage tab="products" />} />
              <Route path="/Cataloge/Products/:slug" element={<ProductDetail />} />
              <Route
                path="/Cataloge/NewProductsComingsoon"
                element={<CatalogPage tab="coming" />}
              />
            </Route>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="search" element={<SearchResults />} />
              <Route path="products" element={<Products />} />
              <Route path="categories" element={<Categories />} />
              <Route path="inventory" element={<Inventory />} />
              <Route path="reviews" element={<Reviews />} />
              <Route path="orders" element={<Orders />} />
              <Route path="payments" element={<Payments />} />
              <Route path="tracking" element={<Tracking />} />
              <Route path="invoices" element={<Invoices />} />
              <Route path="returns" element={<Returns />} />
              <Route path="coupons" element={<Coupons />} />
              <Route path="offers" element={<Offers />} />
              <Route path="gift-cards" element={<GiftCards />} />
              <Route path="shipping" element={<Shipping />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </LanguageProvider>
  </StrictMode>,
)
