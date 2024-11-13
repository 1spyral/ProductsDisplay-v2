"use client";

import { Fragment, useState } from "react";
import ImageWheel from "./ImageWheel";
import Dots from "./Dots";

export default function ImageCarousel({ photos }: { photos: Photo[]}) {
    const [index, setIndex] = useState(0);

    return (
        <Fragment>
            <div className="h-full w-full">
                <ImageWheel photos={photos} index={index}></ImageWheel>
            </div>
            <button className="" onClick={() => setIndex((index - 1) % photos.length)}>&#10094;</button>
            <button className="" onClick={() => setIndex((index + 1) % photos.length)}>&#10095;</button>
            <Dots length={photos.length} index={index} setIndex={setIndex}></Dots>
        </Fragment>
    );
}