-- Performance indexes for foreign keys and common lookup/filter columns.
-- Idempotent (IF NOT EXISTS) so it is safe to (re)apply against an existing DB.

-- order_items: joined by order, aggregated by product
CREATE INDEX IF NOT EXISTS "order_items_order_idx" ON "order_items" ("order_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "order_items_product_idx" ON "order_items" ("product_id");--> statement-breakpoint

-- orders: customer history, status dashboards, recent-orders sort, FKs
CREATE INDEX IF NOT EXISTS "orders_user_idx" ON "orders" ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "orders_status_idx" ON "orders" ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "orders_fulfillment_idx" ON "orders" ("fulfillment_status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "orders_created_at_idx" ON "orders" ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "orders_email_idx" ON "orders" ("email");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "orders_coupon_idx" ON "orders" ("coupon_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "orders_gift_card_idx" ON "orders" ("gift_card_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "orders_shipping_method_idx" ON "orders" ("shipping_method_id");--> statement-breakpoint

-- products: catalog filtering + category browse
CREATE INDEX IF NOT EXISTS "products_category_idx" ON "products" ("category_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "products_active_idx" ON "products" ("is_active");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "products_coming_soon_idx" ON "products" ("is_coming_soon");--> statement-breakpoint

-- reviews: per-product listings, moderation queue, user history
CREATE INDEX IF NOT EXISTS "reviews_user_idx" ON "reviews" ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "reviews_order_idx" ON "reviews" ("order_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "reviews_status_idx" ON "reviews" ("status");--> statement-breakpoint

-- returns + items
CREATE INDEX IF NOT EXISTS "returns_order_idx" ON "returns" ("order_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "returns_user_idx" ON "returns" ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "returns_status_idx" ON "returns" ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "return_items_return_idx" ON "return_items" ("return_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "return_items_order_item_idx" ON "return_items" ("order_item_id");--> statement-breakpoint

-- invoices, gift-card ledger, offers, shipping, tracking, stock
CREATE INDEX IF NOT EXISTS "invoices_order_idx" ON "invoices" ("order_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "gift_card_tx_card_idx" ON "gift_card_transactions" ("gift_card_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "gift_card_tx_order_idx" ON "gift_card_transactions" ("order_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "offers_category_idx" ON "offers" ("category_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "offers_product_idx" ON "offers" ("product_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "offers_active_idx" ON "offers" ("is_active");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "shipping_methods_zone_idx" ON "shipping_methods" ("zone_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "tracking_events_shipment_idx" ON "tracking_events" ("shipment_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "stock_movements_created_by_idx" ON "stock_movements" ("created_by");
