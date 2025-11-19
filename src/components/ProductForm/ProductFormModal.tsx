"use client";

import { ReactNode } from "react";
import Modal from "../Modal";

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  leftPanel: ReactNode;
  rightPanel: ReactNode;
  className?: string;
}

export default function ProductFormModal({
  isOpen,
  onClose,
  title,
  leftPanel,
  rightPanel,
  className = "",
}: ProductFormModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="4xl"
      className={className}
    >
      <div className="flex h-[70vh] max-h-[700px] min-h-[500px] p-4">
        {/* Left Panel - Image Management */}
        <div className="flex w-1/2 flex-col overflow-y-auto border-r border-gray-300 pr-6">
          {leftPanel}
        </div>

        {/* Right Panel - Form Fields */}
        <div className="flex w-1/2 flex-col overflow-y-auto pl-6">
          {rightPanel}
        </div>
      </div>
    </Modal>
  );
}
