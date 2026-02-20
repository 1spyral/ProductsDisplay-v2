import {
    createAdminAccessToken,
    createAdminRefreshToken,
    getAdminCookieNames,
    getAdminTokenTtls,
    isJwtExpiredError,
    verifyAdminAccessToken,
    verifyAdminRefreshToken,
} from "@/lib/adminTokens";
import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { SignJWT } from "jose";

const originalSecret = process.env.ADMIN_TOKEN_SECRET;

function getSecretBytes(): Uint8Array {
    return new TextEncoder().encode(process.env.ADMIN_TOKEN_SECRET as string);
}

describe("adminTokens", () => {
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

    test("returns expected cookie names and token TTLs", () => {
        expect(getAdminCookieNames()).toEqual({
            access: "admin-access",
            refresh: "admin-refresh",
        });
        expect(getAdminTokenTtls()).toEqual({
            accessSeconds: 900,
            refreshSeconds: 1209600,
        });
    });

    test("creates and verifies admin access tokens", async () => {
        const token = await createAdminAccessToken();

        await expect(verifyAdminAccessToken(token)).resolves.toBeUndefined();
        await expect(verifyAdminRefreshToken(token)).rejects.toThrow(
            "Invalid refresh token type"
        );
    });

    test("creates and verifies admin refresh tokens", async () => {
        const token = await createAdminRefreshToken();

        await expect(verifyAdminRefreshToken(token)).resolves.toBeUndefined();
        await expect(verifyAdminAccessToken(token)).rejects.toThrow(
            "Invalid access token type"
        );
    });

    test("detects JWT expired errors", async () => {
        const now = Math.floor(Date.now() / 1000);
        const expiredAccessToken = await new SignJWT({ typ: "admin-access" })
            .setProtectedHeader({ alg: "HS256" })
            .setSubject("admin")
            .setIssuedAt(now - 120)
            .setExpirationTime(now - 60)
            .sign(getSecretBytes());

        let verifyError: unknown;
        try {
            await verifyAdminAccessToken(expiredAccessToken);
        } catch (error) {
            verifyError = error;
        }

        expect(isJwtExpiredError(verifyError)).toBe(true);
        expect(isJwtExpiredError(new Error("not expired"))).toBe(false);
    });

    test("throws when token secret is missing", async () => {
        const previousSecret = process.env.ADMIN_TOKEN_SECRET;
        delete process.env.ADMIN_TOKEN_SECRET;

        await expect(createAdminAccessToken()).rejects.toThrow(
            "Missing ADMIN_TOKEN_SECRET"
        );

        process.env.ADMIN_TOKEN_SECRET = previousSecret;
    });
});
