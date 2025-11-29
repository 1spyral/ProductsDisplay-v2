"use client";

import { useState } from "react";
import ImageWheel from "./ImageWheel";
import Arrows from "./Arrows";
import Dots from "./Dots";
import Photo from "@/types/Photo";
import ZoomImageWheel from "@/components/Image/ZoomImageWheel";

interface ImageCarouselProps {
  photos: Photo[];
  zoom?: boolean;
}

export default function ImageCarousel({ photos, zoom }: ImageCarouselProps) {
  const [index, setIndex] = useState(0);

  return (
    <div className="relative flex h-full w-full flex-col">
      <div className="relative flex h-full w-full items-center justify-center">
        {zoom ? (
          <ZoomImageWheel photos={photos} index={index} setIndex={setIndex} />
        ) : (
          <ImageWheel photos={photos} index={index} />
        )}
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
