import Fastify, { type FastifyServerOptions } from "fastify";
import { env } from "./env";

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

const app = Fastify({ logger: loggerConfig });

app.get("/livez", async () => {
    return { status: "ok" };
});

app.get("/readyz", async () => {
    return { status: "ready" };
});

try {
    await app.listen({ port: env.PORT, host: env.HOST });
} catch (error) {
    app.log.error(error);
    process.exit(1);
}
