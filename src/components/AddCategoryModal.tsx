"use client";

import { createAdminCategory } from "@/actions/admin";
import { useCategoryForm } from "@/hooks/useCategoryForm";
import { useState } from "react";
import {
  CategoryFormActions,
  CategoryFormError,
  CategoryIdField,
  CategoryNameField,
} from "./CategoryForm";
import Modal from "./Modal";

interface AddCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCategoryCreated: () => void;
}

export default function AddCategoryModal({
  isOpen,
  onClose,
  onCategoryCreated,
}: AddCategoryModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Use the shared form logic
  const {
    formData,
    updateField,
    validation,
    isFormValid,
    resetForm,
    getAddFormData,
  } = useCategoryForm({
    mode: "add",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const submitData = getAddFormData();

      await createAdminCategory(submitData);

      onCategoryCreated();
      handleClose();
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Failed to create category. Please try again.");
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
      title="Add New Category"
      size="md"
      showHeaderCloseButton
    >
      <form onSubmit={handleSubmit} className="flex flex-col space-y-4 p-4">
        <CategoryIdField
          value={formData.category}
          onChange={(value) => updateField("category", value)}
          validation={validation}
          required
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
          submitText="Create Category"
          loadingText="Creating..."
        />
      </form>
    </Modal>
  );
}
