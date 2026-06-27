-- ════════════════════════════════════════════════════════════════════
--  ROW-LEVEL SECURITY
--  Pattern: admins get full access via is_admin(); the public gets read
--  access to catalog/marketing data; users see only their own records.
--  All writes to orders/payments/gift cards happen via Edge Functions
--  (service role), so the browser only needs read + a few user inserts.
-- ════════════════════════════════════════════════════════════════════

-- Enable RLS everywhere.
alter table public.categories            enable row level security;
alter table public.product_images        enable row level security;
alter table public.stock_movements       enable row level security;
alter table public.coupons               enable row level security;
alter table public.offers                enable row level security;
alter table public.gift_cards            enable row level security;
alter table public.gift_card_transactions enable row level security;
alter table public.shipping_zones        enable row level security;
alter table public.shipping_methods      enable row level security;
alter table public.payments              enable row level security;
alter table public.shipments             enable row level security;
alter table public.tracking_events       enable row level security;
alter table public.returns               enable row level security;
alter table public.return_items          enable row level security;
alter table public.reviews               enable row level security;
alter table public.invoices              enable row level security;
-- products / orders / order_items already have RLS enabled.

-- ── Admin-full-access on every table ────────────────────────────────
do $$
declare t text;
begin
  foreach t in array array[
    'products','orders','order_items','categories','product_images',
    'stock_movements','coupons','offers','gift_cards','gift_card_transactions',
    'shipping_zones','shipping_methods','payments','shipments','tracking_events',
    'returns','return_items','reviews','invoices'
  ] loop
    execute format(
      'create policy %I on public.%I for all using (public.is_admin()) with check (public.is_admin());',
      t || '_admin_all', t
    );
  end loop;
end $$;

-- ── Public (anon + authenticated) read of catalog & marketing ───────
create policy products_public_read on public.products
  for select using (is_active = true);
create policy categories_public_read on public.categories
  for select using (is_active = true);
create policy product_images_public_read on public.product_images
  for select using (true);
create policy offers_public_read on public.offers
  for select using (is_active = true);
create policy shipping_zones_public_read on public.shipping_zones
  for select using (is_active = true);
create policy shipping_methods_public_read on public.shipping_methods
  for select using (is_active = true);
create policy reviews_public_read on public.reviews
  for select using (status = 'approved');

-- ── Users: their own orders & related records ───────────────────────
create policy orders_owner_read on public.orders
  for select using (auth.uid() = user_id);

create policy order_items_owner_read on public.order_items
  for select using (exists (
    select 1 from public.orders o
    where o.id = order_items.order_id and o.user_id = auth.uid()
  ));

create policy payments_owner_read on public.payments
  for select using (exists (
    select 1 from public.orders o
    where o.id = payments.order_id and o.user_id = auth.uid()
  ));

create policy shipments_owner_read on public.shipments
  for select using (exists (
    select 1 from public.orders o
    where o.id = shipments.order_id and o.user_id = auth.uid()
  ));

create policy tracking_events_owner_read on public.tracking_events
  for select using (exists (
    select 1 from public.shipments s
    join public.orders o on o.id = s.order_id
    where s.id = tracking_events.shipment_id and o.user_id = auth.uid()
  ));

create policy invoices_owner_read on public.invoices
  for select using (exists (
    select 1 from public.orders o
    where o.id = invoices.order_id and o.user_id = auth.uid()
  ));

-- ── Users: returns (view + request their own) ───────────────────────
create policy returns_owner_read on public.returns
  for select using (auth.uid() = user_id);
create policy returns_owner_insert on public.returns
  for insert with check (
    auth.uid() = user_id and exists (
      select 1 from public.orders o
      where o.id = returns.order_id and o.user_id = auth.uid()
    )
  );

-- ── Users: reviews (read own pending + write, only for purchased) ───
create policy reviews_owner_read on public.reviews
  for select using (auth.uid() = user_id);
create policy reviews_owner_insert on public.reviews
  for insert with check (
    auth.uid() = user_id
    and status = 'pending'                       -- can't self-approve
    and exists (
      select 1 from public.orders o
      where o.id = reviews.order_id
        and o.user_id = auth.uid()
        and o.status = 'paid'
    )
  );
