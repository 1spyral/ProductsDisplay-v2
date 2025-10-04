import { pgTable, text } from "drizzle-orm/pg-core";

export const products = pgTable("products", {
    id: text().primaryKey().notNull(),
    name: text(),
    description: text(),
    category: text()
        .notNull()
        .references(() => categories.category),
});

export const categories = pgTable("categories", {
    category: text().primaryKey().notNull(),
    name: text(),
});
