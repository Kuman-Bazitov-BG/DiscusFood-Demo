-- New products are "not ready": they show "Coming soon…" in the shop and are
-- not purchasable until an admin sets the price + flips this off in the panel.
alter table public.products
  add column if not exists is_coming_soon boolean not null default true;
