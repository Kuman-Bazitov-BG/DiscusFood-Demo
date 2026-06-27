import type { Request, Response, NextFunction } from 'express'
import { supabaseAdmin } from '../lib/supabase.js'
import { adminEmails } from '../env.js'

/**
 * Express request augmented with the authenticated admin's email.
 */
export interface AdminRequest extends Request {
  adminEmail?: string
}

/**
 * Guards admin-only routes. Expects an `Authorization: Bearer <supabase-jwt>`
 * header (the access token from a Supabase login on the client). Verifies the
 * token with Supabase, then checks the email against the ADMIN_EMAILS allowlist.
 */
export async function requireAdmin(
  req: AdminRequest,
  res: Response,
  next: NextFunction,
) {
  const header = req.headers.authorization
  const token = header?.startsWith('Bearer ') ? header.slice(7) : null

  if (!token) {
    return res.status(401).json({ error: 'Missing bearer token' })
  }

  const { data, error } = await supabaseAdmin.auth.getUser(token)
  if (error || !data.user) {
    return res.status(401).json({ error: 'Invalid or expired token' })
  }

  const email = data.user.email?.toLowerCase()
  if (!email || !adminEmails.has(email)) {
    return res.status(403).json({ error: 'Not authorized as admin' })
  }

  req.adminEmail = email
  next()
}
