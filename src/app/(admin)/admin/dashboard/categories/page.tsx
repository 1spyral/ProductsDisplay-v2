"use client";

import {
  deleteAdminCategory,
  getAdminCategoriesForManagement,
} from "@/actions/admin";
import AddCategoryModal from "@/components/AddCategoryModal";
import CategoriesTable from "@/components/CategoriesTable";
import ConfirmDeleteModal from "@/components/ConfirmDeleteModal";
import EditCategoryModal from "@/components/EditCategoryModal";
import Category from "@/types/Category";
import { useEffect, useState } from "react";

type SortField = "category" | "name";
type SortOrder = "asc" | "desc";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");

  // Sorting
  const [sortField, setSortField] = useState<SortField>("category");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

  // Edit modal
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Add modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Delete confirmation modal
  const [deleteCategory, setDeleteCategory] = useState<Category | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const categoriesData = await getAdminCategoriesForManagement();
      setCategories(categoriesData);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort categories
  const filteredAndSortedCategories = categories
    .filter((category) => {
      // Search filter
      if (searchQuery) {
        const search = searchQuery.toLowerCase();
        const matchesId = category.category.toLowerCase().includes(search);
        const matchesName = category.name?.toLowerCase().includes(search);
        return matchesId || matchesName;
      }

      return true;
    })
    .sort((a, b) => {
      let aValue: string;
      let bValue: string;

      if (sortField === "name") {
        aValue = a.name || "";
        bValue = b.name || "";
      } else {
        aValue = a.category;
        bValue = b.category;
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

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingCategory(null);
  };

  const handleAddCategory = () => {
    setIsAddModalOpen(true);
  };

  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
  };

  const handleCategoryUpdated = () => {
    fetchData(); // Refresh the categories list
  };

  const handleCategoryCreated = () => {
    fetchData(); // Refresh the categories list
  };

  const handleDeleteCategory = (category: Category) => {
    setDeleteCategory(category);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDeleteCategory(null);
  };

  const handleConfirmDelete = async () => {
    if (!deleteCategory) return;

    try {
      await deleteAdminCategory(deleteCategory.category);
      fetchData(); // Refresh the categories list
    } catch (error) {
      console.error("Failed to delete category:", error);
      // Error will be handled by the confirmation modal
      throw error;
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
              Categories
            </h1>
            <p className="text-sm text-gray-700 sm:text-base">
              {filteredAndSortedCategories.length} categories found
            </p>
          </div>
          <button
            onClick={handleAddCategory}
            className="bg-slate-700 px-4 py-2 font-bold tracking-wide whitespace-nowrap text-white uppercase transition-colors duration-200 hover:bg-slate-900 sm:px-6"
          >
            Add Category
          </button>
        </div>
      </div>

      {/* Filters & Sort */}
      <div className="mb-4 border-3 border-gray-400 bg-white p-4 sm:mb-6 sm:p-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Search */}
          <div>
            <label className="mb-2 block text-sm font-bold tracking-wide text-gray-900 uppercase">
              Search
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by ID or name..."
              className="h-[42px] w-full border-2 border-gray-400 px-4 transition-colors focus:border-slate-700 focus:outline-none"
            />
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
                  <option value="category">ID</option>
                  <option value="name">Name</option>
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
      </div>

      {/* Categories Table */}
      <CategoriesTable
        categories={filteredAndSortedCategories}
        sortField={sortField}
        sortOrder={sortOrder}
        onSort={handleSort}
        onEdit={handleEditCategory}
        onDelete={handleDeleteCategory}
      />

      {/* Edit Category Modal */}
      {editingCategory && (
        <EditCategoryModal
          key={editingCategory.category}
          category={editingCategory}
          isOpen={isEditModalOpen}
          onClose={handleCloseEditModal}
          onCategoryUpdated={handleCategoryUpdated}
        />
      )}

      {/* Add Category Modal */}
      <AddCategoryModal
        isOpen={isAddModalOpen}
        onClose={handleCloseAddModal}
        onCategoryCreated={handleCategoryCreated}
      />

      {/* Delete Confirmation Modal */}
      {deleteCategory && (
        <ConfirmDeleteModal
          isOpen={isDeleteModalOpen}
          title="Delete Category"
          message={`Are you sure you want to delete "${deleteCategory.name || deleteCategory.category}"? Products using this category will no longer have a category assigned.`}
          confirmText="Delete Category"
          onConfirm={handleConfirmDelete}
          onCancel={handleCloseDeleteModal}
        />
      )}
    </div>
  );
}
