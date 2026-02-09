import { SignJWT, errors, jwtVerify } from "jose";

const ACCESS_COOKIE_NAME = "admin-access";
const REFRESH_COOKIE_NAME = "admin-refresh";

const ACCESS_TTL_SECONDS = 15 * 60; // 15 minutes
const REFRESH_TTL_SECONDS = 14 * 24 * 60 * 60; // 14 days

function getSecretKey(): Uint8Array {
    const secret = process.env.ADMIN_TOKEN_SECRET;
    if (!secret) {
        throw new Error("Missing ADMIN_TOKEN_SECRET");
    }

    return new TextEncoder().encode(secret);
}

export function getAdminCookieNames() {
    return {
        access: ACCESS_COOKIE_NAME,
        refresh: REFRESH_COOKIE_NAME,
    } as const;
}

export function getAdminTokenTtls() {
    return {
        accessSeconds: ACCESS_TTL_SECONDS,
        refreshSeconds: REFRESH_TTL_SECONDS,
    } as const;
}

export function isJwtExpiredError(error: unknown): boolean {
    return error instanceof errors.JWTExpired;
}

export async function createAdminAccessToken(): Promise<string> {
    const now = Math.floor(Date.now() / 1000);

    return await new SignJWT({ typ: "admin-access" })
        .setProtectedHeader({ alg: "HS256" })
        .setSubject("admin")
        .setIssuedAt(now)
        .setExpirationTime(now + ACCESS_TTL_SECONDS)
        .sign(getSecretKey());
}

export async function createAdminRefreshToken(): Promise<string> {
    const now = Math.floor(Date.now() / 1000);

    return await new SignJWT({ typ: "admin-refresh", jti: crypto.randomUUID() })
        .setProtectedHeader({ alg: "HS256" })
        .setSubject("admin")
        .setIssuedAt(now)
        .setExpirationTime(now + REFRESH_TTL_SECONDS)
        .sign(getSecretKey());
}

export async function verifyAdminAccessToken(token: string): Promise<void> {
    const { payload } = await jwtVerify(token, getSecretKey(), {
        subject: "admin",
    });

    if (payload.typ !== "admin-access") {
        throw new Error("Invalid access token type");
    }
}

export async function verifyAdminRefreshToken(token: string): Promise<void> {
    const { payload } = await jwtVerify(token, getSecretKey(), {
        subject: "admin",
    });

    if (payload.typ !== "admin-refresh") {
        throw new Error("Invalid refresh token type");
    }
}
