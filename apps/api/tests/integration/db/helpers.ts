import { db } from "@/db/drizzle";
import { sql } from "drizzle-orm";

const resetSql = sql.raw(`
TRUNCATE TABLE
    saved_selection_products,
    saved_selections,
    product_images,
    products,
    categories,
    store_info
RESTART IDENTITY CASCADE;
`);

export async function resetTestDatabase(): Promise<void> {
    await db.execute(resetSql);
}
