import * as fs from "fs";
import * as path from "path";
import { Product } from "@/types/Product";
import { Photo } from "@/types/Photo";

const PATH = "public/data/images/"
const OUTPUT_PATH = "/data/images/"
const EXTENSIONS = [".png", ".jpg", ".jpeg", ".gif"]

function isImage(filePath: string) {
    const ext = path.extname(filePath).toLowerCase();
    return EXTENSIONS.includes(ext);
}

function getPaths(id: string) {
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

function buildPhoto(id: string, filePath: string, name: string, index: number): Photo {
    return {
        id: id,
        path: filePath.replaceAll("\\", "/"),
        alt: `${name} ${index + 1}`
    };
}

export default function getPhotos({ id, name }: Product) {
    const photos: Photo[] = [];

    const paths = getPaths(id);
    for (let i = 0; i < paths.length; i++) {
        photos.push(buildPhoto(id, paths[i], name, i));
    }

    return photos;
}