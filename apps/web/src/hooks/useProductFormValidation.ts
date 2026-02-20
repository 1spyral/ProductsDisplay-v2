import { checkAdminProductIdExists } from "@/actions/admin";
import { useCallback, useEffect, useState } from "react";

interface UseProductFormValidationProps {
    initialId?: string; // For edit mode, the original ID
    skipDuplicateCheck?: boolean; // For cases where we want to skip duplicate checking
    debounceMs?: number; // Debounce delay for automatic ID validation
}

const DEFAULT_DEBOUNCE_MS = 500;

export interface ProductValidationState {
    isDuplicate: boolean;
    isCheckingDuplicate: boolean;
    getIdValidationMessage: (id: string) => string | null;
    isValidIdFormat: (id: string) => boolean;
}

export function useProductFormValidation({
    initialId = "",
    skipDuplicateCheck = false,
}: UseProductFormValidationProps = {}): ProductValidationState {
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
                const exists = await checkAdminProductIdExists(id);
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
    } as ProductValidationState & {
        checkForDuplicate: (id: string) => Promise<void>;
    };
}

// Additional hook for debounced validation with automatic triggering
export function useProductIdValidation(
    id: string,
    options: UseProductFormValidationProps = {}
): ProductValidationState {
    const [isDuplicate, setIsDuplicate] = useState(false);
    const [isCheckingDuplicate, setIsCheckingDuplicate] = useState(false);
    const debounceMs = options.debounceMs ?? DEFAULT_DEBOUNCE_MS;

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
                const exists = await checkAdminProductIdExists(id);
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
        }, debounceMs);

        return () => clearTimeout(timeoutId);
    }, [id, options.skipDuplicateCheck, checkForDuplicate, debounceMs]);

    return {
        isDuplicate,
        isCheckingDuplicate,
        getIdValidationMessage,
        isValidIdFormat,
    };
}
