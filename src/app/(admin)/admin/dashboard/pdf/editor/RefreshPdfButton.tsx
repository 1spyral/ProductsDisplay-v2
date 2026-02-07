"use client";

import { useEffect, useRef, useState } from "react";
import { usePdfEditor } from "./PdfEditorContext";

type RefreshPdfButtonProps = {
  size?: "sm" | "md";
};

export default function RefreshPdfButton({
  size = "md",
}: RefreshPdfButtonProps) {
  const { setPdfFromBlob } = usePdfEditor();
  const [isLoading, setIsLoading] = useState(false);
  const [isCooldown, setIsCooldown] = useState(false);
  const cooldownTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleClick = async () => {
    if (isLoading || isCooldown) return;

    setIsCooldown(true);
    if (cooldownTimeoutRef.current) {
      clearTimeout(cooldownTimeoutRef.current);
    }
    cooldownTimeoutRef.current = setTimeout(() => {
      setIsCooldown(false);
      cooldownTimeoutRef.current = null;
    }, 1000);

    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/compile", {
        method: "POST",
      });

      if (!response.ok) {
        console.error("Failed to compile PDF", await response.text());
        return;
      }

      const blob = await response.blob();
      await setPdfFromBlob(blob);
    } catch (error) {
      console.error("Error compiling PDF", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      if (cooldownTimeoutRef.current) {
        clearTimeout(cooldownTimeoutRef.current);
      }
    };
  }, []);

  const baseClasses =
    "inline-flex items-center justify-center rounded border border-gray-300 bg-white text-xs font-semibold uppercase tracking-wide text-gray-700 hover:bg-gray-50 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60";
  const sizeClasses = size === "sm" ? "px-2" : "px-3 py-1.5";

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isLoading || isCooldown}
      className={`${baseClasses} ${sizeClasses}`}
    >
      {isLoading ? "Refreshing..." : "Refresh PDF"}
    </button>
  );
}
