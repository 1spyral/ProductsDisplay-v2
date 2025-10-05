import { relations } from "drizzle-orm";
import { products, categories } from "./schema";

export const categoriesRelations = relations(categories, ({ many }) => ({
    products: many(products),
}));

export const productsRelations = relations(products, ({ one }) => ({
    category: one(categories, {
        fields: [products.category],
        references: [categories.category],
    }),
}));
