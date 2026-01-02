import { NextRequest, NextResponse } from "next/server";
import {
    createAdminAccessToken,
    getAdminCookieNames,
    getAdminTokenTtls,
    verifyAdminAccessToken,
    verifyAdminRefreshToken,
} from "@/lib/adminTokens";

async function getAuthStatus(
    request: NextRequest
): Promise<
    | { status: "authenticated" }
    | { status: "refresh"; newAccessToken: string }
    | { status: "unauthenticated" }
> {
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

function setAccessCookie(response: NextResponse, token: string) {
    const { accessSeconds } = getAdminTokenTtls();
    const { access } = getAdminCookieNames();
    response.cookies.set(access, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: accessSeconds,
        path: "/",
    });
}

export async function handleAdminAuth(
    request: NextRequest
): Promise<NextResponse | null> {
    const pathname = request.nextUrl.pathname;
    const authStatus = await getAuthStatus(request);
    const authenticated = authStatus.status !== "unauthenticated";

    // Handle /admin - redirect based on auth status
    if (pathname === "/admin") {
        if (authenticated) {
            const response = NextResponse.redirect(
                new URL("/admin/dashboard", request.url)
            );
            if (authStatus.status === "refresh") {
                setAccessCookie(response, authStatus.newAccessToken);
            }
            return response;
        } else {
            return NextResponse.redirect(new URL("/admin/login", request.url));
        }
    }

    // Protect dashboard - redirect to login if not authenticated
    if (pathname.startsWith("/admin/dashboard")) {
        if (!authenticated) {
            return NextResponse.redirect(new URL("/admin/login", request.url));
        }

        if (authStatus.status === "refresh") {
            const response = NextResponse.next();
            setAccessCookie(response, authStatus.newAccessToken);
            return response;
        }
    }

    // If authenticated and trying to access login, redirect to dashboard
    if (pathname === "/admin/login") {
        if (authenticated) {
            const response = NextResponse.redirect(
                new URL("/admin/dashboard", request.url)
            );
            if (authStatus.status === "refresh") {
                setAccessCookie(response, authStatus.newAccessToken);
            }
            return response;
        }
    }

    // No redirect needed
    return null;
}
