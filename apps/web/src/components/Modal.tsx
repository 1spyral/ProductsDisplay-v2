"use client";

import React from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  size?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "full";
  className?: string;
  zIndex?: number; // Allow custom z-index for stacking
  darkBackground?: boolean; // For image viewers with darker background
  showHeaderCloseButton?: boolean; // Control header "x" independently of size
  showFloatingCloseButton?: boolean; // Control floating top-right "x" independently of size
  autoHeight?: boolean; // Use content height instead of fixed viewport height
}

export default function Modal({
  isOpen,
  onClose,
  children,
  title,
  size = "md",
  className = "",
  zIndex = 50,
  darkBackground = false,
  showHeaderCloseButton = false,
  showFloatingCloseButton = false,
  autoHeight = false,
}: ModalProps) {
  if (!isOpen) return null;

  const sizeClasses = autoHeight
    ? {
        sm: "w-[40vw] max-h-[40vh]",
        md: "w-[50vw] max-h-[50vh]",
        lg: "w-[60vw] max-h-[60vh]",
        xl: "w-[70vw] max-h-[70vh]",
        "2xl": "w-[75vw] max-h-[75vh]",
        "3xl": "w-[80vw] max-h-[80vh]",
        "4xl": "w-[85vw] max-h-[85vh]",
        "5xl": "w-[90vw] max-h-[90vh]",
        full: "w-full h-full",
      }
    : {
        sm: "w-[40vw] h-[40vh]",
        md: "w-[50vw] h-[50vh]",
        lg: "w-[60vw] h-[60vh]",
        xl: "w-[70vw] h-[70vh]",
        "2xl": "w-[75vw] h-[75vh]",
        "3xl": "w-[80vw] h-[80vh]",
        "4xl": "w-[85vw] h-[85vh]",
        "5xl": "w-[90vw] h-[90vh]",
        full: "w-full h-full",
      };

  const backgroundClass = darkBackground ? "bg-black/90" : "bg-black/70";

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className={`fixed inset-0 ${backgroundClass} ${
        size === "full" ? "" : "flex items-center justify-center p-4"
      }`}
      style={{ zIndex }}
      onClick={handleBackdropClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.target !== e.currentTarget) return;
        if (e.key === "Escape" || e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClose();
        }
      }}
      aria-label="Close modal"
    >
      <div
        className={`relative flex flex-col border-4 border-slate-700 bg-white ${sizeClasses[size]} ${className}`}
      >
        {/* Full-size modal close button (always shown) */}
        {showFloatingCloseButton && (
          <button
            onClick={onClose}
            className="absolute top-0 right-0 z-50 border-b-4 border-l-4 border-slate-900 bg-slate-800 px-6 py-4 font-bold text-white transition-colors duration-200 hover:bg-red-700"
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
        {(title || showHeaderCloseButton) && (
          <div className="flex items-center justify-between border-b-2 border-gray-300 p-4 sm:p-6">
            {title && (
              <h2 className="text-xl font-bold tracking-wide text-gray-900 uppercase sm:text-2xl">
                {title}
              </h2>
            )}
            {showHeaderCloseButton && (
              <button
                onClick={onClose}
                className="ml-auto text-2xl font-bold text-gray-500 hover:text-gray-700"
                aria-label="Close Modal"
              >
                ×
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="min-h-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
