import ProductList from "@/components/Product/ProductList";
import { Product } from "@/types/Product";
import search from "@/utils/search";

type SearchParams = { [key: string]: string | string[] | undefined }

export default async function SearchResultsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
    const query = (await searchParams).query;

    const searchQuery = Array.isArray(query) ? query.join(" ") : query || "";

    const products: Product[] = await search(searchQuery);

    return (
        <>
            <h1 className="text-2xl font-bold mb-4 px-20">Search for {query}</h1>
            <div className="w-full flex justify-center">
                <ProductList products={products} />
            </div>
        </>
    );
}