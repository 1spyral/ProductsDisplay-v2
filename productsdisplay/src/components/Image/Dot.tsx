
export default function Dot({ dotIndex, index, setIndex }: { dotIndex: number, index: number, setIndex: (index: number) => void }) {
    return (
        <div className={`inline-block w-2.5 h-2.5 m-1 ${dotIndex === index ? "bg-black" : "bg-slate-500"} rounded-full cursor-pointer opacity-50 transition-opacity ease-in-out duration-0.3`} onClick={() => setIndex(dotIndex)}></div>
    );
}