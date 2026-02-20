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
      size="full"
      showHeaderCloseButton
      className={className}
    >
      <div className="flex h-full">
        {/* Left Panel */}
        <div className="flex w-1/2 flex-col overflow-y-auto border-r border-gray-300">
          {leftPanel}
        </div>

        {/* Right Panel */}
        <div className="flex w-1/2 flex-col overflow-y-auto">{rightPanel}</div>
      </div>
    </Modal>
  );
}
