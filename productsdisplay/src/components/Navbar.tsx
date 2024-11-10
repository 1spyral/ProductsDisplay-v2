import Link from "next/link";

export default function Navbar() {
    const name = process.env.NAME;

    return (
        <header className="bg-gray-200 p-2.5">
            <Link href="/" className="text-black text-2xl font-bold">{name}</Link>
        </header>
    );
}