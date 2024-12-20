import * as path from "path";
import { Product } from "@/types/Product";
import { Photo } from "@/types/Photo";

import * as fs from "fs";
import { unstable_cache as cache } from "next/cache";

const PATH = "public/data/images/"
const OUTPUT_PATH = "/data/images/"
const EXTENSIONS = [".png", ".jpg", ".jpeg", ".gif"]

function isImage(filePath: string) {
    const ext = path.extname(filePath).toLowerCase();
    return EXTENSIONS.includes(ext);
}

function getPaths(id: string) {
    try {
        const paths: string[] = [];

        const dir = PATH + id;

        // Read the contents of the directory
        const files = fs.readdirSync(dir);

        files.forEach(file => {
            const filePath = path.join(OUTPUT_PATH, id, file);

            if (isImage(filePath)) {
                paths.push(filePath);
            }
        })

        paths.sort();
        return paths;
    } 
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    catch (error) {
        return [];
    }
}

function buildPhoto(id: string, filePath: string, name: string, index: number): Photo {
    return {
        id: id,
        path: filePath.replaceAll("\\", "/"),
        alt: `${name} ${index + 1}`
    };
}

export const getPhotos = cache(async ({ id, name }: Product) => {
    console.log(`Getting photos for ${id}`)

    const photos: Photo[] = [];

    const paths = getPaths(id);
    for (let i = 0; i < paths.length; i++) {
        photos.push(buildPhoto(id, paths[i], name, i));
    }

    return photos;
}, ["photos"], { revalidate: 60, tags: ["photos"] });