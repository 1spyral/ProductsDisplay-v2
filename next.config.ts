import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
    output: "standalone",
    webpack(config) {
        config.resolve.alias = {
            ...config.resolve.alias,
            "@": path.resolve(__dirname, "src"),
        };
        return config;
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
