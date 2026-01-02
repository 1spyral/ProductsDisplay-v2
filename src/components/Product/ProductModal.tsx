"use client";

import { useRouter } from "next/navigation";
import React from "react";
import Modal from "../Modal";

export default function ProductModal({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const handleClose = () => {
    router.back();
  };

  return (
    <Modal
      isOpen={true}
      onClose={handleClose}
      size="5xl"
      showFloatingCloseButton
    >
      {children}
    </Modal>
  );
}
