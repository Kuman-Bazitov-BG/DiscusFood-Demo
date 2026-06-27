export interface Product {
  id: string
  slug: string
  name: string
  description: string
  details?: string | null
  priceCents: number
  currency: string
  imageUrl?: string | null
  images?: string[]
  weightGrams?: number | null
  stock: number
  isActive: boolean
  isComingSoon?: boolean
}
