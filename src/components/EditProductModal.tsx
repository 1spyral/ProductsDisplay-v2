"use client";

import { useState, useEffect } from "react";
import Product from "@/types/Product";
import Category from "@/types/Category";
import { updateAdminProduct } from "@/actions/admin";
import Modal from "./Modal";

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
    name: product.name || "",
    description: product.description || "",
    category: product.category,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Update form data when product changes
  useEffect(() => {
    setFormData({
      name: product.name || "",
      description: product.description || "",
      category: product.category,
    });
    setError("");
  }, [product]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await updateAdminProduct(product.id, {
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
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Product ID (read-only) */}
        <div>
          <label className="block text-sm font-bold text-gray-900 uppercase tracking-wide mb-2">
            Product ID
          </label>
          <input
            type="text"
            value={product.id}
            readOnly
            className="w-full px-4 py-3 border-2 border-gray-300 bg-gray-100 font-mono text-sm"
          />
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
        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="flex-1 bg-gray-500 hover:bg-gray-700 text-white font-bold py-3 uppercase tracking-wide transition-colors duration-200 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-slate-700 hover:bg-slate-900 text-white font-bold py-3 uppercase tracking-wide transition-colors duration-200 disabled:opacity-50"
          >
            {loading ? "Updating..." : "Update"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
