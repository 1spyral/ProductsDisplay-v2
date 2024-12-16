"use client";

import { useState } from "react";
import ImageWheel from "./ImageWheel";
import ImageControls from "./ImageControls";
import Dots from "./Dots";

export default function ImageCarousel({ photos }: { photos: Photo[] }) {
    const [index, setIndex] = useState(0);

    return (
        <>
            <div className="relative w-full h-32">
                <ImageWheel photos={photos} index={index} />
                {photos.length > 1 && (
                    <ImageControls index={index} setIndex={setIndex} length={photos.length} />
                )}
            </div>
            {photos.length > 1 && (
                <Dots length={photos.length} index={index} setIndex={setIndex} />
            )}
        </>
    );
}