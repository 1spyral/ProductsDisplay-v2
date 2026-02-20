import {
    getClearanceProducts,
    getProductById,
    getProducts,
    getProductsByCategory,
    getProductsByIds,
    hasClearanceProducts,
    searchProducts,
} from "@/db/queries/productQueries";
import { isAdminAuthenticated } from "@/routes/admin/auth";
import { parseBoolean, parseCsvIds } from "@/routes/shared/queryParsers";
import type { FastifyInstance } from "fastify";

export async function publicProductRoutes(app: FastifyInstance): Promise<void> {
    app.get("/products", async (request, reply) => {
        const query = request.query as {
            includeHidden?: string;
            category?: string;
            clearance?: string;
            q?: string;
            ids?: string;
        };

        const includeHidden = parseBoolean(query.includeHidden);
        if (includeHidden && !(await isAdminAuthenticated(request))) {
            return reply.code(401).send({ error: "Unauthorized" });
        }

        if (query.q) {
            return searchProducts(query.q);
        }

        if (query.ids) {
            return getProductsByIds(parseCsvIds(query.ids), includeHidden);
        }

        if (query.category) {
            return getProductsByCategory(query.category, includeHidden);
        }

        if (parseBoolean(query.clearance)) {
            return getClearanceProducts(includeHidden);
        }

        return getProducts(includeHidden);
    });

    app.get("/products/has-clearance", async (request, reply) => {
        const query = request.query as { includeHidden?: string };
        const includeHidden = parseBoolean(query.includeHidden);
        if (includeHidden && !(await isAdminAuthenticated(request))) {
            return reply.code(401).send({ error: "Unauthorized" });
        }

        return { hasClearance: await hasClearanceProducts(includeHidden) };
    });

    app.get("/products/:id", async (request, reply) => {
        const params = request.params as { id: string };
        const query = request.query as { includeHidden?: string };
        const includeHidden = parseBoolean(query.includeHidden);

        if (includeHidden && !(await isAdminAuthenticated(request))) {
            return reply.code(401).send({ error: "Unauthorized" });
        }

        const product = await getProductById(params.id);
        if (!product) return null;
        if (!includeHidden && product.hidden) return null;
        return product;
    });
}
