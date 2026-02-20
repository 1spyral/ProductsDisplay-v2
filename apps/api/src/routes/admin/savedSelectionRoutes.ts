import {
    createSavedSelection,
    deleteSavedSelection,
    getSavedSelectionProductIds,
    getSavedSelections,
    updateSavedSelection,
} from "@/db/queries/savedSelectionQueries";
import { requireAdmin } from "@/routes/admin/auth";
import { adminRateLimitConfig } from "@/routes/shared/rateLimit";
import type { FastifyInstance } from "fastify";

export async function adminSavedSelectionRoutes(
    app: FastifyInstance
): Promise<void> {
    app.get(
        "/saved-selections",
        {
            preHandler: requireAdmin,
            config: adminRateLimitConfig("getAdminSavedSelections", 100),
        },
        async () => {
            return getSavedSelections();
        }
    );

    app.get(
        "/saved-selections/:id/product-ids",
        {
            preHandler: requireAdmin,
            config: adminRateLimitConfig(
                "getAdminSavedSelectionProductIds",
                100
            ),
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
            preHandler: requireAdmin,
            config: adminRateLimitConfig("createAdminSavedSelection", 30),
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
            preHandler: requireAdmin,
            config: adminRateLimitConfig("updateAdminSavedSelection", 30),
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
            preHandler: requireAdmin,
            config: adminRateLimitConfig("deleteAdminSavedSelection", 30),
        },
        async (request) => {
            const params = request.params as { id: string };
            await deleteSavedSelection(params.id);
            return { success: true };
        }
    );
}
