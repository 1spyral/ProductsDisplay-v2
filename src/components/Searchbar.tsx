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
      <div className="flex flex-col sm:flex-row items-center gap-2">
        <input
          type="text"
          className="border p-2 w-full rounded-sm"
          placeholder="Search..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyPress}
        />
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-sm sm:ml-2"
          onClick={handleSearch}
        >
          Search
        </button>
      </div>
    </div>
  );
}
