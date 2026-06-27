# 🐟 Discus Fish — Back-end (Express API)

Express + TypeScript API for the Discus Fish Food shop. Owns the database
(Drizzle + Supabase Postgres), admin auth, product image storage, and Stripe
payments. The Vite front-end (`../`, later `client/`) talks to this over HTTP.

## Endpoints

| Method | Path                       | Auth   | Purpose                              |
| ------ | -------------------------- | ------ | ------------------------------------ |
| GET    | `/health`                  | —      | Health check                         |
| GET    | `/api/products`            | —      | List active products                 |
| GET    | `/api/products/:slug`      | —      | Get one product by slug              |
| POST   | `/api/products`            | Admin  | Create a product                     |
| PATCH  | `/api/products/:id`        | Admin  | Update a product                     |
| DELETE | `/api/products/:id`        | Admin  | Delete a product                     |
| POST   | `/api/upload/image`        | Admin  | Upload a product image to Storage    |
| POST   | `/api/checkout`            | —      | Create a Stripe Checkout session     |
| POST   | `/api/webhooks/stripe`     | Stripe | Stripe webhook → records paid orders |

Admin routes expect an `Authorization: Bearer <supabase-access-token>` header.
The token is verified with Supabase and the email checked against `ADMIN_EMAILS`.

---

## 1. Create the Supabase project

1. Go to <https://supabase.com/dashboard> → **New project**.
2. Name it **Discus Fish**, choose a region close to you, set a strong database
   password (save it), and create the project.
3. **Project Settings → API**, copy:
   - **Project URL** → `SUPABASE_URL`
   - **anon public** key → the *client's* `VITE_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` (⚠️ secret, server only)
4. **Project Settings → Database → Connection string → URI**, copy the
   **Connection pooler** URI (port `6543`) and put it in `DATABASE_URL`
   (insert your DB password).

## 2. Create the admin login

1. **Authentication → Providers**: keep **Email** enabled. Turn **off**
   "Allow new users to sign up" so only you can create accounts.
2. **Authentication → Users → Add user**: create your admin email + password.
3. Put that email in `ADMIN_EMAILS` (comma-separated if more than one).

## 3. Create the image Storage bucket

1. **Storage → New bucket**, name it **product-images**, mark it **Public**
   (product images are shown on the public storefront).
2. Keep the name in sync with `SUPABASE_STORAGE_BUCKET`.

## 4. Configure Stripe

1. <https://dashboard.stripe.com> → **Developers → API keys**: copy the
   **Secret key** → `STRIPE_SECRET_KEY` (and the **Publishable key** → the
   client's `VITE_STRIPE_PUBLISHABLE_KEY`).
2. Local webhooks: install the Stripe CLI and run
   `stripe listen --forward-to localhost:3000/api/webhooks/stripe`.
   It prints a `whsec_...` secret → `STRIPE_WEBHOOK_SECRET`.

## 5. Fill env + push the schema

```bash
cp .env.example .env     # then fill in the real values from steps 1–4
npm install
npm run db:push          # creates the products / orders / order_items tables
npm run dev              # http://localhost:3000
```

`npm run db:generate` already produced the SQL migration in `drizzle/`.
Use `db:push` for quick local sync, or `db:migrate` to apply versioned
migrations. `npm run db:studio` opens a DB browser.

---

## Notes

- The `service_role` key bypasses Row-Level Security — it lives **only** here,
  never in the front-end.
- Checkout prices are read from the database, never trusted from the client.
- Orders are written by the verified Stripe webhook, not the browser.
