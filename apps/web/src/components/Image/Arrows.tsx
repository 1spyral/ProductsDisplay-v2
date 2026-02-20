import React from "react";

export default function Arrows({
  index,
  setIndex,
  length,
}: {
  index: number;
  setIndex: (index: number) => void;
  length: number;
}) {
  return (
    <>
      {/* Left Arrow */}
      <button
        className="absolute inset-y-1/2 left-2 flex h-12 w-12 -translate-y-1/2 cursor-pointer items-center justify-center border-3 border-gray-900 bg-slate-700 text-white opacity-30 transition-opacity duration-200 hover:opacity-100"
        onClick={(e: React.MouseEvent) => {
          setIndex((index - 1 + length) % length);
          e.preventDefault();
        }}
        aria-label="Previous image"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          className="h-7 w-7"
        >
          <path
            strokeLinecap="square"
            strokeLinejoin="miter"
            strokeWidth={3}
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>

      {/* Right Arrow */}
      <button
        className="absolute inset-y-1/2 right-2 flex h-12 w-12 -translate-y-1/2 cursor-pointer items-center justify-center border-3 border-gray-900 bg-slate-700 text-white opacity-30 transition-opacity duration-200 hover:opacity-100"
        onClick={(e: React.MouseEvent) => {
          setIndex((index + 1) % length);
          e.preventDefault();
        }}
        aria-label="Next image"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          className="h-7 w-7"
        >
          <path
            strokeLinecap="square"
            strokeLinejoin="miter"
            strokeWidth={3}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>
    </>
  );
}
