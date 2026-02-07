import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    output: "standalone",
    allowedDevOrigins: ["http://localhost:3000"],
    images: {
        qualities: [100, 75],
        remotePatterns: process.env.NEXT_ALLOWED_IMAGE_REMOTE_PATTERNS?.split(
            ","
        ).map((pattern) => {
            return new URL(pattern);
        }),
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
