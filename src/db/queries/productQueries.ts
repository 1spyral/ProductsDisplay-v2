"use server";

import { db } from "@/db/drizzle";
import { products } from "@/db/schema";
import logger from "@/lib/logger";
import Product from "@/types/Product";
import { and, desc, eq, ilike, inArray, or, sql } from "drizzle-orm";

export async function getProducts(
    includeHidden: boolean = false
): Promise<Product[]> {
    return db.query.products.findMany({
        where: includeHidden ? undefined : eq(products.hidden, false),
        orderBy: (p, { asc }) => [asc(p.id)],
        with: {
            images: {
                orderBy: (images, { asc }) => [asc(images.position)],
            },
        },
    });
}

export async function getProductsByCategory(
    category: string,
    includeHidden: boolean = false
): Promise<Product[]> {
    return db.query.products.findMany({
        where: includeHidden
            ? eq(products.category, category)
            : and(eq(products.category, category), eq(products.hidden, false)),
        orderBy: (p, { asc }) => [asc(p.id)],
        with: {
            images: {
                orderBy: (images, { asc }) => [asc(images.position)],
            },
        },
    });
}

export async function getClearanceProducts(
    includeHidden: boolean = false
): Promise<Product[]> {
    return db.query.products.findMany({
        where: includeHidden
            ? eq(products.clearance, true)
            : and(eq(products.clearance, true), eq(products.hidden, false)),
        orderBy: (p, { asc }) => [asc(p.id)],
        with: {
            images: {
                orderBy: (images, { asc }) => [asc(images.position)],
            },
        },
    });
}

export async function hasClearanceProducts(
    includeHidden: boolean = false
): Promise<boolean> {
    const result = await db.query.products.findFirst({
        where: includeHidden
            ? eq(products.clearance, true)
            : and(eq(products.clearance, true), eq(products.hidden, false)),
        columns: { id: true },
    });
    return result !== undefined;
}

export async function getProductById(id: string): Promise<Product | null> {
    return (
        (await db.query.products.findFirst({
            where: eq(products.id, id),
            with: {
                images: {
                    orderBy: (images, { asc }) => [asc(images.position)],
                },
            },
        })) || null
    );
}

export async function getProductsByIds(
    ids: string[],
    includeHidden: boolean = false
): Promise<Product[]> {
    if (ids.length === 0) return [];

    return db.query.products.findMany({
        where: includeHidden
            ? inArray(products.id, ids)
            : and(inArray(products.id, ids), eq(products.hidden, false)),
        with: {
            images: {
                orderBy: (images, { asc }) => [asc(images.position)],
            },
        },
    });
}

export async function searchProducts(query: string): Promise<Product[]> {
    const searchQuery = query.trim();
    if (!searchQuery) return getProducts();

    const searchPattern = `%${searchQuery}%`;
    const rankExpression = sql<number>`greatest(
        similarity(${products.id}, ${searchQuery}),
        similarity(coalesce(${products.name}, ''), ${searchQuery}),
        similarity(coalesce(${products.description}, ''), ${searchQuery}),
        similarity(coalesce(${products.category}, ''), ${searchQuery})
    )`;

    const matches = await db
        .select({
            id: products.id,
            rank: rankExpression,
        })
        .from(products)
        .where(
            and(
                eq(products.hidden, false),
                or(
                    ilike(products.id, searchPattern),
                    ilike(products.name, searchPattern),
                    ilike(products.description, searchPattern),
                    ilike(products.category, searchPattern),
                    sql`${products.id} % ${searchQuery}`,
                    sql`coalesce(${products.name}, '') % ${searchQuery}`,
                    sql`coalesce(${products.description}, '') % ${searchQuery}`,
                    sql`coalesce(${products.category}, '') % ${searchQuery}`
                )
            )
        )
        .orderBy(desc(rankExpression), products.id);

    if (matches.length === 0) return [];

    const matchedProducts = await getProductsByIds(
        matches.map((match) => match.id)
    );
    const productsById = new Map(
        matchedProducts.map((product) => [product.id, product])
    );

    return matches
        .map((match) => productsById.get(match.id))
        .filter((product): product is Product => product !== undefined);
}

export async function updateProduct(
    id: string,
    data: {
        newId?: string;
        name?: string | null;
        description?: string | null;
        category?: string | null;
        clearance?: boolean;
        price?: string | null;
        soldOut?: boolean;
        hidden?: boolean;
    }
): Promise<void> {
    // If ID is being changed, we need to handle it specially
    if (data.newId && data.newId !== id) {
        // First, check if the new ID already exists
        const existingProduct = await getProductById(data.newId);
        if (existingProduct) {
            throw new Error(`Product with ID "${data.newId}" already exists`);
        }

        const updateData: Partial<typeof products.$inferInsert> = {
            id: data.newId,
        };
        if (data.name !== undefined) updateData.name = data.name;
        if (data.description !== undefined)
            updateData.description = data.description;
        if (data.category !== undefined) updateData.category = data.category;
        if (data.clearance !== undefined) updateData.clearance = data.clearance;
        if (data.price !== undefined) updateData.price = data.price;
        if (data.soldOut !== undefined) updateData.soldOut = data.soldOut;
        if (data.hidden !== undefined) updateData.hidden = data.hidden;

        // Update product (including ID change)
        await db.update(products).set(updateData).where(eq(products.id, id));
    } else {
        // Regular update without ID change
        const updateData: Partial<typeof products.$inferInsert> = {};
        if (data.name !== undefined) updateData.name = data.name;
        if (data.description !== undefined)
            updateData.description = data.description;
        if (data.category !== undefined) updateData.category = data.category;
        if (data.clearance !== undefined) updateData.clearance = data.clearance;
        if (data.price !== undefined) updateData.price = data.price;
        if (data.soldOut !== undefined) updateData.soldOut = data.soldOut;
        if (data.hidden !== undefined) updateData.hidden = data.hidden;

        await db.update(products).set(updateData).where(eq(products.id, id));
    }
}

export async function checkProductIdExists(id: string): Promise<boolean> {
    const product = await getProductById(id);
    return product !== null;
}

export async function createProduct(data: {
    id: string;
    name?: string | null;
    description?: string | null;
    category: string | null;
    clearance?: boolean;
    price?: string | null;
    soldOut?: boolean;
    hidden?: boolean;
}): Promise<void> {
    // Check if ID already exists
    const existingProduct = await getProductById(data.id);
    if (existingProduct) {
        throw new Error(`Product with ID "${data.id}" already exists`);
    }

    await db.insert(products).values(data);
}

export async function deleteProduct(id: string): Promise<void> {
    // Check if product exists and get it with images
    const product = await getProductById(id);
    if (!product) {
        throw new Error(`Product with ID "${id}" not found`);
    }

    // If product has images, we'll need to clean them up from GCS
    // Import the function here to avoid circular dependency
    if (product.images && product.images.length > 0) {
        try {
            const { deleteProductImage } = await import("@/lib/imageService");

            // Delete all images (this handles both GCS and database cleanup)
            const deletePromises = product.images.map((image) =>
                deleteProductImage(image.id).catch((error) => {
                    logger.warn(
                        { error, imageId: image.id },
                        "Failed to delete image"
                    );
                    // Continue even if some images fail to delete
                })
            );

            await Promise.all(deletePromises);
        } catch (error) {
            logger.warn({ error }, "Failed to clean up some product images");
            // Continue with product deletion even if image cleanup fails
        }
    }

    // Delete product from database
    await db.delete(products).where(eq(products.id, id));
}
