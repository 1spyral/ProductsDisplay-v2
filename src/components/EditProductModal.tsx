"use client";

import { useState, useEffect, useCallback } from "react";
import Product from "@/types/Product";
import Category from "@/types/Category";
import { updateAdminProduct, checkAdminProductIdExists } from "@/actions/admin";
import Modal from "./Modal";
import ImageManager from "./ImageManager";

interface EditProductModalProps {
  product: Product;
  categories: Category[];
  isOpen: boolean;
  onClose: () => void;
  onProductUpdated: () => void;
}

export default function EditProductModal({
  product,
  categories,
  isOpen,
  onClose,
  onProductUpdated,
}: EditProductModalProps) {
  const [formData, setFormData] = useState({
    id: product.id,
    name: product.name || "",
    description: product.description || "",
    category: product.category,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isIdLocked, setIsIdLocked] = useState(true); // ID starts locked
  const [isCheckingDuplicate, setIsCheckingDuplicate] = useState(false);
  const [isDuplicate, setIsDuplicate] = useState(false);

  // Validate ID format in real-time
  const isValidIdFormat = (id: string): boolean => {
    return /^[a-zA-Z0-9-_]+$/.test(id) && id.trim().length > 0;
  };

  const getIdValidationMessage = (id: string): string | null => {
    if (!id.trim()) return "ID cannot be empty";
    if (id.length > 255) return "ID too long (max 255 characters)";
    if (!isValidIdFormat(id)) return "Only letters, numbers, hyphens, and underscores allowed";
    if (isDuplicate && id !== product.id) return "This ID is already taken";
    return null;
  };

  // Check if form has any changes
  const hasChanges = (): boolean => {
    const idChanged = !isIdLocked && formData.id.trim() !== product.id;
    const nameChanged = (formData.name.trim() || null) !== product.name;
    const descriptionChanged = (formData.description.trim() || null) !== product.description;
    const categoryChanged = formData.category !== product.category;
    
    return idChanged || nameChanged || descriptionChanged || categoryChanged;
  };

  // Debounced duplicate checking
  const checkForDuplicate = useCallback(async (id: string) => {
    if (id === product.id || !id.trim() || !isValidIdFormat(id)) {
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
  }, [product.id]);

  // Debounce the duplicate check
  useEffect(() => {
    if (isIdLocked || formData.id === product.id) {
      setIsDuplicate(false);
      return;
    }

    const timeoutId = setTimeout(() => {
      checkForDuplicate(formData.id);
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [formData.id, isIdLocked, checkForDuplicate, product.id]);

  // Update form data when product changes
  useEffect(() => {
    setFormData({
      id: product.id,
      name: product.name || "",
      description: product.description || "",
      category: product.category,
    });
    setError("");
    setIsIdLocked(true); // Reset lock when product changes
    setIsDuplicate(false); // Reset duplicate state
  }, [product]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await updateAdminProduct(product.id, {
        newId: !isIdLocked && formData.id.trim() !== product.id ? formData.id.trim() : undefined,
        name: formData.name.trim() || null,
        description: formData.description.trim() || null,
        category: formData.category,
      });
      
      onProductUpdated();
      onClose();
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Failed to update product. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setError("");
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Edit Product"
      size="4xl"
    >
      <div className="flex h-[70vh] min-h-[500px] max-h-[700px] p-4">
        {/* Left side - Image Management */}
        <div className="w-1/2 pr-6 border-r border-gray-300 flex flex-col">
          <ImageManager
            productId={product.id}
            images={product.images || []}
            onImagesUpdated={onProductUpdated}
          />
        </div>

        {/* Right side - Product Details Form */}
        <div className="w-1/2 pl-6 flex flex-col">
          <form onSubmit={handleSubmit} className="flex-1 flex flex-col space-y-4">
            {/* Product ID with lock/unlock */}
            <div>
              <label className="block text-sm font-bold text-gray-900 uppercase tracking-wide mb-2">
                Product ID
                {!isIdLocked && <span className="text-red-600 ml-1">*</span>}
              </label>
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={formData.id}
                    onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                    readOnly={isIdLocked}
                    className={`w-full px-4 py-3 pr-10 border-2 focus:outline-none transition-colors font-mono text-sm ${
                      isIdLocked 
                        ? "border-gray-300 bg-gray-100 cursor-not-allowed" 
                        : getIdValidationMessage(formData.id)
                          ? "border-red-400 focus:border-red-700" 
                          : "border-gray-400 focus:border-slate-700"
                    }`}
                    placeholder={isIdLocked ? "Click lock to edit ID" : "Enter unique product ID..."}
                    required={!isIdLocked}
                  />
                  {/* Loading spinner for duplicate check */}
                  {!isIdLocked && isCheckingDuplicate && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <div className="animate-spin h-4 w-4 border-2 border-gray-300 border-t-slate-700 rounded-full"></div>
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setIsIdLocked(!isIdLocked)}
                  className={`px-4 py-3 border-2 font-bold transition-colors duration-200 flex items-center justify-center ${
                    isIdLocked 
                      ? "border-gray-400 bg-gray-100 hover:bg-gray-200 text-gray-600" 
                      : "border-slate-700 bg-slate-700 hover:bg-slate-900 text-white"
                  }`}
                  title={isIdLocked ? "Click to edit ID" : "Click to lock ID"}
                >
                  {isIdLocked ? (
                    // Locked icon
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    // Unlocked icon
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 2a5 5 0 00-5 5v2a2 2 0 00-2 2v5a2 2 0 002 2h10a2 2 0 002-2v-5a2 2 0 00-2-2H7V7a3 3 0 015.905-.75 1 1 0 001.937-.5A5.002 5.002 0 0010 2z" />
                    </svg>
                  )}
                </button>
              </div>
              <div className="mt-1">
                {!isIdLocked && getIdValidationMessage(formData.id) && (
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
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
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
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={4}
                className="w-full px-4 py-3 border-2 border-gray-400 focus:outline-none focus:border-slate-700 transition-colors resize-none"
                placeholder="Enter product description..."
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-bold text-gray-900 uppercase tracking-wide mb-2">
                Category
              </label>
              <div className="relative">
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
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
                disabled={loading || (!isIdLocked && !!getIdValidationMessage(formData.id)) || !hasChanges()}
                className="flex-1 bg-slate-700 hover:bg-slate-900 text-white font-bold py-2 uppercase tracking-wide transition-colors duration-200 disabled:opacity-50"
              >
                {loading ? "Updating..." : "Update"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Modal>
  );
}
