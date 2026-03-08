"use server";

import { apiJsonRequest } from "@/lib/api/client";
import type {
    CreateOrderRequestDto,
    CreateOrderResponseDto,
} from "@productsdisplay/contracts";

export async function submitOrder(
    payload: CreateOrderRequestDto
): Promise<CreateOrderResponseDto> {
    return apiJsonRequest<CreateOrderResponseDto>("/orders", {
        method: "POST",
        body: JSON.stringify(payload),
    });
}
