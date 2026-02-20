import {
    handleAdminCompileRateLimit,
    handleAuthRateLimit,
    handlePublicRateLimit,
    rateLimit,
} from "@/proxies/rate-limit";
import { describe, expect, test } from "bun:test";
import { NextRequest } from "next/server";

function buildRequest(
    pathname: string,
    {
        method = "GET",
        ip = crypto.randomUUID(),
    }: { method?: string; ip?: string } = {}
): NextRequest {
    const headers = new Headers({
        "x-forwarded-for": ip,
    });

    return new NextRequest(`http://localhost${pathname}`, {
        method,
        headers,
    });
}

describe("rate-limit proxy", () => {
    test("rateLimit blocks requests over the configured limit", async () => {
        const request = buildRequest(`/api/test-${crypto.randomUUID()}`);

        expect(
            rateLimit(request, {
                maxRequests: 1,
                windowMs: 60_000,
            })
        ).toBeNull();

        const blockedResponse = rateLimit(request, {
            maxRequests: 1,
            windowMs: 60_000,
        });

        expect(blockedResponse).not.toBeNull();
        if (!blockedResponse) {
            throw new Error("Expected a rate-limited response");
        }

        expect(blockedResponse.status).toBe(429);
        expect(
            Number(blockedResponse.headers.get("Retry-After"))
        ).toBeGreaterThan(0);

        const body = (await blockedResponse.json()) as {
            error: string;
            retryAfter: number;
        };
        expect(body.error).toBe("Too many requests. Please try again later.");
        expect(body.retryAfter).toBeGreaterThan(0);
    });

    test("handleAdminCompileRateLimit enforces compile POST throttling", async () => {
        const ip = crypto.randomUUID();

        expect(
            handleAdminCompileRateLimit(
                buildRequest("/api/admin/compile", {
                    method: "POST",
                    ip,
                })
            )
        ).toBeNull();

        const blockedResponse = handleAdminCompileRateLimit(
            buildRequest("/api/admin/compile", {
                method: "POST",
                ip,
            })
        );

        expect(blockedResponse).not.toBeNull();
        if (!blockedResponse) {
            throw new Error("Expected compile endpoint to be rate limited");
        }

        const body = (await blockedResponse.json()) as { error: string };
        expect(body.error).toBe(
            "Too many compile requests. Please wait a second."
        );
    });

    test("handleAuthRateLimit throttles repeated login attempts", () => {
        const ip = crypto.randomUUID();
        let response = null;

        for (let i = 0; i < 6; i++) {
            response = handleAuthRateLimit(
                buildRequest("/api/admin/login", {
                    method: "POST",
                    ip,
                })
            );
        }

        expect(response).not.toBeNull();
        expect(response?.status).toBe(429);
    });

    test("handlePublicRateLimit skips static and admin routes", () => {
        expect(
            handlePublicRateLimit(buildRequest("/_next/static/chunk.js"))
        ).toBeNull();
        expect(
            handlePublicRateLimit(buildRequest("/admin/dashboard"))
        ).toBeNull();
        expect(
            handlePublicRateLimit(
                buildRequest("/api/admin/login", { method: "POST" })
            )
        ).toBeNull();
    });
});
