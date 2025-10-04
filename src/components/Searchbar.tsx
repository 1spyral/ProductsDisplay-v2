"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function Searchbar() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSearch = () => {
    if (query.trim()) {
      router.push(`/search?query=${encodeURIComponent(query)}`);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="w-full">
      <div className="bg-white border-3 border-gray-400 p-1">
        <div className="flex flex-col sm:flex-row gap-0">
          <input
            type="text"
            className="flex-1 px-4 py-4 text-lg text-gray-900 placeholder-gray-600 border-0 border-b-2 sm:border-b-0 sm:border-r-2 border-gray-300 focus:outline-none focus:border-slate-700"
            placeholder="Search for products..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyPress}
          />
          <button
            className="bg-slate-700 hover:bg-slate-900 text-white font-bold py-4 px-8 text-lg uppercase tracking-wide transition-colors duration-200"
            onClick={handleSearch}
          >
            Search
          </button>
        </div>
      </div>
    </div>
  );
}
