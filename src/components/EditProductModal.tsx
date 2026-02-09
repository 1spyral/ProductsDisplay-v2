"use client";

import { updateAdminProduct } from "@/actions/admin";
import { useProductForm } from "@/hooks/useProductForm";
import Category from "@/types/Category";
import Product from "@/types/Product";
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
    getEditFormData,
  } = useProductForm({
    initialProduct: product,
    mode: "edit",
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
    <form
      onSubmit={handleSubmit}
      className="flex flex-1 flex-col space-y-4 p-4"
    >
      <ProductIdField
        value={formData.id}
        onChange={(value) => updateField("id", value)}
        validation={validation}
        isLocked={isIdLocked}
        onToggleLock={() => setIsIdLocked(!isIdLocked)}
        required={!isIdLocked}
        isCheckingDuplicate={validation.isCheckingDuplicate}
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
