import { publicCategoryRoutes } from "@/routes/public/categoryRoutes";
import { publicProductRoutes } from "@/routes/public/productRoutes";
import { publicStoreInfoRoutes } from "@/routes/public/storeInfoRoutes";
import type { FastifyInstance } from "fastify";

export async function publicRoutes(app: FastifyInstance): Promise<void> {
    await app.register(publicProductRoutes);
    await app.register(publicCategoryRoutes);
    await app.register(publicStoreInfoRoutes);
}
