import {
    getClearanceProducts,
    getProductById,
    getProducts,
    getProductsByCategory,
    getProductsByIds,
    hasClearanceProducts,
    searchProducts,
} from "@/db/queries/productQueries";
import { parseBoolean, parseCsvIds } from "@/routes/shared/queryParsers";
import type { FastifyInstance } from "fastify";

export async function publicProductRoutes(app: FastifyInstance): Promise<void> {
    app.get("/products", async (request) => {
        const query = request.query as {
            category?: string;
            clearance?: string;
            q?: string;
            ids?: string;
        };

        if (query.q) {
            return searchProducts(query.q);
        }

        if (query.ids) {
            return getProductsByIds(parseCsvIds(query.ids), false);
        }

        if (query.category) {
            return getProductsByCategory(query.category, false);
        }

        if (parseBoolean(query.clearance)) {
            return getClearanceProducts(false);
        }

        return getProducts(false);
    });

    app.get("/products/has-clearance", async () => {
        return { hasClearance: await hasClearanceProducts(false) };
    });

    app.get("/products/:id", async (request) => {
        const params = request.params as { id: string };

        const product = await getProductById(params.id);
        if (!product) return null;
        if (product.hidden) return null;
        return product;
    });
}
