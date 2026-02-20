import {
    getCategories,
    getCategoryByCategory,
} from "@/db/queries/categoryQueries";
import type { FastifyInstance } from "fastify";

export async function publicCategoryRoutes(app: FastifyInstance): Promise<void> {
    app.get("/categories", async () => {
        return getCategories();
    });

    app.get("/categories/:category", async (request) => {
        const params = request.params as { category: string };
        return getCategoryByCategory(params.category);
    });
}
