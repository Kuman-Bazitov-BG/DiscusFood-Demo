-- ════════════════════════════════════════════════════════════════════
--  CATALOG FOUNDATION: admin helper, categories, product extensions,
--  product images. Currency standardised to EUR.
-- ════════════════════════════════════════════════════════════════════

-- Helper: is the current user an admin? SECURITY DEFINER so RLS policies
-- can call it without recursing into profiles' own RLS.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- ── Categories ──────────────────────────────────────────────────────
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text not null default '',
  image_url text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ── Product extensions ──────────────────────────────────────────────
alter table public.products
  add column if not exists category_id uuid references public.categories (id) on delete set null,
  add column if not exists sku text unique,
  add column if not exists compare_at_price_cents integer,
  add column if not exists cost_cents integer,
  add column if not exists low_stock_threshold integer not null default 5,
  add column if not exists track_inventory boolean not null default true;

-- Move the store to EUR.
alter table public.products  alter column currency set default 'eur';
alter table public.orders    alter column currency set default 'eur';
update public.products set currency = 'eur' where currency = 'usd';

-- ── Product images (ordered gallery) ────────────────────────────────
create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  url text not null,
  alt text,
  sort_order integer not null default 0,
  is_primary boolean not null default false,
  created_at timestamptz not null default now()
);
create index product_images_product_idx on public.product_images (product_id);

-- ── Inventory movement log (audit trail for stock changes) ──────────
create type public.stock_reason as enum (
  'manual', 'sale', 'return', 'restock', 'correction', 'cancellation'
);
create table public.stock_movements (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  change integer not null,
  reason public.stock_reason not null default 'manual',
  note text,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);
create index stock_movements_product_idx on public.stock_movements (product_id);
