import {
    checkCategoryIdExists,
    createCategory,
    deleteCategory,
    getCategories,
    reorderCategories,
    updateCategory,
} from "@/db/queries/categoryQueries";
import { createRateLimitPreHandler } from "@/lib/rateLimit";
import { requireAdmin } from "@/routes/admin/auth";
import type { FastifyInstance } from "fastify";

export async function adminCategoryRoutes(app: FastifyInstance): Promise<void> {
    app.get(
        "/categories",
        {
            preHandler: [
                requireAdmin,
                createRateLimitPreHandler({
                    action: "getAdminCategories",
                    maxRequests: 100,
                    windowMs: 15 * 60 * 1000,
                }),
            ],
        },
        async () => {
            return getCategories();
        }
    );

    app.get(
        "/categories/:id/exists",
        { preHandler: requireAdmin },
        async (request) => {
            const params = request.params as { id: string };
            return { exists: await checkCategoryIdExists(params.id) };
        }
    );

    app.post(
        "/categories",
        {
            preHandler: [
                requireAdmin,
                createRateLimitPreHandler({
                    action: "createAdminCategory",
                    maxRequests: 30,
                    windowMs: 15 * 60 * 1000,
                }),
            ],
        },
        async (request, reply) => {
            const body = request.body as {
                category?: string;
                name?: string | null;
            };
            if (!body.category) {
                return reply
                    .code(400)
                    .send({ error: "Category ID is required" });
            }

            await createCategory({
                category: body.category,
                name: body.name ?? null,
            });
            return { success: true, categoryId: body.category };
        }
    );

    app.patch(
        "/categories/:id",
        {
            preHandler: [
                requireAdmin,
                createRateLimitPreHandler({
                    action: "updateAdminCategory",
                    maxRequests: 50,
                    windowMs: 15 * 60 * 1000,
                }),
            ],
        },
        async (request) => {
            const params = request.params as { id: string };
            const body = request.body as {
                newCategoryId?: string;
                name?: string | null;
            };
            await updateCategory(params.id, body);
            return { success: true };
        }
    );

    app.delete(
        "/categories/:id",
        {
            preHandler: [
                requireAdmin,
                createRateLimitPreHandler({
                    action: "deleteAdminCategory",
                    maxRequests: 20,
                    windowMs: 15 * 60 * 1000,
                }),
            ],
        },
        async (request) => {
            const params = request.params as { id: string };
            await deleteCategory(params.id);
            return { success: true };
        }
    );

    app.post(
        "/categories/reorder",
        {
            preHandler: [
                requireAdmin,
                createRateLimitPreHandler({
                    action: "reorderAdminCategories",
                    maxRequests: 80,
                    windowMs: 15 * 60 * 1000,
                }),
            ],
        },
        async (request, reply) => {
            const body = request.body as { categoryIds?: string[] };
            if (!Array.isArray(body.categoryIds)) {
                return reply
                    .code(400)
                    .send({ error: "categoryIds must be an array" });
            }

            await reorderCategories(body.categoryIds);
            return { success: true };
        }
    );
}
