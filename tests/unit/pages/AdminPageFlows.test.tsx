import type Category from "@/types/Category";
import type Product from "@/types/Product";
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  mock,
  test,
} from "bun:test";
import type { ReactNode } from "react";
import { registerHappyDom, unregisterHappyDom } from "../../setup/happy-dom";

const getAdminProducts = mock(async () => [] as Product[]);
const getAdminCategories = mock(async () => [] as Category[]);
const deleteAdminProduct = mock(async (_id: string) => undefined);
const toggleAdminProductClearance = mock(
  async (_id: string, _next: boolean) => undefined
);
const toggleAdminProductHidden = mock(
  async (_id: string, _next: boolean) => undefined
);
const getAdminCategoriesForManagement = mock(async () => [] as Category[]);
const deleteAdminCategory = mock(async (_id: string) => undefined);
const reorderAdminCategories = mock(async (_ids: string[]) => undefined);
const createAdminSavedSelection = mock(
  async (_name: string, _productIds: string[]) => undefined
);
const getAdminSavedSelectionProductIds = mock(async () => [] as string[]);

mock.module("@/actions/admin", () => ({
  getAdminProducts,
  getAdminCategories,
  deleteAdminProduct,
  toggleAdminProductClearance,
  toggleAdminProductHidden,
  getAdminCategoriesForManagement,
  deleteAdminCategory,
  reorderAdminCategories,
  createAdminSavedSelection,
  getAdminSavedSelectionProductIds,
}));

mock.module("@/components/ProductsTable", () => ({
  default: ({
    products,
    onDelete,
    onToggleClearance,
  }: {
    products: Product[];
    onDelete: (product: Product) => void;
    onToggleClearance: (productId: string, current: boolean) => void;
  }) => (
    <div>
      <div data-testid="products-table-count">{products.length}</div>
      {products[0] && (
        <>
          <button type="button" onClick={() => onDelete(products[0])}>
            Trigger Delete
          </button>
          <button
            type="button"
            onClick={() =>
              onToggleClearance(products[0].id, !!products[0].clearance)
            }
          >
            Toggle Clearance
          </button>
        </>
      )}
    </div>
  ),
}));

mock.module("@/components/CategoriesTable", () => ({
  default: ({
    categories,
    isReorderEnabled,
    onDelete,
    onReorderCategories,
  }: {
    categories: Category[];
    isReorderEnabled: boolean;
    onDelete: (category: Category) => void;
    onReorderCategories: (categoryIds: string[]) => Promise<void>;
  }) => (
    <div>
      <div data-testid="categories-table-count">{categories.length}</div>
      <div data-testid="reorder-enabled">{String(isReorderEnabled)}</div>
      {categories.length > 1 && (
        <button
          type="button"
          onClick={() =>
            void onReorderCategories([
              categories[1].category,
              categories[0].category,
            ])
          }
        >
          Trigger Reorder
        </button>
      )}
      {categories[0] && (
        <button type="button" onClick={() => onDelete(categories[0])}>
          Trigger Category Delete
        </button>
      )}
    </div>
  ),
}));

mock.module("@/components/AddProductModal", () => ({
  default: ({ isOpen }: { isOpen: boolean }) =>
    isOpen ? (
      <div data-testid="add-product-modal">Add Product Modal</div>
    ) : null,
}));

mock.module("@/components/EditProductModal", () => ({
  default: ({ isOpen }: { isOpen: boolean }) =>
    isOpen ? (
      <div data-testid="edit-product-modal">Edit Product Modal</div>
    ) : null,
}));

mock.module("@/components/AddCategoryModal", () => ({
  default: ({ isOpen }: { isOpen: boolean }) =>
    isOpen ? (
      <div data-testid="add-category-modal">Add Category Modal</div>
    ) : null,
}));

mock.module("@/components/EditCategoryModal", () => ({
  default: ({ isOpen }: { isOpen: boolean }) =>
    isOpen ? (
      <div data-testid="edit-category-modal">Edit Category Modal</div>
    ) : null,
}));

mock.module("@/components/ConfirmDeleteModal", () => ({
  default: ({
    isOpen,
    onConfirm,
    onCancel,
  }: {
    isOpen: boolean;
    onConfirm: () => Promise<void>;
    onCancel: () => void;
  }) =>
    isOpen ? (
      <div data-testid="confirm-delete-modal">
        <button type="button" onClick={() => void onConfirm()}>
          Confirm Delete
        </button>
        <button type="button" onClick={onCancel}>
          Cancel Delete
        </button>
      </div>
    ) : null,
}));

mock.module("next/image", () => ({
  default: ({ alt = "" }: Record<string, unknown>) => (
    <span role="img" aria-label={String(alt)} />
  ),
}));

mock.module("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: ReactNode;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

mock.module("@dnd-kit/core", () => ({
  DndContext: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  KeyboardSensor: class KeyboardSensor {},
  PointerSensor: class PointerSensor {},
  closestCenter: () => null,
  useSensor: () => ({}),
  useSensors: (...sensors: unknown[]) => sensors,
}));

mock.module("@dnd-kit/modifiers", () => ({
  restrictToVerticalAxis: () => undefined,
}));

mock.module("@dnd-kit/sortable", () => ({
  SortableContext: ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  ),
  arrayMove: <T,>(array: T[], oldIndex: number, newIndex: number) => {
    const copy = [...array];
    const [item] = copy.splice(oldIndex, 1);
    copy.splice(newIndex, 0, item);
    return copy;
  },
  sortableKeyboardCoordinates: () => ({ x: 0, y: 0 }),
  useSortable: ({ id }: { id: string }) => ({
    attributes: { "data-sortable-id": id },
    listeners: {},
    setNodeRef: () => undefined,
    transform: null,
    transition: undefined,
    isDragging: false,
  }),
  verticalListSortingStrategy: {},
}));

mock.module("@dnd-kit/utilities", () => ({
  CSS: {
    Transform: {
      toString: () => "",
    },
  },
}));

const { default: ProductsPage } =
  await import("@/app/(admin)/admin/dashboard/products/page");
const { default: CategoriesPage } =
  await import("@/app/(admin)/admin/dashboard/categories/page");
const { PdfEditorProvider } =
  await import("@/app/(admin)/admin/dashboard/pdf/editor/PdfEditorContext");
const { default: EditorPane } =
  await import("@/app/(admin)/admin/dashboard/pdf/editor/EditorPane");

describe("Admin page flows", () => {
  const products: Product[] = [
    {
      id: "sku-1",
      name: "Apple Chair",
      description: "desc",
      category: "chairs",
      price: "$12",
      clearance: false,
      soldOut: false,
      hidden: false,
      images: [],
    },
    {
      id: "sku-2",
      name: "Blue Table",
      description: "desc",
      category: "tables",
      price: "$20",
      clearance: false,
      soldOut: false,
      hidden: false,
      images: [],
    },
  ];

  const categories: Category[] = [
    {
      category: "chairs",
      name: "Chairs",
      displayOrder: 0,
    },
    {
      category: "tables",
      name: "Tables",
      displayOrder: 1,
    },
  ];

  let originalAlert: typeof window.alert;
  let originalConsoleError: typeof console.error;

  beforeAll(() => {
    registerHappyDom();
  });

  afterAll(() => {
    mock.restore();
    unregisterHappyDom();
  });

  beforeEach(() => {
    originalAlert = window.alert;
    originalConsoleError = console.error;
    window.alert = mock(
      (_message?: string) => undefined
    ) as typeof window.alert;
    console.error = mock(() => undefined) as typeof console.error;
  });

  afterEach(() => {
    window.alert = originalAlert;
    console.error = originalConsoleError;
    getAdminProducts.mockReset();
    getAdminCategories.mockReset();
    deleteAdminProduct.mockReset();
    toggleAdminProductClearance.mockReset();
    toggleAdminProductHidden.mockReset();
    getAdminCategoriesForManagement.mockReset();
    deleteAdminCategory.mockReset();
    reorderAdminCategories.mockReset();
    createAdminSavedSelection.mockReset();
    getAdminSavedSelectionProductIds.mockReset();
    cleanup();
  });

  test("products page: load, add modal, delete flow, and optimistic error path", async () => {
    getAdminProducts
      .mockResolvedValueOnce(products)
      .mockResolvedValueOnce(products)
      .mockResolvedValueOnce(products);
    getAdminCategories.mockResolvedValue(categories);
    deleteAdminProduct.mockResolvedValue(undefined);
    toggleAdminProductClearance.mockRejectedValueOnce(new Error("boom"));

    const { getByText, getByTestId } = render(<ProductsPage />);

    await waitFor(() => {
      expect(getByText("2 products found")).toBeDefined();
    });

    fireEvent.click(getByText("Add Product"));
    expect(getByTestId("add-product-modal")).toBeDefined();

    fireEvent.click(getByText("Trigger Delete"));
    fireEvent.click(getByText("Confirm Delete"));
    await waitFor(() => {
      expect(deleteAdminProduct).toHaveBeenCalledWith("sku-1");
    });

    fireEvent.click(getByText("Toggle Clearance"));
    await waitFor(() => {
      expect(toggleAdminProductClearance).toHaveBeenCalledWith("sku-1", true);
      expect(window.alert).toHaveBeenCalled();
    });
  });

  test("categories page: load/reorder/delete flow", async () => {
    getAdminCategoriesForManagement
      .mockResolvedValueOnce(categories)
      .mockResolvedValueOnce(categories)
      .mockResolvedValueOnce([categories[1]]);
    reorderAdminCategories.mockResolvedValue(undefined);
    deleteAdminCategory.mockResolvedValue(undefined);

    const { getByText, getByTestId } = render(<CategoriesPage />);

    await waitFor(() => {
      expect(getByText("2 categories found")).toBeDefined();
    });
    expect(getByTestId("reorder-enabled").textContent).toBe("true");
    fireEvent.click(getByText("Trigger Reorder"));
    await waitFor(() => {
      expect(reorderAdminCategories).toHaveBeenCalledWith(["tables", "chairs"]);
    });

    fireEvent.click(getByText("Trigger Category Delete"));
    fireEvent.click(getByText("Confirm Delete"));
    await waitFor(() => {
      expect(deleteAdminCategory).toHaveBeenCalledWith("tables");
    });
  });

  test("editor pane: select product and open save modal", async () => {
    getAdminProducts.mockResolvedValue(products);

    const { getByText, getByLabelText, getAllByRole } = render(
      <PdfEditorProvider>
        <EditorPane />
      </PdfEditorProvider>
    );

    await waitFor(() => {
      expect(getByText("Apple Chair")).toBeDefined();
      expect(getByText("Blue Table")).toBeDefined();
    });

    fireEvent.click(getByText("Blue Table"));
    await waitFor(() => {
      expect(getByText("Selected Products (1)")).toBeDefined();
    });

    fireEvent.click(getByText("Save"));
    expect(getByLabelText("Name")).toBeDefined();
    const saveButtons = getAllByRole("button", { name: "Save" });
    expect(saveButtons[saveButtons.length - 1].hasAttribute("disabled")).toBe(
      true
    );
  });
});
