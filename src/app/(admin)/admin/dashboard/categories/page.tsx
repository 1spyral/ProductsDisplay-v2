"use client";

import {
  deleteAdminCategory,
  getAdminCategoriesForManagement,
  moveAdminCategory,
} from "@/actions/admin";
import AddCategoryModal from "@/components/AddCategoryModal";
import CategoriesTable from "@/components/CategoriesTable";
import ConfirmDeleteModal from "@/components/ConfirmDeleteModal";
import EditCategoryModal from "@/components/EditCategoryModal";
import Category from "@/types/Category";
import { useEffect, useState } from "react";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");

  // Edit modal
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Add modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Delete confirmation modal
  const [deleteCategory, setDeleteCategory] = useState<Category | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Reorder state
  const [movingCategoryId, setMovingCategoryId] = useState<string | null>(null);

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

  const filteredCategories = categories.filter((category) => {
    if (searchQuery) {
      const search = searchQuery.toLowerCase();
      const matchesId = category.category.toLowerCase().includes(search);
      const matchesName = category.name?.toLowerCase().includes(search);
      return matchesId || matchesName;
    }

    return true;
  });

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

  const moveCategoryLocally = (
    categoryId: string,
    direction: "up" | "down"
  ) => {
    setCategories((previous) => {
      const currentIndex = previous.findIndex(
        (category) => category.category === categoryId
      );
      if (currentIndex === -1) return previous;

      const targetIndex =
        direction === "up" ? currentIndex - 1 : currentIndex + 1;
      if (targetIndex < 0 || targetIndex >= previous.length) return previous;

      const reordered = [...previous];
      [reordered[currentIndex], reordered[targetIndex]] = [
        reordered[targetIndex],
        reordered[currentIndex],
      ];

      return reordered.map((category, index) => ({
        ...category,
        displayOrder: index,
      }));
    });
  };

  const handleMoveCategory = async (
    categoryId: string,
    direction: "up" | "down"
  ) => {
    if (movingCategoryId) return;

    const previousCategories = categories;
    setMovingCategoryId(categoryId);
    moveCategoryLocally(categoryId, direction);

    try {
      await moveAdminCategory(categoryId, direction);
    } catch (error) {
      setCategories(previousCategories);
      console.error("Failed to reorder category:", error);
    } finally {
      setMovingCategoryId(null);
    }
  };

  const isReorderEnabled = !searchQuery.trim();

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
              {filteredCategories.length} categories found
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

      {/* Search */}
      <div className="mb-4 border-3 border-gray-400 bg-white p-4 sm:mb-6 sm:p-6">
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
        {!isReorderEnabled && (
          <p className="mt-2 text-xs text-gray-600 sm:text-sm">
            Clear search to enable reordering.
          </p>
        )}
      </div>

      {/* Categories Table */}
      <CategoriesTable
        categories={filteredCategories}
        onMoveCategory={handleMoveCategory}
        isReorderEnabled={isReorderEnabled}
        movingCategoryId={movingCategoryId}
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
