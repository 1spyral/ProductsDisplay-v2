CREATE TABLE "categories" (
	"category" text PRIMARY KEY NOT NULL,
	"name" text
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text,
	"description" text,
	"category" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_category_categories_category_fk" FOREIGN KEY ("category") REFERENCES "public"."categories"("category") ON DELETE no action ON UPDATE no action;