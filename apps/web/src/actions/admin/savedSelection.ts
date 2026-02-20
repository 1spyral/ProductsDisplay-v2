"use server";

import {
    createSavedSelection,
    deleteSavedSelection,
    getSavedSelectionProductIds,
    getSavedSelections,
    updateSavedSelection,
} from "@/db/queries/savedSelectionQueries";
import logger from "@/lib/logger";
import { requireAdminAuth } from "./auth";
import { checkRateLimit } from "./rateLimit";

export async function getAdminSavedSelections() {
    await requireAdminAuth();
    await checkRateLimit("getAdminSavedSelections", 100, 15 * 60 * 1000);

    try {
        return await getSavedSelections();
    } catch (error) {
        logger.error({ error }, "Failed to fetch saved selections");
        throw new Error("Failed to fetch saved selections");
    }
}

export async function getAdminSavedSelectionProductIds(selectionId: string) {
    await requireAdminAuth();
    await checkRateLimit(
        "getAdminSavedSelectionProductIds",
        100,
        15 * 60 * 1000
    );

    try {
        return await getSavedSelectionProductIds(selectionId);
    } catch (error) {
        logger.error({ error }, "Failed to fetch saved selection product IDs");
        throw new Error("Failed to fetch saved selection product IDs");
    }
}

export async function createAdminSavedSelection(
    name: string,
    productIds: string[]
) {
    await requireAdminAuth();
    await checkRateLimit("createAdminSavedSelection", 30, 15 * 60 * 1000);

    try {
        if (!name.trim()) {
            throw new Error("Selection name cannot be empty");
        }
        if (name.length > 255) {
            throw new Error("Selection name too long (max 255 characters)");
        }

        const id = await createSavedSelection(name.trim(), productIds);
        return { success: true, id };
    } catch (error) {
        logger.error({ error }, "Failed to create saved selection");
        if (error instanceof Error) {
            throw new Error(error.message);
        }
        throw new Error("Failed to create saved selection");
    }
}

export async function updateAdminSavedSelection(
    selectionId: string,
    name: string,
    productIds: string[]
) {
    await requireAdminAuth();
    await checkRateLimit("updateAdminSavedSelection", 30, 15 * 60 * 1000);

    try {
        if (!name.trim()) {
            throw new Error("Selection name cannot be empty");
        }
        if (name.length > 255) {
            throw new Error("Selection name too long (max 255 characters)");
        }

        await updateSavedSelection(selectionId, name.trim(), productIds);
        return { success: true };
    } catch (error) {
        logger.error({ error }, "Failed to update saved selection");
        if (error instanceof Error) {
            throw new Error(error.message);
        }
        throw new Error("Failed to update saved selection");
    }
}

export async function deleteAdminSavedSelection(selectionId: string) {
    await requireAdminAuth();
    await checkRateLimit("deleteAdminSavedSelection", 30, 15 * 60 * 1000);

    try {
        await deleteSavedSelection(selectionId);
        return { success: true };
    } catch (error) {
        logger.error({ error }, "Failed to delete saved selection");
        throw new Error("Failed to delete saved selection");
    }
}
