"use client";

import Category from "@/types/Category";
import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

type CategoriesTableProps = {
  categories: Category[];
  onReorderCategories: (orderedCategoryIds: string[]) => void;
  isReorderEnabled: boolean;
  isReordering: boolean;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
};

type SortableCategoryRowProps = {
  category: Category;
  dragDisabled: boolean;
  isBusy: boolean;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
};

function SortableCategoryRow({
  category,
  dragDisabled,
  isBusy,
  onEdit,
  onDelete,
}: SortableCategoryRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: category.category,
    disabled: dragDisabled,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const dragLabel = dragDisabled
    ? "Clear search to reorder"
    : "Drag to reorder";

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={`border-b-2 border-gray-300 transition-colors hover:bg-gray-50 ${isDragging ? "bg-slate-100" : ""}`}
    >
      <td className="p-2 font-mono text-xs sm:p-4 sm:text-sm">
        <div className="flex items-center gap-2">
          <button
            type="button"
            {...attributes}
            {...listeners}
            disabled={dragDisabled}
            title={dragLabel}
            className="flex h-7 w-7 items-center justify-center border-2 border-gray-400 bg-white text-sm leading-none text-gray-900 transition-colors hover:border-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="none"
              className="h-4 w-4"
              aria-hidden="true"
            >
              <path
                d="M4 6h12M4 10h12M4 14h12"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </button>
          <span>{category.displayOrder + 1}</span>
        </div>
      </td>
      <td className="p-2 font-mono text-xs sm:p-4 sm:text-sm">
        {category.category}
      </td>
      <td className="p-2 text-sm sm:p-4 sm:text-base">
        {category.name || <span className="text-gray-500 italic">No name</span>}
      </td>
      <td className="p-2 text-right sm:p-4">
        <div className="flex flex-wrap justify-end gap-1 sm:gap-2">
          <button
            onClick={() => onEdit(category)}
            disabled={isBusy}
            className="bg-slate-700 px-2 py-1 text-xs font-bold whitespace-nowrap text-white uppercase transition-colors duration-200 hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-40 sm:px-4 sm:text-sm"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(category)}
            disabled={isBusy}
            className="bg-red-700 px-2 py-1 text-xs font-bold whitespace-nowrap text-white uppercase transition-colors duration-200 hover:bg-red-900 disabled:cursor-not-allowed disabled:opacity-40 sm:px-4 sm:text-sm"
          >
            Delete
          </button>
        </div>
      </td>
    </tr>
  );
}

export default function CategoriesTable({
  categories,
  onReorderCategories,
  isReorderEnabled,
  isReordering,
  onEdit,
  onDelete,
}: CategoriesTableProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    if (!isReorderEnabled || isReordering) {
      return;
    }

    const { active, over } = event;
    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = categories.findIndex(
      (category) => category.category === active.id
    );
    const newIndex = categories.findIndex(
      (category) => category.category === over.id
    );

    if (oldIndex < 0 || newIndex < 0) {
      return;
    }

    const reordered = arrayMove(categories, oldIndex, newIndex);
    onReorderCategories(reordered.map((category) => category.category));
  };

  return (
    <div className="overflow-x-auto border-3 border-gray-400 bg-white">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <table className="w-full min-w-[520px]">
          <thead>
            <tr className="border-b-3 border-gray-400">
              <th className="w-[120px] p-2 text-left text-xs font-bold tracking-wide text-gray-900 uppercase sm:p-4 sm:text-sm">
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
              <SortableContext
                items={categories.map((category) => category.category)}
                strategy={verticalListSortingStrategy}
              >
                {categories.map((category) => (
                  <SortableCategoryRow
                    key={category.category}
                    category={category}
                    dragDisabled={!isReorderEnabled || isReordering}
                    isBusy={isReordering}
                    onEdit={onEdit}
                    onDelete={onDelete}
                  />
                ))}
              </SortableContext>
            )}
          </tbody>
        </table>
      </DndContext>
    </div>
  );
}
