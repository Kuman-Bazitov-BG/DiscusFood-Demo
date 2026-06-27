-- Shipping zones/methods are an INTERNAL admin tool (not shown to customers).
-- Remove public read access; the admin-only (is_admin) policies remain.
drop policy if exists "shipping_zones_public_read" on public.shipping_zones;
drop policy if exists "shipping_methods_public_read" on public.shipping_methods;
