"use client";

import { getAdminProducts } from "@/actions/admin";
import type Product from "@/types/Product";
import { buildImageUrl } from "@/utils/photo";
import { useEffect, useMemo, useState } from "react";

type EditorPaneProps = {
  className?: string;
};

function getIconUrl(product: Product): string | null {
  const firstImage = product.images?.[0];
  return firstImage ? buildImageUrl(firstImage.objectKey) : null;
}

export default function EditorPane({ className = "" }: EditorPaneProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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

  return (
    <div
      className={`flex h-full flex-col overflow-hidden border-3 border-gray-400 bg-white ${className}`}
    >
      <div className="hidden border-b-2 border-gray-300 px-4 py-3 text-xs font-bold tracking-wide text-gray-900 uppercase sm:block sm:text-sm">
        Editor
      </div>
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="flex min-h-0 flex-1 flex-col overflow-scroll border-b-2 border-gray-300 p-4">
          <div className="mb-3 shrink-0 text-xs font-semibold tracking-wide text-gray-700 uppercase">
            Selected Products ({selectedProducts.length})
          </div>
          <div className="min-h-0 overflow-x-hidden overflow-y-auto">
            {selectedProducts.length === 0 ? (
              <p className="text-sm text-gray-500">No products selected yet.</p>
            ) : (
              <div className="space-y-2">
                {selectedProducts.map((product) => {
                  const iconUrl = getIconUrl(product);
                  return (
                    <div
                      key={product.id}
                      className="flex min-w-0 items-center gap-3 rounded border border-gray-200 px-2 py-2"
                    >
                      {iconUrl ? (
                        <img
                          src={iconUrl}
                          alt={product.name || product.id}
                          className="h-10 w-10 shrink-0 rounded object-cover"
                        />
                      ) : (
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-gray-100 text-[10px] text-gray-500 uppercase">
                          No img
                        </div>
                      )}
                      <span className="min-w-0 truncate text-sm text-gray-900">
                        {product.name || product.id}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col overflow-scroll p-4">
          <div className="mb-3 shrink-0 text-xs font-semibold tracking-wide text-gray-700 uppercase">
            Products
          </div>
          <div className="min-h-0 overflow-x-hidden overflow-y-auto">
            {isLoading ? (
              <p className="text-sm text-gray-500">Loading products...</p>
            ) : errorMessage ? (
              <p className="text-sm text-red-600">{errorMessage}</p>
            ) : (
              <div className="space-y-2">
                {products.map((product) => {
                  const isSelected = selectedProductIds.includes(product.id);
                  const iconUrl = getIconUrl(product);
                  return (
                    <label
                      key={product.id}
                      className="flex min-w-0 cursor-pointer items-center gap-3 rounded border border-gray-200 px-2 py-2 hover:bg-gray-50"
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelected(product.id)}
                        className="h-4 w-4 shrink-0"
                      />
                      {iconUrl ? (
                        <img
                          src={iconUrl}
                          alt={product.name || product.id}
                          className="h-8 w-8 shrink-0 rounded object-cover"
                        />
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
    </div>
  );
}
