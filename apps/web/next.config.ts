import type { NextConfig } from "next";

const allowedImageRemotePatterns = process.env
    .NEXT_ALLOWED_IMAGE_REMOTE_PATTERNS
    ? process.env.NEXT_ALLOWED_IMAGE_REMOTE_PATTERNS.split(",")
          .map((pattern) => pattern.trim())
          .filter(Boolean)
          .map((pattern) => new URL(pattern))
    : undefined;

const nextConfig: NextConfig = {
    output: "standalone",
    allowedDevOrigins: ["http://localhost:3000"],
    images: {
        qualities: [100, 75],
        remotePatterns: allowedImageRemotePatterns,
    },
    experimental: {
        serverActions: {
            bodySizeLimit: "4mb",
        },
    },
    rewrites: async () => {
        return {
            beforeFiles: [
                {
                    source: "/_next/static/chunks/app/:folder*/@modal/:path*",
                    destination:
                        "/_next/static/chunks/app/:folder*/%40modal/:path*",
                },
            ],
            afterFiles: [],
            fallback: [],
        };
    },
};

export default nextConfig;
