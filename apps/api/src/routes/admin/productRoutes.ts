import {
    checkProductIdExists,
    createProduct,
    deleteProduct,
    getProducts,
    getProductsByIds,
    updateProduct,
} from "@/db/queries/productQueries";
import { createRateLimitPreHandler } from "@/lib/rateLimit";
import { requireAdmin } from "@/routes/admin/auth";
import { parseCsvIds } from "@/routes/shared/queryParsers";
import type { FastifyInstance } from "fastify";

export async function adminProductRoutes(app: FastifyInstance): Promise<void> {
    app.get(
        "/products",
        {
            preHandler: [
                requireAdmin,
                createRateLimitPreHandler({
                    action: "getAdminProducts",
                    maxRequests: 100,
                    windowMs: 15 * 60 * 1000,
                }),
            ],
        },
        async (request) => {
            const query = request.query as { ids?: string };
            if (query.ids) {
                return getProductsByIds(parseCsvIds(query.ids), true);
            }

            return getProducts(true);
        }
    );

    app.get(
        "/products/:id/exists",
        { preHandler: requireAdmin },
        async (request) => {
            const params = request.params as { id: string };
            return { exists: await checkProductIdExists(params.id) };
        }
    );

    app.post(
        "/products",
        {
            preHandler: [
                requireAdmin,
                createRateLimitPreHandler({
                    action: "createAdminProduct",
                    maxRequests: 30,
                    windowMs: 15 * 60 * 1000,
                }),
            ],
        },
        async (request, reply) => {
            const body = request.body as {
                id?: string;
                name?: string | null;
                description?: string | null;
                category?: string | null;
                clearance?: boolean;
                price?: string | null;
                soldOut?: boolean;
                hidden?: boolean;
            };

            if (!body.id) {
                return reply
                    .code(400)
                    .send({ error: "Product ID is required" });
            }

            await createProduct({
                id: body.id,
                name: body.name ?? null,
                description: body.description ?? null,
                category: body.category ?? null,
                clearance: body.clearance ?? false,
                price: body.price ?? null,
                soldOut: body.soldOut ?? false,
                hidden: body.hidden ?? false,
            });

            return { success: true, productId: body.id };
        }
    );

    app.patch(
        "/products/:id",
        {
            preHandler: [
                requireAdmin,
                createRateLimitPreHandler({
                    action: "updateAdminProduct",
                    maxRequests: 50,
                    windowMs: 15 * 60 * 1000,
                }),
            ],
        },
        async (request) => {
            const params = request.params as { id: string };
            const body = request.body as {
                newId?: string;
                name?: string | null;
                description?: string | null;
                category?: string | null;
                clearance?: boolean;
                price?: string | null;
                soldOut?: boolean;
                hidden?: boolean;
            };

            await updateProduct(params.id, body);
            return { success: true };
        }
    );

    app.delete(
        "/products/:id",
        {
            preHandler: [
                requireAdmin,
                createRateLimitPreHandler({
                    action: "deleteAdminProduct",
                    maxRequests: 20,
                    windowMs: 15 * 60 * 1000,
                }),
            ],
        },
        async (request) => {
            const params = request.params as { id: string };
            await deleteProduct(params.id);
            return { success: true };
        }
    );

    app.patch(
        "/products/:id/toggle-clearance",
        {
            preHandler: [
                requireAdmin,
                createRateLimitPreHandler({
                    action: "toggleAdminProductClearance",
                    maxRequests: 100,
                    windowMs: 15 * 60 * 1000,
                }),
            ],
        },
        async (request) => {
            const params = request.params as { id: string };
            const body = request.body as { clearance: boolean };
            await updateProduct(params.id, { clearance: body.clearance });
            return { success: true };
        }
    );

    app.patch(
        "/products/:id/toggle-hidden",
        {
            preHandler: [
                requireAdmin,
                createRateLimitPreHandler({
                    action: "toggleAdminProductHidden",
                    maxRequests: 100,
                    windowMs: 15 * 60 * 1000,
                }),
            ],
        },
        async (request) => {
            const params = request.params as { id: string };
            const body = request.body as { hidden: boolean };
            await updateProduct(params.id, { hidden: body.hidden });
            return { success: true };
        }
    );
}
