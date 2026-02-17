import { getStoreInfo } from "@/db/queries/storeInfoQueries";
import Link from "next/link";
import NavbarCart from "./NavbarCart";

export default async function Navbar() {
  const store = await getStoreInfo();
  const name = store.name || "Store";

  return (
    <header className="border-b-4 border-slate-900 bg-slate-800">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-8">
        <Link
          href="/"
          className="text-2xl font-bold tracking-wide text-white uppercase transition-colors duration-200 hover:text-gray-300 sm:text-3xl"
        >
          {name}
        </Link>
        <NavbarCart />
      </div>
    </header>
  );
}
