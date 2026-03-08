import {
    index,
    integer,
    pgTable,
    text,
    timestamp,
    uuid,
} from "drizzle-orm/pg-core";
import { products } from "./products";

export const orders = pgTable("orders", {
    id: uuid().primaryKey().notNull().defaultRandom(),
    name: text().notNull(),
    email: text(),
    phone: text(),
    additionalComments: text("additional_comments"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const orderProducts = pgTable(
    "order_products",
    {
        id: uuid().primaryKey().notNull().defaultRandom(),
        orderId: uuid("order_id")
            .notNull()
            .references(() => orders.id, { onDelete: "cascade" }),
        productId: text("product_id")
            .notNull()
            .references(() => products.id, {
                onDelete: "cascade",
                onUpdate: "cascade",
            }),
        quantity: integer().notNull().default(1),
    },
    (table) => [
        index("order_products_order_id_idx").on(table.orderId),
        index("order_products_product_id_idx").on(table.productId),
    ]
);
