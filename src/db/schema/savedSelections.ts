import {
    index,
    integer,
    pgTable,
    text,
    timestamp,
    uuid,
} from "drizzle-orm/pg-core";
import { products } from "./products";

export const savedSelections = pgTable("saved_selections", {
    id: uuid().primaryKey().notNull().defaultRandom(),
    name: text().notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const savedSelectionProducts = pgTable(
    "saved_selection_products",
    {
        id: uuid().primaryKey().notNull().defaultRandom(),
        selectionId: uuid("selection_id")
            .notNull()
            .references(() => savedSelections.id, { onDelete: "cascade" }),
        productId: text("product_id")
            .notNull()
            .references(() => products.id, {
                onDelete: "cascade",
                onUpdate: "cascade",
            }),
        position: integer().notNull().default(0),
    },
    (table) => [
        index("saved_selection_products_selection_id_position_idx").on(
            table.selectionId,
            table.position
        ),
        index("saved_selection_products_product_id_idx").on(table.productId),
    ]
);
