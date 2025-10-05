"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { getProducts, updateProduct, checkProductIdExists } from "@/db/queries/productQueries";
import { getCategories } from "@/db/queries/categoryQueries";
import { uploadProductImage, deleteProductImage, updateImagePosition, reorderProductImages } from "@/lib/imageService";

// TODO: Update to Redis-based rate limiting (e.g., @upstash/ratelimit) for production
// Rate limiting store for server actions
interface RateLimitEntry {
    count: number;
    resetTime: number;
}

const serverActionRateLimitStore = new Map<string, RateLimitEntry>();

// Clean up old entries every 10 minutes
if (typeof setInterval !== "undefined") {
    setInterval(
        () => {
            const now = Date.now();
            for (const [key, value] of serverActionRateLimitStore.entries()) {
                if (now > value.resetTime) {
                    serverActionRateLimitStore.delete(key);
                }
            }
        },
        10 * 60 * 1000
    );
}

// Helper to get client identifier in server actions
async function getClientIdentifier(): Promise<string> {
    const headersList = await headers();
    const forwarded = headersList.get("x-forwarded-for");
    const realIp = headersList.get("x-real-ip");

    if (forwarded) {
        return forwarded.split(",")[0].trim();
    }
    if (realIp) {
        return realIp;
    }

    return "unknown";
}

// Rate limiter for server actions
async function checkRateLimit(
    action: string,
    maxRequests: number,
    windowMs: number
): Promise<void> {
    const identifier = await getClientIdentifier();
    const key = `${identifier}:${action}`;
    const now = Date.now();

    let entry = serverActionRateLimitStore.get(key);

    if (!entry || now > entry.resetTime) {
        // Create new entry or reset expired one
        entry = {
            count: 1,
            resetTime: now + windowMs,
        };
        serverActionRateLimitStore.set(key, entry);
        return;
    }

    entry.count++;

    if (entry.count > maxRequests) {
        const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
        throw new Error(
            `Too many requests. Please try again in ${retryAfter} seconds.`
        );
    }
}

// Helper function to check authentication
async function requireAuth() {
    const cookieStore = await cookies();
    const authCookie = cookieStore.get("admin-auth");

    if (authCookie?.value !== "authenticated") {
        throw new Error("Unauthorized");
    }
}

export async function loginAdmin(password: string) {
    // Rate limit login attempts: 5 attempts per 15 minutes
    await checkRateLimit("loginAdmin", 5, 15 * 60 * 1000);

    // Check against environment variable
    if (password === process.env.ADMIN_PASSWORD) {
        // Set a secure cookie
        const cookieStore = await cookies();
        cookieStore.set("admin-auth", "authenticated", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 60 * 60 * 2, // 2 hours
            path: "/",
        });

        return { success: true };
    }

    return { success: false, error: "Invalid password" };
}

export async function logoutAdmin() {
    await requireAuth();
    const cookieStore = await cookies();
    cookieStore.delete("admin-auth");
    redirect("/admin/login");
}

export async function getAdminProducts() {
    await requireAuth();
    // Rate limit: 100 requests per 15 minutes
    await checkRateLimit("getAdminProducts", 100, 15 * 60 * 1000);

    try {
        return await getProducts();
    } catch (error) {
        console.error("Failed to fetch products:", error);
        throw new Error("Failed to fetch products");
    }
}

export async function getAdminCategories() {
    await requireAuth();
    // Rate limit: 100 requests per 15 minutes
    await checkRateLimit("getAdminCategories", 100, 15 * 60 * 1000);

    try {
        return await getCategories();
    } catch (error) {
        console.error("Failed to fetch categories:", error);
        throw new Error("Failed to fetch categories");
    }
}

export async function updateAdminProduct(
    id: string,
    data: {
        newId?: string;
        name?: string | null;
        description?: string | null;
        category?: string;
    }
) {
    await requireAuth();
    // Rate limit: 50 requests per 15 minutes
    await checkRateLimit("updateAdminProduct", 50, 15 * 60 * 1000);

    try {
        // Validate new ID format if provided
        if (data.newId && data.newId !== id) {
            // Basic ID validation
            if (!data.newId.trim()) {
                throw new Error("Product ID cannot be empty");
            }
            if (data.newId.length > 255) {
                throw new Error("Product ID too long (max 255 characters)");
            }
            // You can add more validation rules here (e.g., no special characters)
            if (!/^[a-zA-Z0-9-_]+$/.test(data.newId)) {
                throw new Error("Product ID can only contain letters, numbers, hyphens, and underscores");
            }
        }

        await updateProduct(id, data);
        return { success: true };
    } catch (error) {
        console.error("Failed to update product:", error);
        // Return specific error messages for validation failures
        if (error instanceof Error) {
            throw new Error(error.message);
        }
        throw new Error("Failed to update product");
    }
}

export async function checkAdminProductIdExists(id: string) {
    await requireAuth();
    // Rate limit: 100 requests per 15 minutes (more generous for real-time validation)
    // await checkRateLimit("checkAdminProductIdExists", 100, 15 * 60 * 1000);

    try {
        return await checkProductIdExists(id);
    } catch (error) {
        console.error("Failed to check product ID:", error);
        throw new Error("Failed to check product ID");
    }
}

// Image Management Actions

export async function uploadAdminProductImage(formData: FormData) {
    await requireAuth();
    // Rate limit: 20 uploads per 15 minutes
    await checkRateLimit("uploadAdminProductImage", 20, 15 * 60 * 1000);

    try {
        const file = formData.get('file') as File;
        const productId = formData.get('productId') as string;
        const position = formData.get('position') ? parseInt(formData.get('position') as string) : 0;

        if (!file || !productId) {
            throw new Error("File and product ID are required");
        }

        const result = await uploadProductImage({
            file,
            productId,
            position,
        });

        if (!result.success) {
            throw new Error(result.error || "Failed to upload image");
        }

        return result;
    } catch (error) {
        console.error("Failed to upload image:", error);
        throw new Error(error instanceof Error ? error.message : "Failed to upload image");
    }
}

export async function deleteAdminProductImage(imageId: string) {
    await requireAuth();
    // Rate limit: 50 deletions per 15 minutes
    await checkRateLimit("deleteAdminProductImage", 50, 15 * 60 * 1000);

    try {
        const result = await deleteProductImage(imageId);
        
        if (!result.success) {
            throw new Error(result.error || "Failed to delete image");
        }

        return { success: true };
    } catch (error) {
        console.error("Failed to delete image:", error);
        throw new Error(error instanceof Error ? error.message : "Failed to delete image");
    }
}

export async function updateAdminImagePosition(imageId: string, position: number) {
    await requireAuth();
    // Rate limit: 100 updates per 15 minutes
    await checkRateLimit("updateAdminImagePosition", 100, 15 * 60 * 1000);

    try {
        const result = await updateImagePosition(imageId, position);
        
        if (!result.success) {
            throw new Error(result.error || "Failed to update image position");
        }

        return { success: true };
    } catch (error) {
        console.error("Failed to update image position:", error);
        throw new Error(error instanceof Error ? error.message : "Failed to update image position");
    }
}

export async function reorderAdminProductImages(productId: string, imageIds: string[]) {
    await requireAuth();
    // Rate limit: 50 reorders per 15 minutes
    await checkRateLimit("reorderAdminProductImages", 50, 15 * 60 * 1000);

    try {
        const result = await reorderProductImages(productId, imageIds);
        
        if (!result.success) {
            throw new Error(result.error || "Failed to reorder images");
        }

        return { success: true };
    } catch (error) {
        console.error("Failed to reorder images:", error);
        throw new Error(error instanceof Error ? error.message : "Failed to reorder images");
    }
}
