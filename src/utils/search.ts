"use server";

import { getProducts } from "@/db/queries/productQueries";
import Product from "@/types/Product";
import Fuse, { FuseResult } from "fuse.js";

let data = await getProducts();

// Configure Fuse.js
const options = {
    keys: ["id", "name", "description", "category"],
    threshold: 0.3,
};

const fuse = new Fuse<Product>(data, options);

async function search(query = "") {
    if (query) {
        data = fuse
            .search(query)
            .map((result: FuseResult<Product>) => result.item);
    }

    return data;
}

export default search;
