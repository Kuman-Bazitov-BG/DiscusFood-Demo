import type { Product } from '../types'

/** True when `q` is empty or appears in the product name/description/slug. */
export function productMatches(p: Product, q: string): boolean {
  const t = q.trim().toLowerCase()
  if (!t) return true
  return (
    p.name.toLowerCase().includes(t) ||
    (p.description?.toLowerCase().includes(t) ?? false) ||
    (p.slug?.toLowerCase().includes(t) ?? false)
  )
}
