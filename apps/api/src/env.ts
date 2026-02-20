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
    DATABASE_URL: optionalString,
});

export const env = envSchema.parse(process.env);

export type Env = typeof env;
