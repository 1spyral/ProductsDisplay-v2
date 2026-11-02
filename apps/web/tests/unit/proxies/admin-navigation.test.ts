import {
    createAdminAccessToken,
    createAdminRefreshToken,
    getAdminCookieNames,
    verifyAdminAccessToken,
} from "@/lib/adminTokens";
import { handleAdminAuth } from "@/proxies/auth";
import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { NextRequest } from "next/server";

const originalSecret = process.env.ADMIN_TOKEN_SECRET;

describe("admin entry navigation", () => {
    beforeAll(() => {
        process.env.ADMIN_TOKEN_SECRET = "unit-test-admin-secret-123456789";
    });
    afterAll(() => {
        if (originalSecret === undefined) delete process.env.ADMIN_TOKEN_SECRET;
        else process.env.ADMIN_TOKEN_SECRET = originalSecret;
    });

    for (const path of ["/admin", "/admin/login"]) {
        test(`redirects authenticated ${path} to Products`, async () => {
            const { access } = getAdminCookieNames();
            const token = await createAdminAccessToken();
            const response = await handleAdminAuth(
                new NextRequest(`http://localhost${path}`, {
                    headers: { cookie: `${access}=${token}` },
                })
            );
            expect(response?.headers.get("location")).toBe(
                "http://localhost/admin/dashboard/products"
            );
        });

        test(`refreshes the session while redirecting ${path} to Products`, async () => {
            const { access, refresh } = getAdminCookieNames();
            const token = await createAdminRefreshToken();
            const response = await handleAdminAuth(
                new NextRequest(`http://localhost${path}`, {
                    headers: { cookie: `${refresh}=${token}` },
                })
            );
            expect(response?.headers.get("location")).toBe(
                "http://localhost/admin/dashboard/products"
            );
            const renewed = response?.cookies.get(access)?.value;
            expect(renewed).toBeDefined();
            await expect(
                verifyAdminAccessToken(renewed!)
            ).resolves.toBeUndefined();
        });
    }

    test("keeps unauthenticated admin entry and section routes protected", async () => {
        for (const path of [
            "/admin",
            "/admin/dashboard",
            "/admin/dashboard/products",
        ]) {
            const response = await handleAdminAuth(
                new NextRequest(`http://localhost${path}`)
            );
            expect(response?.headers.get("location")).toBe(
                "http://localhost/admin/login"
            );
        }
        expect(
            await handleAdminAuth(
                new NextRequest("http://localhost/admin/login")
            )
        ).toBeNull();
    });
});
