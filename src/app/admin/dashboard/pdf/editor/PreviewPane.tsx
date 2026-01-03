"use client";

type PreviewPaneProps = {
  value: string;
  className?: string;
};

export default function PreviewPane({
  value,
  className = "",
}: PreviewPaneProps) {
  return (
    <div
      className={`flex h-full flex-col overflow-hidden border-3 border-gray-400 bg-white ${className}`}
    >
      <div className="hidden border-b-2 border-gray-300 px-4 py-3 text-xs font-bold tracking-wide text-gray-900 uppercase sm:block sm:text-sm">
        Preview
      </div>
      <div className="min-h-0 flex-1 overflow-auto p-4 font-mono text-sm whitespace-pre-wrap text-gray-900">
        {value}
      </div>
    </div>
  );
}
