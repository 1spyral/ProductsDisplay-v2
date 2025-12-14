import { relations } from "drizzle-orm";
import { products, categories, productImages, productPrices } from "./schema";

export const categoriesRelations = relations(categories, ({ many }) => ({
    products: many(products),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
    category: one(categories, {
        fields: [products.category],
        references: [categories.category],
    }),
    images: many(productImages),
    prices: many(productPrices),
}));

export const productImagesRelations = relations(productImages, ({ one }) => ({
    product: one(products, {
        fields: [productImages.productId],
        references: [products.id],
    }),
}));

export const productPricesRelations = relations(productPrices, ({ one }) => ({
    product: one(products, {
        fields: [productPrices.productId],
        references: [products.id],
    }),
}));
