DROP INDEX "products_category_clearance_idx";--> statement-breakpoint
DROP INDEX "products_clearance_idx";--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "hidden" boolean DEFAULT false NOT NULL;--> statement-breakpoint
CREATE INDEX "products_category_hidden_clearance_idx" ON "products" USING btree ("category","hidden","clearance");--> statement-breakpoint
CREATE INDEX "products_hidden_clearance_idx" ON "products" USING btree ("hidden","clearance");