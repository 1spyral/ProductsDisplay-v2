import Icon from "@/components/Icon";
import ChevronLeftIcon from "@material-symbols/svg-400/rounded/chevron_left.svg";
import ChevronRightIcon from "@material-symbols/svg-400/rounded/chevron_right.svg";
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
        <Icon component={ChevronLeftIcon} size={28} className="h-7 w-7" />
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
        <Icon component={ChevronRightIcon} size={28} className="h-7 w-7" />
      </button>
    </>
  );
}
