import { getOrders } from "@/db/queries/orderQueries";
import { requireAdmin } from "@/routes/admin/auth";
import { adminRateLimitConfig } from "@/routes/shared/rateLimit";
import type { FastifyInstance } from "fastify";

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
