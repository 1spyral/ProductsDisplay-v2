import Dot from "./Dot";


export default function Dots({ length, index, setIndex }: { length: number, index: number, setIndex: (index: number) => void }) {
    return (
        <div className="flex justify-center items-center text-center p-2.5">
            {Array.from({ length }).map((_, i) => <Dot key={i} dotIndex={i} index={index} setIndex={setIndex}></Dot>)}
        </div>
    )
}