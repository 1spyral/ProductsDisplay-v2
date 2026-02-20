import Photo from "@/types/Photo";
import Image from "next/image";

export default function ImageWheel({
  photos,
  index,
}: {
  photos: Photo[];
  index: number;
}) {
  return (
    <div className="relative h-full w-full overflow-hidden">
      {photos.map((photo, i) => (
        <Image
          key={photo.alt}
          className={`absolute top-0 left-0 h-full w-full object-contain transition-opacity duration-500 ease-in-out ${i === index ? "opacity-100" : "opacity-0"}`}
          src={photo.path}
          alt={photo.alt}
          fill={true}
          sizes="100vw"
          quality={100}
          unoptimized
        />
      ))}
    </div>
  );
}
