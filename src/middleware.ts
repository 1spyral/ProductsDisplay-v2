import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { handleAdminAuth } from "./middleware/auth";
import {
    handleAuthRateLimit,
    handlePublicRateLimit,
} from "./middleware/rate-limit";

export function middleware(request: NextRequest) {
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
    const authResponse = handleAdminAuth(request);
    if (authResponse) {
        return authResponse;
    }

    return NextResponse.next();
}

export const config = {
    // Match all routes except static files
    matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
