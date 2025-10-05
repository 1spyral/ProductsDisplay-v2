DROP INDEX IF EXISTS "product_images_product_id_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "product_images_position_idx";--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "product_images_product_id_position_idx" ON "product_images" USING btree ("product_id","position");