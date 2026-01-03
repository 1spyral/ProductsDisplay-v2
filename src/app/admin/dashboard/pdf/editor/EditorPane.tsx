"use client";

type EditorPaneProps = {
  value: string;
  onChange: (value: string) => void;
  className?: string;
};

export default function EditorPane({
  value,
  onChange,
  className = "",
}: EditorPaneProps) {
  return (
    <div
      className={`flex h-full flex-col overflow-hidden border-3 border-gray-400 bg-white ${className}`}
    >
      <div className="hidden border-b-2 border-gray-300 px-4 py-3 text-xs font-bold tracking-wide text-gray-900 uppercase sm:block sm:text-sm">
        Editor
      </div>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-0 w-full flex-1 resize-none overflow-auto border-none p-4 font-mono text-sm text-gray-900 focus:outline-none"
      />
    </div>
  );
}
