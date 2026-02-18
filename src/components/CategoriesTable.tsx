import Category from "@/types/Category";

type CategoriesTableProps = {
  categories: Category[];
  onMoveCategory: (categoryId: string, direction: "up" | "down") => void;
  isReorderEnabled: boolean;
  movingCategoryId: string | null;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
};

export default function CategoriesTable({
  categories,
  onMoveCategory,
  isReorderEnabled,
  movingCategoryId,
  onEdit,
  onDelete,
}: CategoriesTableProps) {
  const reorderLocked = !isReorderEnabled || movingCategoryId !== null;

  return (
    <div className="overflow-x-auto border-3 border-gray-400 bg-white">
      <table className="w-full min-w-[520px]">
        <thead>
          <tr className="border-b-3 border-gray-400">
            <th className="w-[96px] p-2 text-left text-xs font-bold tracking-wide text-gray-900 uppercase sm:p-4 sm:text-sm">
              Order
            </th>
            <th className="p-2 text-left text-xs font-bold tracking-wide text-gray-900 uppercase sm:p-4 sm:text-sm">
              ID
            </th>
            <th className="p-2 text-left text-xs font-bold tracking-wide text-gray-900 uppercase sm:p-4 sm:text-sm">
              Name
            </th>
            <th className="p-2 text-right text-xs font-bold tracking-wide text-gray-900 uppercase sm:p-4 sm:text-sm">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {categories.length === 0 ? (
            <tr>
              <td
                colSpan={4}
                className="p-4 text-center text-sm text-gray-600 sm:p-8 sm:text-base"
              >
                No categories found
              </td>
            </tr>
          ) : (
            categories.map((category, index) => {
              const isFirst = index === 0;
              const isLast = index === categories.length - 1;
              const isMoving = movingCategoryId === category.category;

              return (
                <tr
                  key={category.category}
                  className="border-b-2 border-gray-300 transition-colors hover:bg-gray-50"
                >
                  <td className="p-2 font-mono text-xs sm:p-4 sm:text-sm">
                    {category.displayOrder + 1}
                  </td>
                  <td className="p-2 font-mono text-xs sm:p-4 sm:text-sm">
                    {category.category}
                  </td>
                  <td className="p-2 text-sm sm:p-4 sm:text-base">
                    {category.name || (
                      <span className="text-gray-500 italic">No name</span>
                    )}
                  </td>
                  <td className="p-2 text-right sm:p-4">
                    <div className="flex flex-wrap justify-end gap-1 sm:gap-2">
                      <button
                        onClick={() => onMoveCategory(category.category, "up")}
                        disabled={reorderLocked || isFirst}
                        title="Move up"
                        className="border-2 border-gray-400 bg-white px-2 py-1 text-xs font-bold text-gray-900 uppercase transition-colors hover:border-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        ↑
                      </button>
                      <button
                        onClick={() =>
                          onMoveCategory(category.category, "down")
                        }
                        disabled={reorderLocked || isLast}
                        title="Move down"
                        className="border-2 border-gray-400 bg-white px-2 py-1 text-xs font-bold text-gray-900 uppercase transition-colors hover:border-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        ↓
                      </button>
                      <button
                        onClick={() => onEdit(category)}
                        disabled={isMoving}
                        className="bg-slate-700 px-2 py-1 text-xs font-bold whitespace-nowrap text-white uppercase transition-colors duration-200 hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-40 sm:px-4 sm:text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => onDelete(category)}
                        disabled={isMoving}
                        className="bg-red-700 px-2 py-1 text-xs font-bold whitespace-nowrap text-white uppercase transition-colors duration-200 hover:bg-red-900 disabled:cursor-not-allowed disabled:opacity-40 sm:px-4 sm:text-sm"
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
