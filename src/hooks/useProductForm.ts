import { useState, useEffect } from "react";
import Category from "@/types/Category";
import Product from "@/types/Product";
import { useProductIdValidation } from "./useProductFormValidation";

interface ProductFormData {
    id: string;
    name: string;
    description: string;
    category: string;
}

interface UseProductFormProps {
    categories: Category[];
    initialProduct?: Product | null; // For edit mode
    mode: "add" | "edit";
}

export function useProductForm({
    categories,
    initialProduct,
    mode,
}: UseProductFormProps) {
    // Initialize form data
    const [formData, setFormData] = useState<ProductFormData>({
        id: initialProduct?.id || "",
        name: initialProduct?.name || "",
        description: initialProduct?.description || "",
        category: initialProduct?.category || categories[0]?.category || "",
    });

    // Track if ID field is locked (only relevant for edit mode)
    const [isIdLocked, setIsIdLocked] = useState(mode === "edit");

    // Set up validation
    const validation = useProductIdValidation(formData.id, {
        initialId: initialProduct?.id,
        skipDuplicateCheck: mode === "edit" && isIdLocked,
    });

    // Update form data when initial product changes (for edit mode)
    useEffect(() => {
        if (initialProduct) {
            setFormData({
                id: initialProduct.id,
                name: initialProduct.name || "",
                description: initialProduct.description || "",
                category: initialProduct.category,
            });
            setIsIdLocked(true); // Reset lock when product changes
        }
    }, [initialProduct]);

    // Form field update handlers
    const updateField = (field: keyof ProductFormData, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    // Check if form is valid for submission
    const isFormValid = (): boolean => {
        if (mode === "add") {
            return !!(
                formData.id.trim() &&
                formData.category &&
                !validation.getIdValidationMessage(formData.id) &&
                !validation.isCheckingDuplicate
            );
        } else {
            // For edit mode
            if (!isIdLocked && validation.getIdValidationMessage(formData.id)) {
                return false;
            }
            return hasChanges();
        }
    };

    // Check if form has changes (for edit mode)
    const hasChanges = (): boolean => {
        if (!initialProduct) return true; // In add mode, always consider as having changes

        const idChanged =
            !isIdLocked && formData.id.trim() !== initialProduct.id;
        const nameChanged =
            (formData.name.trim() || null) !== initialProduct.name;
        const descriptionChanged =
            (formData.description.trim() || null) !==
            initialProduct.description;
        const categoryChanged = formData.category !== initialProduct.category;

        return (
            idChanged || nameChanged || descriptionChanged || categoryChanged
        );
    };

    // Reset form to initial state
    const resetForm = () => {
        if (initialProduct) {
            setFormData({
                id: initialProduct.id,
                name: initialProduct.name || "",
                description: initialProduct.description || "",
                category: initialProduct.category,
            });
            setIsIdLocked(true);
        } else {
            setFormData({
                id: "",
                name: "",
                description: "",
                category: categories[0]?.category || "",
            });
        }
    };

    // Get form data for submission
    const getFormDataForSubmission = () => {
        const baseData = {
            name: formData.name.trim() || null,
            description: formData.description.trim() || null,
            category: formData.category,
        };

        if (mode === "add") {
            return {
                id: formData.id.trim(),
                ...baseData,
            };
        } else {
            return {
                ...baseData,
                newId:
                    !isIdLocked && formData.id.trim() !== initialProduct?.id
                        ? formData.id.trim()
                        : undefined,
            };
        }
    };

    // Get typed form data for submission
    const getAddFormData = () => {
        return {
            id: formData.id.trim(),
            name: formData.name.trim() || null,
            description: formData.description.trim() || null,
            category: formData.category,
        };
    };

    const getEditFormData = () => {
        return {
            name: formData.name.trim() || null,
            description: formData.description.trim() || null,
            category: formData.category,
            newId:
                !isIdLocked && formData.id.trim() !== initialProduct?.id
                    ? formData.id.trim()
                    : undefined,
        };
    };

    return {
        formData,
        updateField,
        validation,
        isIdLocked,
        setIsIdLocked,
        isFormValid,
        hasChanges,
        resetForm,
        getFormDataForSubmission,
        getAddFormData,
        getEditFormData,
    };
}
