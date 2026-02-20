"use client";

import {
  deleteAdminCategory,
  getAdminCategoriesForManagement,
  reorderAdminCategories,
} from "@/actions/admin";
import AddCategoryModal from "@/components/AddCategoryModal";
import CategoriesTable from "@/components/CategoriesTable";
import ConfirmDeleteModal from "@/components/ConfirmDeleteModal";
import EditCategoryModal from "@/components/EditCategoryModal";
import Category from "@/types/Category";
import { useEffect, useState } from "react";

type CategoriesDataState = {
  categories: Category[];
  loading: boolean;
};

type CategoryModalState = {
  editingCategory: Category | null;
  isEditModalOpen: boolean;
  isAddModalOpen: boolean;
  deleteCategory: Category | null;
  isDeleteModalOpen: boolean;
};

export default function CategoriesPage() {
  const [dataState, setDataState] = useState<CategoriesDataState>({
    categories: [],
    loading: true,
  });
  const { categories, loading } = dataState;

  // Filters
  const [searchQuery, setSearchQuery] = useState("");

  // Modal state
  const [modalState, setModalState] = useState<CategoryModalState>({
    editingCategory: null,
    isEditModalOpen: false,
    isAddModalOpen: false,
    deleteCategory: null,
    isDeleteModalOpen: false,
  });
  const {
    editingCategory,
    isEditModalOpen,
    isAddModalOpen,
    deleteCategory,
    isDeleteModalOpen,
  } = modalState;

  // Reorder state
  const [isReordering, setIsReordering] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const categoriesData = await getAdminCategoriesForManagement();
      setDataState({
        categories: categoriesData,
        loading: false,
      });
    } catch (error) {
      console.error("Failed to fetch data:", error);
      setDataState((prev) => ({ ...prev, loading: false }));
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
    setModalState((prev) => ({
      ...prev,
      editingCategory: category,
      isEditModalOpen: true,
    }));
  };

  const handleCloseEditModal = () => {
    setModalState((prev) => ({
      ...prev,
      isEditModalOpen: false,
      editingCategory: null,
    }));
  };

  const handleAddCategory = () => {
    setModalState((prev) => ({ ...prev, isAddModalOpen: true }));
  };

  const handleCloseAddModal = () => {
    setModalState((prev) => ({ ...prev, isAddModalOpen: false }));
  };

  const handleCategoryUpdated = () => {
    fetchData(); // Refresh the categories list
  };

  const handleCategoryCreated = () => {
    fetchData(); // Refresh the categories list
  };

  const handleDeleteCategory = (category: Category) => {
    setModalState((prev) => ({
      ...prev,
      deleteCategory: category,
      isDeleteModalOpen: true,
    }));
  };

  const handleCloseDeleteModal = () => {
    setModalState((prev) => ({
      ...prev,
      isDeleteModalOpen: false,
      deleteCategory: null,
    }));
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

  const applyOrderedCategories = (
    existingCategories: Category[],
    orderedCategoryIds: string[]
  ): Category[] => {
    const categoryMap = new Map(
      existingCategories.map((category) => [category.category, category])
    );
    const reordered = orderedCategoryIds
      .map((categoryId, index) => {
        const category = categoryMap.get(categoryId);
        if (!category) return null;
        return {
          ...category,
          displayOrder: index,
        };
      })
      .filter((category): category is Category => category !== null);

    if (reordered.length !== existingCategories.length) {
      return existingCategories;
    }

    return reordered;
  };

  const handleReorderCategories = async (orderedCategoryIds: string[]) => {
    if (isReordering) return;

    const previousCategories = categories;
    const nextCategories = applyOrderedCategories(
      categories,
      orderedCategoryIds
    );
    setDataState((prev) => ({ ...prev, categories: nextCategories }));
    setIsReordering(true);

    try {
      await reorderAdminCategories(orderedCategoryIds);
    } catch (error) {
      setDataState((prev) => ({ ...prev, categories: previousCategories }));
      console.error("Failed to reorder categories:", error);
    } finally {
      setIsReordering(false);
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
        <label
          htmlFor="categories-search"
          className="mb-2 block text-sm font-bold tracking-wide text-gray-900 uppercase"
        >
          Search
        </label>
        <input
          id="categories-search"
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
        onReorderCategories={handleReorderCategories}
        isReorderEnabled={isReorderEnabled}
        isReordering={isReordering}
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
