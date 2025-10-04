import Link from "next/link";

export default function Navbar() {
  const name = process.env.NAME;

  return (
    <header className="bg-slate-800 border-b-4 border-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-5">
        <Link
          href="/"
          className="text-white text-2xl sm:text-3xl font-bold hover:text-gray-300 transition-colors duration-200 uppercase tracking-wide"
        >
          {name}
        </Link>
      </div>
    </header>
  );
}
