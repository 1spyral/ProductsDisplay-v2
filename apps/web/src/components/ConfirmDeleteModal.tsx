"use client";

import Icon from "@/components/Icon";
import WarningFillIcon from "@material-symbols/svg-400/rounded/warning-fill.svg";

import { useState } from "react";
import Modal from "./Modal";

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
}

export default function ConfirmDeleteModal({
  isOpen,
  title,
  message,
  confirmText = "Delete",
  onConfirm,
  onCancel,
}: ConfirmDeleteModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = async () => {
    setIsDeleting(true);
    try {
      await onConfirm();
      onCancel(); // Close modal on success
    } catch (error) {
      console.error("Delete failed:", error);
      // Keep modal open to show error or let parent handle it
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      title={title}
      size="md"
      autoHeight
    >
      <div className="space-y-6">
        {/* Warning Icon */}
        <div className="flex items-center justify-center px-4 sm:px-6">
          <div className="rounded-full border-2 border-red-300 bg-red-100 p-4">
            <Icon
              component={WarningFillIcon}
              size={32}
              className="h-8 w-8 text-red-600"
            />
          </div>
        </div>

        {/* Message */}
        <div className="px-4 text-center sm:px-6">
          <p className="text-base leading-relaxed text-gray-900">{message}</p>
          <p className="mt-2 text-sm text-gray-600">
            This action cannot be undone.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className="flex-1 bg-gray-500 py-3 font-bold tracking-wide text-white uppercase transition-colors duration-200 hover:bg-gray-700 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isDeleting}
            className="flex-1 bg-red-600 py-3 font-bold tracking-wide text-white uppercase transition-colors duration-200 hover:bg-red-800 disabled:opacity-50"
          >
            {isDeleting ? "Deleting..." : confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
}
