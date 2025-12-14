import {
    pgTable,
    index,
    integer,
    text,
    timestamp,
    uuid,
} from "drizzle-orm/pg-core";
import { products } from "./products";

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
