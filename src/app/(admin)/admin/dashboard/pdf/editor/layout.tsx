"use client";

import type { ReactNode } from "react";
import { PdfEditorProvider } from "./PdfEditorContext";

export default function PdfEditorLayout({ children }: { children: ReactNode }) {
  return (
    <PdfEditorProvider>
      <div className="flex h-full min-h-0 flex-col overflow-hidden">
        {children}
      </div>
    </PdfEditorProvider>
  );
}
