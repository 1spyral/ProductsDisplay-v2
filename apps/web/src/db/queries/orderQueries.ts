"use server";

import { apiJsonRequest } from "@/lib/api/client";
import type { OrderOverviewDto } from "@productsdisplay/contracts";

export type OrderOverview = OrderOverviewDto;

export async function getAdminOrders(): Promise<OrderOverview[]> {
    return apiJsonRequest<OrderOverview[]>("/admin/orders", {
        forwardCookies: true,
    });
}
