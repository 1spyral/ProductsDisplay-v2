import { Product } from "@/types/Product";
import { Photo } from "@/types/Photo";

import { unstable_cache as cache } from "next/cache";

const EXTENSIONS = [".png", ".jpg", ".jpeg", ".gif"]

async function getPaths(id: string) {
    try {
        const paths: string[] = [];

        const dir = process.env.IMAGE_PATH + id + "/";
        let i = 1;
        while (true) {
            let found = false;
            for (const ext of EXTENSIONS) {
                const filePath = dir + i + ext;
                try {
                    const response = await fetch(filePath);
                    if (response.status === 200) {
                        paths.push(filePath);
                        found = true;
                    }
                } catch (error) {
                    console.error("Error fetching " + filePath, error);
                }
            }
            if (!found) {
                break;
            }
            i++;
        }
        paths.sort();
        return paths;
    } 
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    catch (error) {
        console.error("Error getting photos for " + id);
        return [];
    }
}

function buildPhoto(id: string, filePath: string, name: string, index: number): Photo {
    return {
        id: id,
        path: filePath,
        alt: `${name} ${index + 1}`
    };
}

export const getPhotos = cache(async ({ id, name }: Product) => {    
    // console.log(`Getting photos for ${id}`)

    const photos: Photo[] = [];

    const paths = await getPaths(id);
    for (let i = 0; i < paths.length; i++) {
        photos.push(buildPhoto(id, paths[i], name || "", i));
    }

    return photos;
}, ["photos"], { revalidate: 43200, tags: ["photos"] });