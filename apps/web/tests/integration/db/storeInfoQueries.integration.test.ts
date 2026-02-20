import { db } from "@/db/drizzle";
import { getStoreInfoUncached } from "@/db/queries/storeInfoQueries";
import { storeInfo } from "@/db/schema";
import { describe, expect, test } from "bun:test";
import { resetTestDatabase } from "./helpers";

describe("storeInfoQueries (integration)", () => {
    test("getStoreInfo throws when store_info is empty", async () => {
        await resetTestDatabase();

        await expect(getStoreInfoUncached()).rejects.toThrow(
            "Store info not found (expected row id=1 in store_info)."
        );

        const rows = await db.select().from(storeInfo);
        expect(rows).toHaveLength(0);
    });

    test("getStoreInfo throws when required fields are missing", async () => {
        await resetTestDatabase();

        await db.insert(storeInfo).values({
            id: 1,
            name: "My Store",
            headline: null,
            description: "desc",
            copyright: "copyright",
            backgroundImageUrl: null,
        });

        await expect(getStoreInfoUncached()).rejects.toThrow(
            "Store info is incomplete (name, headline, description, and copyright are required)."
        );
    });
});
