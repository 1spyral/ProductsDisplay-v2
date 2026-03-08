import { db } from "@/db/drizzle";
import { orderProducts, orders } from "@/db/schema";
import type { CreateOrderRequestDto } from "@productsdisplay/contracts";

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
