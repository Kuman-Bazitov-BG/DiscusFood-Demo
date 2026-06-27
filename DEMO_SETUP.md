# Discus Fish — DEMO setup runbook

This is a **portfolio demo** of the Discus Fish store: its own GitHub repo, its
own Supabase project, Stripe **test mode**, and a Netlify subdomain. A yellow
"Demo / Test mode" banner is shown app-wide and checkout uses the Stripe test
card `4242 4242 4242 4242` (no real money).

Production (`vumjslsogdnexehutibj`) is **untouched** by any of this.

---

## What is already done (in code)
- ✅ Separate demo working copy (this folder), builds clean.
- ✅ `VITE_DEMO_MODE` flag + always-on demo banner (storefront + admin, EN/EL/BG)
  → [src/components/DemoBanner.tsx](src/components/DemoBanner.tsx), [src/lib/demo.ts](src/lib/demo.ts)
- ✅ Stripe checkout + webhook as Supabase **Edge Functions** (replacing Express)
  → [supabase/functions/checkout](supabase/functions/checkout), [supabase/functions/stripe-webhook](supabase/functions/stripe-webhook)
- ✅ Client calls the Edge Function → [src/lib/api.ts](src/lib/api.ts)
- ✅ Catalog seed data + demo seed script → [scripts/seed-demo.mjs](scripts/seed-demo.mjs)

## What still needs your accounts (do these once)

### 1. GitHub repo
Create an empty repo (e.g. `discus-fish-demo`), then from this folder:
```
git init
git add .
git commit -m "Discus Fish demo"
git branch -M main
git remote add origin https://github.com/<you>/discus-fish-demo.git
git push -u origin main
```

### 2. Supabase demo project
1. Create a new project at supabase.com → note **Project URL**, **anon key**,
   **service_role key**, and the **DB password**.
2. Apply the schema (15 migrations in `supabase/migrations/`):
   ```
   npx supabase link --project-ref <demo-ref>
   npx supabase db push
   ```
   (or paste `supabase/migrations/*.sql` in order into the SQL editor.)
3. Create the demo admin account: sign up in the app (or Auth dashboard), then
   in SQL editor: `update public.profiles set role='admin' where email='<you>';`

### 3. Stripe (test mode)
1. Toggle **Test mode** in the Stripe dashboard → Developers → API keys:
   copy `pk_test_…` and `sk_test_…`.
2. Add a webhook (Developers → Webhooks) to:
   `https://<demo-ref>.functions.supabase.co/stripe-webhook`
   event `checkout.session.completed` → copy the signing secret `whsec_…`.

### 4. Deploy the Edge Functions + secrets
```
npx supabase secrets set STRIPE_SECRET_KEY=sk_test_... STRIPE_WEBHOOK_SECRET=whsec_...
npx supabase functions deploy checkout
npx supabase functions deploy stripe-webhook
```
(`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are injected automatically.)

### 5. Seed the demo data
Put the demo service creds in `server/.env`:
```
SUPABASE_URL=https://<demo-ref>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<demo service_role key>
```
Then:
```
npm install
npm run seed:demo
```
Imports the real 69-product catalog + categories + shipping + coupons, and
generates ~14 sample orders + 10 reviews with **fake** customer data.

### 6. Netlify (subdomain)
1. New site from the `discus-fish-demo` repo. Build: `npm run build`, publish: `dist`.
   (`public/_redirects` already handles SPA routing.)
2. Set environment variables:
   ```
   VITE_DEMO_MODE=true
   VITE_SUPABASE_URL=https://<demo-ref>.supabase.co
   VITE_SUPABASE_ANON_KEY=<demo anon key>
   VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
   ```
   (Leave `VITE_API_URL` empty so checkout uses the Edge Function.)
3. Site settings → Domain → rename to your subdomain (e.g. `discus-fish-demo`).

### 7. Test the full flow
Open the site → add to cart → checkout → pay with `4242 4242 4242 4242`
(any future expiry, any CVC, any postal code) → land on success →
confirm the order appears in `/admin` Orders.

---

## Environment variable reference

| Where | Variable | Value |
|---|---|---|
| Netlify (client) | `VITE_DEMO_MODE` | `true` |
| Netlify (client) | `VITE_SUPABASE_URL` | demo project URL |
| Netlify (client) | `VITE_SUPABASE_ANON_KEY` | demo anon/publishable key |
| Netlify (client) | `VITE_STRIPE_PUBLISHABLE_KEY` | `pk_test_…` |
| Supabase secret (functions) | `STRIPE_SECRET_KEY` | `sk_test_…` |
| Supabase secret (functions) | `STRIPE_WEBHOOK_SECRET` | `whsec_…` |
| `server/.env` (seed only) | `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` | demo project |
