-- Step 1: Add new UUID column
ALTER TABLE "product_images" ADD COLUMN "id_new" uuid DEFAULT gen_random_uuid() NOT NULL;--> statement-breakpoint
-- Step 2: Generate UUIDs for all existing rows
UPDATE "product_images" SET "id_new" = gen_random_uuid();--> statement-breakpoint
-- Step 3: Drop the old primary key constraint
ALTER TABLE "product_images" DROP CONSTRAINT "product_images_pkey";--> statement-breakpoint
-- Step 4: Drop old text ID column
ALTER TABLE "product_images" DROP COLUMN "id";--> statement-breakpoint
-- Step 5: Rename new column to id
ALTER TABLE "product_images" RENAME COLUMN "id_new" TO "id";--> statement-breakpoint
-- Step 6: Add primary key constraint on the new UUID column
ALTER TABLE "product_images" ADD PRIMARY KEY ("id");