import type { FastifyInstance } from "fastify";

export async function healthRoutes(app: FastifyInstance): Promise<void> {
    app.get("/livez", { logLevel: "silent" }, async () => {
        return { status: "ok" };
    });

    app.get("/readyz", { logLevel: "silent" }, async () => {
        return { status: "ready" };
    });
}
