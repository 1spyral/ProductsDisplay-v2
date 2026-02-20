import { headers } from "next/headers";

// TODO: Update to Redis-based rate limiting (e.g., @upstash/ratelimit) for production
// Rate limiting store for server actions
interface RateLimitEntry {
    count: number;
    resetTime: number;
}

const serverActionRateLimitStore = new Map<string, RateLimitEntry>();

// Clean up old entries every 10 minutes
if (typeof setInterval !== "undefined") {
    setInterval(
        () => {
            const now = Date.now();
            for (const [key, value] of serverActionRateLimitStore.entries()) {
                if (now > value.resetTime) {
                    serverActionRateLimitStore.delete(key);
                }
            }
        },
        10 * 60 * 1000
    );
}

// Helper to get client identifier in server actions
async function getClientIdentifier(): Promise<string> {
    const headersList = await headers();
    const forwarded = headersList.get("x-forwarded-for");
    const realIp = headersList.get("x-real-ip");

    if (forwarded) {
        return forwarded.split(",")[0].trim();
    }
    if (realIp) {
        return realIp;
    }

    return "unknown";
}

export async function checkRateLimit(
    action: string,
    maxRequests: number,
    windowMs: number
): Promise<void> {
    const identifier = await getClientIdentifier();
    const key = `${identifier}:${action}`;
    const now = Date.now();

    let entry = serverActionRateLimitStore.get(key);

    if (!entry || now > entry.resetTime) {
        entry = {
            count: 1,
            resetTime: now + windowMs,
        };
        serverActionRateLimitStore.set(key, entry);
        return;
    }

    entry.count++;

    if (entry.count > maxRequests) {
        const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
        throw new Error(
            `Too many requests. Please try again in ${retryAfter} seconds.`
        );
    }
}
