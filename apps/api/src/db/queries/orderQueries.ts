import type {
    CreateOrderRequestDto,
    OrderOverviewDto,
} from "@productsdisplay/contracts";
import { db } from "@/db/drizzle";
import { orderProducts, orders } from "@/db/schema";

export async function createOrder(
    input: CreateOrderRequestDto
): Promise<string> {
    return db.transaction(async (tx) => {
        const [order] = await tx
            .insert(orders)
            .values({
                name: input.name,
                email: input.email,
                phone: input.phone,
                additionalComments: input.additionalComments,
            })
            .returning({ id: orders.id });

        await tx.insert(orderProducts).values(
            input.items.map((item) => ({
                orderId: order.id,
                productId: item.productId,
                quantity: item.quantity,
            }))
        );

        return order.id;
    });
}

export async function getOrders(): Promise<OrderOverviewDto[]> {
    const rows = await db.query.orders.findMany({
        orderBy: (table, { desc }) => [desc(table.createdAt)],
        with: {
            products: {
                orderBy: (table, { asc }) => [asc(table.productId)],
                columns: {
                    quantity: true,
                },
                with: {
                    product: {
                        columns: {
                            id: true,
                            name: true,
                        },
                        with: {
                            images: {
                                orderBy: (table, { asc }) => [
                                    asc(table.position),
                                ],
                                columns: {
                                    objectKey: true,
                                },
                                limit: 1,
                            },
                        },
                    },
                },
            },
        },
    });

    return rows.map((row) => ({
        id: row.id,
        name: row.name,
        email: row.email,
        phone: row.phone,
        additionalComments: row.additionalComments,
        createdAt: row.createdAt,
        items: row.products.map((item) => ({
            quantity: item.quantity,
            product: {
                id: item.product.id,
                name: item.product.name,
                imageObjectKey: item.product.images[0]?.objectKey || null,
            },
        })),
    }));
}
