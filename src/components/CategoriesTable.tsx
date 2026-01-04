import Category from "@/types/Category";

type SortField = "category" | "name";
type SortOrder = "asc" | "desc";

type CategoriesTableProps = {
  categories: Category[];
  sortField: SortField;
  sortOrder: SortOrder;
  onSort: (field: SortField) => void;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
};

export default function CategoriesTable({
  categories,
  sortField,
  sortOrder,
  onSort,
  onEdit,
  onDelete,
}: CategoriesTableProps) {
  return (
    <div className="overflow-x-auto border-3 border-gray-400 bg-white">
      <table className="w-full min-w-[400px]">
        <thead>
          <tr className="border-b-3 border-gray-400">
            <th
              onClick={() => onSort("category")}
              className="cursor-pointer p-2 text-left text-xs font-bold tracking-wide text-gray-900 uppercase transition-colors hover:bg-gray-100 sm:p-4 sm:text-sm"
            >
              ID {sortField === "category" && (sortOrder === "asc" ? "↑" : "↓")}
            </th>
            <th
              onClick={() => onSort("name")}
              className="cursor-pointer p-2 text-left text-xs font-bold tracking-wide text-gray-900 uppercase transition-colors hover:bg-gray-100 sm:p-4 sm:text-sm"
            >
              Name {sortField === "name" && (sortOrder === "asc" ? "↑" : "↓")}
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
                colSpan={3}
                className="p-4 text-center text-sm text-gray-600 sm:p-8 sm:text-base"
              >
                No categories found
              </td>
            </tr>
          ) : (
            categories.map((category) => (
              <tr
                key={category.category}
                className="border-b-2 border-gray-300 transition-colors hover:bg-gray-50"
              >
                <td className="p-2 font-mono text-xs sm:p-4 sm:text-sm">
                  {category.category}
                </td>
                <td className="p-2 text-sm sm:p-4 sm:text-base">
                  {category.name || (
                    <span className="text-gray-500 italic">No name</span>
                  )}
                </td>
                <td className="p-2 text-right sm:p-4">
                  <div className="flex flex-col justify-end gap-1 sm:flex-row sm:gap-2">
                    <button
                      onClick={() => onEdit(category)}
                      className="bg-slate-700 px-2 py-1 text-xs font-bold whitespace-nowrap text-white uppercase transition-colors duration-200 hover:bg-slate-900 sm:px-4 sm:text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete(category)}
                      className="bg-red-700 px-2 py-1 text-xs font-bold whitespace-nowrap text-white uppercase transition-colors duration-200 hover:bg-red-900 sm:px-4 sm:text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
