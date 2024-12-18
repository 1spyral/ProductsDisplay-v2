import ProductBox from "./ProductBox";
import { Product } from "@/types/Product";

export default function ProductList({ products }: { products: Product[] }) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-4/5">
            {products.map(product => (
                <ProductBox key={product.id} product={product}></ProductBox>
            ))}
        </div>
    );
}