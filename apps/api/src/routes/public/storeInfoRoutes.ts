import { getStoreInfoUncached } from "@/db/queries/storeInfoQueries";
import type { FastifyInstance } from "fastify";

export async function publicStoreInfoRoutes(
    app: FastifyInstance
): Promise<void> {
    app.get("/store-info", async () => {
        return getStoreInfoUncached();
    });
}
