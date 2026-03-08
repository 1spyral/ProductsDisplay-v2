import { db } from "@/db/drizzle";
import { createOrder, getOrders } from "@/db/queries/orderQueries";
import { createProduct } from "@/db/queries/productQueries";
import { orderProducts, productImages } from "@/db/schema";
import { beforeEach, describe, expect, test } from "bun:test";
import { eq } from "drizzle-orm";
import { resetTestDatabase } from "./helpers";

describe("orderQueries (integration)", () => {
    beforeEach(async () => {
        await resetTestDatabase();
        await createProduct({ id: "product-a", category: null, name: "Chair" });
        await createProduct({ id: "product-b", category: null, name: "Table" });
    });

    test("createOrder persists contact details and product quantities", async () => {
        const orderId = await createOrder({
            name: "Alex Smith",
            email: "alex@example.com",
            phone: null,
            additionalComments: "Please call before delivery.",
            items: [
                { productId: "product-a", quantity: 2 },
                { productId: "product-b", quantity: 1 },
            ],
        });

        const order = await db.query.orders.findFirst({
            where: (table, { eq: equals }) => equals(table.id, orderId),
        });

        const items = await db
            .select({
                productId: orderProducts.productId,
                quantity: orderProducts.quantity,
            })
            .from(orderProducts)
            .where(eq(orderProducts.orderId, orderId))
            .orderBy(orderProducts.productId);

        expect(order).toBeDefined();
        expect(order?.name).toBe("Alex Smith");
        expect(order?.email).toBe("alex@example.com");
        expect(order?.phone).toBeNull();
        expect(order?.additionalComments).toBe("Please call before delivery.");
        expect(items).toEqual([
            { productId: "product-a", quantity: 2 },
            { productId: "product-b", quantity: 1 },
        ]);
    });

    test("getOrders returns newest orders with nested product details", async () => {
        await db.insert(productImages).values([
            {
                productId: "product-a",
                objectKey: "chair-primary.jpg",
                mimeType: "image/jpeg",
                width: 800,
                height: 600,
                position: 0,
            },
            {
                productId: "product-a",
                objectKey: "chair-secondary.jpg",
                mimeType: "image/jpeg",
                width: 800,
                height: 600,
                position: 1,
            },
        ]);

        await createOrder({
            name: "First Customer",
            email: "first@example.com",
            phone: null,
            additionalComments: null,
            items: [{ productId: "product-a", quantity: 1 }],
        });

        await createOrder({
            name: "Second Customer",
            email: null,
            phone: "555-0100",
            additionalComments: "Call after 5",
            items: [
                { productId: "product-b", quantity: 3 },
                { productId: "product-a", quantity: 2 },
            ],
        });

        const orders = await getOrders();

        expect(orders).toHaveLength(2);
        expect(orders[0]?.name).toBe("Second Customer");
        expect(orders[0]?.phone).toBe("555-0100");
        expect(orders[0]?.additionalComments).toBe("Call after 5");
        expect(orders[0]?.items).toEqual([
            {
                quantity: 2,
                product: {
                    id: "product-a",
                    name: "Chair",
                    imageObjectKey: "chair-primary.jpg",
                },
            },
            {
                quantity: 3,
                product: {
                    id: "product-b",
                    name: "Table",
                    imageObjectKey: null,
                },
            },
        ]);
        expect(orders[1]?.name).toBe("First Customer");
    });
});
