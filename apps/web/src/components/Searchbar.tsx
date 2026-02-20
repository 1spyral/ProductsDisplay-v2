"use client";

import { useRouter } from "next/navigation";
import React, { useRef } from "react";

export default function Searchbar() {
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const navigateToSearch = (query: string) => {
    if (query.trim()) {
      router.push(`/search?query=${encodeURIComponent(query)}`);
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    navigateToSearch(inputRef.current?.value ?? "");
  };

  return (
    <div className="w-full">
      <div className="border-3 border-gray-400 bg-white p-1">
        <form
          className="flex flex-col gap-0 sm:flex-row"
          onSubmit={handleSubmit}
        >
          <input
            ref={inputRef}
            type="text"
            className="flex-1 border-0 border-b-2 border-gray-300 px-4 py-4 text-lg text-gray-900 placeholder-gray-600 focus:border-slate-700 focus:outline-none sm:border-r-2 sm:border-b-0"
            placeholder="Search for products..."
          />
          <button
            type="submit"
            className="bg-slate-700 px-8 py-4 text-lg font-bold tracking-wide text-white uppercase transition-colors duration-200 hover:bg-slate-900"
          >
            Search
          </button>
        </form>
      </div>
    </div>
  );
}
