import Image from "next/image";

export default function ImageWheel({ photos, index }: { photos: Photo[], index: number }) {
    return (
        <div className="relative w-full h-32 overflow-hidden">
            {photos.map((photo, i) => (
                <Image
                    key={photo.alt}
                    className={`absolute top-0 left-0 w-full h-full object-contain transition-opacity duration-500 ease-in-out ${i === index ? "opacity-100" : "opacity-0"}`}
                    src={photo.path}
                    alt={photo.alt}
                    layout="fill"
                    quality={100}
                    unoptimized
                />
            ))}
        </div>
    );
}