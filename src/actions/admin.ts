"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { getProducts, updateProduct } from "@/db/queries/productQueries";
import { getCategories } from "@/db/queries/categoryQueries";

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
        name?: string | null;
        description?: string | null;
        category?: string;
    }
) {
    await requireAuth();
    // Rate limit: 50 requests per 15 minutes
    await checkRateLimit("updateAdminProduct", 50, 15 * 60 * 1000);

    try {
        await updateProduct(id, data);
        return { success: true };
    } catch (error) {
        console.error("Failed to update product:", error);
        throw new Error("Failed to update product");
    }
}
