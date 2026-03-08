"use server";

import type { OrderOverviewDto } from "@productsdisplay/contracts";
import { apiJsonRequest } from "@/lib/api/client";

export type OrderOverview = OrderOverviewDto;

export async function getAdminOrders(): Promise<OrderOverview[]> {
    return apiJsonRequest<OrderOverview[]>("/admin/orders", {
        forwardCookies: true,
    });
}
