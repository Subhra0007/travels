"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/app/components/Pages/admin/Sidebar";
import { useRouter } from "next/navigation";
import { FaPlus, FaEdit, FaTrash, FaTag } from "react-icons/fa";

interface Category {
  _id: string;
  name: string;
  slug: string;
  requiresVariants: boolean;
  image?: string;
  displayOrder: number;
  isActive: boolean;
}

export default function AdminCategoriesPage() {
  const router = useRouter();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch all categories (including inactive) for admin
      const res = await fetch("/api/categories?all=true", {
        cache: "no-store",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data?.message || "Failed to fetch categories");
      setCategories(data.categories || []);
    } catch (err: any) {
      setError(err?.message || "Unable to fetch categories");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return;

    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data?.message || "Failed to delete category");
      loadCategories();
    } catch (err: any) {
      alert(err?.message || "Failed to delete category");
    }
  };

  const handleToggleActive = async (category: Category) => {
    try {
      const res = await fetch(`/api/categories/${category._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ isActive: !category.isActive }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data?.message || "Failed to update category");
      loadCategories();
    } catch (err: any) {
      alert(err?.message || "Failed to update category");
    }
  };

  return (
    <div className="flex h-screen bg-sky-50 text-black">
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col mt-15">
        <div className="sticky top-0 z-40 bg-sky-50">
          <div className="flex items-center justify-between gap-3 p-3 border-b">
            <div className="flex items-center gap-3">
              <button
                className="lg:hidden px-3 py-2 rounded border text-gray-700"
                onClick={() => setMobileSidebarOpen(true)}
                aria-label="Open menu"
              >
                ☰
              </button>
              <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Product Categories</h1>
            </div>
            <div className="flex items-center gap-3">
              <p className="hidden sm:block text-sm text-gray-600">Manage product categories.</p>
              <button
                onClick={() => {
                  setEditingCategory(null);
                  setShowAddModal(true);
                }}
                className="inline-flex items-center gap-2 rounded-full bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
              >
                <FaPlus /> Add Category
              </button>
            </div>
          </div>
        </div>

        <main className="flex-1 overflow-y-auto overflow-x-auto lg:overflow-x-hidden p-4 sm:p-6">
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-green-500 border-t-transparent" />
            </div>
          ) : error ? (
            <div className="rounded-xl bg-red-50 p-6 text-red-700">{error}</div>
          ) : categories.length === 0 ? (
            <div className="rounded-xl bg-white p-8 text-center shadow">
              <FaTag className="mx-auto mb-4 text-4xl text-gray-400" />
              <p className="text-gray-600 mb-4">No categories have been created yet.</p>
              <button
                onClick={() => {
                  setEditingCategory(null);
                  setShowAddModal(true);
                }}
                className="inline-flex items-center gap-2 rounded-full bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
              >
                <FaPlus /> Add First Category
              </button>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl bg-white shadow">
              <div className="hidden w-full min-w-[800px] lg:block">
                <table className="w-full text-left text-sm text-gray-700">
                  <thead className="bg-gray-100 text-xs uppercase text-gray-600">
                    <tr>
                      <th className="px-4 py-3">Category</th>
                      <th className="px-4 py-3">Slug</th>
                      <th className="px-4 py-3">Requires Variants</th>
                      <th className="px-4 py-3">Display Order</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {categories.map((category) => (
                      <tr key={category._id} className="hover:bg-gray-50">
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            {category.image && (
                              <img
                                src={category.image}
                                alt={category.name}
                                className="h-12 w-12 rounded-lg object-cover"
                              />
                            )}
                            <div>
                              <p className="font-semibold text-gray-900">{category.name}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <code className="text-xs bg-gray-100 px-2 py-1 rounded">{category.slug}</code>
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              category.requiresVariants
                                ? "bg-blue-50 text-blue-700"
                                : "bg-gray-50 text-gray-700"
                            }`}
                          >
                            {category.requiresVariants ? "Yes" : "No"}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-700">{category.displayOrder}</td>
                        <td className="px-4 py-4">
                          <button
                            onClick={() => handleToggleActive(category)}
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              category.isActive
                                ? "bg-green-50 text-green-700"
                                : "bg-red-50 text-red-700"
                            }`}
                          >
                            {category.isActive ? "Active" : "Inactive"}
                          </button>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => {
                                setEditingCategory(category);
                                setShowAddModal(true);
                              }}
                              className="inline-flex items-center gap-1 rounded-full bg-yellow-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-yellow-600"
                            >
                              <FaEdit /> Edit
                            </button>
                            <button
                              onClick={() => handleDelete(category._id)}
                              className="inline-flex items-center gap-1 rounded-full bg-red-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-600"
                            >
                              <FaTrash /> Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="grid gap-4 p-4 lg:hidden">
                {categories.map((category) => (
                  <div key={category._id} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                    <div className="flex items-start gap-3">
                      {category.image && (
                        <img
                          src={category.image}
                          alt={category.name}
                          className="h-16 w-16 rounded-lg object-cover"
                        />
                      )}
                      <div className="flex-1">
                        <p className="text-base font-semibold text-gray-900">{category.name}</p>
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded mt-1">{category.slug}</code>
                        <div className="mt-2 flex items-center gap-2">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              category.requiresVariants
                                ? "bg-blue-50 text-blue-700"
                                : "bg-gray-50 text-gray-700"
                            }`}
                          >
                            {category.requiresVariants ? "Requires Variants" : "No Variants"}
                          </span>
                          <button
                            onClick={() => handleToggleActive(category)}
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              category.isActive
                                ? "bg-green-50 text-green-700"
                                : "bg-red-50 text-red-700"
                            }`}
                          >
                            {category.isActive ? "Active" : "Inactive"}
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <button
                        onClick={() => {
                          setEditingCategory(category);
                          setShowAddModal(true);
                        }}
                        className="flex-1 inline-flex items-center justify-center gap-1 rounded-full bg-yellow-500 px-3 py-2 text-xs font-semibold text-white hover:bg-yellow-600"
                      >
                        <FaEdit /> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(category._id)}
                        className="flex-1 inline-flex items-center justify-center gap-1 rounded-full bg-red-500 px-3 py-2 text-xs font-semibold text-white hover:bg-red-600"
                      >
                        <FaTrash /> Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <CategoryModal
          category={editingCategory}
          onClose={() => {
            setShowAddModal(false);
            setEditingCategory(null);
          }}
          onSuccess={() => {
            setShowAddModal(false);
            setEditingCategory(null);
            loadCategories();
          }}
        />
      )}

      {/* Mobile Sidebar */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileSidebarOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-64 bg-white shadow-xl">
            <Sidebar />
          </div>
        </div>
      )}
    </div>
  );
}

// Category Modal Component
function CategoryModal({
  category,
  onClose,
  onSuccess,
}: {
  category: Category | null;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    name: category?.name || "",
    requiresVariants: category?.requiresVariants || false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const url = category ? `/api/categories/${category._id}` : "/api/categories";
      const method = category ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...formData,
          image: category?.image || undefined,
          displayOrder: category?.displayOrder || 0,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data?.message || "Failed to save category");
      }

      onSuccess();
    } catch (err: any) {
      setError(err?.message || "Failed to save category");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
          {category ? "Edit Category" : "Add New Category"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Category Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="e.g., Jacket, T-Shirt, Book"
              required
            />
          </div>

          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.requiresVariants}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, requiresVariants: e.target.checked }))
                }
                className="rounded border-gray-300"
              />
              <span className="text-sm font-medium text-gray-900">Requires Variants</span>
            </label>
            <p className="text-xs text-gray-500 mt-1">
              Enable this for products that need variants (Color, Size, Stock) like jackets and t-shirts
            </p>
          </div>

          {error && <div className="rounded-lg bg-red-50 p-3 text-red-700 text-sm">{error}</div>}

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 rounded-lg bg-green-600 px-4 py-2 text-white font-semibold hover:bg-green-700 disabled:opacity-50"
            >
              {submitting ? "Saving..." : category ? "Update" : "Create"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg bg-gray-200 px-4 py-2 text-gray-700 font-semibold hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

