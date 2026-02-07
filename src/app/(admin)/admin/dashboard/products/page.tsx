"use client";

import { useState, useEffect } from "react";
import {
  getAdminProducts,
  getAdminCategories,
  deleteAdminProduct,
  toggleAdminProductClearance,
  toggleAdminProductHidden,
} from "@/actions/admin";
import Product from "@/types/Product";
import Category from "@/types/Category";
import EditProductModal from "@/components/EditProductModal";
import AddProductModal from "@/components/AddProductModal";
import ConfirmDeleteModal from "@/components/ConfirmDeleteModal";
import ProductsTable from "@/components/ProductsTable";

type SortField = "id" | "name" | "category";
type SortOrder = "asc" | "desc";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [clearanceFilter, setClearanceFilter] = useState<string>("all");
  const [hiddenFilter, setHiddenFilter] = useState<string>("all");

  // Sorting
  const [sortField, setSortField] = useState<SortField>("id");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

  // Edit modal
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Add modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Delete confirmation modal
  const [deleteProduct, setDeleteProduct] = useState<Product | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Clearance update state
  const [updatingClearance, setUpdatingClearance] = useState<{
    [id: string]: boolean;
  }>({});

  // Hidden update state
  const [updatingHidden, setUpdatingHidden] = useState<{
    [id: string]: boolean;
  }>({});

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

      // Clearance filter
      if (clearanceFilter !== "all") {
        const isClearance = product.clearance === true;
        if (clearanceFilter === "clearance" && !isClearance) {
          return false;
        }
        if (clearanceFilter === "regular" && isClearance) {
          return false;
        }
      }

      // Hidden filter
      if (hiddenFilter !== "all") {
        const isHidden = product.hidden === true;
        if (hiddenFilter === "hidden" && !isHidden) {
          return false;
        }
        if (hiddenFilter === "visible" && isHidden) {
          return false;
        }
      }

      // Search filter
      if (searchQuery) {
        const search = searchQuery.toLowerCase();
        const matchesId = product.id.toLowerCase().includes(search);
        const matchesName = product.name?.toLowerCase().includes(search);
        const matchesCategory = (product.category || "")
          .toLowerCase()
          .includes(search);
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
        aValue = a.category || "";
        bValue = b.category || "";
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
          const updatedProduct = updatedProducts.find(
            (p) => p.id === editingProduct.id
          );
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

  const handleDeleteProduct = (product: Product) => {
    setDeleteProduct(product);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDeleteProduct(null);
  };

  const handleConfirmDelete = async () => {
    if (!deleteProduct) return;

    try {
      await deleteAdminProduct(deleteProduct.id);
      fetchData(); // Refresh the products list
    } catch (error) {
      console.error("Failed to delete product:", error);
      // Error will be handled by the confirmation modal
      throw error;
    }
  };

  const handleToggleClearance = async (productId: string, current: boolean) => {
    // optimistic update
    const previous = products;
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, clearance: !current } : p))
    );
    setUpdatingClearance((s) => ({ ...s, [productId]: true }));

    try {
      await toggleAdminProductClearance(productId, !current);
    } catch (error) {
      console.error("Failed to toggle clearance:", error);
      // revert
      setProducts(previous);
      alert(
        `Failed to update clearance: ${error instanceof Error ? error.message : String(error)}`
      );
    } finally {
      setUpdatingClearance((s) => {
        const copy = { ...s };
        delete copy[productId];
        return copy;
      });
    }
  };

  const handleToggleHidden = async (productId: string, current: boolean) => {
    // optimistic update
    const previous = products;
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, hidden: !current } : p))
    );
    setUpdatingHidden((s) => ({ ...s, [productId]: true }));

    try {
      await toggleAdminProductHidden(productId, !current);
    } catch (error) {
      console.error("Failed to toggle hidden:", error);
      // revert
      setProducts(previous);
      alert(
        `Failed to update hidden: ${error instanceof Error ? error.message : String(error)}`
      );
    } finally {
      setUpdatingHidden((s) => {
        const copy = { ...s };
        delete copy[productId];
        return copy;
      });
    }
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-6 md:p-8">
        <div className="border-3 border-gray-400 bg-white p-6 text-center sm:p-8">
          <p className="text-lg font-bold text-gray-900 uppercase sm:text-xl">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 md:p-8">
      {/* Header */}
      <div className="mb-4 border-4 border-slate-700 bg-white p-4 sm:mb-6 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-3">
            <h1 className="text-2xl font-bold tracking-wide text-gray-900 uppercase sm:text-3xl">
              Products
            </h1>
            <p className="text-sm text-gray-700 sm:text-base">
              {filteredAndSortedProducts.length} products found
            </p>
          </div>
          <button
            onClick={handleAddProduct}
            className="bg-slate-700 px-4 py-2 font-bold tracking-wide whitespace-nowrap text-white uppercase transition-colors duration-200 hover:bg-slate-900 sm:px-6"
          >
            Add Product
          </button>
        </div>
      </div>

      {/* Filters & Sort */}
      <div className="mb-4 border-3 border-gray-400 bg-white p-4 sm:mb-6 sm:p-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {/* Search */}
          <div>
            <label className="mb-2 block text-sm font-bold tracking-wide text-gray-900 uppercase">
              Search
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by ID, name, or category..."
              className="h-[42px] w-full border-2 border-gray-400 px-4 transition-colors focus:border-slate-700 focus:outline-none"
            />
          </div>

          {/* Category Filter */}
          <div>
            <label className="mb-2 block text-sm font-bold tracking-wide text-gray-900 uppercase">
              Category
            </label>
            <div className="relative">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="h-[42px] w-full appearance-none border-2 border-gray-400 pr-10 pl-4 transition-colors focus:border-slate-700 focus:outline-none"
              >
                <option value="all">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.category} value={cat.category}>
                    {cat.name || cat.category}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 font-bold text-gray-600">
                ▼
              </div>
            </div>
          </div>

          {/* Sort */}
          <div>
            <label className="mb-2 block text-sm font-bold tracking-wide text-gray-900 uppercase">
              Sort By
            </label>
            <div className="flex h-[42px] gap-2">
              <div className="relative flex-1">
                <select
                  value={sortField}
                  onChange={(e) => setSortField(e.target.value as SortField)}
                  className="h-full w-full appearance-none border-2 border-gray-400 pr-10 pl-4 transition-colors focus:border-slate-700 focus:outline-none"
                >
                  <option value="id">ID</option>
                  <option value="name">Name</option>
                  <option value="category">Category</option>
                </select>
                <div className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 font-bold text-gray-600">
                  ▼
                </div>
              </div>
              <button
                onClick={() =>
                  setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                }
                className="flex w-[42px] items-center justify-center border-2 border-gray-400 font-bold transition-colors hover:border-slate-700"
                title={sortOrder === "asc" ? "Ascending" : "Descending"}
              >
                {sortOrder === "asc" ? "↑" : "↓"}
              </button>
            </div>
          </div>
        </div>

        {/* Additional Filters Row */}
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Clearance Filter */}
          <div>
            <label className="mb-2 block text-sm font-bold tracking-wide text-gray-900 uppercase">
              Clearance Status
            </label>
            <div className="relative">
              <select
                value={clearanceFilter}
                onChange={(e) => setClearanceFilter(e.target.value)}
                className="h-[42px] w-full appearance-none border-2 border-gray-400 pr-10 pl-4 transition-colors focus:border-slate-700 focus:outline-none"
              >
                <option value="all">All Products</option>
                <option value="clearance">Clearance Only</option>
                <option value="regular">Regular Only</option>
              </select>
              <div className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 font-bold text-gray-600">
                ▼
              </div>
            </div>
          </div>

          {/* Hidden Filter */}
          <div>
            <label className="mb-2 block text-sm font-bold tracking-wide text-gray-900 uppercase">
              Visibility Status
            </label>
            <div className="relative">
              <select
                value={hiddenFilter}
                onChange={(e) => setHiddenFilter(e.target.value)}
                className="h-[42px] w-full appearance-none border-2 border-gray-400 pr-10 pl-4 transition-colors focus:border-slate-700 focus:outline-none"
              >
                <option value="all">All Products</option>
                <option value="visible">Visible Only</option>
                <option value="hidden">Hidden Only</option>
              </select>
              <div className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 font-bold text-gray-600">
                ▼
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <ProductsTable
        products={filteredAndSortedProducts}
        sortField={sortField}
        sortOrder={sortOrder}
        onSort={handleSort}
        onEdit={handleEditProduct}
        onDelete={handleDeleteProduct}
        onToggleClearance={handleToggleClearance}
        onToggleHidden={handleToggleHidden}
        updatingClearance={updatingClearance}
        updatingHidden={updatingHidden}
      />

      {/* Edit Product Modal */}
      {editingProduct && (
        <EditProductModal
          key={editingProduct.id}
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

      {/* Delete Confirmation Modal */}
      {deleteProduct && (
        <ConfirmDeleteModal
          isOpen={isDeleteModalOpen}
          title="Delete Product"
          message={`Are you sure you want to delete "${deleteProduct.name || deleteProduct.id}"? This will also delete all associated images.`}
          confirmText="Delete Product"
          onConfirm={handleConfirmDelete}
          onCancel={handleCloseDeleteModal}
        />
      )}
    </div>
  );
}
