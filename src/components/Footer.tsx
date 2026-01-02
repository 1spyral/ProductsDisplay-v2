import { getStoreInfo } from "@/db/queries/storeInfoQueries";

export default async function Footer() {
  const store = await getStoreInfo();
  const copyright = store.copyright || process.env.COPYRIGHT;

  return (
    <footer className="mt-auto border-t-4 border-slate-900 bg-slate-800 text-white">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-8">
        <div className="text-center">
          <p className="text-base text-gray-200">&copy; {copyright}</p>
        </div>
      </div>
    </footer>
  );
}
