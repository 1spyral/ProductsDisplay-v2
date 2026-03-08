import type { FastifyInstance } from "fastify";
import { getStoreInfoUncached } from "@/db/queries/storeInfoQueries";

export async function publicStoreInfoRoutes(
    app: FastifyInstance
): Promise<void> {
    app.get("/store-info", async () => {
        return getStoreInfoUncached();
    });
}
