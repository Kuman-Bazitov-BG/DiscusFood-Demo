import { useOutletContext } from 'react-router-dom'
import { ProductSearch } from '../components/ProductSearch'
import { HomeProductShowcase } from '../components/HomeProductShowcase'
import { CtaBanner } from '../components/CtaBanner'
import type { StorefrontContext } from '../layouts/StorefrontLayout'

export function Home() {
  const { products, addToCart } = useOutletContext<StorefrontContext>()
  return (
    <>
      <ProductSearch products={products} />
      <HomeProductShowcase products={products} onAdd={addToCart} />
      <CtaBanner />
    </>
  )
}
