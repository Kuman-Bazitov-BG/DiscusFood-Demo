import { Router } from 'express'
import multer from 'multer'
import { randomUUID } from 'node:crypto'
import { supabaseAdmin, STORAGE_BUCKET } from '../lib/supabase.js'
import { requireAdmin } from '../middleware/requireAdmin.js'

export const uploadRouter = Router()

// Keep files in memory; we forward straight to Supabase Storage.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (_req, file, cb) => {
    cb(null, file.mimetype.startsWith('image/'))
  },
})

// --- Admin: upload a product image, returns its public URL ---
uploadRouter.post(
  '/image',
  requireAdmin,
  upload.single('file'),
  async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' })
    }

    const ext = req.file.originalname.split('.').pop()?.toLowerCase() ?? 'jpg'
    const path = `pictures/${randomUUID()}.${ext}`

    const { error } = await supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .upload(path, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: false,
      })

    if (error) {
      return res.status(500).json({ error: error.message })
    }

    const { data } = supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(path)

    res.status(201).json({ path, url: data.publicUrl })
  },
)
