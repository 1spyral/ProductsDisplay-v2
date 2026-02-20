import { env } from "@/env";
import {
    createAdminAccessToken,
    getAdminCookieNames,
    getAdminTokenTtls,
    verifyAdminAccessToken,
    verifyAdminRefreshToken,
} from "@/lib/adminTokens";
import type { NextRequest, NextResponse } from "next/server";

export type AdminAuthStatus =
    | { status: "authenticated" }
    | { status: "refresh"; newAccessToken: string }
    | { status: "unauthenticated" };

export async function getAdminAuthStatus(
    request: NextRequest
): Promise<AdminAuthStatus> {
    const { access, refresh } = getAdminCookieNames();
    const accessToken = request.cookies.get(access)?.value;

    if (accessToken) {
        try {
            await verifyAdminAccessToken(accessToken);
            return { status: "authenticated" };
        } catch {
            // Fall back to refresh token for any access-token verification failure.
        }
    }

    const refreshToken = request.cookies.get(refresh)?.value;
    if (!refreshToken) {
        return { status: "unauthenticated" };
    }

    try {
        await verifyAdminRefreshToken(refreshToken);
    } catch {
        return { status: "unauthenticated" };
    }

    return {
        status: "refresh",
        newAccessToken: await createAdminAccessToken(),
    };
}

export function setAdminAccessCookie(response: NextResponse, token: string) {
    const { accessSeconds } = getAdminTokenTtls();
    const { access } = getAdminCookieNames();
    response.cookies.set(access, token, {
        httpOnly: true,
        secure: env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: accessSeconds,
        path: "/",
    });
}
