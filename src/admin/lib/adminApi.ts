import { supabase } from '../../lib/supabase'

// ── Money + date helpers ────────────────────────────────────────────
export const eurosToCents = (e: string | number): number => Math.round(Number(e) * 100)
export const centsToEuros = (c?: number | null): string =>
  c == null ? '' : (c / 100).toFixed(2)

/** datetime-local string -> ISO (or null). */
export const toTs = (v: string): string | null => (v ? new Date(v).toISOString() : null)
/** ISO/timestamptz -> value for <input type="datetime-local">. */
export const tsLocal = (v?: string | null): string => {
  if (!v) return ''
  const d = new Date(v)
  const off = d.getTimezoneOffset()
  return new Date(d.getTime() - off * 60000).toISOString().slice(0, 16)
}
export const fmtDate = (v?: string | null): string =>
  v ? new Date(v).toLocaleDateString() : '—'

// ── Generic CRUD over a table (admin RLS applies) ───────────────────
export async function fetchAll<T = any>(
  table: string,
  columns = '*',
  order?: { col: string; asc?: boolean },
): Promise<T[]> {
  let q = supabase.from(table).select(columns)
  if (order) q = q.order(order.col, { ascending: order.asc ?? true })
  const { data, error } = await q
  if (error) throw error
  return (data ?? []) as T[]
}

/** Fetch a single row matching the given equality filters (or null). */
export async function fetchOne<T = any>(
  table: string,
  columns: string,
  match: Record<string, unknown>,
): Promise<T | null> {
  let q = supabase.from(table).select(columns)
  for (const [k, v] of Object.entries(match)) q = q.eq(k, v as never)
  const { data, error } = await q.maybeSingle()
  if (error) throw error
  return (data ?? null) as T | null
}

export async function insertRow(table: string, row: Record<string, unknown>): Promise<void> {
  const { error } = await supabase.from(table).insert(row)
  if (error) throw error
}

export async function updateRow(
  table: string,
  id: string,
  patch: Record<string, unknown>,
): Promise<void> {
  const { error } = await supabase.from(table).update(patch).eq('id', id)
  if (error) throw error
}

export async function deleteRow(table: string, id: string): Promise<void> {
  const { error } = await supabase.from(table).delete().eq('id', id)
  if (error) throw error
}

/** Upload an image to a public bucket and return its URL. */
export async function uploadImage(file: File, bucket = 'product-images'): Promise<string> {
  const ext = file.name.split('.').pop()?.toLowerCase() || 'png'
  const path = `${crypto.randomUUID()}.${ext}`
  const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: false })
  if (error) throw error
  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl
}

/** A short random code, e.g. for coupons / gift cards. */
export const randomCode = (prefix = '', len = 10): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let s = ''
  for (let i = 0; i < len; i++) s += chars[Math.floor(Math.random() * chars.length)]
  return prefix ? `${prefix}-${s}` : s
}
