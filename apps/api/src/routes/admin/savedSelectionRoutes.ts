import {
    createSavedSelection,
    deleteSavedSelection,
    getSavedSelectionProductIds,
    getSavedSelections,
    updateSavedSelection,
} from "@/db/queries/savedSelectionQueries";
import { createRateLimitPreHandler } from "@/lib/rateLimit";
import { requireAdmin } from "@/routes/admin/auth";
import type { FastifyInstance } from "fastify";

export async function adminSavedSelectionRoutes(
    app: FastifyInstance
): Promise<void> {
    app.get(
        "/saved-selections",
        {
            preHandler: [
                requireAdmin,
                createRateLimitPreHandler({
                    action: "getAdminSavedSelections",
                    maxRequests: 100,
                    windowMs: 15 * 60 * 1000,
                }),
            ],
        },
        async () => {
            return getSavedSelections();
        }
    );

    app.get(
        "/saved-selections/:id/product-ids",
        {
            preHandler: [
                requireAdmin,
                createRateLimitPreHandler({
                    action: "getAdminSavedSelectionProductIds",
                    maxRequests: 100,
                    windowMs: 15 * 60 * 1000,
                }),
            ],
        },
        async (request) => {
            const params = request.params as { id: string };
            return {
                productIds: await getSavedSelectionProductIds(params.id),
            };
        }
    );

    app.post(
        "/saved-selections",
        {
            preHandler: [
                requireAdmin,
                createRateLimitPreHandler({
                    action: "createAdminSavedSelection",
                    maxRequests: 30,
                    windowMs: 15 * 60 * 1000,
                }),
            ],
        },
        async (request, reply) => {
            const body = request.body as {
                name?: string;
                productIds?: string[];
            };
            if (!body.name || !Array.isArray(body.productIds)) {
                return reply
                    .code(400)
                    .send({ error: "name and productIds are required" });
            }

            const id = await createSavedSelection(body.name, body.productIds);
            return { success: true, id };
        }
    );

    app.patch(
        "/saved-selections/:id",
        {
            preHandler: [
                requireAdmin,
                createRateLimitPreHandler({
                    action: "updateAdminSavedSelection",
                    maxRequests: 30,
                    windowMs: 15 * 60 * 1000,
                }),
            ],
        },
        async (request, reply) => {
            const params = request.params as { id: string };
            const body = request.body as {
                name?: string;
                productIds?: string[];
            };
            if (!body.name || !Array.isArray(body.productIds)) {
                return reply
                    .code(400)
                    .send({ error: "name and productIds are required" });
            }

            await updateSavedSelection(params.id, body.name, body.productIds);
            return { success: true };
        }
    );

    app.delete(
        "/saved-selections/:id",
        {
            preHandler: [
                requireAdmin,
                createRateLimitPreHandler({
                    action: "deleteAdminSavedSelection",
                    maxRequests: 30,
                    windowMs: 15 * 60 * 1000,
                }),
            ],
        },
        async (request) => {
            const params = request.params as { id: string };
            await deleteSavedSelection(params.id);
            return { success: true };
        }
    );
}
