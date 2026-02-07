"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";

type PdfEditorContextValue = {
  pdfBytes: Uint8Array | null;
  pdfUrl: string | null;
  selectedProductIds: string[];
  setSelectedProductIds: Dispatch<SetStateAction<string[]>>;
  setPdfBytes: (bytes: Uint8Array | null) => void;
  setPdfFromArrayBuffer: (buffer: ArrayBuffer | null) => void;
  setPdfFromBlob: (blob: Blob | null) => Promise<void>;
  clearPdf: () => void;
};

const PdfEditorContext = createContext<PdfEditorContextValue | null>(null);

export function PdfEditorProvider({ children }: { children: ReactNode }) {
  const [pdfBytes, setPdfBytesState] = useState<Uint8Array | null>(null);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const pdfUrl = useMemo(() => {
    if (!pdfBytes) return null;
    const normalizedBytes = new Uint8Array(pdfBytes);
    const blob = new Blob([normalizedBytes], { type: "application/pdf" });
    return URL.createObjectURL(blob);
  }, [pdfBytes]);

  useEffect(() => {
    if (!pdfUrl) return;
    return () => {
      URL.revokeObjectURL(pdfUrl);
    };
  }, [pdfUrl]);

  const setPdfBytes = useCallback((bytes: Uint8Array | null) => {
    setPdfBytesState(bytes);
  }, []);

  const setPdfFromArrayBuffer = useCallback((buffer: ArrayBuffer | null) => {
    setPdfBytesState(buffer ? new Uint8Array(buffer) : null);
  }, []);

  const setPdfFromBlob = useCallback(async (blob: Blob | null) => {
    if (!blob) {
      setPdfBytesState(null);
      return;
    }

    const buffer = await blob.arrayBuffer();
    setPdfBytesState(new Uint8Array(buffer));
  }, []);

  const clearPdf = useCallback(() => {
    setPdfBytesState(null);
  }, []);

  const value = useMemo<PdfEditorContextValue>(
    () => ({
      pdfBytes,
      pdfUrl,
      selectedProductIds,
      setSelectedProductIds,
      setPdfBytes,
      setPdfFromArrayBuffer,
      setPdfFromBlob,
      clearPdf,
    }),
    [
      pdfBytes,
      pdfUrl,
      selectedProductIds,
      setSelectedProductIds,
      setPdfBytes,
      setPdfFromArrayBuffer,
      setPdfFromBlob,
      clearPdf,
    ]
  );

  return (
    <PdfEditorContext.Provider value={value}>
      {children}
    </PdfEditorContext.Provider>
  );
}

export function usePdfEditor() {
  const ctx = useContext(PdfEditorContext);
  if (!ctx) {
    throw new Error("usePdfEditor must be used within PdfEditorProvider");
  }
  return ctx;
}
