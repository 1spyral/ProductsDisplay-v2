import Image from "next/image";

export default function ImageWheel({ photos, index }: { photos: Photo[], index: number}) {

    return (
        <div className="overflow-hidden relative w-full h-full">
            {photos.map(photo => <Image key={photo.alt} className="absolute top-0 left-0 w-full h-full object-contain" src={photo.path} alt={photo.alt} width="10" height="10"></Image>)}
        </div>
    );
}