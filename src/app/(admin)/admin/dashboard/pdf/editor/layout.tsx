"use client";

import type { ReactNode } from "react";
import { PdfEditorProvider } from "./PdfEditorContext";

export default function PdfEditorLayout({ children }: { children: ReactNode }) {
  return <PdfEditorProvider>{children}</PdfEditorProvider>;
}
