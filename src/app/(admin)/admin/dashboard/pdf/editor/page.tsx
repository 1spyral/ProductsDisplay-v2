"use client";

import { useState } from "react";
import EditorPane from "./EditorPane";
import PreviewPane from "./PreviewPane";

const defaultEditorText = `\\documentclass{article}
\\begin{document}
Hello from the editor.

This is placeholder content while we wire up PDF rendering.
\\end{document}
`;

export default function PdfEditorPage() {
  const [editorText, setEditorText] = useState(defaultEditorText);
  const [activePane, setActivePane] = useState<"editor" | "preview">("editor");

  return (
    <div className="flex h-full min-h-0 flex-col p-0 sm:p-4">
      <div className="mb-0 flex items-center justify-between border-3 border-b-0 border-gray-400 bg-white px-3 py-2 text-xs font-bold tracking-wide text-gray-900 uppercase sm:mb-0 sm:hidden">
        <button
          type="button"
          onClick={() => setActivePane("editor")}
          className={`px-2 py-1 ${activePane === "editor" ? "bg-slate-700 text-white" : "text-gray-700"}`}
        >
          &lt; Editor
        </button>
        <span className="text-gray-500">{activePane}</span>
        <button
          type="button"
          onClick={() => setActivePane("preview")}
          className={`px-2 py-1 ${activePane === "preview" ? "bg-slate-700 text-white" : "text-gray-700"}`}
        >
          Preview &gt;
        </button>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 grid-rows-1 gap-0 sm:grid-cols-10 sm:gap-4">
        <EditorPane
          value={editorText}
          onChange={setEditorText}
          className={`sm:col-span-4 ${activePane === "preview" ? "hidden sm:flex" : ""}`}
        />

        <PreviewPane
          value={editorText}
          className={`sm:col-span-6 ${activePane === "editor" ? "hidden sm:flex" : ""}`}
        />
      </div>
    </div>
  );
}
