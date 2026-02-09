"use server";

import {
    createAdminAccessToken,
    createAdminRefreshToken,
    getAdminCookieNames,
    getAdminTokenTtls,
    verifyAdminAccessToken,
    verifyAdminRefreshToken,
} from "@/lib/adminTokens";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { checkRateLimit } from "./rateLimit";

async function clearAdminAuthCookiesAndRedirect() {
    const cookieStore = await cookies();
    const { access, refresh } = getAdminCookieNames();
    cookieStore.delete(access);
    cookieStore.delete({ name: refresh, path: "/admin" });
    redirect("/admin/login");
}

export async function requireAdminAuth() {
    const cookieStore = await cookies();
    const { access, refresh } = getAdminCookieNames();
    const accessToken = cookieStore.get(access)?.value;

    if (accessToken) {
        try {
            await verifyAdminAccessToken(accessToken);
            return;
        } catch {
            // Fall back to refresh token for any access-token verification failure.
        }
    }

    const refreshToken = cookieStore.get(refresh)?.value;
    if (!refreshToken) {
        await clearAdminAuthCookiesAndRedirect();
        return;
    }

    try {
        await verifyAdminRefreshToken(refreshToken);
    } catch {
        await clearAdminAuthCookiesAndRedirect();
        return;
    }

    const newAccessToken = await createAdminAccessToken();
    const { accessSeconds } = getAdminTokenTtls();
    cookieStore.set(access, newAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: accessSeconds,
        path: "/",
    });
}

export async function loginAdmin(password: string) {
    // Rate limit login attempts: 5 attempts per 15 minutes
    await checkRateLimit("loginAdmin", 5, 15 * 60 * 1000);

    // Check against environment variable
    if (password === process.env.ADMIN_PASSWORD) {
        const cookieStore = await cookies();
        const { access, refresh } = getAdminCookieNames();
        const { accessSeconds, refreshSeconds } = getAdminTokenTtls();

        const [accessToken, refreshToken] = await Promise.all([
            createAdminAccessToken(),
            createAdminRefreshToken(),
        ]);

        cookieStore.set(access, accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: accessSeconds,
            path: "/",
        });

        cookieStore.set(refresh, refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: refreshSeconds,
            path: "/admin",
        });

        return { success: true };
    }

    return { success: false, error: "Invalid password" };
}

export async function logoutAdmin() {
    await clearAdminAuthCookiesAndRedirect();
}
