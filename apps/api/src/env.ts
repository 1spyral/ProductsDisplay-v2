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
    HOST: z.string().default("0.0.0.0"),
    PORT: z.coerce.number().int().positive().default(3001),
    LOG_LEVEL: z.enum(logLevels).default("info"),
    LOG_PRETTY: z.coerce.boolean().default(false),
    CI: optionalString,
    DATABASE_URL: optionalString,
    ADMIN_TOKEN_SECRET: optionalString,
    CORS_ALLOWED_ORIGINS: optionalString,
    GOOGLE_CLOUD_PROJECT_ID: optionalString,
    GOOGLE_CLOUD_STORAGE_BUCKET: optionalString,
    GOOGLE_APPLICATION_CREDENTIALS: optionalString,
    GOOGLE_CLOUD_CLIENT_EMAIL: optionalString,
    GOOGLE_CLOUD_PRIVATE_KEY: optionalString,
});

export const env = envSchema.parse(process.env);

export type Env = typeof env;
