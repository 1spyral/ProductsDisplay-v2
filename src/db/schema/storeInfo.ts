import { integer, pgTable, text } from "drizzle-orm/pg-core";

export const storeInfo = pgTable("store_info", {
    // Singleton row by convention: id=1
    id: integer().primaryKey().notNull().default(1),
    name: text(),
    headline: text(),
    description: text(),
    copyright: text(),
});
