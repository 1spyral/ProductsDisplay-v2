ALTER TABLE "products" DROP CONSTRAINT "products_category_categories_category_fk";
--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_category_categories_category_fk" FOREIGN KEY ("category") REFERENCES "public"."categories"("category") ON DELETE set null ON UPDATE cascade;