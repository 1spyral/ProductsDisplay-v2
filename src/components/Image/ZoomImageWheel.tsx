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
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartPos = useRef({ x: 0, y: 0 });

  // Detect if device supports touch
  useEffect(() => {
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

  // Desktop: hover to zoom, mouse move to pan
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isTouchDevice) return;
    const { left, top, width, height } =
      e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setPosition({ x: `${x}%`, y: `${y}%` });
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isTouchDevice) return;
    
    const touch = e.touches[0];
    touchStartPos.current = { x: touch.clientX, y: touch.clientY };
    setIsDragging(false);
    
    if (!zoom) {
      setZoom(true);
      const { left, top, width, height } =
        e.currentTarget.getBoundingClientRect();
      const x = ((touch.clientX - left) / width) * 100;
      const y = ((touch.clientY - top) / height) * 100;
      setPosition({ x: `${x}%`, y: `${y}%` });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isTouchDevice || !zoom) return;
    
    const touch = e.touches[0];
    const deltaX = Math.abs(touch.clientX - touchStartPos.current.x);
    const deltaY = Math.abs(touch.clientY - touchStartPos.current.y);
    
    if (deltaX > 5 || deltaY > 5) {
      setIsDragging(true);
    }
    
    const { left, top, width, height } =
      e.currentTarget.getBoundingClientRect();
    const x = ((touch.clientX - left) / width) * 100;
    const y = ((touch.clientY - top) / height) * 100;
    setPosition({ x: `${x}%`, y: `${y}%` });
  };

  const handleTouchEnd = () => {
    if (!isTouchDevice) return;
    
    if (zoom && !isDragging) {
      setZoom(false);
    }
    
    setIsDragging(false);
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden cursor-zoom-in"
      onMouseEnter={() => !isTouchDevice && setZoom(true)}
      onMouseLeave={() => !isTouchDevice && setZoom(false)}
      onMouseMove={handleMouseMove}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Zoom indicator for mobile */}
      {isTouchDevice && !zoom && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black/60 text-white px-3 py-1 rounded-full text-xs font-medium pointer-events-none z-10">
          Tap to zoom
        </div>
      )}
      {isTouchDevice && zoom && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black/60 text-white px-3 py-1 rounded-full text-xs font-medium pointer-events-none z-10">
          Drag to pan • Tap to exit
        </div>
      )}
      
      {photos.map((photo, i) => (
        <Image
          key={photo.alt}
          className={`
                        ${zoom ? "scale-200" : "scale-100"}
                        absolute
                        top-0
                        left-0
                        w-full
                        h-full
                        object-contain
                        transition-opacity
                        duration-500
                        ease-in-out
                        ${i === index ? "opacity-100" : "opacity-0"}
                    `}
          style={{ transformOrigin: `${position.x} ${position.y}` }}
          src={photo.path}
          alt={photo.alt}
          fill={true}
          quality={100}
          unoptimized
        />
      ))}
    </div>
  );
}
