import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, FolderTree, AlertCircle, Save, X, Eye, EyeOff } from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { AdminLayout } from './AdminLayout';
import {
  getAllCategoriesAdmin,
  createOrUpdateCategory,
  deleteCategoryInFirestore
} from '../../services/firebaseService';
import { FirestoreCategory } from '../../types';

export const AdminCategoriesView: React.FC = () => {
  const { showToast } = useShop();

  const [categories, setCategories] = useState<FirestoreCategory[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Partial<FirestoreCategory> | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await getAllCategoriesAdmin();
      setCategories(data);
    } catch (err) {
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenAddModal = () => {
    setEditingCategory({
      categoryId: '',
      name: '',
      slug: '',
      description: '',
      image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=1000&auto=format&fit=crop',
      active: true,
      sortOrder: categories.length + 1,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (cat: FirestoreCategory) => {
    setEditingCategory(cat);
    setIsModalOpen(true);
  };

  const handleDeleteCategory = async (cat: FirestoreCategory) => {
    if (!window.confirm(`Are you sure you want to delete category "${cat.name}"?`)) {
      return;
    }
    const ok = await deleteCategoryInFirestore(cat.categoryId);
    if (ok) {
      setCategories((prev) => prev.filter((c) => c.categoryId !== cat.categoryId));
      showToast(`Deleted category "${cat.name}".`);
    } else {
      showToast('Error deleting category.');
    }
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory?.name) {
      showToast('Please enter a category name.');
      return;
    }

    setSaving(true);
    try {
      const id =
        editingCategory.categoryId || editingCategory.name.toLowerCase().replace(/\s+/g, '-');
      const payload: Partial<FirestoreCategory> = {
        ...editingCategory,
        categoryId: id,
        slug: editingCategory.slug || id,
      };

      const ok = await createOrUpdateCategory(payload);
      if (ok) {
        showToast(`Category "${payload.name}" saved!`);
        setIsModalOpen(false);
        fetchCategories();
      } else {
        showToast('Failed to save category.');
      }
    } catch (err) {
      console.error('Save category error:', err);
      showToast('Error saving category.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout activeSection="Category Management">
      <div className="space-y-6">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-800">
          <div>
            <h1 className="font-syne font-black text-2xl md:text-3xl uppercase tracking-tight text-white">
              CATEGORIES MANAGER
            </h1>
            <p className="font-mono text-xs text-neutral-400 mt-1">
              Organize storefront drops by Shirts, Caps, Jeans, Outerwear, and Custom categories.
            </p>
          </div>

          <button
            onClick={handleOpenAddModal}
            className="bg-[#00e65c] text-black font-syne font-extrabold text-xs uppercase px-5 py-3.5 hover:bg-[#00ff66] transition-colors flex items-center gap-2 self-start sm:self-auto"
          >
            <Plus size={16} />
            <span>CREATE NEW CATEGORY</span>
          </button>
        </div>

        {/* CATEGORIES GRID */}
        {loading ? (
          <div className="py-20 text-center font-mono text-xs text-neutral-500">
            Loading categories...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((cat) => (
              <div
                key={cat.categoryId}
                className="bg-neutral-900 border border-neutral-800 overflow-hidden flex flex-col justify-between"
              >
                <div className="relative h-40 bg-neutral-950">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-cover opacity-80"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-transparent to-transparent"></div>
                  <div className="absolute top-3 right-3 flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 font-mono text-[10px] font-bold uppercase border ${
                        cat.active
                          ? 'bg-[#00e65c]/20 text-[#00e65c] border-[#00e65c]/40'
                          : 'bg-neutral-800 text-neutral-400 border-neutral-700'
                      }`}
                    >
                      {cat.active ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                  </div>
                  <div className="absolute bottom-3 left-4 right-4">
                    <h3 className="font-syne font-black text-lg text-white uppercase tracking-wide">
                      {cat.name}
                    </h3>
                    <p className="font-mono text-[10px] text-neutral-400">slug: /{cat.slug}</p>
                  </div>
                </div>

                <div className="p-4 space-y-4 font-mono text-xs text-neutral-300">
                  <p className="line-clamp-2 text-neutral-400">{cat.description || 'No description set.'}</p>

                  <div className="flex items-center justify-between border-t border-neutral-800 pt-3">
                    <span className="text-[10px] text-neutral-500">SORT ORDER: #{cat.sortOrder}</span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenEditModal(cat)}
                        className="px-3 py-1.5 bg-neutral-800 text-neutral-200 hover:text-white font-mono text-xs hover:bg-neutral-700 transition-colors flex items-center gap-1"
                      >
                        <Edit2 size={12} />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(cat)}
                        className="p-1.5 bg-neutral-800 text-red-400 hover:bg-red-950 transition-colors"
                        title="Delete category"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* MODAL FOR ADD / EDIT */}
        {isModalOpen && editingCategory && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-neutral-900 border border-neutral-800 max-w-lg w-full p-6 space-y-6 shadow-2xl">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
                <h3 className="font-syne font-bold text-lg text-white uppercase">
                  {editingCategory.categoryId ? 'EDIT CATEGORY' : 'NEW CATEGORY'}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-neutral-500 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSaveCategory} className="space-y-4 font-mono text-xs">
                <div>
                  <label className="block text-neutral-400 mb-1">CATEGORY NAME *</label>
                  <input
                    type="text"
                    value={editingCategory.name || ''}
                    onChange={(e) =>
                      setEditingCategory({
                        ...editingCategory,
                        name: e.target.value,
                        slug:
                          editingCategory.slug || e.target.value.toLowerCase().replace(/\s+/g, '-'),
                      })
                    }
                    placeholder="e.g. Shirts or Jackets"
                    required
                    className="w-full bg-neutral-950 border border-neutral-800 text-white p-3 focus:outline-none focus:border-[#00e65c]"
                  />
                </div>

                <div>
                  <label className="block text-neutral-400 mb-1">SLUG</label>
                  <input
                    type="text"
                    value={editingCategory.slug || ''}
                    onChange={(e) =>
                      setEditingCategory({ ...editingCategory, slug: e.target.value })
                    }
                    placeholder="e.g. shirts"
                    className="w-full bg-neutral-950 border border-neutral-800 text-white p-3 focus:outline-none focus:border-[#00e65c]"
                  />
                </div>

                <div>
                  <label className="block text-neutral-400 mb-1">TAGLINE / DESCRIPTION</label>
                  <textarea
                    rows={2}
                    value={editingCategory.description || ''}
                    onChange={(e) =>
                      setEditingCategory({ ...editingCategory, description: e.target.value })
                    }
                    placeholder="Short description snippet"
                    className="w-full bg-neutral-950 border border-neutral-800 text-white p-3 focus:outline-none focus:border-[#00e65c]"
                  />
                </div>

                <div>
                  <label className="block text-neutral-400 mb-1">IMAGE BANNER URL</label>
                  <input
                    type="url"
                    value={editingCategory.image || ''}
                    onChange={(e) =>
                      setEditingCategory({ ...editingCategory, image: e.target.value })
                    }
                    placeholder="https://..."
                    className="w-full bg-neutral-950 border border-neutral-800 text-white p-3 focus:outline-none focus:border-[#00e65c]"
                  />
                </div>

                <div className="flex items-center gap-4 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer text-neutral-300">
                    <input
                      type="checkbox"
                      checked={editingCategory.active !== false}
                      onChange={(e) =>
                        setEditingCategory({ ...editingCategory, active: e.target.checked })
                      }
                      className="accent-[#00e65c]"
                    />
                    <span>Active on Store</span>
                  </label>
                </div>

                <div className="pt-4 border-t border-neutral-800 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2.5 bg-neutral-800 text-neutral-300 font-mono text-xs hover:text-white"
                  >
                    CANCEL
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2.5 bg-[#00e65c] text-black font-syne font-extrabold text-xs uppercase hover:bg-[#00ff66]"
                  >
                    {saving ? 'SAVING...' : 'SAVE CATEGORY'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};
