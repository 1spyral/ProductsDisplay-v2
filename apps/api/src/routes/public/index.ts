import type { FastifyInstance } from "fastify";
import { publicCategoryRoutes } from "@/routes/public/categoryRoutes";
import { publicOrderRoutes } from "@/routes/public/orderRoutes";
import { publicProductRoutes } from "@/routes/public/productRoutes";
import { publicStoreInfoRoutes } from "@/routes/public/storeInfoRoutes";

export async function publicRoutes(app: FastifyInstance): Promise<void> {
    await app.register(publicOrderRoutes);
    await app.register(publicProductRoutes);
    await app.register(publicCategoryRoutes);
    await app.register(publicStoreInfoRoutes);
}
