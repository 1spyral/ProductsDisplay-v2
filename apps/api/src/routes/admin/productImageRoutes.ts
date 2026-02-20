import {
    getProductImageById,
    getProductImages,
    getProductImagesByIds,
} from "@/db/queries/productImageQueries";
import { requireAdmin } from "@/routes/admin/auth";
import { parseCsvIds } from "@/routes/shared/queryParsers";
import { adminRateLimitConfig } from "@/routes/shared/rateLimit";
import type { FastifyInstance } from "fastify";

export async function adminProductImageRoutes(
    app: FastifyInstance
): Promise<void> {
    app.post(
        "/product-images/upload",
        {
            preHandler: requireAdmin,
            config: adminRateLimitConfig("uploadAdminProductImage", 20),
        },
        async (request, reply) => {
            const parts = request.parts();
            let uploadedFile: File | null = null;
            let productId = "";
            let position = 0;

            for await (const part of parts) {
                if (part.type === "file") {
                    const buffer = await part.toBuffer();
                    uploadedFile = new File(
                        [buffer],
                        part.filename || "upload",
                        {
                            type: part.mimetype,
                        }
                    );
                } else if (part.fieldname === "productId") {
                    productId = String(part.value || "");
                } else if (part.fieldname === "position") {
                    const parsedPosition = Number(part.value);
                    position = Number.isFinite(parsedPosition)
                        ? parsedPosition
                        : 0;
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
        "/product-images/by-ids",
        { preHandler: requireAdmin },
        async (request) => {
            const query = request.query as { ids?: string };
            return getProductImagesByIds(parseCsvIds(query.ids));
        }
    );

    app.get(
        "/product-images",
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
        "/product-images/:imageId",
        { preHandler: requireAdmin },
        async (request) => {
            const params = request.params as { imageId: string };
            return getProductImageById(params.imageId);
        }
    );

    app.delete(
        "/product-images/:imageId",
        {
            preHandler: requireAdmin,
            config: adminRateLimitConfig("deleteAdminProductImage", 50),
        },
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
        "/product-images/:imageId/position",
        {
            preHandler: requireAdmin,
            config: adminRateLimitConfig("updateAdminImagePosition", 100),
        },
        async (request, reply) => {
            const params = request.params as { imageId: string };
            const body = request.body as { position?: number };
            if (typeof body.position !== "number") {
                return reply.code(400).send({ error: "position is required" });
            }

            const { updateImagePosition } = await import("@/lib/imageService");
            const result = await updateImagePosition(
                params.imageId,
                body.position
            );
            if (!result.success) {
                return reply.code(400).send({ error: result.error });
            }

            return { success: true };
        }
    );

    app.post(
        "/product-images/reorder",
        {
            preHandler: requireAdmin,
            config: adminRateLimitConfig("reorderAdminProductImages", 50),
        },
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
}
