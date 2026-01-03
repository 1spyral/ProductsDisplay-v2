import Image from "next/image";
import Product from "@/types/Product";
import { buildImageUrl } from "@/utils/photo";
import ToggleableCheckbox from "@/components/ToggleableCheckbox";

type SortField = "id" | "name" | "category";
type SortOrder = "asc" | "desc";

type ProductsTableProps = {
  products: Product[];
  sortField: SortField;
  sortOrder: SortOrder;
  onSort: (field: SortField) => void;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  onToggleClearance: (productId: string, current: boolean) => void;
  onToggleHidden: (productId: string, current: boolean) => void;
  updatingClearance: Record<string, boolean>;
  updatingHidden: Record<string, boolean>;
};

function getProductThumbnailUrl(product: Product): string | null {
  if (!product.images || product.images.length === 0) {
    return null;
  }
  const firstImage = product.images[0];
  return buildImageUrl(firstImage.objectKey);
}

export default function ProductsTable({
  products,
  sortField,
  sortOrder,
  onSort,
  onEdit,
  onDelete,
  onToggleClearance,
  onToggleHidden,
  updatingClearance,
  updatingHidden,
}: ProductsTableProps) {
  return (
    <div className="overflow-x-auto border-3 border-gray-400 bg-white">
      <table className="w-full min-w-[640px]">
        <thead>
          <tr className="border-b-3 border-gray-400">
            <th className="w-16 p-2 text-left text-xs font-bold tracking-wide text-gray-900 uppercase sm:w-24 sm:p-4 sm:text-sm">
              Image
            </th>
            <th
              onClick={() => onSort("id")}
              className="cursor-pointer p-2 text-left text-xs font-bold tracking-wide text-gray-900 uppercase transition-colors hover:bg-gray-100 sm:p-4 sm:text-sm"
            >
              ID {sortField === "id" && (sortOrder === "asc" ? "↑" : "↓")}
            </th>
            <th
              onClick={() => onSort("name")}
              className="cursor-pointer p-2 text-left text-xs font-bold tracking-wide text-gray-900 uppercase transition-colors hover:bg-gray-100 sm:p-4 sm:text-sm"
            >
              Name {sortField === "name" && (sortOrder === "asc" ? "↑" : "↓")}
            </th>
            <th
              onClick={() => onSort("category")}
              className="cursor-pointer p-2 text-left text-xs font-bold tracking-wide text-gray-900 uppercase transition-colors hover:bg-gray-100 sm:p-4 sm:text-sm"
            >
              Category{" "}
              {sortField === "category" && (sortOrder === "asc" ? "↑" : "↓")}
            </th>
            <th className="p-2 text-center text-xs font-bold tracking-wide text-gray-900 uppercase sm:p-4 sm:text-sm">
              Clearance
            </th>
            <th className="p-2 text-center text-xs font-bold tracking-wide text-gray-900 uppercase sm:p-4 sm:text-sm">
              Hidden
            </th>
            <th className="p-2 text-right text-xs font-bold tracking-wide text-gray-900 uppercase sm:p-4 sm:text-sm">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {products.length === 0 ? (
            <tr>
              <td
                colSpan={7}
                className="p-4 text-center text-sm text-gray-600 sm:p-8 sm:text-base"
              >
                No products found
              </td>
            </tr>
          ) : (
            products.map((product) => {
              const imageUrl = getProductThumbnailUrl(product);
              return (
                <tr
                  key={product.id}
                  className="border-b-2 border-gray-300 transition-colors hover:bg-gray-50"
                >
                  <td className="p-2 sm:p-4">
                    <div className="relative flex h-12 w-12 flex-shrink-0 items-center justify-center border-2 border-gray-300 bg-gray-100 sm:h-16 sm:w-16">
                      {imageUrl ? (
                        <Image
                          src={imageUrl}
                          alt={product.name || product.id}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <span className="px-1 text-center text-[10px] text-gray-400 sm:text-xs">
                          No Image
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-2 font-mono text-xs sm:p-4 sm:text-sm">
                    {product.id}
                  </td>
                  <td className="p-2 text-sm sm:p-4 sm:text-base">
                    {product.name || (
                      <span className="text-gray-500 italic">No name</span>
                    )}
                  </td>
                  <td className="p-2 text-sm sm:p-4 sm:text-base">
                    {product.category || (
                      <span className="text-gray-500 italic">No category</span>
                    )}
                  </td>
                  <td className="p-2 text-center sm:p-4">
                    <ToggleableCheckbox
                      checked={!!product.clearance}
                      onToggle={() =>
                        onToggleClearance(product.id, !!product.clearance)
                      }
                      disabled={!!updatingClearance[product.id]}
                      title={
                        product.clearance ? "Clearance: On" : "Clearance: Off"
                      }
                    />
                  </td>
                  <td className="p-2 text-center sm:p-4">
                    <ToggleableCheckbox
                      checked={!!product.hidden}
                      onToggle={() =>
                        onToggleHidden(product.id, !!product.hidden)
                      }
                      disabled={!!updatingHidden[product.id]}
                      title={product.hidden ? "Hidden: On" : "Hidden: Off"}
                    />
                  </td>
                  <td className="p-2 text-right sm:p-4">
                    <div className="flex flex-col justify-end gap-1 sm:flex-row sm:gap-2">
                      <button
                        onClick={() => onEdit(product)}
                        className="bg-slate-700 px-2 py-1 text-xs font-bold whitespace-nowrap text-white uppercase transition-colors duration-200 hover:bg-slate-900 sm:px-4 sm:text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => onDelete(product)}
                        className="bg-red-700 px-2 py-1 text-xs font-bold whitespace-nowrap text-white uppercase transition-colors duration-200 hover:bg-red-900 sm:px-4 sm:text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
