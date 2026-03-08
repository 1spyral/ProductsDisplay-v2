import { sql } from "drizzle-orm";
import { db } from "@/db/drizzle";

const resetSql = sql.raw(`
TRUNCATE TABLE
    order_products,
    orders,
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
