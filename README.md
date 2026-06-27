# 🐟 Discus Fish Food — E-Commerce Web App

A full-stack web application for selling **Discus Fish Food** online, with product
browsing, a shopping cart, and secure checkout powered by Stripe.

The project is split into two apps in one repo:

- **`client/`** — Vite + React front-end (the storefront the user sees)
- **`server/`** — Express API back-end (Stripe, Drizzle, database access)

---

## 🧰 Tech Stack

### Front-end (`client/`)

- **TypeScript**
- **Vite**
- **React**
- **Tailwind CSS**

### Back-end (`server/`)

- **TypeScript**
- **Node.js + Express**
- **Drizzle ORM**
- **Supabase** (PostgreSQL database + Auth)

### Payments

- **Stripe** (Checkout + Webhooks)

---

## ✨ Planned Features

- Product catalog of Discus fish foods
- Product detail pages
- Shopping cart
- User authentication (Supabase Auth)
- Secure checkout with Stripe
- Order history
- Admin: manage products & orders

---

## 📁 Project Structure

> Target structure once both apps are scaffolded.

```text
discus-fish/
├── client/                  # Front-end (Vite + React + Tailwind)
│   ├── public/              # Static assets
│   ├── src/
│   │   ├── components/      # Reusable React components
│   │   ├── pages/           # Route pages (products, cart, checkout)
│   │   ├── lib/
│   │   │   ├── supabase.ts  # Supabase browser client
│   │   │   └── api.ts       # Calls to the Express back-end
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── .env                 # VITE_* vars (git-ignored)
│   └── .env.example
│
├── server/                  # Back-end (Express + Drizzle + Stripe)
│   ├── src/
│   │   ├── routes/
│   │   │   ├── checkout.ts  # Create Stripe Checkout session
│   │   │   └── webhooks.ts  # Stripe webhook handler
│   │   ├── db/
│   │   │   ├── schema.ts    # Drizzle database schema
│   │   │   └── index.ts     # Drizzle client (Postgres)
│   │   ├── lib/
│   │   │   └── stripe.ts    # Stripe server client
│   │   └── index.ts         # Express app entry
│   ├── drizzle/             # Generated SQL migrations
│   ├── drizzle.config.ts    # Drizzle Kit config
│   ├── .env                 # Server secrets (git-ignored)
│   └── .env.example
│
└── README.md
```

---

## 🔑 Environment Variables

Secrets are split by app. **`.env` files are git-ignored and must never be committed** —
copy each `.env.example` to `.env` and fill in your own values.

### `client/.env` (exposed to the browser — public values only)

| Variable                      | Description                                  |
| ----------------------------- | -------------------------------------------- |
| `VITE_SUPABASE_URL`           | Supabase project URL                         |
| `VITE_SUPABASE_ANON_KEY`      | Supabase anon key (used with RLS)            |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key                       |
| `VITE_API_URL`                | Base URL of the Express back-end             |

### `server/.env` (server-only secrets — never sent to the browser)

| Variable                | Description                                      |
| ----------------------- | ------------------------------------------------ |
| `DATABASE_URL`          | Postgres connection string (Drizzle/migrations)  |
| `STRIPE_SECRET_KEY`     | Stripe secret API key                            |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret                    |
| `CLIENT_URL`            | Front-end origin (for CORS + Stripe redirects)   |
| `PORT`                  | Port the Express server listens on               |

---

## 🚀 Getting Started

```bash
# 1. Front-end
cd client
npm install
npm run dev          # http://localhost:5173

# 2. Back-end (in a second terminal)
cd server
npm install
npm run db:push      # apply schema to the database
npm run dev          # http://localhost:3000
```

---

## 📜 Scripts

### `client/`

| Command           | Description                  |
| ----------------- | ---------------------------- |
| `npm run dev`     | Start the Vite dev server    |
| `npm run build`   | Build the front-end          |
| `npm run preview` | Preview the production build |
| `npm run lint`    | Lint the codebase            |

### `server/`

| Command               | Description                 |
| --------------------- | --------------------------- |
| `npm run dev`         | Start the Express dev server|
| `npm run build`       | Compile TypeScript          |
| `npm run start`       | Run the compiled server     |
| `npm run db:generate` | Generate Drizzle migrations |
| `npm run db:push`     | Push schema to the database |
| `npm run db:migrate`  | Run migrations              |
| `npm run db:studio`   | Open Drizzle Studio         |

---

## 🔒 Security Notes

- All `.env` files are **git-ignored** — secrets stay local.
- Server-only secrets (`DATABASE_URL`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`)
  live in `server/` and are **never** bundled into the front-end.
- The front-end only receives `VITE_*` public values.
- Enable **Row-Level Security (RLS)** on Supabase tables accessed from the client.
- Stripe payments are processed server-side; webhook signatures are verified.

---

## 📄 License

Private project — all rights reserved.
