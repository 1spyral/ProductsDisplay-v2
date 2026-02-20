import { adminCategoryRoutes } from "@/routes/admin/categoryRoutes";
import { adminProductImageRoutes } from "@/routes/admin/productImageRoutes";
import { adminProductRoutes } from "@/routes/admin/productRoutes";
import { adminSavedSelectionRoutes } from "@/routes/admin/savedSelectionRoutes";
import type { FastifyInstance } from "fastify";

export async function adminRoutes(app: FastifyInstance): Promise<void> {
    await app.register(adminProductRoutes);
    await app.register(adminCategoryRoutes);
    await app.register(adminSavedSelectionRoutes);
    await app.register(adminProductImageRoutes);
}
