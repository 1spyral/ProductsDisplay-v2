"use server";

import { getAdminOrders as getAdminOrdersQuery } from "@/db/queries/orderQueries";
import logger from "@/lib/logger";
import { checkRateLimit } from "./rateLimit";

export async function getAdminOrders() {
    await checkRateLimit("getAdminOrders", 100, 15 * 60 * 1000);

    try {
        return await getAdminOrdersQuery();
    } catch (error) {
        logger.error({ error }, "Failed to fetch orders");
        throw new Error("Failed to fetch orders");
    }
}
