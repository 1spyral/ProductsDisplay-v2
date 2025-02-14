import React from "react";

export default function Dot({ dotIndex, index, setIndex }: { dotIndex: number, index: number, setIndex: (index: number) => void }) {
    return (
        <div
            className={`
                inline-block 
                w-2.5 
                h-2.5 
                m-1 
                rounded-full 
                cursor-pointer 
                ${dotIndex === index ? "bg-black opacity-100" : "bg-slate-500 opacity-30"} 
                transition-opacity 
                ease-in-out 
                duration-300
            `}
            onClick={(e: React.MouseEvent) => {
                setIndex(dotIndex);
                e.preventDefault();
            }}
        />
    );
}