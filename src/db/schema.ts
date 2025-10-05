import { pgTable, text, index } from "drizzle-orm/pg-core";

export const categories = pgTable("categories", {
    category: text().primaryKey().notNull(),
    name: text(),
});

export const products = pgTable(
    "products",
    {
        id: text().primaryKey().notNull(),
        name: text(),
        description: text(),
        category: text()
            .notNull()
            .references(() => categories.category),
    },
    (table) => ({
        categoryIdx: index("products_category_idx").on(table.category),
    })
);
