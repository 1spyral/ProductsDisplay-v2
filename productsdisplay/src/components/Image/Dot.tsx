"use client";

export default function Dot({ dotIndex, index, setIndex }: { dotIndex: number, index: number, setIndex: (index: number) => void }) {
    return (
        <div className={`inline-block w-2.5 h-2.5 m-1 ${dotIndex === index ? "opacity-100 bg-black" : "bg-slate-500 opacity-30"} rounded-full cursor-pointer transition-opacity ease-in-out duration-0.3`} onClick={() => setIndex(dotIndex)}></div>
    );
}