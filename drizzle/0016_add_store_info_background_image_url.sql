CREATE TABLE IF NOT EXISTS "saved_selection_products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"selection_id" uuid NOT NULL,
	"product_id" text NOT NULL,
	"position" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "saved_selections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "store_info" ADD COLUMN IF NOT EXISTS "background_image_url" text;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "saved_selection_products" ADD CONSTRAINT "saved_selection_products_selection_id_saved_selections_id_fk" FOREIGN KEY ("selection_id") REFERENCES "public"."saved_selections"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END; $$;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "saved_selection_products" ADD CONSTRAINT "saved_selection_products_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION WHEN duplicate_object THEN NULL;
END; $$;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "saved_selection_products_selection_id_position_idx" ON "saved_selection_products" USING btree ("selection_id","position");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "saved_selection_products_product_id_idx" ON "saved_selection_products" USING btree ("product_id");