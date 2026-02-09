import { boolean, index, pgTable, text } from "drizzle-orm/pg-core";
import { categories } from "./categories";

export const products = pgTable(
    "products",
    {
        id: text().primaryKey().notNull(),
        name: text(),
        description: text(),
        category: text().references(() => categories.category, {
            onDelete: "set null",
            onUpdate: "cascade",
        }),
        price: text(),
        clearance: boolean().notNull().default(false),
        soldOut: boolean("sold_out").notNull().default(false),
        hidden: boolean().notNull().default(false),
    },
    (table) => [
        index("products_category_hidden_clearance_idx").on(
            table.category,
            table.hidden,
            table.clearance
        ),
        index("products_hidden_clearance_idx").on(
            table.hidden,
            table.clearance
        ),
    ]
);
