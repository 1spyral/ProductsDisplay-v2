"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ProductImage } from "@/types/Product";
import { buildImageUrl } from "@/utils/photo";
import {
  uploadAdminProductImage,
  deleteAdminProductImage,
  reorderAdminProductImages,
} from "@/actions/admin";
import Modal from "../Modal";

// Types for the unified component
interface ImageItem {
  id: string;
  type: "file" | "existing";
  file?: File; // For new uploads
  productImage?: ProductImage; // For existing images
  position: number;
}

interface UnifiedImageManagerProps {
  mode: "add" | "edit";
  productId?: string; // Required for edit mode
  existingImages?: ProductImage[]; // For edit mode
  selectedFiles?: File[]; // For add mode
  onFilesChange?: (files: File[]) => void; // For add mode
  onImagesUpdated?: () => void; // For edit mode
}

// Sortable tile component that handles both file previews and existing images
interface SortableTileProps {
  item: ImageItem;
  productId?: string;
  onRemove: (id: string) => void;
  onView?: (imageUrl: string, alt: string) => void;
  mode: "add" | "edit";
}

function SortableTile({
  item,
  productId,
  onRemove,
  onView,
  mode,
}: SortableTileProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.8 : 1,
  };

  // Get image source based on type
  const getImageSrc = () => {
    if (item.type === "file" && item.file) {
      return URL.createObjectURL(item.file);
    } else if (item.type === "existing" && item.productImage && productId) {
      return buildImageUrl(productId, item.productImage.objectKey);
    }
    return "";
  };

  const getImageAlt = () => {
    if (item.type === "file") {
      return `Selected image ${item.position + 1}`;
    } else {
      return `Product image ${item.position + 1}`;
    }
  };

  const handleRemove = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isDeleting) return;

    setIsDeleting(true);
    try {
      await onRemove(item.id);
    } catch (error) {
      console.error("Failed to remove image:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleView = () => {
    if (onView && (mode === "edit" || item.type === "file")) {
      onView(getImageSrc(), getImageAlt());
    }
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
        <svg
          className="w-3 h-3"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth={2.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8 18l4 4 4-4M8 6l4-4 4 4M6 8l-4 4 4 4M18 8l4 4-4 4"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 2v20M2 12h20"
          />
        </svg>
      </div>

      <div
        className={`aspect-square relative ${onView ? "cursor-pointer" : ""}`}
        onClick={handleView}
      >
        <Image
          src={getImageSrc()}
          alt={getImageAlt()}
          fill
          className="object-cover"
          unoptimized
        />

        {/* Remove button */}
        {isHovered && (
          <button
            onClick={handleRemove}
            disabled={isDeleting}
            className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white rounded-full p-1 shadow-lg transition-colors duration-200 disabled:opacity-50 z-10"
            title="Remove image"
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
          {item.position + 1}
        </div>
      </div>
    </div>
  );
}

// Image viewer modal
interface ImageViewerModalProps {
  isOpen: boolean;
  imageUrl: string;
  alt: string;
  onClose: () => void;
}

function ImageViewerModal({
  isOpen,
  imageUrl,
  alt,
  onClose,
}: ImageViewerModalProps) {
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

export default function UnifiedImageManager({
  mode,
  productId,
  existingImages = [],
  selectedFiles = [],
  onFilesChange,
  onImagesUpdated,
}: UnifiedImageManagerProps) {
  const [dragActive, setDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [viewerImage, setViewerImage] = useState<{
    url: string;
    alt: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Convert images/files to unified format
  const imageItems: ImageItem[] = [
    // Existing images (for edit mode)
    ...existingImages.map(
      (img): ImageItem => ({
        id: img.id,
        type: "existing",
        productImage: img,
        position: img.position,
      })
    ),
    // Selected files (for add mode)
    ...selectedFiles.map(
      (file, index): ImageItem => ({
        id: `file-${file.name}-${index}`,
        type: "file",
        file,
        position: existingImages.length + index,
      })
    ),
  ].sort((a, b) => a.position - b.position);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = imageItems.findIndex((item) => item.id === active.id);
    const newIndex = imageItems.findIndex((item) => item.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      const newOrder = arrayMove(imageItems, oldIndex, newIndex);

      if (mode === "add") {
        // Update file order for add mode
        const newFiles = newOrder
          .filter((item) => item.type === "file")
          .map((item) => item.file!)
          .filter(Boolean);
        onFilesChange?.(newFiles);
      } else if (mode === "edit" && productId) {
        // Update database order for edit mode
        try {
          const imageIds = newOrder
            .filter((item) => item.type === "existing")
            .map((item) => item.productImage!.id);
          await reorderAdminProductImages(productId, imageIds);
          onImagesUpdated?.();
        } catch (error) {
          console.error("Failed to reorder images:", error);
          setUploadError("Failed to reorder images");
        }
      }
    }
  };

  const handleFileSelect = async (files: FileList) => {
    const validFiles = Array.from(files).filter((file) => {
      // Check file type
      if (!file.type.startsWith("image/")) {
        console.warn(`Skipped non-image file: ${file.name}`);
        return false;
      }
      // Check file size (4MB limit)
      if (file.size > 4 * 1024 * 1024) {
        console.warn(
          `Skipped large file (${Math.round(file.size / 1024 / 1024)}MB): ${file.name}`
        );
        return false;
      }
      return true;
    });

    if (validFiles.length !== files.length) {
      const skipped = files.length - validFiles.length;
      setUploadError(
        `Skipped ${skipped} file(s) - only JPEG/PNG/WebP under 4MB are allowed`
      );
      setTimeout(() => setUploadError(""), 3000);
    }

    if (mode === "add") {
      // In add mode, just update the files list
      onFilesChange?.([...selectedFiles, ...validFiles]);
    } else if (mode === "edit" && productId) {
      // In edit mode, upload immediately
      setIsUploading(true);
      setUploadError("");

      try {
        const uploadPromises = validFiles.map(async (file, index) => {
          const formData = new FormData();
          formData.append("file", file);
          formData.append("productId", productId);
          formData.append(
            "position",
            (existingImages.length + index).toString()
          );

          return uploadAdminProductImage(formData);
        });

        await Promise.all(uploadPromises);
        onImagesUpdated?.();
      } catch (error) {
        console.error("Failed to upload images:", error);
        setUploadError(
          error instanceof Error ? error.message : "Failed to upload images"
        );
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    const item = imageItems.find((i) => i.id === itemId);
    if (!item) return;

    if (item.type === "file") {
      // Remove from files list
      const newFiles = selectedFiles.filter(
        (_, index) => `file-${selectedFiles[index].name}-${index}` !== itemId
      );
      onFilesChange?.(newFiles);
    } else if (item.type === "existing" && item.productImage) {
      // Delete from database
      await deleteAdminProductImage(item.productImage.id);
      onImagesUpdated?.();
    }
  };

  // Drag and drop handlers
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
          {imageItems.length} {imageItems.length === 1 ? "image" : "images"}
          {mode === "edit" ? " • Drag to reorder" : " selected"}
        </p>
      </div>

      {/* Images Grid */}
      <div className="flex-1 overflow-y-auto py-3 min-h-0">
        {imageItems.length > 0 ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={imageItems.map((item) => item.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="grid grid-cols-3 gap-2">
                {imageItems.map((item) => (
                  <SortableTile
                    key={item.id}
                    item={item}
                    productId={productId}
                    onRemove={handleRemoveItem}
                    onView={mode === "edit" ? openImageViewer : undefined}
                    mode={mode}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        ) : (
          <div className="flex items-center justify-center text-gray-500 h-32">
            <div className="text-center">
              <svg
                className="w-8 h-8 mx-auto mb-2 text-gray-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                  clipRule="evenodd"
                />
              </svg>
              <p className="text-xs">
                {mode === "add" ? "No images selected" : "No images"}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Upload Section */}
      <div className="flex-shrink-0 pt-3 border-t border-gray-300">
        <div
          className={`border-2 border-dashed rounded-lg p-3 text-center transition-colors duration-200 ${
            dragActive
              ? "border-slate-700 bg-slate-50"
              : isUploading
                ? "border-blue-400 bg-blue-50"
                : "border-gray-300 hover:border-gray-400"
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
        >
          {isUploading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
              <span className="text-sm font-medium text-blue-600">
                Uploading...
              </span>
            </div>
          ) : (
            <>
              <svg
                className="w-5 h-5 mx-auto mb-1 text-gray-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M8 12a1 1 0 001 1h2a1 1 0 001-1V9.414l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L8 9.414V12z" />
                <path d="M3 7a1 1 0 011-1h1V5a3 3 0 016 0v1h1a1 1 0 011 1v8a3 3 0 01-3 3H6a3 3 0 01-3-3V7z" />
              </svg>
              <p className="text-xs text-gray-600">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-slate-700 font-medium hover:text-slate-900 underline"
                  disabled={isUploading}
                >
                  {mode === "add" ? "Select images" : "Upload"}
                </button>{" "}
                or drag & drop (4MB max each)
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
          onChange={(e) => e.target.files && handleFileSelect(e.target.files)}
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
