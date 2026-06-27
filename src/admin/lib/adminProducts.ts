import { supabase } from '../../lib/supabase'

export interface AdminProduct {
  id: string
  slug: string
  name: string
  description: string
  details: string | null
  price_cents: number
  compare_at_price_cents: number | null
  currency: string
  sku: string | null
  image_url: string | null
  weight_grams: number | null
  stock: number
  low_stock_threshold: number
  is_active: boolean
  is_coming_soon: boolean
  category_id: string | null
}

export interface Category {
  id: string
  name: string
  slug: string
}

/** Fields the admin form edits. */
export interface ProductInput {
  name: string
  slug: string
  sku: string | null
  category_id: string | null
  description: string
  details: string | null
  price_cents: number
  compare_at_price_cents: number | null
  image_url: string | null
  weight_grams: number | null
  stock: number
  low_stock_threshold: number
  is_active: boolean
  is_coming_soon: boolean
}

const PRODUCT_COLUMNS =
  'id, slug, name, description, details, price_cents, compare_at_price_cents, currency, sku, image_url, weight_grams, stock, low_stock_threshold, is_active, is_coming_soon, category_id'

export async function listProducts(): Promise<AdminProduct[]> {
  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_COLUMNS)
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as AdminProduct[]
}

export async function listCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('id, name, slug')
    .order('sort_order', { ascending: true })
  if (error) throw error
  return (data ?? []) as Category[]
}

export async function createProduct(input: ProductInput): Promise<void> {
  const { error } = await supabase
    .from('products')
    .insert({ ...input, currency: 'eur' })
  if (error) throw error
}

export async function updateProduct(
  id: string,
  input: Partial<ProductInput>,
): Promise<void> {
  const { error } = await supabase.from('products').update(input).eq('id', id)
  if (error) throw error
}

export async function deleteProduct(id: string): Promise<void> {
  const { error } = await supabase.from('products').delete().eq('id', id)
  if (error) throw error
}

/** Upload an image to the product-images bucket and return its public URL. */
export async function uploadProductImage(file: File): Promise<string> {
  const ext = file.name.split('.').pop()?.toLowerCase() || 'png'
  const path = `${crypto.randomUUID()}.${ext}`
  const { error } = await supabase.storage
    .from('product-images')
    .upload(path, file, { cacheControl: '3600', upsert: false })
  if (error) throw error
  const { data } = supabase.storage.from('product-images').getPublicUrl(path)
  return data.publicUrl
}

/** Turn a product name into a URL-safe slug. */
export function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export const eurosToCents = (euros: string | number): number =>
  Math.round(Number(euros) * 100)

export const centsToEuros = (cents: number | null | undefined): string =>
  cents == null ? '' : (cents / 100).toFixed(2)
