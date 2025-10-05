"use client";

import { useState } from "react";
import Product from "@/types/Product";
import Category from "@/types/Category";
import { updateAdminProduct } from "@/actions/admin";
import { useProductForm } from "@/hooks/useProductForm";
import ProductFormModal from "./ProductForm/ProductFormModal";
import ProductIdField from "./ProductForm/ProductIdField";
import { ProductNameField, ProductDescriptionField, ProductCategoryField } from "./ProductForm/ProductTextFields";
import { ProductFormError, ProductFormActions } from "./ProductForm/ProductFormActions";
import UnifiedImageManager from "./ProductForm/UnifiedImageManager";

interface EditProductModalProps {
  product: Product;
  categories: Category[];
  isOpen: boolean;
  onClose: () => void;
  onProductUpdated: () => void;
}

export default function EditProductModal({
  product,
  categories,
  isOpen,
  onClose,
  onProductUpdated,
}: EditProductModalProps) {
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
    getEditFormData
  } = useProductForm({
    categories,
    initialProduct: product,
    mode: "edit"
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const submitData = getEditFormData();
      
      await updateAdminProduct(product.id, submitData);
      
      onProductUpdated();
      onClose();
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Failed to update product. Please try again.");
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

  // Left panel: Image management
  const leftPanel = (
    <UnifiedImageManager
      mode="edit"
      productId={product.id}
      existingImages={product.images || []}
      onImagesUpdated={onProductUpdated}
    />
  );

  // Right panel: Form fields
  const rightPanel = (
    <form onSubmit={handleSubmit} className="flex-1 flex flex-col space-y-4">
      <ProductIdField
        value={formData.id}
        onChange={(value) => updateField('id', value)}
        validation={validation}
        isLocked={isIdLocked}
        onToggleLock={() => setIsIdLocked(!isIdLocked)}
        required={!isIdLocked}
        isCheckingDuplicate={validation.isCheckingDuplicate}
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
        submitText="Update"
        loadingText="Updating..."
      />
    </form>
  );

  return (
    <ProductFormModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Edit Product"
      leftPanel={leftPanel}
      rightPanel={rightPanel}
    />
  );
}
