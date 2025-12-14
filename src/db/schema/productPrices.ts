import {
    pgTable,
    index,
    integer,
    pgEnum,
    text,
    timestamp,
    uuid,
} from "drizzle-orm/pg-core";
import { products } from "./products";

export const productPriceTypeEnum = pgEnum("product_price_type", [
    "retail",
    "consignment",
    "wholesale_1",
    "wholesale_2",
    "wholesale_3",
    "wholesale_4",
]);

export const productPrices = pgTable(
    "product_prices",
    {
        id: uuid().primaryKey().notNull().defaultRandom(),
        productId: text("product_id")
            .notNull()
            .references(() => products.id, {
                onDelete: "cascade",
                onUpdate: "cascade",
            }),
        type: productPriceTypeEnum("type").notNull(),
        amountCents: integer("amount_cents").notNull(),
        currency: text("currency").notNull().default("CAD"),
        createdAt: timestamp("created_at").notNull().defaultNow(),
    },
    (table) => [
        index("product_prices_product_id_type_idx").on(
            table.productId,
            table.type
        ),
    ]
);
