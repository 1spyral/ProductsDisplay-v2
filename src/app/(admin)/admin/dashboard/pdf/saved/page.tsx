"use client";

import {
  deleteAdminSavedSelection,
  getAdminSavedSelections,
} from "@/actions/admin";
import type { SavedSelectionOverview } from "@/db/queries/savedSelectionQueries";
import { buildImageUrl } from "@/utils/photo";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function SavedSelectionsPage() {
  const [selections, setSelections] = useState<SavedSelectionOverview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadSelections = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await getAdminSavedSelections();
      setSelections(data);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to load saved selections"
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSelections();
  }, []);

  const handleDelete = async (selectionId: string) => {
    setDeletingId(selectionId);
    try {
      await deleteAdminSavedSelection(selectionId);
      setSelections((current) =>
        current.filter((selection) => selection.id !== selectionId)
      );
      if (expandedId === selectionId) {
        setExpandedId(null);
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to delete saved selection"
      );
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="mx-auto max-w-3xl p-4 sm:p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-lg font-bold text-gray-900">Saved Selections</h1>
        <Link
          href="/admin/dashboard/pdf/editor"
          className="rounded border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          ← Back to Editor
        </Link>
      </div>

      {isLoading ? (
        <p className="text-sm text-gray-500">Loading saved selections...</p>
      ) : errorMessage ? (
        <p className="text-sm text-red-600">{errorMessage}</p>
      ) : selections.length === 0 ? (
        <p className="text-sm text-gray-500">
          No saved selections yet. Select products in the PDF editor and click
          Save to create one.
        </p>
      ) : (
        <div className="space-y-3">
          {selections.map((selection) => {
            const isExpanded = expandedId === selection.id;
            const isDeleting = deletingId === selection.id;

            return (
              <div
                key={selection.id}
                className="overflow-hidden rounded-lg border border-gray-200 bg-white"
              >
                {/* Header */}
                <div className="flex items-center gap-3 px-4 py-3">
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedId(isExpanded ? null : selection.id)
                    }
                    className="flex min-w-0 flex-1 items-center gap-3 text-left"
                  >
                    <svg
                      className={`h-4 w-4 shrink-0 text-gray-500 transition-transform ${isExpanded ? "rotate-90" : ""}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-gray-900">
                        {selection.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {selection.products.length} product
                        {selection.products.length !== 1 ? "s" : ""} ·{" "}
                        {new Date(selection.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </button>

                  <div className="flex shrink-0 items-center gap-2">
                    <Link
                      href={`/admin/dashboard/pdf/editor?selectionId=${selection.id}`}
                      className="rounded border border-gray-300 px-2.5 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Open
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDelete(selection.id)}
                      disabled={isDeleting}
                      className="rounded border border-red-200 px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                    >
                      {isDeleting ? "..." : "Delete"}
                    </button>
                  </div>
                </div>

                {/* Expanded product list */}
                {isExpanded && (
                  <div className="border-t border-gray-100 bg-gray-50 px-4 py-3">
                    {selection.products.length === 0 ? (
                      <p className="text-xs text-gray-500">
                        No products in this selection.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {selection.products.map(
                          ({ product, position: _position }, index) => {
                            const iconUrl = product.images?.[0]?.objectKey
                              ? buildImageUrl(product.images[0].objectKey)
                              : null;
                            return (
                              <div
                                key={`${selection.id}-${product.id}`}
                                className="flex items-center gap-3 rounded border border-gray-200 bg-white px-2 py-1.5"
                              >
                                <span className="w-5 text-center text-xs font-medium text-gray-400">
                                  {index + 1}
                                </span>
                                {iconUrl ? (
                                  <Image
                                    src={iconUrl}
                                    alt={product.name || product.id}
                                    width={28}
                                    height={28}
                                    className="h-7 w-7 shrink-0 rounded object-cover"
                                  />
                                ) : (
                                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-gray-100 text-[9px] text-gray-500 uppercase">
                                    No img
                                  </div>
                                )}
                                <span className="min-w-0 truncate text-sm text-gray-900">
                                  {product.name || product.id}
                                </span>
                              </div>
                            );
                          }
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
