"use client";

interface ProductFormErrorProps {
  error: string;
}

export function ProductFormError({ error }: ProductFormErrorProps) {
  if (!error) return null;

  return (
    <div className="border-2 border-red-600 bg-red-100 p-3 text-center">
      <p className="text-sm font-bold text-red-900 uppercase">{error}</p>
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
    <div className="mt-auto flex gap-3 pt-4 pb-6">
      <button
        type="button"
        onClick={onCancel}
        disabled={isLoading}
        className="flex-1 bg-gray-500 py-2 font-bold tracking-wide text-white uppercase transition-colors duration-200 hover:bg-gray-700 disabled:opacity-50"
      >
        Cancel
      </button>
      <button
        type="submit"
        onClick={onSubmit}
        disabled={isLoading || !isValid}
        className="flex-1 bg-slate-700 py-2 font-bold tracking-wide text-white uppercase transition-colors duration-200 hover:bg-slate-900 disabled:opacity-50"
      >
        {isLoading ? loadingText : submitText}
      </button>
    </div>
  );
}
