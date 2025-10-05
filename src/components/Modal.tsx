"use client";

import React from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  className?: string;
}

export default function Modal({
  isOpen,
  onClose,
  children,
  title,
  size = "md",
  className = "",
}: ModalProps) {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md", 
    lg: "max-w-lg",
    xl: "max-w-2xl",
    full: "max-w-7xl w-full h-full",
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 flex justify-center items-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div
        className={`relative bg-white border-4 border-slate-700 ${sizeClasses[size]} ${
          size === "full" ? "" : "max-h-[90vh] overflow-y-auto"
        } ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Full-size modal close button (always shown) */}
        {size === "full" && (
          <button
            onClick={onClose}
            className="absolute top-0 right-0 bg-slate-800 hover:bg-red-700 text-white font-bold px-6 py-4 transition-colors duration-200 z-50 border-l-4 border-b-4 border-slate-900"
            aria-label="Close Modal"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={3}
            >
              <path
                strokeLinecap="square"
                strokeLinejoin="miter"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}

        {/* Header with title and close button for smaller modals */}
        {(title || (size !== "full")) && size !== "full" && (
          <div className="flex items-center justify-between p-4 sm:p-6 border-b-2 border-gray-300">
            {title && (
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 uppercase tracking-wide">
                {title}
              </h2>
            )}
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl font-bold ml-4"
              aria-label="Close Modal"
            >
              ×
            </button>
          </div>
        )}
        
        {/* Content */}
        <div className={size === "full" ? "h-full overflow-auto" : "p-4 sm:p-6"}>
          {children}
        </div>
      </div>
    </div>
  );
}
