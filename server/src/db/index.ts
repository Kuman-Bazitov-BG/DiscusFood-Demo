import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { env } from '../env.js'
import * as schema from './schema.js'

// `prepare: false` is recommended when connecting through Supabase's pooler.
const client = postgres(env.DATABASE_URL, { prepare: false })

export const db = drizzle(client, { schema })
