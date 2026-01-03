"use client";

import { useState } from "react";
import Category from "@/types/Category";
import { updateAdminCategory } from "@/actions/admin";
import { useCategoryForm } from "@/hooks/useCategoryForm";
import Modal from "./Modal";
import {
  CategoryIdField,
  CategoryNameField,
  CategoryFormError,
  CategoryFormActions,
} from "./CategoryForm";

interface EditCategoryModalProps {
  category: Category;
  isOpen: boolean;
  onClose: () => void;
  onCategoryUpdated: () => void;
}

export default function EditCategoryModal({
  category,
  isOpen,
  onClose,
  onCategoryUpdated,
}: EditCategoryModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Use the shared form logic
  const {
    formData,
    updateField,
    validation,
    isIdLocked,
    setIsIdLocked,
    isFormValid,
    resetForm,
    getEditFormData,
  } = useCategoryForm({
    initialCategory: category,
    mode: "edit",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const submitData = getEditFormData();

      await updateAdminCategory(category.category, submitData);

      onCategoryUpdated();
      onClose();
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Failed to update category. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setError("");
    resetForm();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Edit Category"
      size="md"
      showHeaderCloseButton
    >
      <form onSubmit={handleSubmit} className="flex flex-col space-y-4 p-4">
        <CategoryIdField
          value={formData.category}
          onChange={(value) => updateField("category", value)}
          validation={validation}
          isLocked={isIdLocked}
          onToggleLock={() => setIsIdLocked(!isIdLocked)}
          required={!isIdLocked}
          isCheckingDuplicate={validation.isCheckingDuplicate}
        />

        <CategoryNameField
          value={formData.name}
          onChange={(value) => updateField("name", value)}
        />

        <CategoryFormError error={error} />

        <CategoryFormActions
          onCancel={handleClose}
          onSubmit={handleSubmit}
          isLoading={loading}
          isValid={isFormValid()}
          submitText="Update"
          loadingText="Updating..."
        />
      </form>
    </Modal>
  );
}
