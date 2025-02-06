import Link from "next/link";

import ImageCarousel from "@/components/Image/ImageCarousel";
import { Product } from "@/types/Product";
import { Photo } from "@/types/Photo";

function shortenDescription(description: string): string {
    if (description.length > 100) {
        return description.substring(0, 99) + "...";
    }
    return description;
}

export default function ProductBox({ product, photos }: { product: Product, photos: Photo[] }) {
    return (
        <Link href={`/product/${product.id}`} scroll={false}>
            <div className="
                flex flex-col 
                m-2 
                p-5
                rounded-lg 
                shadow-lg hover:shadow-xl 
                transition-shadow duration-300
                w-full
                h-96
                sm:h-80
                md:h-96
                lg:h-112
            ">
                <ImageCarousel photos={photos} />
                <div className="flex-grow h-full">
                    <h1 className="text-xl font-bold p-2.5 text-center">{product.name}</h1>
                    <p className="italic text-center">{shortenDescription(product.description || "")}</p>
                    <p className="text-center">{product.category}</p>
                </div>
            </div>
        </Link>
    );
}