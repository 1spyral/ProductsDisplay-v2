"use client";

import { useState } from 'react';

export default function Searchbar() {
    const [query, setQuery] = useState('');

    const handleSearch = () => {
        window.location.href = `/search?query=${query}`;
    };

    const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            handleSearch();
        }
    };

    return (
        <div className="px-16">
            <h1 className="font-bold mt-8 mb-4"></h1>
            <div className="flex">
                <input 
                    type="text" 
                    className="border p-2 flex-grow rounded" 
                    placeholder="Search..." 
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyPress}
                />
                <button 
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ml-2" 
                    onClick={handleSearch}
                >
                    Search
                </button>
            </div>
        </div>
    );
}