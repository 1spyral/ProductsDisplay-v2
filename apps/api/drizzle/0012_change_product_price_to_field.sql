DROP TABLE "product_prices" CASCADE;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "price" text;--> statement-breakpoint
DROP TYPE "public"."product_price_type";