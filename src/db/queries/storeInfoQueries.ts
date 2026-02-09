"use server";

import { db } from "@/db/drizzle";
import { storeInfo } from "@/db/schema";
import StoreInfo from "@/types/StoreInfo";
import { eq } from "drizzle-orm";
import { cache } from "react";

export const getStoreInfo = cache(async (): Promise<StoreInfo> => {
    const row = await db
        .select({
            id: storeInfo.id,
            name: storeInfo.name,
            headline: storeInfo.headline,
            description: storeInfo.description,
            copyright: storeInfo.copyright,
        })
        .from(storeInfo)
        .where(eq(storeInfo.id, 1))
        .limit(1)
        .then((rows) => rows[0] || null);

    if (row) return row;

    const seeded: StoreInfo = {
        id: 1,
        name: "Store",
        headline: null,
        description: null,
        copyright: "© 2026 Store",
    };

    await db
        .insert(storeInfo)
        .values({
            id: seeded.id,
            name: seeded.name,
            headline: seeded.headline,
            description: seeded.description,
            copyright: seeded.copyright,
        })
        .onConflictDoNothing();

    return seeded;
});
