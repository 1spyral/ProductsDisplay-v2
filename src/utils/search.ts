import Fuse, { FuseResult } from "fuse.js"
import { Product } from "@/types/Product"
import { getProducts } from "@/db/queries"
import { unstable_cache as cache } from "next/cache"

async function search(query = "", category: string[] = []) {
    let data = await getProducts();

    // Configure Fuse.js
    const options = {
        keys: ['name', 'description', 'category'],
        threshold: 0.3
    }

    if (category.length > 0) {
        data = data.filter(product => category.includes(product.category || ""))
    }
    if (query) {
        const fuse = new Fuse<Product>(data, options);

        data = fuse.search(query).map((result: FuseResult<Product>) => result.item)
    }

    return data;
}

export default cache(
    search,
    ["search"],
    { revalidate: 43200, tags: ["search"] }
)
