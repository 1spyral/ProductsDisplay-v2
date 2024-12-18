export default async function ProductPage({ id }: { 
    id: string; 
}) {
    return (
        <h1>Product {id}</h1>
    );
}