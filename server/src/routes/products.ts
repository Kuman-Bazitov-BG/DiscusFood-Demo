import { Router } from 'express'
import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { db } from '../db/index.js'
import { products } from '../db/schema.js'
import { requireAdmin } from '../middleware/requireAdmin.js'

export const productsRouter = Router()

const productInput = z.object({
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/, 'slug must be lowercase letters, numbers, dashes'),
  name: z.string().min(1),
  description: z.string().default(''),
  details: z.string().nullish(),
  priceCents: z.number().int().positive(),
  currency: z.string().length(3).default('usd'),
  imageUrl: z.string().url().nullish(),
  images: z.array(z.string().url()).default([]),
  weightGrams: z.number().int().positive().nullish(),
  stock: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
})

// --- Public: list active products ---
productsRouter.get('/', async (_req, res) => {
  const rows = await db
    .select()
    .from(products)
    .where(eq(products.isActive, true))
  res.json(rows)
})

// --- Public: single product by slug ---
productsRouter.get('/:slug', async (req, res) => {
  const [row] = await db
    .select()
    .from(products)
    .where(eq(products.slug, req.params.slug))
    .limit(1)
  if (!row || !row.isActive) {
    return res.status(404).json({ error: 'Product not found' })
  }
  res.json(row)
})

// --- Admin: create ---
productsRouter.post('/', requireAdmin, async (req, res) => {
  const parsed = productInput.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: z.flattenError(parsed.error) })
  }
  const [row] = await db.insert(products).values(parsed.data).returning()
  res.status(201).json(row)
})

// --- Admin: update ---
productsRouter.patch('/:id', requireAdmin, async (req, res) => {
  const parsed = productInput.partial().safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: z.flattenError(parsed.error) })
  }
  const [row] = await db
    .update(products)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(products.id, String(req.params.id)))
    .returning()
  if (!row) return res.status(404).json({ error: 'Product not found' })
  res.json(row)
})

// --- Admin: delete ---
productsRouter.delete('/:id', requireAdmin, async (req, res) => {
  const [row] = await db
    .delete(products)
    .where(eq(products.id, String(req.params.id)))
    .returning()
  if (!row) return res.status(404).json({ error: 'Product not found' })
  res.json({ deleted: row.id })
})
