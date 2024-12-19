"use cache";

import Fuse, { FuseResult } from "fuse.js";
import { Product } from "@/types/Product";

export default async function search(data: Product[], query = "", category: string[] = []) {
    // Configure Fuse.js
    const options = {
        keys: ['name', 'description', 'category'],
        threshold: 0.3
    };

    if (category) {
        data = data.filter(product => category.includes(product.category));
    }
    if (query) {
        const fuse = new Fuse<Product>(data, options);

        data = fuse.search(query).map((result: FuseResult<Product>) => result.item);
    }

    return data;
}