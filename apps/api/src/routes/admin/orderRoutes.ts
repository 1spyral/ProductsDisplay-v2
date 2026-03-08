import type { FastifyInstance } from "fastify";
import { getOrders } from "@/db/queries/orderQueries";
import { requireAdmin } from "@/routes/admin/auth";
import { adminRateLimitConfig } from "@/routes/shared/rateLimit";

export async function adminOrderRoutes(app: FastifyInstance): Promise<void> {
    app.get(
        "/orders",
        {
            preHandler: requireAdmin,
            config: adminRateLimitConfig("getAdminOrders", 100),
        },
        async () => {
            return getOrders();
        }
    );
}
