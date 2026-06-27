-- ════════════════════════════════════════════════════════════════════
--  PROMOTIONS, GIFT CARDS & SHIPPING
-- ════════════════════════════════════════════════════════════════════

-- ── Coupons ─────────────────────────────────────────────────────────
create type public.discount_type as enum ('percent', 'fixed');

create table public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  description text not null default '',
  discount_type public.discount_type not null,
  value integer not null,                       -- percent (1-100) or cents
  min_order_cents integer not null default 0,   -- minimum subtotal to qualify
  max_redemptions integer,                      -- null = unlimited
  times_redeemed integer not null default 0,
  per_user_limit integer,                       -- null = unlimited
  starts_at timestamptz,
  expires_at timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ── Offers / promotions (auto-applied product or category discounts) ─
create table public.offers (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  discount_type public.discount_type not null,
  value integer not null,
  category_id uuid references public.categories (id) on delete cascade,
  product_id uuid references public.products (id) on delete cascade,
  banner_image_url text,
  starts_at timestamptz,
  ends_at timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ── Gift cards ──────────────────────────────────────────────────────
create type public.gift_card_status as enum ('active', 'redeemed', 'disabled', 'expired');

create table public.gift_cards (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  initial_balance_cents integer not null,
  balance_cents integer not null,
  currency text not null default 'eur',
  status public.gift_card_status not null default 'active',
  recipient_email text,
  note text,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.gift_card_transactions (
  id uuid primary key default gen_random_uuid(),
  gift_card_id uuid not null references public.gift_cards (id) on delete cascade,
  amount_cents integer not null,        -- negative = spent, positive = top-up
  order_id uuid,                        -- FK added later (orders extended next migration)
  created_at timestamptz not null default now()
);

-- ── Shipping zones, methods & free-shipping rules ───────────────────
create table public.shipping_zones (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  countries text[] not null default '{}',   -- ISO codes; empty = applies everywhere
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.shipping_methods (
  id uuid primary key default gen_random_uuid(),
  zone_id uuid references public.shipping_zones (id) on delete cascade,
  name text not null,                          -- e.g. "Standard", "Express"
  description text not null default '',
  price_cents integer not null default 0,
  -- Orders at/above this subtotal ship free (null = never free via threshold).
  free_over_cents integer,
  estimated_days_min integer,
  estimated_days_max integer,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);
