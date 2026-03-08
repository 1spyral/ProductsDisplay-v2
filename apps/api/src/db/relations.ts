import { relations } from "drizzle-orm";
import {
    categories,
    orderProducts,
    orders,
    productImages,
    products,
    savedSelectionProducts,
    savedSelections,
} from "./schema";

export const categoriesRelations = relations(categories, ({ many }) => ({
    products: many(products),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
    category: one(categories, {
        fields: [products.category],
        references: [categories.category],
    }),
    orderProducts: many(orderProducts),
    images: many(productImages),
    savedSelectionProducts: many(savedSelectionProducts),
}));

export const productImagesRelations = relations(productImages, ({ one }) => ({
    product: one(products, {
        fields: [productImages.productId],
        references: [products.id],
    }),
}));

export const savedSelectionsRelations = relations(
    savedSelections,
    ({ many }) => ({
        products: many(savedSelectionProducts),
    })
);

export const ordersRelations = relations(orders, ({ many }) => ({
    products: many(orderProducts),
}));

export const orderProductsRelations = relations(orderProducts, ({ one }) => ({
    order: one(orders, {
        fields: [orderProducts.orderId],
        references: [orders.id],
    }),
    product: one(products, {
        fields: [orderProducts.productId],
        references: [products.id],
    }),
}));

export const savedSelectionProductsRelations = relations(
    savedSelectionProducts,
    ({ one }) => ({
        selection: one(savedSelections, {
            fields: [savedSelectionProducts.selectionId],
            references: [savedSelections.id],
        }),
        product: one(products, {
            fields: [savedSelectionProducts.productId],
            references: [products.id],
        }),
    })
);
