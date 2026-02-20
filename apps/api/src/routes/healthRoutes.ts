import type { FastifyInstance } from "fastify";

export async function healthRoutes(app: FastifyInstance): Promise<void> {
    app.get("/livez", async () => {
        return { status: "ok" };
    });

    app.get("/readyz", async () => {
        return { status: "ready" };
    });
}
