import Image from "next/image"
import Photo from "@/types/Photo"
import React, { useState } from "react"

export default function ZoomImageWheel({ photos, index }: { photos: Photo[], index: number }) {
    const [zoom, setZoom] = useState(false)
    const [position, setPosition] = useState({ x: "50%", y: "50%" })

    const handleMouseMove = (e: React.MouseEvent) => {
        const { left, top, width, height } = e.currentTarget.getBoundingClientRect()
        const x = ((e.clientX - left) / width) * 100
        const y = ((e.clientY - top) / height) * 100
        setPosition({ x: `${x}%`, y: `${y}%` })
    }

    return (
        <div
            className="relative w-full h-full overflow-hidden"
            onMouseEnter={() => setZoom(true)}
            onMouseLeave={() => setZoom(false)}
            onMouseMove={handleMouseMove}
        >
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
                    style={{transformOrigin: `${position.x} ${position.y}`}}
                    src={photo.path}
                    alt={photo.alt}
                    fill={true}
                    quality={100}
                    unoptimized
                />
            ))}
        </div>
    )
}