import fetchData from "@/utils/data";

export default async function Page() {
    const data = await fetchData();

    return (
        <div>
            {data.map(product => JSON.stringify(product))}
        </div>
    );
}