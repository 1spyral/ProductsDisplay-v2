import { z } from "zod";

const logLevels = ["trace", "debug", "info", "warn", "error", "fatal"] as const;

const optionalString = z.preprocess(
    (value) =>
        typeof value === "string" && value.trim() === "" ? undefined : value,
    z.string().optional()
);

const envSchema = z
    .object({
        NODE_ENV: z
            .enum(["development", "test", "production"])
            .default("development"),
        DATABASE_URL: optionalString,
        NEXT_PUBLIC_IMAGE_PATH: z.string().default(""),
        ADMIN_PASSWORD: optionalString,
        ADMIN_TOKEN_SECRET: optionalString,
        LOG_LEVEL: z.enum(logLevels).default("info"),
        LOG_PRETTY: optionalString,
        CI: optionalString,
        GOOGLE_CLOUD_PROJECT_ID: optionalString,
        GOOGLE_CLOUD_STORAGE_BUCKET: optionalString,
        GOOGLE_APPLICATION_CREDENTIALS: optionalString,
        GOOGLE_CLOUD_CLIENT_EMAIL: optionalString,
        GOOGLE_CLOUD_PRIVATE_KEY: optionalString,
    })
    .superRefine((data, ctx) => {
        const hasInlineServiceAccount =
            !!data.GOOGLE_CLOUD_CLIENT_EMAIL || !!data.GOOGLE_CLOUD_PRIVATE_KEY;

        if (
            hasInlineServiceAccount &&
            (!data.GOOGLE_CLOUD_CLIENT_EMAIL || !data.GOOGLE_CLOUD_PRIVATE_KEY)
        ) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message:
                    "GOOGLE_CLOUD_CLIENT_EMAIL and GOOGLE_CLOUD_PRIVATE_KEY must both be set together",
            });
        }
    });

export const env = envSchema.parse(process.env);

export type Env = typeof env;
