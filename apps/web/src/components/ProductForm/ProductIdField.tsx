"use client";

import Icon from "@/components/Icon";
import LockIcon from "@material-symbols/svg-400/rounded/lock.svg";
import LockOpenIcon from "@material-symbols/svg-400/rounded/lock_open.svg";

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
      <label className="mb-2 block text-sm font-bold tracking-wide text-gray-900 uppercase">
        Product ID
        {required && !isLocked && <span className="ml-1 text-red-600">*</span>}
      </label>
      <div className={`flex gap-2 ${showLockToggle ? "" : "flex-col"}`}>
        <div className="relative flex-1">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            readOnly={isLocked}
            className={`w-full border-2 px-4 py-3 pr-10 font-mono text-sm transition-colors focus:outline-none ${
              isLocked
                ? "cursor-not-allowed border-gray-300 bg-gray-100"
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
              <div className="absolute top-1/2 right-3 -translate-y-1/2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-slate-700"></div>
              </div>
            )}
        </div>

        {/* Lock/Unlock Toggle Button */}
        {showLockToggle && (
          <button
            type="button"
            onClick={onToggleLock}
            className={`flex items-center justify-center border-2 px-4 py-3 font-bold transition-colors duration-200 ${
              isLocked
                ? "border-gray-400 bg-gray-100 text-gray-600 hover:bg-gray-200"
                : "border-slate-700 bg-slate-700 text-white hover:bg-slate-900"
            }`}
            title={isLocked ? "Click to edit ID" : "Click to lock ID"}
          >
            {isLocked ? (
              // Locked icon
              <Icon component={LockIcon} size={20} className="h-5 w-5" />
            ) : (
              // Unlocked icon
              <Icon component={LockOpenIcon} size={20} className="h-5 w-5" />
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
