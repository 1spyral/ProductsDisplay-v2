import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { handleAdminAuth } from "./proxies/auth";
import {
    handleAuthRateLimit,
    handlePublicRateLimit,
} from "./proxies/rate-limit";

export async function proxy(request: NextRequest) {
    // Apply rate limiting first (admin-specific)
    const adminRateLimitResponse = handleAuthRateLimit(request);
    if (adminRateLimitResponse) {
        return adminRateLimitResponse;
    }

    // Apply public rate limiting (bot protection)
    const publicRateLimitResponse = handlePublicRateLimit(request);
    if (publicRateLimitResponse) {
        return publicRateLimitResponse;
    }

    // Handle admin authentication
    const authResponse = await handleAdminAuth(request);
    if (authResponse) {
        return authResponse;
    }

    return NextResponse.next();
}

export const config = {
    // Match all routes except static files
    matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
