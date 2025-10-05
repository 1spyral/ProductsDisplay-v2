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
      <div className="flex h-[70vh] min-h-[500px] max-h-[700px] p-4">
        {/* Left Panel - Image Management */}
        <div className="w-1/2 pr-6 border-r border-gray-300 flex flex-col">
          {leftPanel}
        </div>

        {/* Right Panel - Form Fields */}
        <div className="w-1/2 pl-6 flex flex-col">{rightPanel}</div>
      </div>
    </Modal>
  );
}
