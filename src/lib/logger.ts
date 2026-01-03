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

/**
 * Server-side logger instance using Pino.
 *
 * Configure the log level using the LOG_LEVEL environment variable.
 * Valid values: trace, debug, info, warn, error, fatal.
 * Defaults to "info" if not set or invalid.
 *
 * @example
 * import logger from "@/lib/logger";
 *
 * logger.info({ userId: "123" }, "User logged in");
 * logger.error({ error }, "Failed to process request");
 */
const logger = pino({
    level: getLogLevel(),
});

export default logger;
