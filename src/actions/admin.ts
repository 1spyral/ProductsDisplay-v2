"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getProducts } from "@/db/queries/productQueries";
import { getCategories } from "@/db/queries/categoryQueries";

export async function loginAdmin(password: string) {
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
    const cookieStore = await cookies();
    cookieStore.delete("admin-auth");
    redirect("/admin/login");
}

export async function getAdminProducts() {
    try {
        return await getProducts();
    } catch (error) {
        console.error("Failed to fetch products:", error);
        throw new Error("Failed to fetch products");
    }
}

export async function getAdminCategories() {
    try {
        return await getCategories();
    } catch (error) {
        console.error("Failed to fetch categories:", error);
        throw new Error("Failed to fetch categories");
    }
}
