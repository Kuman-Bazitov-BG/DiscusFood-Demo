-- ════════════════════════════════════════════════════════════════════
--  ORDERS, PAYMENTS, SHIPMENTS/TRACKING, RETURNS, REVIEWS, INVOICES
-- ════════════════════════════════════════════════════════════════════

-- ── Fulfillment status enum + order extensions ──────────────────────
create type public.fulfillment_status as enum (
  'unfulfilled', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'
);

-- Human-friendly sequential order numbers: DF-10001, DF-10002, ...
create sequence if not exists public.order_number_seq start 10001;

alter table public.orders
  add column if not exists user_id uuid references public.profiles (id) on delete set null,
  add column if not exists order_number text unique,
  add column if not exists subtotal_cents integer not null default 0,
  add column if not exists shipping_cents integer not null default 0,
  add column if not exists discount_cents integer not null default 0,
  add column if not exists tax_cents integer not null default 0,
  add column if not exists gift_card_cents integer not null default 0,
  add column if not exists coupon_id uuid references public.coupons (id) on delete set null,
  add column if not exists gift_card_id uuid references public.gift_cards (id) on delete set null,
  add column if not exists shipping_method_id uuid references public.shipping_methods (id) on delete set null,
  add column if not exists fulfillment_status public.fulfillment_status not null default 'unfulfilled',
  add column if not exists ship_name text,
  add column if not exists ship_phone text,
  add column if not exists ship_address1 text,
  add column if not exists ship_address2 text,
  add column if not exists ship_city text,
  add column if not exists ship_postal_code text,
  add column if not exists ship_country text,
  add column if not exists customer_note text,
  add column if not exists admin_note text,
  add column if not exists updated_at timestamptz not null default now();

-- Back-reference for gift card spend (deferred from previous migration).
alter table public.gift_card_transactions
  add constraint gift_card_transactions_order_fk
  foreign key (order_id) references public.orders (id) on delete set null;

-- ── Payments (Stripe records, one+ per order) ───────────────────────
create type public.payment_status as enum (
  'pending', 'succeeded', 'failed', 'refunded', 'partially_refunded'
);
create table public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders (id) on delete set null,
  stripe_payment_intent_id text unique,
  stripe_charge_id text,
  amount_cents integer not null,
  amount_refunded_cents integer not null default 0,
  currency text not null default 'eur',
  status public.payment_status not null default 'pending',
  method text,                           -- card, etc.
  created_at timestamptz not null default now()
);
create index payments_order_idx on public.payments (order_id);

-- ── Shipments + tracking events ─────────────────────────────────────
create table public.shipments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  carrier text,
  tracking_number text,
  tracking_url text,
  shipped_at timestamptz,
  delivered_at timestamptz,
  created_at timestamptz not null default now()
);
create index shipments_order_idx on public.shipments (order_id);

create table public.tracking_events (
  id uuid primary key default gen_random_uuid(),
  shipment_id uuid not null references public.shipments (id) on delete cascade,
  status text not null,
  location text,
  description text,
  occurred_at timestamptz not null default now()
);

-- ── Returns / RMAs ──────────────────────────────────────────────────
create type public.return_status as enum (
  'requested', 'approved', 'rejected', 'received', 'refunded'
);
create table public.returns (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  user_id uuid references public.profiles (id) on delete set null,
  reason text not null default '',
  status public.return_status not null default 'requested',
  refund_amount_cents integer,
  admin_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.return_items (
  id uuid primary key default gen_random_uuid(),
  return_id uuid not null references public.returns (id) on delete cascade,
  order_item_id uuid references public.order_items (id) on delete set null,
  quantity integer not null default 1
);

-- ── Reviews / comments (post-order, admin-moderated) ────────────────
create type public.review_status as enum ('pending', 'approved', 'rejected');
create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  user_id uuid references public.profiles (id) on delete set null,
  order_id uuid references public.orders (id) on delete set null,
  author_name text,
  rating integer not null check (rating between 1 and 5),
  comment text not null default '',
  status public.review_status not null default 'pending',
  created_at timestamptz not null default now()
);
create index reviews_product_idx on public.reviews (product_id);

-- ── Invoices ────────────────────────────────────────────────────────
create table public.invoices (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  invoice_number text not null unique,
  pdf_url text,
  total_cents integer not null,
  currency text not null default 'eur',
  issued_at timestamptz not null default now()
);
create sequence if not exists public.invoice_number_seq start 1001;
