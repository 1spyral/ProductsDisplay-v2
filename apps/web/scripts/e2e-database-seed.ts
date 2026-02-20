import { db } from "@/db/drizzle";
import { storeInfo } from "@/db/schema";

// Keep this script as the single e2e DB seeding entrypoint.
// Add additional inserts/upserts here as future e2e seed data is needed.
await db
    .insert(storeInfo)
    .values({
        id: 1,
        name: "Products Display",
        headline: "Product Catalog",
        description: "Browse our inventory.",
        copyright: "Products Display",
        backgroundImageUrl: null,
    })
    .onConflictDoNothing({ target: storeInfo.id });
