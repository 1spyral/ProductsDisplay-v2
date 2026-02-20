import postgres from "postgres";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    throw new Error("Missing DATABASE_URL");
}

const sql = postgres(connectionString, {
    prepare: false,
    max: 1,
});

try {
    await sql`
        insert into store_info (id, name, headline, description, copyright, background_image_url)
        values (1, 'Products Display', 'Product Catalog', 'Browse our inventory.', 'Products Display', null)
        on conflict (id) do nothing
    `;
} finally {
    await sql.end();
}
