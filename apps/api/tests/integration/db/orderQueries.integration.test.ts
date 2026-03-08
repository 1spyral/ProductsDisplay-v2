import { db } from "@/db/drizzle";
import { createOrder } from "@/db/queries/orderQueries";
import { createProduct } from "@/db/queries/productQueries";
import { orderProducts } from "@/db/schema";
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
});
