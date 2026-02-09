import Category from "@/types/Category";
import { useState } from "react";
import { useCategoryIdValidation } from "./useCategoryFormValidation";

interface CategoryFormData {
    category: string;
    name: string;
}

interface UseCategoryFormProps {
    initialCategory?: Category | null; // For edit mode
    mode: "add" | "edit";
}

export function useCategoryForm({
    initialCategory,
    mode,
}: UseCategoryFormProps) {
    // Initialize form data
    const [formData, setFormData] = useState<CategoryFormData>({
        category: initialCategory?.category || "",
        name: initialCategory?.name || "",
    });

    // Track if ID field is locked (only relevant for edit mode)
    const [isIdLocked, setIsIdLocked] = useState(mode === "edit");

    // Set up validation
    const validation = useCategoryIdValidation(formData.category, {
        initialId: initialCategory?.category,
        skipDuplicateCheck: mode === "edit" && isIdLocked,
    });

    // Form field update handlers
    const updateField = (field: keyof CategoryFormData, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    // Check if form is valid for submission
    const isFormValid = (): boolean => {
        if (mode === "add") {
            return !!(
                formData.category.trim() &&
                !validation.getIdValidationMessage(formData.category) &&
                !validation.isCheckingDuplicate
            );
        } else {
            // For edit mode
            if (
                !isIdLocked &&
                validation.getIdValidationMessage(formData.category)
            ) {
                return false;
            }
            return hasChanges();
        }
    };

    // Check if form has changes (for edit mode)
    const hasChanges = (): boolean => {
        if (!initialCategory) return true; // In add mode, always consider as having changes

        const idChanged =
            !isIdLocked &&
            formData.category.trim() !== initialCategory.category;
        const nameChanged =
            (formData.name.trim() || null) !== initialCategory.name;

        return idChanged || nameChanged;
    };

    // Reset form to initial state
    const resetForm = () => {
        if (initialCategory) {
            setFormData({
                category: initialCategory.category,
                name: initialCategory.name || "",
            });
            setIsIdLocked(true);
        } else {
            setFormData({
                category: "",
                name: "",
            });
        }
    };

    // Get typed form data for submission
    const getAddFormData = () => {
        return {
            category: formData.category.trim(),
            name: formData.name.trim() || null,
        };
    };

    const getEditFormData = () => {
        return {
            name: formData.name.trim() || null,
            newCategoryId:
                !isIdLocked &&
                formData.category.trim() !== initialCategory?.category
                    ? formData.category.trim()
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
        getAddFormData,
        getEditFormData,
    };
}
