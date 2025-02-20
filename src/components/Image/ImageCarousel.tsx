"use client";

import { useState } from "react";
import ImageWheel from "./ImageWheel";
import Arrows from "./Arrows";
import Dots from "./Dots";
import Photo from "@/types/Photo";

interface ImageCarouselProps {
    photos: Photo[];
}

export default function ImageCarousel({ photos }: ImageCarouselProps) {
    const [index, setIndex] = useState(0);

    return (
        <div className="relative w-full h-full flex flex-col">
            <div className="relative w-full h-full flex justify-center items-center">
                <ImageWheel photos={photos} index={index} />
                {photos.length > 1 && (
                    <Arrows index={index} setIndex={setIndex} length={photos.length} />
                )}
            </div>
            {photos.length > 1 && (
                <Dots length={photos.length} index={index} setIndex={setIndex} />
            )}
        </div>
    );
}