import type {
    FastifyReply,
    FastifyRequest,
    preHandlerHookHandler,
} from "fastify";

interface RateLimitEntry {
    count: number;
    resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// Periodically clear expired entries to bound in-memory growth.
if (typeof setInterval !== "undefined") {
    const timer = setInterval(
        () => {
            const now = Date.now();
            for (const [key, value] of rateLimitStore.entries()) {
                if (now > value.resetTime) {
                    rateLimitStore.delete(key);
                }
            }
        },
        10 * 60 * 1000
    );

    timer.unref?.();
}

function getClientIdentifier(request: FastifyRequest): string {
    const forwarded = request.headers["x-forwarded-for"];
    const realIp = request.headers["x-real-ip"];

    if (typeof forwarded === "string" && forwarded.length > 0) {
        return forwarded.split(",")[0]?.trim() || "unknown";
    }

    if (typeof realIp === "string" && realIp.length > 0) {
        return realIp;
    }

    return request.ip || "unknown";
}

function sendRateLimitExceeded(
    reply: FastifyReply,
    message: string,
    retryAfterSeconds: number
): void {
    reply.code(429).header("Retry-After", retryAfterSeconds.toString()).send({
        error: message,
        retryAfter: retryAfterSeconds,
    });
}

export function createRateLimitPreHandler(options: {
    action: string;
    maxRequests: number;
    windowMs: number;
    message?: string;
}): preHandlerHookHandler {
    const {
        action,
        maxRequests,
        windowMs,
        message = "Too many requests. Please try again later.",
    } = options;

    return async (request, reply) => {
        const identifier = getClientIdentifier(request);
        const key = `${identifier}:${action}`;
        const now = Date.now();

        const entry = rateLimitStore.get(key);
        if (!entry || now > entry.resetTime) {
            rateLimitStore.set(key, {
                count: 1,
                resetTime: now + windowMs,
            });
            return;
        }

        entry.count++;
        if (entry.count > maxRequests) {
            const retryAfterSeconds = Math.ceil((entry.resetTime - now) / 1000);
            sendRateLimitExceeded(reply, message, retryAfterSeconds);
        }
    };
}
