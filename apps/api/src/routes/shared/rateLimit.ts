import type { FastifyRequest } from "fastify";

function getClientIdentifier(request: FastifyRequest): string {
    const forwarded = request.headers["x-forwarded-for"];
    if (typeof forwarded === "string" && forwarded.length > 0) {
        return forwarded.split(",")[0]?.trim() || "unknown";
    }

    const realIp = request.headers["x-real-ip"];
    if (typeof realIp === "string" && realIp.length > 0) {
        return realIp;
    }

    return request.ip || "unknown";
}

export function adminRateLimitConfig(action: string, maxRequests: number) {
    return {
        rateLimit: {
            max: maxRequests,
            timeWindow: 15 * 60 * 1000,
            keyGenerator: (request: FastifyRequest) =>
                `${getClientIdentifier(request)}:${action}`,
        },
    };
}
