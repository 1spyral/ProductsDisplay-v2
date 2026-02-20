CREATE TABLE "saved_selections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "saved_selection_products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"selection_id" uuid NOT NULL REFERENCES "saved_selections"("id") ON DELETE CASCADE,
	"product_id" text NOT NULL REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE,
	"position" integer NOT NULL DEFAULT 0
);

CREATE INDEX "saved_selection_products_selection_id_position_idx" ON "saved_selection_products" ("selection_id", "position");
CREATE INDEX "saved_selection_products_product_id_idx" ON "saved_selection_products" ("product_id");
