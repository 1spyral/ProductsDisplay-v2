-- Custom SQL migration file, put your code below! --
UPDATE "products" SET "price" = '$' || "price" WHERE "price" IS NOT NULL;
