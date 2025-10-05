"use client";

interface ProductFormErrorProps {
  error: string;
}

export function ProductFormError({ error }: ProductFormErrorProps) {
  if (!error) return null;

  return (
    <div className="bg-red-100 border-2 border-red-600 p-3 text-center">
      <p className="text-red-900 font-bold text-sm uppercase">{error}</p>
    </div>
  );
}

interface ProductFormActionsProps {
  onCancel: () => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  isValid: boolean;
  submitText: string;
  loadingText: string;
}

export function ProductFormActions({
  onCancel,
  onSubmit,
  isLoading,
  isValid,
  submitText,
  loadingText,
}: ProductFormActionsProps) {
  return (
    <div className="flex gap-3 pt-4 mt-auto">
      <button
        type="button"
        onClick={onCancel}
        disabled={isLoading}
        className="flex-1 bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 uppercase tracking-wide transition-colors duration-200 disabled:opacity-50"
      >
        Cancel
      </button>
      <button
        type="submit"
        onClick={onSubmit}
        disabled={isLoading || !isValid}
        className="flex-1 bg-slate-700 hover:bg-slate-900 text-white font-bold py-2 uppercase tracking-wide transition-colors duration-200 disabled:opacity-50"
      >
        {isLoading ? loadingText : submitText}
      </button>
    </div>
  );
}
