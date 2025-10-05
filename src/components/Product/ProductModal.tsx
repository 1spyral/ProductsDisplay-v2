"use client";

import { useRouter } from "next/navigation";
import React from "react";

export default function ProductModal({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const handleClose = () => {
    router.back();
  };

  return (
    // Click outside backdrop to close
    <div
      className="fixed inset-0 bg-black/70 flex justify-center items-center z-50 p-4"
      onClick={handleClose}
    >
      <div
        className="relative bg-white w-full h-full max-w-7xl border-4 border-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleClose}
          className="absolute top-0 right-0 bg-slate-800 hover:bg-red-700 text-white font-bold px-6 py-4 transition-colors duration-200 z-50 border-l-4 border-b-4 border-slate-900"
          aria-label="Close Modal"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={3}
          >
            <path
              strokeLinecap="square"
              strokeLinejoin="miter"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
        <div className="h-full overflow-auto">{children}</div>
      </div>
    </div>
  );
}
