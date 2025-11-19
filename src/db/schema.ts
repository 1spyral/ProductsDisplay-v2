import {
    pgTableCreator,
    text,
    index,
    timestamp,
    integer,
    uuid,
    boolean,
} from "drizzle-orm/pg-core";

// Create table creator for the public schema (default)
const pgTable = pgTableCreator((name) => name);

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
            .references(() => categories.category, {
                onDelete: "restrict",
                onUpdate: "cascade",
            }),
        clearance: boolean().notNull().default(false),
    },
    (table) => [
        index("products_category_clearance_idx").on(
            table.category,
            table.clearance
        ),
        index("products_clearance_idx").on(table.clearance),
    ]
);

export const productImages = pgTable(
    "product_images",
    {
        id: uuid().primaryKey().notNull().defaultRandom(),
        productId: text("product_id")
            .notNull()
            .references(() => products.id, {
                onDelete: "cascade",
                onUpdate: "cascade",
            }),
        createdAt: timestamp("created_at").notNull().defaultNow(),
        objectKey: text("object_key").notNull(),
        mimeType: text("mime_type").notNull(),
        width: integer().notNull(),
        height: integer().notNull(),
        position: integer().notNull().default(0),
    },
    (table) => [
        index("product_images_product_id_position_idx").on(
            table.productId,
            table.position
        ),
    ]
);
