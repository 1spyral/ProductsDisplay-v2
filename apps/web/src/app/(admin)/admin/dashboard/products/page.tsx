"use client";

import {
  deleteAdminProduct,
  getAdminCategories,
  getAdminProducts,
  toggleAdminProductClearance,
  toggleAdminProductHidden,
} from "@/actions/admin";
import AddProductModal from "@/components/AddProductModal";
import ConfirmDeleteModal from "@/components/ConfirmDeleteModal";
import EditProductModal from "@/components/EditProductModal";
import ProductsTable from "@/components/ProductsTable";
import Category from "@/types/Category";
import Product from "@/types/Product";
import { useEffect, useState } from "react";

type SortField = "id" | "name" | "category";
type SortOrder = "asc" | "desc";

type ProductsDataState = {
  products: Product[];
  categories: Category[];
  loading: boolean;
  updatingClearance: Record<string, boolean>;
  updatingHidden: Record<string, boolean>;
};

type ProductFilterSortState = {
  searchQuery: string;
  categoryFilter: string;
  clearanceFilter: string;
  hiddenFilter: string;
  sortField: SortField;
  sortOrder: SortOrder;
};

type ProductModalState = {
  editingProduct: Product | null;
  isEditModalOpen: boolean;
  isAddModalOpen: boolean;
  deleteProduct: Product | null;
  isDeleteModalOpen: boolean;
};

type ProductsHeaderProps = {
  productCount: number;
  onAddProduct: () => void;
};

function ProductsHeader({ productCount, onAddProduct }: ProductsHeaderProps) {
  return (
    <div className="mb-4 border-4 border-slate-700 bg-white p-4 sm:mb-6 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-3">
          <h1 className="text-2xl font-bold tracking-wide text-gray-900 uppercase sm:text-3xl">
            Products
          </h1>
          <p className="text-sm text-gray-700 sm:text-base">
            {productCount} products found
          </p>
        </div>
        <button
          onClick={onAddProduct}
          className="bg-slate-700 px-4 py-2 font-bold tracking-wide whitespace-nowrap text-white uppercase transition-colors duration-200 hover:bg-slate-900 sm:px-6"
        >
          Add Product
        </button>
      </div>
    </div>
  );
}

type ProductsFiltersProps = {
  searchQuery: string;
  categoryFilter: string;
  clearanceFilter: string;
  hiddenFilter: string;
  sortField: SortField;
  sortOrder: SortOrder;
  categories: Category[];
  onSearchQueryChange: (value: string) => void;
  onCategoryFilterChange: (value: string) => void;
  onSortFieldChange: (value: SortField) => void;
  onSortOrderToggle: () => void;
  onClearanceFilterChange: (value: string) => void;
  onHiddenFilterChange: (value: string) => void;
};

function ProductsFilters({
  searchQuery,
  categoryFilter,
  clearanceFilter,
  hiddenFilter,
  sortField,
  sortOrder,
  categories,
  onSearchQueryChange,
  onCategoryFilterChange,
  onSortFieldChange,
  onSortOrderToggle,
  onClearanceFilterChange,
  onHiddenFilterChange,
}: ProductsFiltersProps) {
  return (
    <div className="mb-4 border-3 border-gray-400 bg-white p-4 sm:mb-6 sm:p-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div>
          <label
            htmlFor="products-search"
            className="mb-2 block text-sm font-bold tracking-wide text-gray-900 uppercase"
          >
            Search
          </label>
          <input
            id="products-search"
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
            placeholder="Search by ID, name, or category..."
            className="h-[42px] w-full border-2 border-gray-400 px-4 transition-colors focus:border-slate-700 focus:outline-none"
          />
        </div>

        <div>
          <label
            htmlFor="products-category-filter"
            className="mb-2 block text-sm font-bold tracking-wide text-gray-900 uppercase"
          >
            Category
          </label>
          <div className="relative">
            <select
              id="products-category-filter"
              value={categoryFilter}
              onChange={(e) => onCategoryFilterChange(e.target.value)}
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

        <div>
          <label
            htmlFor="products-sort-field"
            className="mb-2 block text-sm font-bold tracking-wide text-gray-900 uppercase"
          >
            Sort By
          </label>
          <div className="flex h-[42px] gap-2">
            <div className="relative flex-1">
              <select
                id="products-sort-field"
                value={sortField}
                onChange={(e) => onSortFieldChange(e.target.value as SortField)}
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
              onClick={onSortOrderToggle}
              className="flex w-[42px] items-center justify-center border-2 border-gray-400 font-bold transition-colors hover:border-slate-700"
              title={sortOrder === "asc" ? "Ascending" : "Descending"}
            >
              {sortOrder === "asc" ? "↑" : "↓"}
            </button>
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label
            htmlFor="products-clearance-filter"
            className="mb-2 block text-sm font-bold tracking-wide text-gray-900 uppercase"
          >
            Clearance Status
          </label>
          <div className="relative">
            <select
              id="products-clearance-filter"
              value={clearanceFilter}
              onChange={(e) => onClearanceFilterChange(e.target.value)}
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

        <div>
          <label
            htmlFor="products-hidden-filter"
            className="mb-2 block text-sm font-bold tracking-wide text-gray-900 uppercase"
          >
            Visibility Status
          </label>
          <div className="relative">
            <select
              id="products-hidden-filter"
              value={hiddenFilter}
              onChange={(e) => onHiddenFilterChange(e.target.value)}
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
  );
}

function useProductsPageController() {
  const [dataState, setDataState] = useState<ProductsDataState>({
    products: [],
    categories: [],
    loading: true,
    updatingClearance: {},
    updatingHidden: {},
  });
  const { products, categories, loading, updatingClearance, updatingHidden } =
    dataState;

  const [filterSortState, setFilterSortState] =
    useState<ProductFilterSortState>({
      searchQuery: "",
      categoryFilter: "all",
      clearanceFilter: "all",
      hiddenFilter: "all",
      sortField: "id",
      sortOrder: "asc",
    });
  const {
    searchQuery,
    categoryFilter,
    clearanceFilter,
    hiddenFilter,
    sortField,
    sortOrder,
  } = filterSortState;

  const [modalState, setModalState] = useState<ProductModalState>({
    editingProduct: null,
    isEditModalOpen: false,
    isAddModalOpen: false,
    deleteProduct: null,
    isDeleteModalOpen: false,
  });
  const {
    editingProduct,
    isEditModalOpen,
    isAddModalOpen,
    deleteProduct,
    isDeleteModalOpen,
  } = modalState;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [productsData, categoriesData] = await Promise.all([
        getAdminProducts(),
        getAdminCategories(),
      ]);

      setDataState((prev) => ({
        ...prev,
        products: productsData,
        categories: categoriesData,
        loading: false,
      }));
    } catch (error) {
      console.error("Failed to fetch data:", error);
      setDataState((prev) => ({ ...prev, loading: false }));
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
      setFilterSortState((prev) => ({
        ...prev,
        sortOrder: prev.sortOrder === "asc" ? "desc" : "asc",
      }));
    } else {
      setFilterSortState((prev) => ({
        ...prev,
        sortField: field,
        sortOrder: "asc",
      }));
    }
  };

  const handleEditProduct = (product: Product) => {
    setModalState((prev) => ({
      ...prev,
      editingProduct: product,
      isEditModalOpen: true,
    }));
  };

  const handleCloseEditModal = () => {
    setModalState((prev) => ({
      ...prev,
      isEditModalOpen: false,
      editingProduct: null,
    }));
  };

  const handleAddProduct = () => {
    setModalState((prev) => ({ ...prev, isAddModalOpen: true }));
  };

  const handleCloseAddModal = () => {
    setModalState((prev) => ({ ...prev, isAddModalOpen: false }));
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
            setModalState((prev) => ({
              ...prev,
              editingProduct: updatedProduct,
            }));
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
    setModalState((prev) => ({
      ...prev,
      deleteProduct: product,
      isDeleteModalOpen: true,
    }));
  };

  const handleCloseDeleteModal = () => {
    setModalState((prev) => ({
      ...prev,
      isDeleteModalOpen: false,
      deleteProduct: null,
    }));
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
    setDataState((prev) => ({
      ...prev,
      products: prev.products.map((p) =>
        p.id === productId ? { ...p, clearance: !current } : p
      ),
      updatingClearance: { ...prev.updatingClearance, [productId]: true },
    }));

    try {
      await toggleAdminProductClearance(productId, !current);
    } catch (error) {
      console.error("Failed to toggle clearance:", error);
      // revert
      setDataState((prev) => ({ ...prev, products: previous }));
      alert(
        `Failed to update clearance: ${error instanceof Error ? error.message : String(error)}`
      );
    } finally {
      setDataState((prev) => {
        const copy = { ...prev.updatingClearance };
        delete copy[productId];
        return { ...prev, updatingClearance: copy };
      });
    }
  };

  const handleToggleHidden = async (productId: string, current: boolean) => {
    // optimistic update
    const previous = products;
    setDataState((prev) => ({
      ...prev,
      products: prev.products.map((p) =>
        p.id === productId ? { ...p, hidden: !current } : p
      ),
      updatingHidden: { ...prev.updatingHidden, [productId]: true },
    }));

    try {
      await toggleAdminProductHidden(productId, !current);
    } catch (error) {
      console.error("Failed to toggle hidden:", error);
      // revert
      setDataState((prev) => ({ ...prev, products: previous }));
      alert(
        `Failed to update hidden: ${error instanceof Error ? error.message : String(error)}`
      );
    } finally {
      setDataState((prev) => {
        const copy = { ...prev.updatingHidden };
        delete copy[productId];
        return { ...prev, updatingHidden: copy };
      });
    }
  };

  const updateFilters = (updates: Partial<ProductFilterSortState>) => {
    setFilterSortState((prev) => ({ ...prev, ...updates }));
  };

  return {
    loading,
    categories,
    searchQuery,
    categoryFilter,
    clearanceFilter,
    hiddenFilter,
    sortField,
    sortOrder,
    filteredAndSortedProducts,
    updatingClearance,
    updatingHidden,
    editingProduct,
    isEditModalOpen,
    isAddModalOpen,
    deleteProduct,
    isDeleteModalOpen,
    handleSort,
    handleEditProduct,
    handleDeleteProduct,
    handleToggleClearance,
    handleToggleHidden,
    handleCloseEditModal,
    handleProductUpdated,
    handleCloseAddModal,
    handleProductCreated,
    handleConfirmDelete,
    handleCloseDeleteModal,
    handleAddProduct,
    updateFilters,
  };
}

export default function ProductsPage() {
  const {
    loading,
    categories,
    searchQuery,
    categoryFilter,
    clearanceFilter,
    hiddenFilter,
    sortField,
    sortOrder,
    filteredAndSortedProducts,
    updatingClearance,
    updatingHidden,
    editingProduct,
    isEditModalOpen,
    isAddModalOpen,
    deleteProduct,
    isDeleteModalOpen,
    handleSort,
    handleEditProduct,
    handleDeleteProduct,
    handleToggleClearance,
    handleToggleHidden,
    handleCloseEditModal,
    handleProductUpdated,
    handleCloseAddModal,
    handleProductCreated,
    handleConfirmDelete,
    handleCloseDeleteModal,
    handleAddProduct,
    updateFilters,
  } = useProductsPageController();

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
      <ProductsHeader
        productCount={filteredAndSortedProducts.length}
        onAddProduct={handleAddProduct}
      />

      <ProductsFilters
        searchQuery={searchQuery}
        categoryFilter={categoryFilter}
        clearanceFilter={clearanceFilter}
        hiddenFilter={hiddenFilter}
        sortField={sortField}
        sortOrder={sortOrder}
        categories={categories}
        onSearchQueryChange={(value) => updateFilters({ searchQuery: value })}
        onCategoryFilterChange={(value) =>
          updateFilters({ categoryFilter: value })
        }
        onSortFieldChange={(value) => updateFilters({ sortField: value })}
        onSortOrderToggle={() =>
          updateFilters({ sortOrder: sortOrder === "asc" ? "desc" : "asc" })
        }
        onClearanceFilterChange={(value) =>
          updateFilters({ clearanceFilter: value })
        }
        onHiddenFilterChange={(value) => updateFilters({ hiddenFilter: value })}
      />

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

      <AddProductModal
        categories={categories}
        isOpen={isAddModalOpen}
        onClose={handleCloseAddModal}
        onProductCreated={handleProductCreated}
      />

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
