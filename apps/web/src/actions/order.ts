"use server";

import type {
    CreateOrderRequestDto,
    CreateOrderResponseDto,
} from "@productsdisplay/contracts";
import { apiJsonRequest } from "@/lib/api/client";

export async function submitOrder(
    payload: CreateOrderRequestDto
): Promise<CreateOrderResponseDto> {
    return apiJsonRequest<CreateOrderResponseDto>("/orders", {
        method: "POST",
        body: JSON.stringify(payload),
    });
}
