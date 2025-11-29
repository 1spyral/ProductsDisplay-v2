"use client";

import Image from "next/image";
import Photo from "@/types/Photo";
import React, { useState, useRef, useEffect } from "react";

export default function ZoomImageWheel({
  photos,
  index,
}: {
  photos: Photo[];
  index: number;
}) {
  const [zoom, setZoom] = useState(false);
  const [position, setPosition] = useState({ x: "50%", y: "50%" });
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [showFullscreen, setShowFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Detect if device supports touch
  useEffect(() => {
    setIsTouchDevice("ontouchstart" in window || navigator.maxTouchPoints > 0);
  }, []);

  // Prevent body scroll when fullscreen is open
  useEffect(() => {
    if (showFullscreen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [showFullscreen]);

  // Desktop: hover to zoom, mouse move to pan
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isTouchDevice) return;
    const { left, top, width, height } =
      e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setPosition({ x: `${x}%`, y: `${y}%` });
  };

  // Mobile: tap to open fullscreen
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isTouchDevice) return;
    e.preventDefault();
    setShowFullscreen(true);
  };

  const handleCloseFullscreen = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowFullscreen(false);
  };

  return (
    <>
      <div
        ref={containerRef}
        className="relative h-full w-full cursor-zoom-in overflow-hidden"
        onMouseEnter={() => !isTouchDevice && setZoom(true)}
        onMouseLeave={() => !isTouchDevice && setZoom(false)}
        onMouseMove={handleMouseMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Zoom indicator for mobile */}
        {isTouchDevice && (
          <div className="pointer-events-none absolute top-4 left-1/2 z-10 -translate-x-1/2 transform rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-white">
            Tap to view full screen
          </div>
        )}

        {photos.map((photo, i) => (
          <Image
            key={photo.alt}
            className={`${!isTouchDevice && zoom ? "scale-200" : "scale-100"} absolute top-0 left-0 h-full w-full object-contain transition-opacity duration-500 ease-in-out ${i === index ? "opacity-100" : "opacity-0"} `}
            style={
              !isTouchDevice
                ? { transformOrigin: `${position.x} ${position.y}` }
                : undefined
            }
            src={photo.path}
            alt={photo.alt}
            fill={true}
            quality={100}
            unoptimized
          />
        ))}
      </div>

      {/* Fullscreen overlay for mobile */}
      {showFullscreen && isTouchDevice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
          {/* Close button */}
          <button
            onClick={handleCloseFullscreen}
            className="absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-black shadow-lg transition-all hover:bg-white active:scale-95"
            aria-label="Close fullscreen"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          {/* Fullscreen image */}
          <div className="relative h-full w-full p-4">
            {photos.map((photo, i) => (
              <Image
                key={photo.alt}
                className={`absolute top-0 left-0 h-full w-full object-contain transition-opacity duration-300 ${i === index ? "opacity-100" : "opacity-0"}`}
                src={photo.path}
                alt={photo.alt}
                fill={true}
                quality={100}
                unoptimized
              />
            ))}
          </div>
        </div>
      )}
    </>
  );
}
