"use client";

import { useRouter } from "next/navigation";
import React from "react";

export default function ProductModal({ children }: { children: React.ReactNode }) {
    const router = useRouter();

    const handleClose = () => {
        router.back();
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
            <div className="relative bg-white w-[90%] h-[90%] sm:w-4/5 sm:h-4/5 sm:p-6 rounded-lg shadow-xl">
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 text-gray-600 hover:text-red-500 focus:outline-hidden transition-colors duration-75 z-100"
                    aria-label="Close Modal"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 hover:stroke-2 transition-stroke duration-75"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                        />
                    </svg>
                </button>
                <div className="h-full overflow-auto">
                    {children}
                </div>
            </div>
        </div>
    );
}