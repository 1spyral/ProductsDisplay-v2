import ProductPage from "@/components/Product/ProductPage";
// import { getProducts } from "@/db/queries";

export const revalidate = 43200;

export const dynamicParams = true;

// export async function generateStaticParams() {
//     const data = await getProducts();
//
//     return data.map(product => ({
//         id: product.id
//     }));
// }

export default async function ProductItemPage({ params }: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    return (
        <ProductPage id={id} />
    );
}