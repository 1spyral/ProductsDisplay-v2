import Fuse, { FuseResult } from "fuse.js";

import { fetchData } from "./data";
import { Product } from "@/types/Product";

export default async function search(query = "", category: string[] = []) {
    let data = await fetchData();
    
    // Configure Fuse.js
    const options = {
        keys: ['name', 'description', 'category'],
        threshold: 0.3
    };

    if (category.length > 0) {
        data = data.filter(product => category.includes(product.category));
    }
    if (query) {
        const fuse = new Fuse<Product>(data, options);
        
        data = fuse.search(query).map((result: FuseResult<Product>) => result.item);
    }

    return data;
}