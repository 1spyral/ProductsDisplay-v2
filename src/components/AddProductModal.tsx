"use client";

import { useState } from "react";
import Category from "@/types/Category";
import { createAdminProduct, uploadAdminProductImage } from "@/actions/admin";
import { useProductForm } from "@/hooks/useProductForm";
import ProductFormModal from "./ProductForm/ProductFormModal";
import ProductIdField from "./ProductForm/ProductIdField";
import { ProductNameField, ProductDescriptionField, ProductCategoryField } from "./ProductForm/ProductTextFields";
import { ProductFormError, ProductFormActions } from "./ProductForm/ProductFormActions";
import UnifiedImageManager from "./ProductForm/UnifiedImageManager";

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
    getAddFormData
  } = useProductForm({
    categories,
    mode: "add"
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
            uploadFormData.append('file', file);
            uploadFormData.append('productId', submitData.id);
            uploadFormData.append('position', index.toString());

            return uploadAdminProductImage(uploadFormData);
          });
          
          await Promise.all(uploadPromises);
        } catch (uploadError) {
          console.error('Failed to upload some images:', uploadError);
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
    <form onSubmit={handleSubmit} className="flex-1 flex flex-col space-y-4">
      <ProductIdField
        value={formData.id}
        onChange={(value) => updateField('id', value)}
        validation={validation}
        required
      />

      <ProductNameField
        value={formData.name}
        onChange={(value) => updateField('name', value)}
      />

      <ProductDescriptionField
        value={formData.description}
        onChange={(value) => updateField('description', value)}
      />

      <ProductCategoryField
        value={formData.category}
        onChange={(value) => updateField('category', value)}
        categories={categories}
        required
      />

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
