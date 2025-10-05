"use client";

import { useState, useEffect } from "react";
import { getAdminProducts, getAdminCategories } from "@/actions/admin";

type Product = {
  id: string;
  name: string | null;
  description: string | null;
  category: string;
};

type Category = {
  category: string;
  name: string | null;
};

type SortField = "id" | "name" | "category";
type SortOrder = "asc" | "desc";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  // Sorting
  const [sortField, setSortField] = useState<SortField>("id");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [productsData, categoriesData] = await Promise.all([
        getAdminProducts(),
        getAdminCategories(),
      ]);

      setProducts(productsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort products
  const filteredAndSortedProducts = products
    .filter((product) => {
      // Category filter
      if (categoryFilter !== "all" && product.category !== categoryFilter) {
        return false;
      }

      // Search filter
      if (searchQuery) {
        const search = searchQuery.toLowerCase();
        const matchesId = product.id.toLowerCase().includes(search);
        const matchesName = product.name?.toLowerCase().includes(search);
        const matchesCategory = product.category.toLowerCase().includes(search);
        return matchesId || matchesName || matchesCategory;
      }

      return true;
    })
    .sort((a, b) => {
      let aValue: string;
      let bValue: string;

      if (sortField === "name") {
        aValue = a.name || "";
        bValue = b.name || "";
      } else if (sortField === "category") {
        aValue = a.category;
        bValue = b.category;
      } else {
        aValue = a.id;
        bValue = b.id;
      }

      const comparison = aValue.localeCompare(bValue);
      return sortOrder === "asc" ? comparison : -comparison;
    });

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="bg-white border-3 border-gray-400 p-8 text-center">
          <p className="text-xl font-bold text-gray-900 uppercase">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="bg-white border-4 border-slate-700 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-gray-900 uppercase tracking-wide">
            Products
          </h1>
          <button className="bg-slate-700 hover:bg-slate-900 text-white font-bold py-2 px-6 uppercase tracking-wide transition-colors duration-200">
            Add Product
          </button>
        </div>
        <p className="text-gray-700">
          {filteredAndSortedProducts.length} products found
        </p>
      </div>

      {/* Filters & Sort */}
      <div className="bg-white border-3 border-gray-400 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-bold text-gray-900 uppercase tracking-wide mb-2">
              Search
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by ID, name, or category..."
              className="w-full h-[42px] px-4 border-2 border-gray-400 focus:outline-none focus:border-slate-700 transition-colors"
            />
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-sm font-bold text-gray-900 uppercase tracking-wide mb-2">
              Category
            </label>
            <div className="relative">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full h-[42px] pl-4 pr-10 border-2 border-gray-400 focus:outline-none focus:border-slate-700 transition-colors appearance-none"
              >
                <option value="all">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.category} value={cat.category}>
                    {cat.name || cat.category}
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-600 font-bold">
                ▼
              </div>
            </div>
          </div>

          {/* Sort */}
          <div>
            <label className="block text-sm font-bold text-gray-900 uppercase tracking-wide mb-2">
              Sort By
            </label>
            <div className="flex gap-2 h-[42px]">
              <div className="relative flex-1">
                <select
                  value={sortField}
                  onChange={(e) => setSortField(e.target.value as SortField)}
                  className="w-full h-full pl-4 pr-10 border-2 border-gray-400 focus:outline-none focus:border-slate-700 transition-colors appearance-none"
                >
                  <option value="id">ID</option>
                  <option value="name">Name</option>
                  <option value="category">Category</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-600 font-bold">
                  ▼
                </div>
              </div>
              <button
                onClick={() =>
                  setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                }
                className="w-[42px] border-2 border-gray-400 hover:border-slate-700 font-bold transition-colors flex items-center justify-center"
                title={sortOrder === "asc" ? "Ascending" : "Descending"}
              >
                {sortOrder === "asc" ? "↑" : "↓"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white border-3 border-gray-400">
        <table className="w-full">
          <thead>
            <tr className="border-b-3 border-gray-400">
              <th
                onClick={() => handleSort("id")}
                className="text-left p-4 font-bold text-gray-900 uppercase tracking-wide cursor-pointer hover:bg-gray-100 transition-colors"
              >
                ID {sortField === "id" && (sortOrder === "asc" ? "↑" : "↓")}
              </th>
              <th
                onClick={() => handleSort("name")}
                className="text-left p-4 font-bold text-gray-900 uppercase tracking-wide cursor-pointer hover:bg-gray-100 transition-colors"
              >
                Name {sortField === "name" && (sortOrder === "asc" ? "↑" : "↓")}
              </th>
              <th
                onClick={() => handleSort("category")}
                className="text-left p-4 font-bold text-gray-900 uppercase tracking-wide cursor-pointer hover:bg-gray-100 transition-colors"
              >
                Category{" "}
                {sortField === "category" && (sortOrder === "asc" ? "↑" : "↓")}
              </th>
              <th className="text-right p-4 font-bold text-gray-900 uppercase tracking-wide">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedProducts.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center p-8 text-gray-600">
                  No products found
                </td>
              </tr>
            ) : (
              filteredAndSortedProducts.map((product) => (
                <tr
                  key={product.id}
                  className="border-b-2 border-gray-300 hover:bg-gray-50 transition-colors"
                >
                  <td className="p-4 font-mono text-sm">{product.id}</td>
                  <td className="p-4">
                    {product.name || (
                      <span className="text-gray-500 italic">No name</span>
                    )}
                  </td>
                  <td className="p-4">{product.category}</td>
                  <td className="p-4 text-right">
                    <button className="bg-slate-700 hover:bg-slate-900 text-white font-bold py-1 px-4 text-sm uppercase transition-colors duration-200 mr-2">
                      Edit
                    </button>
                    <button className="bg-red-700 hover:bg-red-900 text-white font-bold py-1 px-4 text-sm uppercase transition-colors duration-200">
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
