import { z } from "zod";

const logLevels = ["trace", "debug", "info", "warn", "error", "fatal"] as const;

const optionalString = z.preprocess(
    (value) =>
        typeof value === "string" && value.trim() === "" ? undefined : value,
    z.string().optional()
);

const envSchema = z.object({
    NODE_ENV: z
        .enum(["development", "test", "production"])
        .default("development"),
    API_BASE_URL: z.string().default("http://127.0.0.1:3001"),
    NEXT_PUBLIC_IMAGE_PATH: z.string().default(""),
    ADMIN_PASSWORD: optionalString,
    ADMIN_TOKEN_SECRET: optionalString,
    LOG_LEVEL: z.enum(logLevels).default("info"),
    LOG_PRETTY: optionalString,
    CI: optionalString,
});

export const env = envSchema.parse(process.env);

export type Env = typeof env;
