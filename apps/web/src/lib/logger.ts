import pino from "pino";

const validLogLevels = [
    "trace",
    "debug",
    "info",
    "warn",
    "error",
    "fatal",
] as const;

type LogLevel = (typeof validLogLevels)[number];

function getLogLevel(): LogLevel {
    const envLevel = process.env.LOG_LEVEL?.toLowerCase();
    if (envLevel && validLogLevels.includes(envLevel as LogLevel)) {
        return envLevel as LogLevel;
    }
    return "info";
}

function shouldUsePrettyTransport(): boolean {
    const explicitPretty = process.env.LOG_PRETTY?.toLowerCase();
    if (explicitPretty === "1" || explicitPretty === "true") return true;
    if (explicitPretty === "0" || explicitPretty === "false") return false;

    return (
        process.env.NODE_ENV !== "production" &&
        process.env.CI !== "true" &&
        !!process.stdout?.isTTY
    );
}

/**
 * Server-side logger instance using Pino.
 *
 * Configure the log level using the LOG_LEVEL environment variable.
 * Valid values: trace, debug, info, warn, error, fatal.
 * Defaults to "info" if not set or invalid.
 *
 * In development mode, uses pino-pretty for colored, human-readable logs.
 * In production, uses standard JSON output for log aggregation.
 *
 * @example
 * import logger from "@/lib/logger";
 *
 * logger.info({ userId: "123" }, "User logged in");
 * logger.error({ error }, "Failed to process request");
 */
const logger = pino({
    level: getLogLevel(),
    ...(shouldUsePrettyTransport() && {
        transport: {
            target: "pino-pretty",
            options: {
                colorize: true,
            },
        },
    }),
});

export default logger;
