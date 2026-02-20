"use server";

import { apiJsonRequest } from "@/lib/api/client";
import type { SavedSelectionOverviewDto } from "@productsdisplay/contracts";

export type SavedSelectionOverview = SavedSelectionOverviewDto;

export async function getSavedSelections(): Promise<SavedSelectionOverview[]> {
    return apiJsonRequest<SavedSelectionOverview[]>("/admin/saved-selections", {
        forwardCookies: true,
    });
}

export async function getSavedSelectionProductIds(
    selectionId: string
): Promise<string[]> {
    const result = await apiJsonRequest<{ productIds: string[] }>(
        `/admin/saved-selections/${encodeURIComponent(selectionId)}/product-ids`,
        {
            forwardCookies: true,
        }
    );
    return result.productIds;
}

export async function createSavedSelection(
    name: string,
    productIds: string[]
): Promise<string> {
    const result = await apiJsonRequest<{ success: boolean; id: string }>(
        "/admin/saved-selections",
        {
            method: "POST",
            body: JSON.stringify({ name, productIds }),
            forwardCookies: true,
        }
    );
    return result.id;
}

export async function updateSavedSelection(
    selectionId: string,
    name: string,
    productIds: string[]
): Promise<void> {
    await apiJsonRequest<{ success: boolean }>(
        `/admin/saved-selections/${encodeURIComponent(selectionId)}`,
        {
            method: "PATCH",
            body: JSON.stringify({ name, productIds }),
            forwardCookies: true,
        }
    );
}

export async function deleteSavedSelection(selectionId: string): Promise<void> {
    await apiJsonRequest<{ success: boolean }>(
        `/admin/saved-selections/${encodeURIComponent(selectionId)}`,
        {
            method: "DELETE",
            forwardCookies: true,
        }
    );
}
