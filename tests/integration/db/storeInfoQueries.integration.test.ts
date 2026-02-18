import { db } from "@/db/drizzle";
import { getStoreInfo } from "@/db/queries/storeInfoQueries";
import { storeInfo } from "@/db/schema";
import { describe, expect, test } from "bun:test";
import { resetTestDatabase } from "./helpers";

describe("storeInfoQueries (integration)", () => {
    test("getStoreInfo seeds a default store row when table is empty", async () => {
        await resetTestDatabase();

        const info = await getStoreInfo();

        expect(info).toEqual({
            id: 1,
            name: "Store",
            headline: null,
            description: null,
            copyright: "© 2026 Store",
            backgroundImageUrl: null,
        });

        const rows = await db.select().from(storeInfo);
        expect(rows).toHaveLength(1);
        expect(rows[0]?.id).toBe(1);
    });
});
