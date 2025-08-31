"use server";

import Fuse, { FuseResult } from "fuse.js"
import Product from"@/types/Product"
import { getProducts } from "@/db/queries/productQueries"
// import { unstable_cache as cache } from "next/cache"

let data = await getProducts()

// Configure Fuse.js
const options = {
    keys: ['name', 'description', 'category'],
    threshold: 0.3
}

const fuse = new Fuse<Product>(data, options)

async function search(query = "") {
    if (query) {
        data = fuse.search(query).map((result: FuseResult<Product>) => result.item)
    }

    return data;
}

// export default cache(
//     search,
//     ["search"],
//     { revalidate: 43200, tags: ["search"] }
// )
export default search