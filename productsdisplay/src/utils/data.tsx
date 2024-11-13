import { promises as fs } from "fs";
import { parse } from "@vanillaes/csv";

export default async function fetchData() {
    const file = (await fs.readFile("public/data/data.csv", "utf8")).toString();
    const parsedData = parse(file);
    const data: Product[] = [];
    
    for (const product of parsedData) {
        data.push({
            id: product[0],
            name: product[1],
            description: product[2],
            category: product[3]
        });
    }
    
    return data;
}