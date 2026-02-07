"use client";

import RefreshPdfButton from "./RefreshPdfButton";
import { usePdfEditor } from "./PdfEditorContext";

type PreviewPaneProps = {
  className?: string;
};

export default function PreviewPane({ className = "" }: PreviewPaneProps) {
  const { pdfUrl } = usePdfEditor();

  return (
    <div
      className={`flex h-full flex-col overflow-hidden border-3 border-gray-400 bg-white ${className}`}
    >
      <div className="hidden items-center justify-between border-b-2 border-gray-300 px-4 py-3 text-xs font-bold tracking-wide text-gray-900 uppercase sm:flex sm:text-sm">
        <span>Preview</span>
        <RefreshPdfButton size="sm" />
      </div>
      <div className="min-h-0 flex-1 overflow-hidden bg-white">
        {pdfUrl ? (
          <iframe title="PDF preview" src={pdfUrl} className="h-full w-full" />
        ) : (
          <div className="flex h-full items-center justify-center p-4 text-sm text-gray-600">
            No PDF loaded yet. Click &quot;Refresh PDF&quot; to generate a
            preview.
          </div>
        )}
      </div>
    </div>
  );
}
