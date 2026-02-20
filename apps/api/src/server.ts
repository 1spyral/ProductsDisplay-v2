import {
    checkCategoryIdExists,
    createCategory,
    deleteCategory,
    getCategories,
    getCategoryByCategory,
    reorderCategories,
    updateCategory,
} from "@/db/queries/categoryQueries";
import {
    getProductImageById,
    getProductImages,
    getProductImagesByIds,
} from "@/db/queries/productImageQueries";
import {
    checkProductIdExists,
    createProduct,
    deleteProduct,
    getClearanceProducts,
    getProductById,
    getProducts,
    getProductsByCategory,
    getProductsByIds,
    hasClearanceProducts,
    searchProducts,
    updateProduct,
} from "@/db/queries/productQueries";
import {
    createSavedSelection,
    deleteSavedSelection,
    getSavedSelectionProductIds,
    getSavedSelections,
    updateSavedSelection,
} from "@/db/queries/savedSelectionQueries";
import { getStoreInfoUncached } from "@/db/queries/storeInfoQueries";
import { env } from "@/env";
import {
    getAdminCookieNames,
    verifyAdminAccessToken,
    verifyAdminRefreshToken,
} from "@/lib/adminTokens";
import cookie from "@fastify/cookie";
import multipart from "@fastify/multipart";
import Fastify, {
    type FastifyReply,
    type FastifyRequest,
    type FastifyServerOptions,
} from "fastify";

const loggerConfig: FastifyServerOptions["logger"] =
    env.LOG_PRETTY || env.NODE_ENV === "development"
        ? {
              level: env.LOG_LEVEL,
              transport: {
                  target: "pino-pretty",
                  options: {
                      colorize: true,
                      ignore: "pid,hostname",
                      translateTime: "SYS:standard",
                  },
              },
          }
        : { level: env.LOG_LEVEL };

const app = Fastify({
    logger: loggerConfig,
    bodyLimit: 5 * 1024 * 1024,
});

await app.register(cookie);
await app.register(multipart);

function parseBoolean(value: string | undefined): boolean {
    if (!value) return false;
    return value === "1" || value.toLowerCase() === "true";
}

function parseCsvIds(ids: string | undefined): string[] {
    if (!ids) return [];
    return ids
        .split(",")
        .map((id) => id.trim())
        .filter((id) => id.length > 0);
}

async function isAdminAuthenticated(request: FastifyRequest): Promise<boolean> {
    const { access, refresh } = getAdminCookieNames();
    const accessToken = request.cookies[access];
    if (accessToken) {
        try {
            await verifyAdminAccessToken(accessToken);
            return true;
        } catch {
            // Fall back to refresh token.
        }
    }

    const refreshToken = request.cookies[refresh];
    if (!refreshToken) return false;

    try {
        await verifyAdminRefreshToken(refreshToken);
        return true;
    } catch {
        return false;
    }
}

async function requireAdmin(
    request: FastifyRequest,
    reply: FastifyReply
): Promise<void> {
    const authenticated = await isAdminAuthenticated(request);
    if (!authenticated) {
        reply.code(401).send({ error: "Unauthorized" });
    }
}

app.get("/livez", async () => {
    return { status: "ok" };
});

app.get("/readyz", async () => {
    return { status: "ready" };
});

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

app.get("/categories", async () => {
    return getCategories();
});

app.get("/categories/:category", async (request) => {
    const params = request.params as { category: string };
    return getCategoryByCategory(params.category);
});

app.get("/store-info", async () => {
    return getStoreInfoUncached();
});

app.get("/admin/products", { preHandler: requireAdmin }, async (request) => {
    const query = request.query as { ids?: string };
    if (query.ids) {
        const ids = parseCsvIds(query.ids);
        return getProductsByIds(ids, true);
    }

    return getProducts(true);
});

app.get(
    "/admin/products/:id/exists",
    { preHandler: requireAdmin },
    async (request) => {
        const params = request.params as { id: string };
        return { exists: await checkProductIdExists(params.id) };
    }
);

app.post(
    "/admin/products",
    { preHandler: requireAdmin },
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
            return reply.code(400).send({ error: "Product ID is required" });
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
    "/admin/products/:id",
    { preHandler: requireAdmin },
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
    "/admin/products/:id",
    { preHandler: requireAdmin },
    async (request) => {
        const params = request.params as { id: string };
        await deleteProduct(params.id);
        return { success: true };
    }
);

app.patch(
    "/admin/products/:id/toggle-clearance",
    { preHandler: requireAdmin },
    async (request) => {
        const params = request.params as { id: string };
        const body = request.body as { clearance: boolean };
        await updateProduct(params.id, { clearance: body.clearance });
        return { success: true };
    }
);

app.patch(
    "/admin/products/:id/toggle-hidden",
    { preHandler: requireAdmin },
    async (request) => {
        const params = request.params as { id: string };
        const body = request.body as { hidden: boolean };
        await updateProduct(params.id, { hidden: body.hidden });
        return { success: true };
    }
);

app.get("/admin/categories", { preHandler: requireAdmin }, async () => {
    return getCategories();
});

app.get(
    "/admin/categories/:id/exists",
    { preHandler: requireAdmin },
    async (request) => {
        const params = request.params as { id: string };
        return { exists: await checkCategoryIdExists(params.id) };
    }
);

app.post(
    "/admin/categories",
    { preHandler: requireAdmin },
    async (request, reply) => {
        const body = request.body as {
            category?: string;
            name?: string | null;
        };
        if (!body.category) {
            return reply.code(400).send({ error: "Category ID is required" });
        }

        await createCategory({
            category: body.category,
            name: body.name ?? null,
        });
        return { success: true, categoryId: body.category };
    }
);

app.patch(
    "/admin/categories/:id",
    { preHandler: requireAdmin },
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
    "/admin/categories/:id",
    { preHandler: requireAdmin },
    async (request) => {
        const params = request.params as { id: string };
        await deleteCategory(params.id);
        return { success: true };
    }
);

app.post(
    "/admin/categories/reorder",
    { preHandler: requireAdmin },
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

app.get("/admin/saved-selections", { preHandler: requireAdmin }, async () => {
    return getSavedSelections();
});

app.get(
    "/admin/saved-selections/:id/product-ids",
    { preHandler: requireAdmin },
    async (request) => {
        const params = request.params as { id: string };
        return {
            productIds: await getSavedSelectionProductIds(params.id),
        };
    }
);

app.post(
    "/admin/saved-selections",
    { preHandler: requireAdmin },
    async (request, reply) => {
        const body = request.body as { name?: string; productIds?: string[] };
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
    "/admin/saved-selections/:id",
    { preHandler: requireAdmin },
    async (request, reply) => {
        const params = request.params as { id: string };
        const body = request.body as { name?: string; productIds?: string[] };
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
    "/admin/saved-selections/:id",
    { preHandler: requireAdmin },
    async (request) => {
        const params = request.params as { id: string };
        await deleteSavedSelection(params.id);
        return { success: true };
    }
);

app.post(
    "/admin/product-images/upload",
    { preHandler: requireAdmin },
    async (request, reply) => {
        const parts = request.parts();
        let uploadedFile: File | null = null;
        let productId = "";
        let position = 0;

        for await (const part of parts) {
            if (part.type === "file") {
                const buffer = await part.toBuffer();
                uploadedFile = new File([buffer], part.filename || "upload", {
                    type: part.mimetype,
                });
            } else if (part.fieldname === "productId") {
                productId = String(part.value || "");
            } else if (part.fieldname === "position") {
                const parsedPosition = Number(part.value);
                position = Number.isFinite(parsedPosition) ? parsedPosition : 0;
            }
        }

        if (!uploadedFile || !productId) {
            return reply
                .code(400)
                .send({ error: "file and productId are required" });
        }

        const { uploadProductImage } = await import("@/lib/imageService");
        const result = await uploadProductImage({
            file: uploadedFile,
            productId,
            position,
        });

        if (!result.success) {
            return reply.code(400).send({ error: result.error });
        }

        return result;
    }
);

app.get(
    "/admin/product-images/by-ids",
    { preHandler: requireAdmin },
    async (request) => {
        const query = request.query as { ids?: string };
        return getProductImagesByIds(parseCsvIds(query.ids));
    }
);

app.get(
    "/admin/product-images",
    { preHandler: requireAdmin },
    async (request, reply) => {
        const query = request.query as { productId?: string };
        if (!query.productId) {
            return reply.code(400).send({ error: "productId is required" });
        }
        return getProductImages(query.productId);
    }
);

app.get(
    "/admin/product-images/:imageId",
    { preHandler: requireAdmin },
    async (request) => {
        const params = request.params as { imageId: string };
        return getProductImageById(params.imageId);
    }
);

app.delete(
    "/admin/product-images/:imageId",
    { preHandler: requireAdmin },
    async (request, reply) => {
        const params = request.params as { imageId: string };
        const { deleteProductImage } = await import("@/lib/imageService");
        const result = await deleteProductImage(params.imageId);

        if (!result.success) {
            return reply.code(400).send({ error: result.error });
        }

        return { success: true };
    }
);

app.patch(
    "/admin/product-images/:imageId/position",
    { preHandler: requireAdmin },
    async (request, reply) => {
        const params = request.params as { imageId: string };
        const body = request.body as { position?: number };
        if (typeof body.position !== "number") {
            return reply.code(400).send({ error: "position is required" });
        }

        const { updateImagePosition } = await import("@/lib/imageService");
        const result = await updateImagePosition(params.imageId, body.position);
        if (!result.success) {
            return reply.code(400).send({ error: result.error });
        }

        return { success: true };
    }
);

app.post(
    "/admin/product-images/reorder",
    { preHandler: requireAdmin },
    async (request, reply) => {
        const body = request.body as {
            productId?: string;
            imageIds?: string[];
        };
        if (!body.productId || !Array.isArray(body.imageIds)) {
            return reply
                .code(400)
                .send({ error: "productId and imageIds are required" });
        }

        const { reorderProductImages } = await import("@/lib/imageService");
        const result = await reorderProductImages(
            body.productId,
            body.imageIds
        );
        if (!result.success) {
            return reply.code(400).send({ error: result.error });
        }

        return { success: true };
    }
);

const port = env.PORT;
const host = env.HOST;

try {
    await app.listen({ port, host });
} catch (error) {
    app.log.error(error);
    process.exit(1);
}
