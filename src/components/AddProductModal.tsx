"use client";

import { createAdminProduct, uploadAdminProductImage } from "@/actions/admin";
import { useProductForm } from "@/hooks/useProductForm";
import Category from "@/types/Category";
import { useState } from "react";
import {
  ProductCategoryField,
  ProductClearanceField,
  ProductDescriptionField,
  ProductFormActions,
  ProductFormError,
  ProductFormModal,
  ProductHiddenField,
  ProductIdField,
  ProductNameField,
  ProductPriceField,
  ProductSoldOutField,
  UnifiedImageManager,
} from "./ProductForm";

interface AddProductModalProps {
  categories: Category[];
  isOpen: boolean;
  onClose: () => void;
  onProductCreated: () => void;
}

export default function AddProductModal({
  categories,
  isOpen,
  onClose,
  onProductCreated,
}: AddProductModalProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
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
  } = useProductForm({
    mode: "add",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const submitData = getAddFormData();

      // Create the product first
      await createAdminProduct(submitData);

      // Upload images if any were selected
      if (selectedFiles.length > 0) {
        try {
          const uploadPromises = selectedFiles.map(async (file, index) => {
            const uploadFormData = new FormData();
            uploadFormData.append("file", file);
            uploadFormData.append("productId", submitData.id);
            uploadFormData.append("position", index.toString());

            return uploadAdminProductImage(uploadFormData);
          });

          await Promise.all(uploadPromises);
        } catch (uploadError) {
          console.error("Failed to upload some images:", uploadError);
          // Product is created but images failed - still consider it a success
        }
      }

      onProductCreated();
      handleClose();
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Failed to create product. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setError("");
    setSelectedFiles([]);
    resetForm();
    onClose();
  };

  // Left panel: Image management
  const leftPanel = (
    <UnifiedImageManager
      mode="add"
      selectedFiles={selectedFiles}
      onFilesChange={setSelectedFiles}
    />
  );

  // Right panel: Form fields
  const rightPanel = (
    <form
      onSubmit={handleSubmit}
      className="flex flex-1 flex-col space-y-4 p-4"
    >
      <ProductIdField
        value={formData.id}
        onChange={(value) => updateField("id", value)}
        validation={validation}
        required
      />

      <ProductNameField
        value={formData.name}
        onChange={(value) => updateField("name", value)}
      />

      <ProductDescriptionField
        value={formData.description}
        onChange={(value) => updateField("description", value)}
      />

      <ProductCategoryField
        value={formData.category}
        onChange={(value) => updateField("category", value)}
        categories={categories}
        required={false}
      />

      <ProductPriceField
        value={formData.price}
        onChange={(value) => updateField("price", value)}
      />

      <div className="flex flex-col gap-4 sm:flex-row sm:gap-6">
        <ProductClearanceField
          value={formData.clearance}
          onChange={(value) => updateField("clearance", value)}
        />

        <ProductSoldOutField
          value={formData.soldOut}
          onChange={(value) => updateField("soldOut", value)}
        />

        <ProductHiddenField
          value={formData.hidden}
          onChange={(value) => updateField("hidden", value)}
        />
      </div>

      <ProductFormError error={error} />

      <ProductFormActions
        onCancel={handleClose}
        onSubmit={handleSubmit}
        isLoading={loading}
        isValid={isFormValid()}
        submitText="Create Product"
        loadingText="Creating..."
      />
    </form>
  );

  return (
    <ProductFormModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Add New Product"
      leftPanel={leftPanel}
      rightPanel={rightPanel}
    />
  );
}
