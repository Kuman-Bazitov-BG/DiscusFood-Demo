-- Enable RLS on all tables. The Express API uses the service-role key, which
-- bypasses RLS, so server access is unaffected. This locks down direct anon
-- (browser) access by default.
ALTER TABLE "products" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "orders" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "order_items" ENABLE ROW LEVEL SECURITY;

-- Allow anyone (anon + authenticated) to READ active products directly.
-- Safe: products are public catalog data. Writes remain server-only.
CREATE POLICY "Public can read active products"
  ON "products"
  FOR SELECT
  TO anon, authenticated
  USING ("is_active" = true);

-- No policies on orders / order_items => anon and authenticated get NO access.
-- Only the service-role key (server) can read/write them.
