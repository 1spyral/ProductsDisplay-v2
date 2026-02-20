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
import {
  useEffect,
  useMemo,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import { usePdfEditor } from "./PdfEditorContext";

type EditorPaneProps = {
  className?: string;
};

type ProductListState = {
  products: Product[];
  isLoading: boolean;
  errorMessage: string | null;
};

type FilterState = {
  productSearch: string;
  selectedCategories: Set<string>;
  showCategoryMenu: boolean;
};

type SaveSelectionState = {
  isOpen: boolean;
  name: string;
  isSaving: boolean;
  error: string | null;
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

type SelectedProductsPanelProps = {
  selectedProducts: Product[];
  onOpenSaveModal: () => void;
  onRemoveProduct: (productId: string) => void;
  onReorderProducts: (activeId: string, overId: string) => void;
  onImageClick: (url: string, alt: string) => void;
};

function SelectedProductsPanel({
  selectedProducts,
  onOpenSaveModal,
  onRemoveProduct,
  onReorderProducts,
  onImageClick,
}: SelectedProductsPanelProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-scroll border-b-2 border-gray-300 p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="shrink-0 text-xs font-semibold tracking-wide text-gray-700 uppercase">
          Selected Products ({selectedProducts.length})
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenSaveModal}
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
              onReorderProducts(String(active.id), String(over.id));
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
                    onRemove={onRemoveProduct}
                    onImageClick={onImageClick}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  );
}

type ProductSelectionPanelProps = {
  productSearch: string;
  showCategoryMenu: boolean;
  selectedCategories: Set<string>;
  allCategories: string[];
  filteredProducts: Product[];
  selectedProductIds: string[];
  isLoading: boolean;
  errorMessage: string | null;
  setFilterState: Dispatch<SetStateAction<FilterState>>;
  onToggleSelected: (productId: string) => void;
  onImageClick: (url: string, alt: string) => void;
};

function ProductSelectionPanel({
  productSearch,
  showCategoryMenu,
  selectedCategories,
  allCategories,
  filteredProducts,
  selectedProductIds,
  isLoading,
  errorMessage,
  setFilterState,
  onToggleSelected,
  onImageClick,
}: ProductSelectionPanelProps) {
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-scroll p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="shrink-0 text-xs font-semibold tracking-wide text-gray-700 uppercase">
          Products
        </div>
        <div className="flex items-center gap-2">
          <input
            type="search"
            value={productSearch}
            onChange={(event) =>
              setFilterState((prev) => ({
                ...prev,
                productSearch: event.target.value,
              }))
            }
            placeholder="Search"
            aria-label="Search products by name"
            className="h-8 w-36 rounded border border-gray-300 px-2 text-xs text-gray-900 placeholder:text-gray-400 focus:border-slate-600 focus:outline-none"
          />
          <div className="relative">
            <button
              type="button"
              onClick={() =>
                setFilterState((prev) => ({
                  ...prev,
                  showCategoryMenu: !prev.showCategoryMenu,
                }))
              }
              className={`flex h-8 items-center gap-1 rounded border px-2 text-xs font-medium ${
                selectedCategories.size > 0
                  ? "border-slate-600 bg-slate-700 text-white"
                  : "border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              <svg
                className="h-3.5 w-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 4a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v2a1 1 0 0 1-.293.707L13 13.414V19a1 1 0 0 1-.553.894l-4 2A1 1 0 0 1 7 21v-7.586L3.293 6.707A1 1 0 0 1 3 6V4Z"
                />
              </svg>
              {selectedCategories.size > 0
                ? `${selectedCategories.size}`
                : "Filter"}
            </button>
            {showCategoryMenu && (
              <>
                <button
                  type="button"
                  className="fixed inset-0 z-10"
                  onClick={() =>
                    setFilterState((prev) => ({
                      ...prev,
                      showCategoryMenu: false,
                    }))
                  }
                  aria-label="Close category filter menu"
                />
                <div className="absolute right-0 z-20 mt-1 min-w-44 rounded border border-gray-200 bg-white shadow-lg">
                  <div className="max-h-56 overflow-y-auto py-1">
                    {allCategories.length === 0 ? (
                      <p className="px-3 py-2 text-xs text-gray-400">
                        No categories
                      </p>
                    ) : (
                      allCategories.map((cat) => (
                        <label
                          key={cat}
                          className="flex cursor-pointer items-center gap-2 px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50"
                        >
                          <input
                            type="checkbox"
                            checked={selectedCategories.has(cat)}
                            onChange={() => {
                              setFilterState((prev) => {
                                const next = new Set(prev.selectedCategories);
                                if (next.has(cat)) next.delete(cat);
                                else next.add(cat);
                                return {
                                  ...prev,
                                  selectedCategories: next,
                                };
                              });
                            }}
                            className="h-3.5 w-3.5"
                          />
                          {cat}
                        </label>
                      ))
                    )}
                  </div>
                  {selectedCategories.size > 0 && (
                    <button
                      type="button"
                      onClick={() =>
                        setFilterState((prev) => ({
                          ...prev,
                          selectedCategories: new Set(),
                        }))
                      }
                      className="w-full border-t border-gray-100 px-3 py-1.5 text-left text-xs text-red-600 hover:bg-gray-50"
                    >
                      Clear filters
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
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
                    onChange={() => onToggleSelected(product.id)}
                    className="h-4 w-4 shrink-0"
                  />
                  {iconUrl ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        onImageClick(iconUrl, product.name || product.id);
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
  );
}

type SaveSelectionModalProps = {
  isOpen: boolean;
  saveName: string;
  isSaving: boolean;
  saveError: string | null;
  onNameChange: (name: string) => void;
  onSave: () => void;
  onClose: () => void;
};

function SaveSelectionModal({
  isOpen,
  saveName,
  isSaving,
  saveError,
  onNameChange,
  onSave,
  onClose,
}: SaveSelectionModalProps) {
  if (!isOpen) return null;

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Save Selection"
      size="md"
      autoHeight
    >
      <div className="space-y-4 p-4">
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
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="e.g. Spring 2026 Flyer"
            className="h-9 w-full rounded border border-gray-300 px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-slate-600 focus:outline-none"
          />
        </div>
        {saveError && <p className="text-sm text-red-600">{saveError}</p>}
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="h-9 rounded border border-gray-300 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={isSaving || !saveName.trim()}
            className="h-9 rounded bg-slate-700 px-4 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
          >
            {isSaving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default function EditorPane({ className = "" }: EditorPaneProps) {
  const [productState, setProductState] = useState<ProductListState>({
    products: [],
    isLoading: true,
    errorMessage: null,
  });
  const { products, isLoading, errorMessage } = productState;
  const { selectedProductIds, setSelectedProductIds } = usePdfEditor();
  const [filterState, setFilterState] = useState<FilterState>({
    productSearch: "",
    selectedCategories: new Set(),
    showCategoryMenu: false,
  });
  const { productSearch, selectedCategories, showCategoryMenu } = filterState;
  const [viewerImage, setViewerImage] = useState<{
    url: string;
    alt: string;
  } | null>(null);
  const [saveState, setSaveState] = useState<SaveSelectionState>({
    isOpen: false,
    name: "",
    isSaving: false,
    error: null,
  });
  const {
    isOpen: showSaveModal,
    name: saveName,
    isSaving,
    error: saveError,
  } = saveState;

  const handleSave = async () => {
    const trimmedName = saveName.trim();
    if (!trimmedName || selectedProductIds.length === 0) return;

    setSaveState((prev) => ({ ...prev, isSaving: true, error: null }));
    try {
      await createAdminSavedSelection(trimmedName, selectedProductIds);
      setSaveState({
        isOpen: false,
        name: "",
        isSaving: false,
        error: null,
      });
    } catch (error) {
      setSaveState((prev) => ({
        ...prev,
        isSaving: false,
        error:
          error instanceof Error ? error.message : "Failed to save selection",
      }));
    }
  };

  useEffect(() => {
    let isMounted = true;

    const loadProducts = async () => {
      try {
        const nextProducts = await getAdminProducts();
        if (!isMounted) return;
        setProductState({
          products: nextProducts,
          isLoading: false,
          errorMessage: null,
        });
      } catch (error) {
        if (!isMounted) return;
        setProductState((prev) => ({
          ...prev,
          isLoading: false,
          errorMessage:
            error instanceof Error ? error.message : "Failed to load products",
        }));
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

  const allCategories = useMemo(() => {
    const cats = new Set<string>();
    for (const p of products) {
      if (p.category) cats.add(p.category);
    }
    return Array.from(cats).sort();
  }, [products]);

  const filteredProducts = useMemo(() => {
    const normalizedQuery = productSearch.trim().toLowerCase();
    return products.filter((product) => {
      if (
        normalizedQuery &&
        !(product.name || "").toLowerCase().includes(normalizedQuery)
      )
        return false;
      if (
        selectedCategories.size > 0 &&
        !selectedCategories.has(product.category ?? "")
      )
        return false;
      return true;
    });
  }, [productSearch, products, selectedCategories]);

  return (
    <div
      className={`flex h-full flex-col overflow-hidden border-3 border-gray-400 bg-white ${className}`}
    >
      <div className="hidden border-b-2 border-gray-300 px-4 py-3 text-xs font-bold tracking-wide text-gray-900 uppercase sm:block sm:text-sm">
        Editor
      </div>
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <SelectedProductsPanel
          selectedProducts={selectedProducts}
          onOpenSaveModal={() =>
            setSaveState((prev) => ({ ...prev, isOpen: true, error: null }))
          }
          onRemoveProduct={(productId) =>
            setSelectedProductIds((current) =>
              current.filter((id) => id !== productId)
            )
          }
          onReorderProducts={(activeId, overId) =>
            setSelectedProductIds((current) => {
              const oldIndex = current.indexOf(activeId);
              const newIndex = current.indexOf(overId);
              if (oldIndex === -1 || newIndex === -1) return current;
              return arrayMove(current, oldIndex, newIndex);
            })
          }
          onImageClick={(url, alt) => setViewerImage({ url, alt })}
        />

        <ProductSelectionPanel
          productSearch={productSearch}
          showCategoryMenu={showCategoryMenu}
          selectedCategories={selectedCategories}
          allCategories={allCategories}
          filteredProducts={filteredProducts}
          selectedProductIds={selectedProductIds}
          isLoading={isLoading}
          errorMessage={errorMessage}
          setFilterState={setFilterState}
          onToggleSelected={toggleSelected}
          onImageClick={(url, alt) => setViewerImage({ url, alt })}
        />
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

      <SaveSelectionModal
        isOpen={showSaveModal}
        saveName={saveName}
        isSaving={isSaving}
        saveError={saveError}
        onNameChange={(name) => setSaveState((prev) => ({ ...prev, name }))}
        onSave={handleSave}
        onClose={() =>
          setSaveState({
            isOpen: false,
            name: "",
            isSaving: false,
            error: null,
          })
        }
      />
    </div>
  );
}
