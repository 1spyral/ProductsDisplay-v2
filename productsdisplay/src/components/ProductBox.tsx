import getPhotos from "@/utils/photo";
import ImageCarousel from "./Image/ImageCarousel";

export default function ProductBox({ product }: { product: Product }) {
    const photos = getPhotos(product);

    return (
        <div>
            <h1>{product.name}</h1>
            <p>{product.description}</p>
            <p>{product.category}</p>
            <ImageCarousel photos={photos}></ImageCarousel>
        </div>
    );
}