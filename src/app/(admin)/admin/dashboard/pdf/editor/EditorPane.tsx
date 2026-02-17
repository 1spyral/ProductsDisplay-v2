"use client";

import { createAdminSavedSelection, getAdminProducts } from "@/actions/admin";
import Modal from "@/components/Modal";
import type Product from "@/types/Product";
import { buildImageUrl } from "@/utils/photo";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePdfEditor } from "./PdfEditorContext";

type EditorPaneProps = {
  className?: string;
};

function getIconUrl(product: Product): string | null {
  const firstImage = product.images?.[0];
  return firstImage ? buildImageUrl(firstImage.objectKey) : null;
}

type SortableSelectedProductProps = {
  product: Product;
  onRemove?: (productId: string) => void;
  onImageClick?: (url: string, alt: string) => void;
};

function SortableSelectedProduct({
  product,
  onRemove,
  onImageClick,
}: SortableSelectedProductProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: product.id });
  const iconUrl = getIconUrl(product);
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex min-w-0 items-center gap-3 rounded border border-gray-200 px-2 ${
        isDragging ? "bg-slate-50 shadow-sm" : "bg-white"
      }`}
    >
      {iconUrl ? (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onImageClick?.(iconUrl, product.name || product.id);
          }}
          className="shrink-0 cursor-pointer transition-opacity hover:opacity-80"
          title="Click to view full image"
        >
          <Image
            src={iconUrl}
            alt={product.name || product.id}
            height={32}
            width={32}
            className="h-8 w-8 rounded object-cover"
          />
        </button>
      ) : (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-gray-100 text-[10px] text-gray-500 uppercase">
          No img
        </div>
      )}
      <span className="min-w-0 truncate text-sm text-gray-900">
        {product.name || product.id}
      </span>
      <div className="ml-auto flex items-center gap-2">
        <button
          type="button"
          onClick={() => onRemove?.(product.id)}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded border border-gray-200 text-gray-500 hover:bg-red-50 hover:text-red-600"
          aria-label="Remove product"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="flex h-7 w-7 shrink-0 cursor-grab items-center justify-center rounded border border-gray-200 text-gray-500 active:cursor-grabbing"
          aria-label="Drag to reorder"
        >
          <span className="flex flex-col gap-1">
            <span className="h-0.5 w-3.5 rounded bg-gray-400" />
            <span className="h-0.5 w-3.5 rounded bg-gray-400" />
            <span className="h-0.5 w-3.5 rounded bg-gray-400" />
          </span>
        </button>
      </div>
    </div>
  );
}

export default function EditorPane({ className = "" }: EditorPaneProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const { selectedProductIds, setSelectedProductIds } = usePdfEditor();
  const [productSearch, setProductSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [viewerImage, setViewerImage] = useState<{
    url: string;
    alt: string;
  } | null>(null);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveName, setSaveName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!saveName.trim() || selectedProductIds.length === 0) return;
    setIsSaving(true);
    setSaveError(null);
    try {
      await createAdminSavedSelection(saveName.trim(), selectedProductIds);
      setShowSaveModal(false);
      setSaveName("");
    } catch (error) {
      setSaveError(
        error instanceof Error ? error.message : "Failed to save selection"
      );
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const loadProducts = async () => {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const nextProducts = await getAdminProducts();
        if (!isMounted) return;
        setProducts(nextProducts);
      } catch (error) {
        if (!isMounted) return;
        setErrorMessage(
          error instanceof Error ? error.message : "Failed to load products"
        );
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadProducts();

    return () => {
      isMounted = false;
    };
  }, []);

  const selectedProducts = useMemo(() => {
    const productsById = new Map(
      products.map((product) => [product.id, product])
    );
    return selectedProductIds
      .map((productId) => productsById.get(productId))
      .filter((product): product is Product => Boolean(product));
  }, [selectedProductIds, products]);

  const toggleSelected = (productId: string) => {
    setSelectedProductIds((current) => {
      if (current.includes(productId)) {
        return current.filter((id) => id !== productId);
      }
      return [...current, productId];
    });
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const filteredProducts = useMemo(() => {
    const normalizedQuery = productSearch.trim().toLowerCase();
    if (!normalizedQuery) return products;
    return products.filter((product) =>
      (product.name || "").toLowerCase().includes(normalizedQuery)
    );
  }, [productSearch, products]);

  return (
    <div
      className={`flex h-full flex-col overflow-hidden border-3 border-gray-400 bg-white ${className}`}
    >
      <div className="hidden border-b-2 border-gray-300 px-4 py-3 text-xs font-bold tracking-wide text-gray-900 uppercase sm:block sm:text-sm">
        Editor
      </div>
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="flex min-h-0 flex-1 flex-col overflow-scroll border-b-2 border-gray-300 p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="shrink-0 text-xs font-semibold tracking-wide text-gray-700 uppercase">
              Selected Products ({selectedProducts.length})
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setSaveError(null);
                  setShowSaveModal(true);
                }}
                disabled={selectedProducts.length === 0}
                className="h-7 rounded border border-gray-300 px-2 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Save
              </button>
              <Link
                href="/admin/dashboard/pdf/saved"
                className="h-7 rounded border border-gray-300 px-2 text-xs font-medium leading-7 text-gray-700 hover:bg-gray-50"
              >
                View Saved
              </Link>
            </div>
          </div>
          <div className="h-full overflow-x-hidden overflow-y-auto">
            {selectedProducts.length === 0 ? (
              <p className="text-sm text-gray-500">No products selected yet.</p>
            ) : (
              <DndContext
                sensors={sensors}
                modifiers={[restrictToVerticalAxis]}
                collisionDetection={closestCenter}
                onDragEnd={({ active, over }) => {
                  if (!over || active.id === over.id) return;
                  setSelectedProductIds((current) => {
                    const oldIndex = current.indexOf(String(active.id));
                    const newIndex = current.indexOf(String(over.id));
                    if (oldIndex === -1 || newIndex === -1) return current;
                    return arrayMove(current, oldIndex, newIndex);
                  });
                }}
              >
                <SortableContext
                  items={selectedProducts.map((product) => product.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-2">
                    {selectedProducts.map((product) => (
                      <SortableSelectedProduct
                        key={product.id}
                        product={product}
                        onRemove={(productId) =>
                          setSelectedProductIds((current) =>
                            current.filter((id) => id !== productId)
                          )
                        }
                        onImageClick={(url, alt) =>
                          setViewerImage({ url, alt })
                        }
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col overflow-scroll p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="shrink-0 text-xs font-semibold tracking-wide text-gray-700 uppercase">
              Products
            </div>
            <input
              type="search"
              value={productSearch}
              onChange={(event) => setProductSearch(event.target.value)}
              placeholder="Search"
              aria-label="Search products by name"
              className="h-8 w-50 rounded border border-gray-300 px-2 text-xs text-gray-900 placeholder:text-gray-400 focus:border-slate-600 focus:outline-none"
            />
          </div>
          <div className="min-h-0 overflow-x-hidden overflow-y-auto">
            {isLoading ? (
              <p className="text-sm text-gray-500">Loading products...</p>
            ) : errorMessage ? (
              <p className="text-sm text-red-600">{errorMessage}</p>
            ) : (
              <div className="space-y-2">
                {filteredProducts.map((product) => {
                  const isSelected = selectedProductIds.includes(product.id);
                  const iconUrl = getIconUrl(product);
                  return (
                    <label
                      key={product.id}
                      className="flex min-w-0 cursor-pointer items-center gap-3 rounded border border-gray-200 px-2 hover:bg-gray-50"
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelected(product.id)}
                        className="h-4 w-4 shrink-0"
                      />
                      {iconUrl ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            setViewerImage({
                              url: iconUrl,
                              alt: product.name || product.id,
                            });
                          }}
                          className="shrink-0 cursor-pointer transition-opacity hover:opacity-80"
                          title="Click to view full image"
                        >
                          <Image
                            src={iconUrl}
                            alt={product.name || product.id}
                            width={32}
                            height={32}
                            className="h-8 w-8 rounded object-cover"
                          />
                        </button>
                      ) : (
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-gray-100 text-[10px] text-gray-500 uppercase">
                          No img
                        </div>
                      )}
                      <span className="min-w-0 truncate text-sm text-gray-900">
                        {product.name || product.id}
                      </span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Image Viewer Modal */}
      {viewerImage && (
        <Modal
          isOpen={true}
          onClose={() => setViewerImage(null)}
          size="5xl"
          className="border-0 bg-transparent"
          zIndex={60}
          darkBackground={true}
          showHeaderCloseButton={true}
        >
          <div className="relative flex h-full w-full items-center justify-center">
            <Image
              src={viewerImage.url}
              alt={viewerImage.alt}
              width={1200}
              height={800}
              className="max-h-full max-w-full object-contain"
              unoptimized
            />
          </div>
        </Modal>
      )}

      {/* Save Selection Modal */}
      {showSaveModal && (
        <Modal
          isOpen={true}
          onClose={() => {
            setShowSaveModal(false);
            setSaveName("");
            setSaveError(null);
          }}
          title="Save Selection"
          size="md"
          autoHeight
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSave();
            }}
            className="space-y-4 p-4"
          >
            <div>
              <label
                htmlFor="selection-name"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Name
              </label>
              <input
                id="selection-name"
                type="text"
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
                placeholder="e.g. Spring 2026 Flyer"
                autoFocus
                className="h-9 w-full rounded border border-gray-300 px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-slate-600 focus:outline-none"
              />
            </div>
            {saveError && <p className="text-sm text-red-600">{saveError}</p>}
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowSaveModal(false);
                  setSaveName("");
                  setSaveError(null);
                }}
                className="h-9 rounded border border-gray-300 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving || !saveName.trim()}
                className="h-9 rounded bg-slate-700 px-4 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
              >
                {isSaving ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
