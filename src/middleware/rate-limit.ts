import { NextRequest, NextResponse } from "next/server";

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory store (use Redis in production for multi-instance deployments)
const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up old entries every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitStore.entries()) {
    if (now > value.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 10 * 60 * 1000);

function getClientIdentifier(request: NextRequest): string {
  // Try to get IP from various headers
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  if (realIp) {
    return realIp;
  }
  
  // Fallback to a generic identifier
  return "unknown";
}

export function rateLimit(
  request: NextRequest,
  options: {
    maxRequests: number;
    windowMs: number;
    message?: string;
  }
): NextResponse | null {
  const identifier = getClientIdentifier(request);
  const key = `${identifier}:${request.nextUrl.pathname}`;
  const now = Date.now();

  let entry = rateLimitStore.get(key);

  if (!entry || now > entry.resetTime) {
    // Create new entry or reset expired one
    entry = {
      count: 1,
      resetTime: now + options.windowMs,
    };
    rateLimitStore.set(key, entry);
    return null;
  }

  entry.count++;

  if (entry.count > options.maxRequests) {
    // Rate limit exceeded
    return NextResponse.json(
      {
        error: options.message || "Too many requests. Please try again later.",
        retryAfter: Math.ceil((entry.resetTime - now) / 1000),
      },
      {
        status: 429,
        headers: {
          "Retry-After": Math.ceil((entry.resetTime - now) / 1000).toString(),
        },
      }
    );
  }

  return null;
}

export function handleAuthRateLimit(request: NextRequest): NextResponse | null {
  const pathname = request.nextUrl.pathname;

  // Rate limit login attempts: 5 attempts per 15 minutes
  if (pathname === "/api/admin/login" && request.method === "POST") {
    return rateLimit(request, {
      maxRequests: 5,
      windowMs: 15 * 60 * 1000, // 15 minutes
      message: "Too many login attempts. Please try again in 15 minutes.",
    });
  }

  // Rate limit all admin routes: 100 requests per 15 minutes
  if (pathname.startsWith("/admin")) {
    return rateLimit(request, {
      maxRequests: 100,
      windowMs: 15 * 60 * 1000,
      message: "Too many requests. Please slow down.",
    });
  }

  return null;
}

export function handlePublicRateLimit(request: NextRequest): NextResponse | null {
  const pathname = request.nextUrl.pathname;

  // Skip static files and images
  if (
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/static/") ||
    pathname.match(/\.(jpg|jpeg|png|gif|ico|svg|woff|woff2|ttf|css|js)$/)
  ) {
    return null;
  }

  // Skip admin routes (handled separately)
  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    return null;
  }

  // Rate limit public routes: 1000 requests per minute
  // Generous for humans, but will catch aggressive bots
  return rateLimit(request, {
    maxRequests: 1000,
    windowMs: 60 * 1000, // 1 minute
    message: "Too many requests. Please slow down.",
  });
}

