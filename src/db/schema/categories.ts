import { pgTable, text } from "drizzle-orm/pg-core";

export const categories = pgTable("categories", {
    category: text().primaryKey().notNull(),
    name: text(),
});
