// Applies the 15 schema migrations (DDL) to the demo Supabase project over a
// direct Postgres connection. Reads DATABASE_URL from server/.env.
// Idempotent-ish: also records each migration in supabase_migrations so a later
// `supabase db push` sees them as applied.
import postgres from 'postgres'
import { readFileSync, existsSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const root = join(here, '..')
const migDir = join(root, 'supabase', 'migrations')

function fromServerEnv(key) {
  const p = join(root, 'server', '.env')
  if (!existsSync(p)) return undefined
  for (const line of readFileSync(p, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z_]+)\s*=\s*(.*)\s*$/)
    if (m && m[1] === key) return m[2].replace(/^["']|["']$/g, '')
  }
}

const url = process.env.DATABASE_URL || fromServerEnv('DATABASE_URL')
if (!url || url.includes('YOUR-DB-PASSWORD')) {
  console.error('ERROR: real DATABASE_URL not set in server/.env'); process.exit(1)
}

const sql = postgres(url, { ssl: 'require', max: 1, idle_timeout: 10 })
const files = readdirSync(migDir).filter((f) => f.endsWith('.sql')).sort()

try {
  await sql.unsafe(`
    create schema if not exists supabase_migrations;
    create table if not exists supabase_migrations.schema_migrations (
      version text primary key, statements text[], name text
    );`)

  for (const file of files) {
    const version = file.slice(0, 14)
    const name = file.slice(15, -4)
    const body = readFileSync(join(migDir, file), 'utf8')

    const done = await sql`select 1 from supabase_migrations.schema_migrations where version = ${version}`
    if (done.length) { console.log(`skip  ${file} (already applied)`); continue }

    try {
      await sql.unsafe(body)
      await sql`insert into supabase_migrations.schema_migrations (version, name, statements)
                values (${version}, ${name}, ${[body]})
                on conflict (version) do nothing`
      console.log(`OK    ${file}`)
    } catch (e) {
      console.error(`FAIL  ${file}\n      ${e.message}`)
      throw e
    }
  }
  console.log('\nALL MIGRATIONS APPLIED.')
} catch (e) {
  console.error('CONNECTION/RUN ERROR:', e.code || '', e.message)
  process.exitCode = 1
} finally {
  await sql.end({ timeout: 5 })
}
