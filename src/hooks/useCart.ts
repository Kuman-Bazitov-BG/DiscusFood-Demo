import { useState, useEffect, useCallback } from 'react'
import type { Product } from '../types'

const STORAGE_KEY = 'discus-cart'

export interface CartItem {
  product: Product
  quantity: number
}

export function useCart() {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
    } catch {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items])

  const add = useCallback((product: Product) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.product.id === product.id)
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id
            ? { ...i, quantity: i.quantity + 1 }
            : i,
        )
      }
      return [...prev, { product, quantity: 1 }]
    })
  }, [])

  const setQuantity = useCallback((id: string, quantity: number) => {
    setItems((prev) =>
      quantity <= 0
        ? prev.filter((i) => i.product.id !== id)
        : prev.map((i) =>
            i.product.id === id ? { ...i, quantity } : i,
          ),
    )
  }, [])

  const remove = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.product.id !== id))
  }, [])

  const clear = useCallback(() => setItems([]), [])

  const count = items.reduce((n, i) => n + i.quantity, 0)
  const totalCents = items.reduce(
    (sum, i) => sum + i.product.priceCents * i.quantity,
    0,
  )

  return { items, add, setQuantity, remove, clear, count, totalCents }
}
