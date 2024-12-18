"use client";

import { useState } from "react";
import ImageWheel from "./ImageWheel";
import Arrows from "./Arrows";
import Dots from "./Dots";
import { Photo } from "@/types/Photo";

export default function ImageCarousel({ photos }: { photos: Photo[] }) {
    const [index, setIndex] = useState(0);

    return (
        <>
            <div className="relative w-full h-32">
                <ImageWheel photos={photos} index={index} />
                {photos.length > 1 && (
                    <Arrows index={index} setIndex={setIndex} length={photos.length} />
                )}
            </div>
            {photos.length > 1 && (
                <Dots length={photos.length} index={index} setIndex={setIndex} />
            )}
        </>
    );
}