import { checkAdminCategoryIdExists } from "@/actions/admin";
import { useCallback, useEffect, useState } from "react";

interface UseCategoryFormValidationProps {
    initialId?: string; // For edit mode, the original ID
    skipDuplicateCheck?: boolean; // For cases where we want to skip duplicate checking
}

export interface CategoryValidationState {
    isDuplicate: boolean;
    isCheckingDuplicate: boolean;
    getIdValidationMessage: (id: string) => string | null;
    isValidIdFormat: (id: string) => boolean;
}

export function useCategoryFormValidation({
    initialId = "",
    skipDuplicateCheck = false,
}: UseCategoryFormValidationProps = {}): CategoryValidationState {
    const [isDuplicate, setIsDuplicate] = useState(false);
    const [isCheckingDuplicate, setIsCheckingDuplicate] = useState(false);

    // Validate ID format in real-time
    const isValidIdFormat = useCallback((id: string): boolean => {
        return /^[a-zA-Z0-9-_]+$/.test(id) && id.trim().length > 0;
    }, []);

    const getIdValidationMessage = useCallback(
        (id: string): string | null => {
            if (!id.trim()) return "ID cannot be empty";
            if (id.length > 255) return "ID too long (max 255 characters)";
            if (!isValidIdFormat(id))
                return "Only letters, numbers, hyphens, and underscores allowed";
            if (isDuplicate && id !== initialId)
                return "This ID is already taken";
            return null;
        },
        [isDuplicate, initialId, isValidIdFormat]
    );

    // Debounced duplicate checking
    const checkForDuplicate = useCallback(
        async (id: string) => {
            if (
                skipDuplicateCheck ||
                id === initialId ||
                !id.trim() ||
                !isValidIdFormat(id)
            ) {
                setIsDuplicate(false);
                return;
            }

            setIsCheckingDuplicate(true);
            try {
                const exists = await checkAdminCategoryIdExists(id);
                setIsDuplicate(exists);
            } catch (error) {
                console.error("Failed to check duplicate:", error);
                setIsDuplicate(false);
            } finally {
                setIsCheckingDuplicate(false);
            }
        },
        [initialId, isValidIdFormat, skipDuplicateCheck]
    );

    return {
        isDuplicate,
        isCheckingDuplicate,
        getIdValidationMessage,
        isValidIdFormat,
        // Expose the debounced check function for manual triggering
        checkForDuplicate: checkForDuplicate,
    } as CategoryValidationState & {
        checkForDuplicate: (id: string) => Promise<void>;
    };
}

// Additional hook for debounced validation with automatic triggering
export function useCategoryIdValidation(
    id: string,
    options: UseCategoryFormValidationProps = {}
): CategoryValidationState {
    const [isDuplicate, setIsDuplicate] = useState(false);
    const [isCheckingDuplicate, setIsCheckingDuplicate] = useState(false);

    // Validate ID format in real-time
    const isValidIdFormat = useCallback((id: string): boolean => {
        return /^[a-zA-Z0-9-_]+$/.test(id) && id.trim().length > 0;
    }, []);

    const getIdValidationMessage = useCallback(
        (id: string): string | null => {
            if (!id.trim()) return "ID cannot be empty";
            if (id.length > 255) return "ID too long (max 255 characters)";
            if (!isValidIdFormat(id))
                return "Only letters, numbers, hyphens, and underscores allowed";
            if (isDuplicate && id !== options.initialId)
                return "This ID is already taken";
            return null;
        },
        [isDuplicate, options.initialId, isValidIdFormat]
    );

    // Debounced duplicate checking function
    const checkForDuplicate = useCallback(
        async (id: string) => {
            if (
                options.skipDuplicateCheck ||
                id === options.initialId ||
                !id.trim() ||
                !isValidIdFormat(id)
            ) {
                setIsDuplicate(false);
                return;
            }

            setIsCheckingDuplicate(true);
            try {
                const exists = await checkAdminCategoryIdExists(id);
                setIsDuplicate(exists);
            } catch (error) {
                console.error("Failed to check duplicate:", error);
                setIsDuplicate(false);
            } finally {
                setIsCheckingDuplicate(false);
            }
        },
        [options.initialId, options.skipDuplicateCheck, isValidIdFormat]
    );

    // Debounce the duplicate check
    useEffect(() => {
        if (!id.trim() || options.skipDuplicateCheck) {
            setIsDuplicate(false);
            return;
        }

        const timeoutId = setTimeout(() => {
            checkForDuplicate(id);
        }, 500); // 500ms debounce

        return () => clearTimeout(timeoutId);
    }, [id, options.skipDuplicateCheck, checkForDuplicate]);

    return {
        isDuplicate,
        isCheckingDuplicate,
        getIdValidationMessage,
        isValidIdFormat,
    };
}
