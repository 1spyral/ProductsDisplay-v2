"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragEndEvent 
} from '@dnd-kit/core';
import { 
  arrayMove, 
  SortableContext, 
  sortableKeyboardCoordinates, 
  verticalListSortingStrategy,
  useSortable 
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ProductImage } from "@/types/Product";
import { buildImageUrl } from "@/utils/photo";
import { 
  uploadAdminProductImage, 
  deleteAdminProductImage, 
  reorderAdminProductImages 
} from "@/actions/admin";
import Modal from "./Modal";

interface ImageManagerProps {
  productId: string;
  images: ProductImage[];
  onImagesUpdated: () => void;
}

interface SortableImageTileProps {
  image: ProductImage;
  productId: string;
  onDelete: (imageId: string) => void;
  onView: (imageUrl: string, alt: string) => void;
}

// Individual sortable image tile component
function SortableImageTile({ image, productId, onDelete, onView }: SortableImageTileProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: image.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.8 : 1,
  };

  const imageUrl = buildImageUrl(productId, image.objectKey);

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isDeleting) return;
    
    setIsDeleting(true);
    try {
      await onDelete(image.id);
    } catch (error) {
      console.error('Failed to delete image:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleView = () => {
    onView(imageUrl, `Product image ${image.position + 1}`);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="relative group bg-white border-2 border-gray-300 rounded-lg overflow-hidden hover:border-slate-700 transition-colors duration-200"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Drag handle */}
      <div
        {...listeners}
        className="absolute top-1 left-1 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded p-1 cursor-move z-10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
        title="Drag to reorder"
      >
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 18l4 4 4-4M8 6l4-4 4 4M6 8l-4 4 4 4M18 8l4 4-4 4" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 2v20M2 12h20" />
        </svg>
      </div>

      <div className="aspect-square relative cursor-pointer" onClick={handleView}>
        <Image
          src={imageUrl}
          alt={`Product image ${image.position + 1}`}
          fill
          className="object-cover"
          unoptimized
        />
        
        {/* Delete button on hover */}
        {isHovered && (
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white rounded-full p-1 shadow-lg transition-colors duration-200 disabled:opacity-50 z-10"
            title="Delete image"
          >
            {isDeleting ? (
              <div className="animate-spin h-3 w-3 border-2 border-white border-t-transparent rounded-full"></div>
            ) : (
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </button>
        )}

        {/* Position indicator */}
        <div className="absolute bottom-1 left-1 bg-black bg-opacity-60 text-white text-xs px-1.5 py-0.5 rounded">
          {image.position + 1}
        </div>
      </div>
    </div>
  );
}

// Full-size image viewer modal
interface ImageViewerModalProps {
  isOpen: boolean;
  imageUrl: string;
  alt: string;
  onClose: () => void;
}

function ImageViewerModal({ isOpen, imageUrl, alt, onClose }: ImageViewerModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="full"
      className="bg-transparent border-0"
      zIndex={60}
      darkBackground={true}
    >
      <div className="relative w-full h-full flex items-center justify-center">
        <Image
          src={imageUrl}
          alt={alt}
          width={1200}
          height={800}
          className="object-contain max-w-full max-h-full"
          unoptimized
        />
      </div>
    </Modal>
  );
}

export default function ImageManager({ productId, images, onImagesUpdated }: ImageManagerProps) {
  const [sortedImages, setSortedImages] = useState<ProductImage[]>(images);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [viewerImage, setViewerImage] = useState<{ url: string; alt: string } | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Update sorted images when props change
  useEffect(() => {
    setSortedImages([...images].sort((a, b) => a.position - b.position));
  }, [images]);

  // Also update editingProduct state when product ID changes (for migration scenarios)
  useEffect(() => {
    // Reset upload error when product changes
    setUploadError("");
  }, [productId]);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setIsDragging(false);

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = sortedImages.findIndex((img) => img.id === active.id);
    const newIndex = sortedImages.findIndex((img) => img.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      const newOrder = arrayMove(sortedImages, oldIndex, newIndex);
      setSortedImages(newOrder);

      // Update positions in database
      try {
        const imageIds = newOrder.map(img => img.id);
        await reorderAdminProductImages(productId, imageIds);
        onImagesUpdated();
      } catch (error) {
        console.error('Failed to reorder images:', error);
        // Revert on error
        setSortedImages(sortedImages);
      }
    }
  };

  const handleFileSelect = async (files: FileList) => {
    if (files.length === 0) return;

    setIsUploading(true);
    setUploadError("");

    try {
      // Upload files one by one
      const uploadPromises = Array.from(files).map(async (file, index) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('productId', productId);
        formData.append('position', (sortedImages.length + index).toString());

        return uploadAdminProductImage(formData);
      });
      
      await Promise.all(uploadPromises);
      
      // Refresh the images list
      onImagesUpdated();
    } catch (error) {
      console.error('Failed to upload images:', error);
      setUploadError(error instanceof Error ? error.message : 'Failed to upload images');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFileSelect(e.target.files);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    if (e.dataTransfer.files) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleDeleteImage = async (imageId: string) => {
    try {
      await deleteAdminProductImage(imageId);
      // Immediately refresh the images list
      onImagesUpdated();
    } catch (error) {
      console.error('Failed to delete image:', error);
      // You might want to show an error message to the user
      setUploadError(error instanceof Error ? error.message : 'Failed to delete image');
      throw error; // Let the tile component handle the error display
    }
  };

  const openImageViewer = (url: string, alt: string) => {
    setViewerImage({ url, alt });
  };

  const closeImageViewer = () => {
    setViewerImage(null);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 pb-3 border-b border-gray-300">
        <h3 className="text-base font-bold text-gray-900 uppercase tracking-wide mb-1">
          Product Images
        </h3>
        <p className="text-xs text-gray-600">
          {sortedImages.length} {sortedImages.length === 1 ? 'image' : 'images'} • Drag to reorder
        </p>
      </div>

      {/* Images Grid - constrained to available space */}
      <div className="flex-1 overflow-y-auto py-3 min-h-0">
        {sortedImages.length > 0 ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
            onDragStart={() => setIsDragging(true)}
          >
            <SortableContext items={sortedImages.map(img => img.id)} strategy={verticalListSortingStrategy}>
              <div className="grid grid-cols-3 gap-2">
                {sortedImages.map((image) => (
                  <SortableImageTile
                    key={image.id}
                    image={image}
                    productId={productId}
                    onDelete={handleDeleteImage}
                    onView={openImageViewer}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        ) : (
          <div className="flex items-center justify-center text-gray-500 h-32">
            <div className="text-center">
              <svg className="w-8 h-8 mx-auto mb-2 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
              </svg>
              <p className="text-xs">No images</p>
            </div>
          </div>
        )}
      </div>

      {/* Compact Upload Section */}
      <div className="flex-shrink-0 pt-3 border-t border-gray-300">
        <div
          className={`border-2 border-dashed rounded-lg p-3 text-center transition-colors duration-200 ${
            dragActive
              ? 'border-slate-700 bg-slate-50'
              : isUploading
              ? 'border-blue-400 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
        >
          {isUploading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
              <span className="text-sm font-medium text-blue-600">Uploading...</span>
            </div>
          ) : (
            <>
              <svg className="w-5 h-5 mx-auto mb-1 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8 12a1 1 0 001 1h2a1 1 0 001-1V9.414l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L8 9.414V12z" />
                <path d="M3 7a1 1 0 011-1h1V5a3 3 0 016 0v1h1a1 1 0 011 1v8a3 3 0 01-3 3H6a3 3 0 01-3-3V7z" />
              </svg>
              <p className="text-xs text-gray-600">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-slate-700 font-medium hover:text-slate-900 underline"
                  disabled={isUploading}
                >
                  Upload
                </button>
                {' '}or drag files
              </p>
            </>
          )}
        </div>

        {uploadError && (
          <div className="mt-2 p-2 bg-red-100 border border-red-300 rounded text-sm text-red-700">
            {uploadError}
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={handleFileInputChange}
          className="hidden"
        />
      </div>

      {/* Image Viewer Modal */}
      {viewerImage && (
        <ImageViewerModal
          isOpen={true}
          imageUrl={viewerImage.url}
          alt={viewerImage.alt}
          onClose={closeImageViewer}
        />
      )}
    </div>
  );
}
