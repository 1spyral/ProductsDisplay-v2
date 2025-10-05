"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { getAdminProducts, getAdminCategories } from "@/actions/admin";
import Product from "@/types/Product";
import Category from "@/types/Category";
import { buildImageUrl } from "@/utils/photo";
import EditProductModal from "@/components/EditProductModal";
import AddProductModal from "@/components/AddProductModal";

type SortField = "id" | "name" | "category";
type SortOrder = "asc" | "desc";

// Helper function to get the first image URL for a product
function getProductThumbnailUrl(product: Product): string | null {
  if (!product.images || product.images.length === 0) {
    return null;
  }
  const firstImage = product.images[0];
  return buildImageUrl(product.id, firstImage.objectKey);
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  // Sorting
  const [sortField, setSortField] = useState<SortField>("id");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

  // Edit modal
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Add modal  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [productsData, categoriesData] = await Promise.all([
        getAdminProducts(),
        getAdminCategories(),
      ]);

      setProducts(productsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort products
  const filteredAndSortedProducts = products
    .filter((product) => {
      // Category filter
      if (categoryFilter !== "all" && product.category !== categoryFilter) {
        return false;
      }

      // Search filter
      if (searchQuery) {
        const search = searchQuery.toLowerCase();
        const matchesId = product.id.toLowerCase().includes(search);
        const matchesName = product.name?.toLowerCase().includes(search);
        const matchesCategory = product.category.toLowerCase().includes(search);
        return matchesId || matchesName || matchesCategory;
      }

      return true;
    })
    .sort((a, b) => {
      let aValue: string;
      let bValue: string;

      if (sortField === "name") {
        aValue = a.name || "";
        bValue = b.name || "";
      } else if (sortField === "category") {
        aValue = a.category;
        bValue = b.category;
      } else {
        aValue = a.id;
        bValue = b.id;
      }

      const comparison = aValue.localeCompare(bValue);
      return sortOrder === "asc" ? comparison : -comparison;
    });

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingProduct(null);
  };

  const handleAddProduct = () => {
    setIsAddModalOpen(true);
  };

  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
  };

  const handleProductUpdated = () => {
    fetchData(); // Refresh the products list
    // Also refresh the editing product if modal is open
    if (editingProduct) {
      // Find the updated product in the new data
      setTimeout(async () => {
        try {
          const updatedProducts = await getAdminProducts();
          const updatedProduct = updatedProducts.find(p => p.id === editingProduct.id);
          if (updatedProduct) {
            setEditingProduct(updatedProduct);
          }
        } catch (error) {
          console.error("Failed to refresh editing product:", error);
        }
      }, 100); // Small delay to ensure database is updated
    }
  };

  const handleProductCreated = () => {
    fetchData(); // Refresh the products list
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-6 md:p-8">
        <div className="bg-white border-3 border-gray-400 p-6 sm:p-8 text-center">
          <p className="text-lg sm:text-xl font-bold text-gray-900 uppercase">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 md:p-8">
      {/* Header */}
      <div className="bg-white border-4 border-slate-700 p-4 sm:p-6 mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex flex-col gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 uppercase tracking-wide">
              Products
            </h1>
            <p className="text-sm sm:text-base text-gray-700">
              {filteredAndSortedProducts.length} products found
            </p>
          </div>
          <button 
            onClick={handleAddProduct}
            className="bg-slate-700 hover:bg-slate-900 text-white font-bold py-2 px-4 sm:px-6 uppercase tracking-wide transition-colors duration-200 whitespace-nowrap"
          >
            Add Product
          </button>
        </div>
      </div>

      {/* Filters & Sort */}
      <div className="bg-white border-3 border-gray-400 p-4 sm:p-6 mb-4 sm:mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-bold text-gray-900 uppercase tracking-wide mb-2">
              Search
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by ID, name, or category..."
              className="w-full h-[42px] px-4 border-2 border-gray-400 focus:outline-none focus:border-slate-700 transition-colors"
            />
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-sm font-bold text-gray-900 uppercase tracking-wide mb-2">
              Category
            </label>
            <div className="relative">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full h-[42px] pl-4 pr-10 border-2 border-gray-400 focus:outline-none focus:border-slate-700 transition-colors appearance-none"
              >
                <option value="all">All Categories</option>
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

          {/* Sort */}
          <div>
            <label className="block text-sm font-bold text-gray-900 uppercase tracking-wide mb-2">
              Sort By
            </label>
            <div className="flex gap-2 h-[42px]">
              <div className="relative flex-1">
                <select
                  value={sortField}
                  onChange={(e) => setSortField(e.target.value as SortField)}
                  className="w-full h-full pl-4 pr-10 border-2 border-gray-400 focus:outline-none focus:border-slate-700 transition-colors appearance-none"
                >
                  <option value="id">ID</option>
                  <option value="name">Name</option>
                  <option value="category">Category</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-600 font-bold">
                  ▼
                </div>
              </div>
              <button
                onClick={() =>
                  setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                }
                className="w-[42px] border-2 border-gray-400 hover:border-slate-700 font-bold transition-colors flex items-center justify-center"
                title={sortOrder === "asc" ? "Ascending" : "Descending"}
              >
                {sortOrder === "asc" ? "↑" : "↓"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white border-3 border-gray-400 overflow-x-auto">
        <table className="w-full min-w-[640px]">
          <thead>
            <tr className="border-b-3 border-gray-400">
              <th className="text-left p-2 sm:p-4 font-bold text-gray-900 uppercase tracking-wide w-16 sm:w-24 text-xs sm:text-sm">
                Image
              </th>
              <th
                onClick={() => handleSort("id")}
                className="text-left p-2 sm:p-4 font-bold text-gray-900 uppercase tracking-wide cursor-pointer hover:bg-gray-100 transition-colors text-xs sm:text-sm"
              >
                ID {sortField === "id" && (sortOrder === "asc" ? "↑" : "↓")}
              </th>
              <th
                onClick={() => handleSort("name")}
                className="text-left p-2 sm:p-4 font-bold text-gray-900 uppercase tracking-wide cursor-pointer hover:bg-gray-100 transition-colors text-xs sm:text-sm"
              >
                Name {sortField === "name" && (sortOrder === "asc" ? "↑" : "↓")}
              </th>
              <th
                onClick={() => handleSort("category")}
                className="text-left p-2 sm:p-4 font-bold text-gray-900 uppercase tracking-wide cursor-pointer hover:bg-gray-100 transition-colors text-xs sm:text-sm"
              >
                Category{" "}
                {sortField === "category" && (sortOrder === "asc" ? "↑" : "↓")}
              </th>
              <th className="text-right p-2 sm:p-4 font-bold text-gray-900 uppercase tracking-wide text-xs sm:text-sm">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedProducts.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="text-center p-4 sm:p-8 text-sm sm:text-base text-gray-600"
                >
                  No products found
                </td>
              </tr>
            ) : (
              filteredAndSortedProducts.map((product) => {
                const imageUrl = getProductThumbnailUrl(product);
                return (
                  <tr
                    key={product.id}
                    className="border-b-2 border-gray-300 hover:bg-gray-50 transition-colors"
                  >
                    <td className="p-2 sm:p-4">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 relative bg-gray-100 border-2 border-gray-300 flex items-center justify-center flex-shrink-0">
                        {imageUrl ? (
                          <Image
                            src={imageUrl}
                            alt={product.name || product.id}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        ) : (
                          <span className="text-gray-400 text-[10px] sm:text-xs text-center px-1">
                            No Image
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-2 sm:p-4 font-mono text-xs sm:text-sm">
                      {product.id}
                    </td>
                    <td className="p-2 sm:p-4 text-sm sm:text-base">
                      {product.name || (
                        <span className="text-gray-500 italic">No name</span>
                      )}
                    </td>
                    <td className="p-2 sm:p-4 text-sm sm:text-base">
                      {product.category}
                    </td>
                    <td className="p-2 sm:p-4 text-right">
                      <div className="flex flex-col sm:flex-row gap-1 sm:gap-2 justify-end">
                        <button 
                          onClick={() => handleEditProduct(product)}
                          className="bg-slate-700 hover:bg-slate-900 text-white font-bold py-1 px-2 sm:px-4 text-xs sm:text-sm uppercase transition-colors duration-200 whitespace-nowrap"
                        >
                          Edit
                        </button>
                        <button className="bg-red-700 hover:bg-red-900 text-white font-bold py-1 px-2 sm:px-4 text-xs sm:text-sm uppercase transition-colors duration-200 whitespace-nowrap">
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Product Modal */}
      {editingProduct && (
        <EditProductModal
          product={editingProduct}
          categories={categories}
          isOpen={isEditModalOpen}
          onClose={handleCloseEditModal}
          onProductUpdated={handleProductUpdated}
        />
      )}

      {/* Add Product Modal */}
      <AddProductModal
        categories={categories}
        isOpen={isAddModalOpen}
        onClose={handleCloseAddModal}
        onProductCreated={handleProductCreated}
      />
    </div>
  );
}
