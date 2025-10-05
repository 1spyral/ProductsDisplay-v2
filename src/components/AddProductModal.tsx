"use client";

import { useState, useCallback, useEffect } from "react";
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
import Category from "@/types/Category";
import { createAdminProduct, checkAdminProductIdExists, uploadAdminProductImage } from "@/actions/admin";
import Modal from "./Modal";

interface AddProductModalProps {
  categories: Category[];
  isOpen: boolean;
  onClose: () => void;
  onProductCreated: () => void;
}

// Individual sortable image tile for preview
interface SortablePreviewTileProps {
  file: File;
  index: number;
  onRemove: (index: number) => void;
}

function SortablePreviewTile({ file, index, onRemove }: SortablePreviewTileProps) {
  const [isHovered, setIsHovered] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `${file.name}-${index}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.8 : 1,
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRemove(index);
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

      <div className="aspect-square relative">
        <img
          src={URL.createObjectURL(file)}
          alt={`Selected image ${index + 1}`}
          className="w-full h-full object-cover"
        />
        
        {/* Remove button */}
        {isHovered && (
          <button
            onClick={handleRemove}
            className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white rounded-full p-1 shadow-lg transition-colors duration-200 z-10"
            title="Remove image"
          >
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        )}

        {/* Position indicator */}
        <div className="absolute bottom-1 left-1 bg-black bg-opacity-60 text-white text-xs px-1.5 py-0.5 rounded">
          {index + 1}
        </div>
      </div>
    </div>
  );
}

export default function AddProductModal({
  categories,
  isOpen,
  onClose,
  onProductCreated,
}: AddProductModalProps) {
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    description: "",
    category: categories[0]?.category || "",
  });
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isCheckingDuplicate, setIsCheckingDuplicate] = useState(false);
  const [isDuplicate, setIsDuplicate] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // Drag and drop sensors for image reordering
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Validate ID format in real-time
  const isValidIdFormat = (id: string): boolean => {
    return /^[a-zA-Z0-9-_]+$/.test(id) && id.trim().length > 0;
  };

  const getIdValidationMessage = (id: string): string | null => {
    if (!id.trim()) return "ID cannot be empty";
    if (id.length > 255) return "ID too long (max 255 characters)";
    if (!isValidIdFormat(id)) return "Only letters, numbers, hyphens, and underscores allowed";
    if (isDuplicate) return "This ID is already taken";
    return null;
  };

  // Check if form is valid
  const isFormValid = (): boolean => {
    return !!formData.id.trim() && 
           !!formData.category && 
           !getIdValidationMessage(formData.id) && 
           !isCheckingDuplicate;
  };

  // Debounced duplicate checking
  const checkForDuplicate = useCallback(async (id: string) => {
    if (!id.trim() || !isValidIdFormat(id)) {
      setIsDuplicate(false);
      return;
    }

    setIsCheckingDuplicate(true);
    try {
      const exists = await checkAdminProductIdExists(id);
      setIsDuplicate(exists);
    } catch (error) {
      console.error("Failed to check duplicate:", error);
      setIsDuplicate(false);
    } finally {
      setIsCheckingDuplicate(false);
    }
  }, []);

  // Debounce the duplicate check
  useEffect(() => {
    if (!formData.id.trim()) {
      setIsDuplicate(false);
      return;
    }

    const timeoutId = setTimeout(() => {
      checkForDuplicate(formData.id);
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [formData.id, checkForDuplicate]);

  // Handle drag end for image reordering
  const handleImageDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = selectedImages.findIndex((_, i) => `${selectedImages[i].name}-${i}` === active.id);
    const newIndex = selectedImages.findIndex((_, i) => `${selectedImages[i].name}-${i}` === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      setSelectedImages(arrayMove(selectedImages, oldIndex, newIndex));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Create the product first
      const createResult = await createAdminProduct({
        id: formData.id.trim(),
        name: formData.name.trim() || null,
        description: formData.description.trim() || null,
        category: formData.category,
      });

      // Upload images if any were selected
      if (selectedImages.length > 0) {
        try {
          const uploadPromises = selectedImages.map(async (file, index) => {
            const uploadFormData = new FormData();
            uploadFormData.append('file', file);
            uploadFormData.append('productId', formData.id.trim());
            uploadFormData.append('position', index.toString());

            return uploadAdminProductImage(uploadFormData);
          });
          
          await Promise.all(uploadPromises);
        } catch (uploadError) {
          console.error('Failed to upload some images:', uploadError);
          // Product is created but images failed - still consider it a success
          // User can add images later via edit
        }
      }
      
      onProductCreated();
      handleClose();
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Failed to create product. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setError("");
    setFormData({
      id: "",
      name: "",
      description: "",
      category: categories[0]?.category || "",
    });
    setSelectedImages([]);
    setIsDuplicate(false);
    onClose();
  };

  const handleImageSelect = (files: FileList) => {
    const newImages = Array.from(files).filter(file => {
      // Check file type
      if (!file.type.startsWith('image/')) {
        console.warn(`Skipped non-image file: ${file.name}`);
        return false;
      }
      // Check file size (4MB limit)
      if (file.size > 4 * 1024 * 1024) {
        console.warn(`Skipped large file (${Math.round(file.size / 1024 / 1024)}MB): ${file.name}`);
        return false;
      }
      return true;
    });
    
    if (newImages.length !== files.length) {
      const skipped = files.length - newImages.length;
      setError(`Skipped ${skipped} file(s) - only JPEG/PNG/WebP under 4MB are allowed`);
      setTimeout(() => setError(""), 3000); // Clear after 3 seconds
    }
    
    setSelectedImages(prev => [...prev, ...newImages]);
  };

  const handleRemoveImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  // Drag and drop handlers
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    if (e.dataTransfer.files) {
      handleImageSelect(e.dataTransfer.files);
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

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Add New Product"
      size="4xl"
    >
      <div className="flex h-[70vh] min-h-[500px] max-h-[700px] p-4">
        {/* Left side - Image Selection */}
        <div className="w-1/2 pr-6 border-r border-gray-300 flex flex-col">
          <div className="h-full flex flex-col">
            {/* Header */}
            <div className="flex-shrink-0 pb-3 border-b border-gray-300">
              <h3 className="text-base font-bold text-gray-900 uppercase tracking-wide mb-1">
                Product Images
              </h3>
              <p className="text-xs text-gray-600">
                {selectedImages.length} {selectedImages.length === 1 ? 'image' : 'images'} selected
              </p>
            </div>

            {/* Selected Images Preview */}
            <div className="flex-1 overflow-y-auto py-3 min-h-0">
              {selectedImages.length > 0 ? (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleImageDragEnd}
                >
                  <SortableContext 
                    items={selectedImages.map((_, i) => `${selectedImages[i].name}-${i}`)} 
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="grid grid-cols-3 gap-2">
                      {selectedImages.map((file, index) => (
                        <SortablePreviewTile
                          key={`${file.name}-${index}`}
                          file={file}
                          index={index}
                          onRemove={handleRemoveImage}
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
                    <p className="text-xs">No images selected</p>
                  </div>
                </div>
              )}
            </div>

            {/* Upload Section */}
            <div className="flex-shrink-0 pt-3 border-t border-gray-300">
              <div 
                className={`border-2 border-dashed rounded-lg p-3 text-center transition-colors duration-200 ${
                  dragActive
                    ? 'border-slate-700 bg-slate-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
              >
                <svg className="w-5 h-5 mx-auto mb-1 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8 12a1 1 0 001 1h2a1 1 0 001-1V9.414l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L8 9.414V12z" />
                  <path d="M3 7a1 1 0 011-1h1V5a3 3 0 016 0v1h1a1 1 0 011 1v8a3 3 0 01-3 3H6a3 3 0 01-3-3V7z" />
                </svg>
                <p className="text-xs text-gray-600">
                  <button
                    onClick={() => document.getElementById('add-product-file-input')?.click()}
                    className="text-slate-700 font-medium hover:text-slate-900 underline"
                    type="button"
                  >
                    Select images
                  </button>
                  {' '}or drag & drop (4MB max each)
                </p>
              </div>

              <input
                id="add-product-file-input"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                onChange={(e) => e.target.files && handleImageSelect(e.target.files)}
                className="hidden"
              />
            </div>
          </div>
        </div>

        {/* Right side - Product Details Form */}
        <div className="w-1/2 pl-6 flex flex-col">
          <form onSubmit={handleSubmit} className="flex-1 flex flex-col space-y-4">
            {/* Product ID */}
            <div>
              <label className="block text-sm font-bold text-gray-900 uppercase tracking-wide mb-2">
                Product ID
                <span className="text-red-600 ml-1">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.id}
                  onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                  className={`w-full px-4 py-3 pr-10 border-2 focus:outline-none transition-colors font-mono text-sm ${
                    getIdValidationMessage(formData.id)
                      ? "border-red-400 focus:border-red-700" 
                      : "border-gray-400 focus:border-slate-700"
                  }`}
                  placeholder="Enter unique product ID..."
                  required
                />
                {/* Loading spinner for duplicate check */}
                {isCheckingDuplicate && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="animate-spin h-4 w-4 border-2 border-gray-300 border-t-slate-700 rounded-full"></div>
                  </div>
                )}
              </div>
              <div className="mt-1">
                {getIdValidationMessage(formData.id) && (
                  <p className="text-xs text-red-600">
                    {getIdValidationMessage(formData.id)}
                  </p>
                )}
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-bold text-gray-900 uppercase tracking-wide mb-2">
                Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-400 focus:outline-none focus:border-slate-700 transition-colors"
                placeholder="Enter product name..."
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-bold text-gray-900 uppercase tracking-wide mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 border-2 border-gray-400 focus:outline-none focus:border-slate-700 transition-colors resize-none"
                placeholder="Enter product description..."
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-bold text-gray-900 uppercase tracking-wide mb-2">
                Category
                <span className="text-red-600 ml-1">*</span>
              </label>
              <div className="relative">
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-400 focus:outline-none focus:border-slate-700 transition-colors appearance-none"
                  required
                >
                  {categories.map((cat) => (
                    <option key={cat.category} value={cat.category}>
                      {cat.name || cat.category}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-600 font-bold">
                  ▼
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-100 border-2 border-red-600 p-3 text-center">
                <p className="text-red-900 font-bold text-sm uppercase">
                  {error}
                </p>
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-3 pt-4 mt-auto">
              <button
                type="button"
                onClick={handleClose}
                disabled={loading}
                className="flex-1 bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 uppercase tracking-wide transition-colors duration-200 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !isFormValid()}
                className="flex-1 bg-slate-700 hover:bg-slate-900 text-white font-bold py-2 uppercase tracking-wide transition-colors duration-200 disabled:opacity-50"
              >
                {loading ? "Creating..." : "Create Product"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Modal>
  );
}
