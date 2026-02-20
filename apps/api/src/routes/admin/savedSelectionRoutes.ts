import {
    createSavedSelection,
    deleteSavedSelection,
    getSavedSelectionProductIds,
    getSavedSelections,
    updateSavedSelection,
} from "@/db/queries/savedSelectionQueries";
import { requireAdmin } from "@/routes/admin/auth";
import type { FastifyInstance } from "fastify";

export async function adminSavedSelectionRoutes(
    app: FastifyInstance
): Promise<void> {
    app.get("/saved-selections", { preHandler: requireAdmin }, async () => {
        return getSavedSelections();
    });

    app.get(
        "/saved-selections/:id/product-ids",
        { preHandler: requireAdmin },
        async (request) => {
            const params = request.params as { id: string };
            return {
                productIds: await getSavedSelectionProductIds(params.id),
            };
        }
    );

    app.post(
        "/saved-selections",
        { preHandler: requireAdmin },
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
        { preHandler: requireAdmin },
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
        { preHandler: requireAdmin },
        async (request) => {
            const params = request.params as { id: string };
            await deleteSavedSelection(params.id);
            return { success: true };
        }
    );
}
