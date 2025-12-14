import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    output: "standalone",
    allowedDevOrigins: ["http://localhost:3000"],
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
