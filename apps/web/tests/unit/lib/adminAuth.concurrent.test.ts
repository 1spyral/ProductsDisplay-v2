import { getAdminAuthStatus, setAdminAccessCookie } from "@/lib/adminAuth";
import {
    createAdminAccessToken,
    createAdminRefreshToken,
    getAdminCookieNames,
    verifyAdminAccessToken,
} from "@/lib/adminTokens";
import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { NextRequest, NextResponse } from "next/server";

const originalSecret = process.env.ADMIN_TOKEN_SECRET;

function buildRequest(pathname: string, cookieHeader?: string): NextRequest {
    const headers = new Headers();
    if (cookieHeader) {
        headers.set("cookie", cookieHeader);
    }

    return new NextRequest(`http://localhost${pathname}`, {
        headers,
    });
}

describe("adminAuth", () => {
    beforeAll(() => {
        process.env.ADMIN_TOKEN_SECRET = "unit-test-admin-secret-123456789";
    });

    afterAll(() => {
        if (originalSecret === undefined) {
            delete process.env.ADMIN_TOKEN_SECRET;
            return;
        }

        process.env.ADMIN_TOKEN_SECRET = originalSecret;
    });

    test("returns unauthenticated when no auth cookies are present", async () => {
        const request = buildRequest("/admin/dashboard");

        await expect(getAdminAuthStatus(request)).resolves.toEqual({
            status: "unauthenticated",
        });
    });

    test("returns authenticated for valid access token", async () => {
        const { access } = getAdminCookieNames();
        const accessToken = await createAdminAccessToken();
        const request = buildRequest(
            "/admin/dashboard",
            `${access}=${accessToken}`
        );

        await expect(getAdminAuthStatus(request)).resolves.toEqual({
            status: "authenticated",
        });
    });

    test("returns refresh status with a new access token when refresh is valid", async () => {
        const { access, refresh } = getAdminCookieNames();
        const refreshToken = await createAdminRefreshToken();
        const request = buildRequest(
            "/admin/dashboard",
            `${access}=invalid-token; ${refresh}=${refreshToken}`
        );

        const authStatus = await getAdminAuthStatus(request);
        expect(authStatus.status).toBe("refresh");

        if (authStatus.status !== "refresh") {
            throw new Error("Expected refresh auth status");
        }

        await expect(
            verifyAdminAccessToken(authStatus.newAccessToken)
        ).resolves.toBeUndefined();
    });

    test("returns unauthenticated when refresh token is invalid", async () => {
        const { refresh } = getAdminCookieNames();
        const request = buildRequest(
            "/admin/dashboard",
            `${refresh}=invalid-token`
        );

        await expect(getAdminAuthStatus(request)).resolves.toEqual({
            status: "unauthenticated",
        });
    });

    test("sets secure admin access cookie attributes", () => {
        const response = NextResponse.next();

        setAdminAccessCookie(response, "access-value");

        const setCookieHeader = response.headers.get("set-cookie");
        expect(setCookieHeader).toBeDefined();
        expect(setCookieHeader).toContain("admin-access=access-value");
        expect(setCookieHeader).toContain("HttpOnly");
        expect(setCookieHeader).toContain("Max-Age=900");
        expect(setCookieHeader).toContain("Path=/");
        expect(setCookieHeader).toContain("SameSite=strict");
    });
});
