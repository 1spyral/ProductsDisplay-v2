import React from "react";

export default function Dot({
  dotIndex,
  index,
  setIndex,
}: {
  dotIndex: number;
  index: number;
  setIndex: (index: number) => void;
}) {
  return (
    <button
      type="button"
      className={`m-1 inline-block h-2.5 w-2.5 cursor-pointer rounded-full ${dotIndex === index ? "bg-black opacity-100" : "bg-slate-500 opacity-30"} transition-opacity duration-300 ease-in-out`}
      onClick={(e: React.MouseEvent) => {
        setIndex(dotIndex);
        e.preventDefault();
      }}
      aria-label={`Go to image ${dotIndex + 1}`}
    />
  );
}
