import { env } from "@/env";
import { adminRoutes } from "@/routes/admin";
import { healthRoutes } from "@/routes/healthRoutes";
import { publicRoutes } from "@/routes/public";
import cookie from "@fastify/cookie";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import multipart from "@fastify/multipart";
import rateLimit from "@fastify/rate-limit";
import Fastify, { type FastifyServerOptions } from "fastify";

const loggerConfig: FastifyServerOptions["logger"] =
    env.LOG_PRETTY || env.NODE_ENV === "development"
        ? {
              level: env.LOG_LEVEL,
              transport: {
                  target: "pino-pretty",
                  options: {
                      colorize: true,
                      ignore: "pid,hostname",
                      translateTime: "SYS:standard",
                  },
              },
          }
        : { level: env.LOG_LEVEL };

const app = Fastify({
    logger: loggerConfig,
    bodyLimit: 5 * 1024 * 1024,
});

const allowedCorsOrigins = new Set(
    (env.CORS_ALLOWED_ORIGINS ?? "")
        .split(",")
        .map((origin) => origin.trim())
        .filter((origin) => origin.length > 0)
);

await app.register(cookie);
await app.register(cors, {
    origin:
        allowedCorsOrigins.size === 0
            ? false
            : (origin, callback) => {
                  if (!origin) {
                      callback(null, false);
                      return;
                  }

                  callback(null, allowedCorsOrigins.has(origin));
              },
    credentials: true,
});
await app.register(helmet, {
    contentSecurityPolicy: false,
});
await app.register(multipart);
await app.register(rateLimit, { global: false });

await app.register(healthRoutes);
await app.register(publicRoutes);
await app.register(adminRoutes, { prefix: "/admin" });

const port = env.PORT;
const host = env.HOST;

try {
    await app.listen({ port, host });
} catch (error) {
    app.log.error(error);
    process.exit(1);
}
