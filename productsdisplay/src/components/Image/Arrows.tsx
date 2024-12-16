export default function Arrows({ index, setIndex, length }: { index: number, setIndex: (index: number) => void, length: number }) {
    return (
        <>
            <button
                className="
                    absolute inset-y-1/2 -translate-y-1/2
                    p-2.5 w-8 h-12
                    cursor-pointer
                    opacity-20 hover:opacity-70 transition-opacity
                    text-2xl text-white
                    bg-black
                    flex items-center justify-center
                "
                onClick={(e: React.MouseEvent) => {
                    setIndex((index - 1 + length) % length);
                    e.preventDefault();
                }}
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={6} d="M15 19l-7-7 7-7" />
                </svg>
            </button>
            <button
                className="
                    absolute inset-y-1/2 -translate-y-1/2 right-0
                    p-2.5 w-8 h-12
                    cursor-pointer
                    opacity-20 hover:opacity-70 transition-opacity
                    text-2xl text-white
                    bg-black
                    flex items-center justify-center
                "
                onClick={(e: React.MouseEvent) => {
                    setIndex((index + 1) % length);
                    e.preventDefault();
                }}
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={6} d="M9 5l7 7-7 7" />
                </svg>
            </button>
        </>
    );
}