import type { NextConfig } from "next";
import { fileURLToPath } from "node:url";

const allowedImageRemotePatterns = process.env
    .NEXT_ALLOWED_IMAGE_REMOTE_PATTERNS
    ? process.env.NEXT_ALLOWED_IMAGE_REMOTE_PATTERNS.split(",")
          .map((pattern) => pattern.trim())
          .filter(Boolean)
          .map((pattern) => new URL(pattern))
    : undefined;

const repoRoot = fileURLToPath(new URL("../..", import.meta.url));

const nextConfig: NextConfig = {
    output: "standalone",
    transpilePackages: ["@productsdisplay/contracts"],
    turbopack: {
        root: repoRoot,
    },
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
