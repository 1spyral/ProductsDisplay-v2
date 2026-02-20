import { db } from "@/db/drizzle";
import { storeInfo } from "@/db/schema";
import type { StoreInfoDto } from "@productsdisplay/contracts";
import { eq } from "drizzle-orm";

type CompleteStoreInfo = StoreInfoDto & {
    name: string;
    headline: string;
    description: string;
    copyright: string;
};

export async function getStoreInfoUncached(): Promise<CompleteStoreInfo> {
    const row = await db
        .select({
            id: storeInfo.id,
            name: storeInfo.name,
            headline: storeInfo.headline,
            description: storeInfo.description,
            copyright: storeInfo.copyright,
            backgroundImageUrl: storeInfo.backgroundImageUrl,
        })
        .from(storeInfo)
        .where(eq(storeInfo.id, 1))
        .limit(1)
        .then((rows) => rows[0] || null);

    if (!row) {
        throw new Error(
            "Store info not found (expected row id=1 in store_info)."
        );
    }

    if (!row.name || !row.headline || !row.description || !row.copyright) {
        throw new Error(
            "Store info is incomplete (name, headline, description, and copyright are required)."
        );
    }

    return {
        ...row,
        name: row.name,
        headline: row.headline,
        description: row.description,
        copyright: row.copyright,
    };
}
