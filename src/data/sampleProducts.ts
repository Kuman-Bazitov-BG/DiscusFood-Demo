import type { Product } from '../types'

/**
 * Offline fallback catalog. Intentionally empty — the live catalog now comes
 * from Supabase. (The old hard-coded demo products were removed once real
 * products started being added.)
 */
export const sampleProducts: Product[] = []
