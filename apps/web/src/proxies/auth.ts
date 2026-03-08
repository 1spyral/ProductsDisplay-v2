import { NextRequest, NextResponse } from "next/server";
import { getAdminAuthStatus, setAdminAccessCookie } from "@/lib/adminAuth";

export async function handleAdminAuth(
    request: NextRequest
): Promise<NextResponse | null> {
    const pathname = request.nextUrl.pathname;
    const authStatus = await getAdminAuthStatus(request);
    const authenticated = authStatus.status !== "unauthenticated";

    // Handle /admin - redirect based on auth status
    if (pathname === "/admin") {
        if (authenticated) {
            const response = NextResponse.redirect(
                new URL("/admin/dashboard", request.url)
            );
            if (authStatus.status === "refresh") {
                setAdminAccessCookie(response, authStatus.newAccessToken);
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
            setAdminAccessCookie(response, authStatus.newAccessToken);
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
                setAdminAccessCookie(response, authStatus.newAccessToken);
            }
            return response;
        }
    }

    // No redirect needed
    return null;
}
export async function handleAdminApiAuth(
    request: NextRequest
): Promise<NextResponse | null> {
    if (!request.nextUrl.pathname.startsWith("/api/admin")) {
        return null;
    }

    const auth = await getAdminAuthStatus(request);

    if (auth.status === "unauthenticated") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (auth.status === "refresh") {
        const response = NextResponse.next();
        setAdminAccessCookie(response, auth.newAccessToken);
        return response;
    }

    return null;
}
