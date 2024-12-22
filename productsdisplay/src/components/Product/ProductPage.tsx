import { getPhotos } from "@/utils/photo";
import { fetchData } from "@/utils/data";
import { Product } from "@/types/Product";
import ImageCarousel from "@/components/Image/ImageCarousel";

export default async function ProductPage({ id }: { 
    id: string; 
}) {
    const product: Product | undefined = (await fetchData()).find((product) => product.id === id);

    if (product === undefined) {
        return <div>Product not found</div>;
    }

    return (
        <div className="flex flex-col md:flex-row w-full h-full flex-grow overflow-hidden">
            <div className="w-full md:w-1/2 md:h-full h-1/2 p-4">
                <ImageCarousel photos={await getPhotos(product)} />
            </div>
            <div className="w-full md:w-1/2 md:h-full h-1/2 p-4 flex flex-col">
                <div className="flex-grow overflow-y-auto scrollbar-hide">
                    <div className="mt-4">
                        <h1 className="text-2xl font-bold mb-4">{product.name}</h1>
                        <p className="mb-4">{product.description}</p>
                        <p className="text-gray-600 mb-4">{product.category}</p>
                    </div>
                    <div className="sticky bottom-0 left-0 w-full h-16 bg-gradient-to-t from-white to-transparent pointer-events-none"></div>
                </div>
            </div>
        </div>
    );
}