"use client";

import { ProductValidationState } from "@/hooks/useProductFormValidation";

interface ProductIdFieldProps {
  value: string;
  onChange: (value: string) => void;
  validation: ProductValidationState;
  isLocked?: boolean;
  onToggleLock?: () => void;
  placeholder?: string;
  required?: boolean;
  isCheckingDuplicate?: boolean;
}

export default function ProductIdField({
  value,
  onChange,
  validation,
  isLocked = false,
  onToggleLock,
  placeholder = "Enter unique product ID...",
  required = true,
  isCheckingDuplicate = false,
}: ProductIdFieldProps) {
  const errorMessage = validation.getIdValidationMessage(value);
  const showLockToggle = onToggleLock !== undefined;

  return (
    <div>
      <label className="block text-sm font-bold text-gray-900 uppercase tracking-wide mb-2">
        Product ID
        {required && !isLocked && <span className="text-red-600 ml-1">*</span>}
      </label>
      <div className={`flex gap-2 ${showLockToggle ? "" : "flex-col"}`}>
        <div className="flex-1 relative">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            readOnly={isLocked}
            className={`w-full px-4 py-3 pr-10 border-2 focus:outline-none transition-colors font-mono text-sm ${
              isLocked
                ? "border-gray-300 bg-gray-100 cursor-not-allowed"
                : errorMessage
                  ? "border-red-400 focus:border-red-700"
                  : "border-gray-400 focus:border-slate-700"
            }`}
            placeholder={isLocked ? "Click lock to edit ID" : placeholder}
            required={required && !isLocked}
          />
          {/* Loading spinner for duplicate check */}
          {!isLocked &&
            (validation.isCheckingDuplicate || isCheckingDuplicate) && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="animate-spin h-4 w-4 border-2 border-gray-300 border-t-slate-700 rounded-full"></div>
              </div>
            )}
        </div>

        {/* Lock/Unlock Toggle Button */}
        {showLockToggle && (
          <button
            type="button"
            onClick={onToggleLock}
            className={`px-4 py-3 border-2 font-bold transition-colors duration-200 flex items-center justify-center ${
              isLocked
                ? "border-gray-400 bg-gray-100 hover:bg-gray-200 text-gray-600"
                : "border-slate-700 bg-slate-700 hover:bg-slate-900 text-white"
            }`}
            title={isLocked ? "Click to edit ID" : "Click to lock ID"}
          >
            {isLocked ? (
              // Locked icon
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              // Unlocked icon
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2a5 5 0 00-5 5v2a2 2 0 00-2 2v5a2 2 0 002 2h10a2 2 0 002-2v-5a2 2 0 00-2-2H7V7a3 3 0 015.905-.75 1 1 0 001.937-.5A5.002 5.002 0 0010 2z" />
              </svg>
            )}
          </button>
        )}
      </div>

      {/* Validation Error Message */}
      <div className="mt-1">
        {!isLocked && errorMessage && (
          <p className="text-xs text-red-600">{errorMessage}</p>
        )}
      </div>
    </div>
  );
}
