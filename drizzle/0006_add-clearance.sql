DROP INDEX IF EXISTS "products_category_idx";--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "clearance" boolean DEFAULT false NOT NULL;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "products_category_clearance_idx" ON "products" USING btree ("category","clearance");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "products_clearance_idx" ON "products" USING btree ("clearance");