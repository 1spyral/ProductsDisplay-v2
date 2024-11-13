import ProductBox from "./ProductBox";

export default function ProductList({ products }: { products: Product[] }) {
    return (
        <div className="flex">
            {products.map(product => <ProductBox product={product}></ProductBox>)}
        </div>
    );
}