import getPhotos from "@/utils/photo";
import ImageCarousel from "./Image/ImageCarousel";

function shortenDescription(description: String): String {
    if (description.length > 100) {
        return description.substring(0, 99) + "...";
    }
    return description;
}

export default function ProductBox({ product }: { product: Product }) {
    const photos = getPhotos(product);

    return (
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
            <ImageCarousel photos={photos}></ImageCarousel>
            <h1 className="text-xl font-bold p-2.5 text-center">{product.name}</h1>
            <p className="italic text-center">{shortenDescription(product.description)}</p>
            <p className="text-center">{product.category}</p>
        </div>
    );
}