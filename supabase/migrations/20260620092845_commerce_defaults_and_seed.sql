-- ════════════════════════════════════════════════════════════════════
--  DEFAULTS, TRIGGERS & BASE SEED DATA
-- ════════════════════════════════════════════════════════════════════

-- Auto-generate human-friendly numbers.
alter table public.orders
  alter column order_number set default ('DF-' || nextval('public.order_number_seq'));
alter table public.invoices
  alter column invoice_number set default ('INV-' || nextval('public.invoice_number_seq'));

-- Keep updated_at fresh.
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;
create trigger orders_touch_updated_at  before update on public.orders
  for each row execute function public.touch_updated_at();
create trigger returns_touch_updated_at before update on public.returns
  for each row execute function public.touch_updated_at();

-- ── Categories ──────────────────────────────────────────────────────
insert into public.categories (slug, name, description, sort_order) values
  ('discus-food',        'Discus Food',            'Daily granules, flakes and pellets for discus.', 1),
  ('color-enhancers',    'Color Enhancers',        'Astaxanthin & carotenoid blends for vivid color.', 2),
  ('fry-growth',         'Fry & Growth',           'High-protein food for juveniles and growth.', 3),
  ('preparations',       'Water Preparations',     'Conditioners and treatments for discus tanks.', 4),
  ('supplements',        'Supplements & Vitamins', 'Boosters, vitamins and health supplements.', 5)
on conflict (slug) do nothing;

-- ── Shipping (EU zone, standard + express, free over €35) ───────────
insert into public.shipping_zones (id, name, countries)
values ('00000000-0000-0000-0000-0000000000e0', 'Europe', array['GR','BG','CY','RO','DE','FR','IT','ES','NL','BE','AT'])
on conflict (id) do nothing;

insert into public.shipping_methods
  (zone_id, name, description, price_cents, free_over_cents, estimated_days_min, estimated_days_max, sort_order)
values
  ('00000000-0000-0000-0000-0000000000e0', 'Standard', 'Tracked delivery', 490, 3500, 2, 5, 1),
  ('00000000-0000-0000-0000-0000000000e0', 'Express',  'Priority delivery', 990, null, 1, 2, 2)
on conflict do nothing;

-- ── A starter coupon ────────────────────────────────────────────────
insert into public.coupons (code, description, discount_type, value, min_order_cents, is_active)
values ('WELCOME10', '10% off your first order', 'percent', 10, 0, true)
on conflict (code) do nothing;
