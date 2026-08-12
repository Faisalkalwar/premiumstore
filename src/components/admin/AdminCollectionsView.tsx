import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Layers, X, Save, Eye } from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { AdminLayout } from './AdminLayout';
import {
  getAllCollectionsAdmin,
  createOrUpdateCollection,
  deleteCollectionInFirestore
} from '../../services/firebaseService';
import { FirestoreCollection } from '../../types';

export const AdminCollectionsView: React.FC = () => {
  const { showToast } = useShop();

  const [collections, setCollections] = useState<FirestoreCollection[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState<Partial<FirestoreCollection> | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchCollections = async () => {
    setLoading(true);
    try {
      const data = await getAllCollectionsAdmin();
      setCollections(data);
    } catch (err) {
      console.error('Error fetching collections:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollections();
  }, []);

  const handleOpenAddModal = () => {
    setEditingCollection({
      collectionId: '',
      name: '',
      slug: '',
      description: '',
      image: 'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?q=80&w=1000&auto=format&fit=crop',
      active: true,
      sortOrder: collections.length + 1,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (col: FirestoreCollection) => {
    setEditingCollection(col);
    setIsModalOpen(true);
  };

  const handleDeleteCollection = async (col: FirestoreCollection) => {
    if (!window.confirm(`Are you sure you want to delete collection "${col.name}"?`)) {
      return;
    }
    const ok = await deleteCollectionInFirestore(col.collectionId);
    if (ok) {
      setCollections((prev) => prev.filter((c) => c.collectionId !== col.collectionId));
      showToast(`Deleted collection "${col.name}".`);
    } else {
      showToast('Error deleting collection.');
    }
  };

  const handleSaveCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCollection?.name) {
      showToast('Please enter a collection name.');
      return;
    }

    setSaving(true);
    try {
      const id =
        editingCollection.collectionId ||
        editingCollection.name.toLowerCase().replace(/\s+/g, '-');
      const payload: Partial<FirestoreCollection> = {
        ...editingCollection,
        collectionId: id,
        slug: editingCollection.slug || id,
      };

      const ok = await createOrUpdateCollection(payload);
      if (ok) {
        showToast(`Collection "${payload.name}" saved!`);
        setIsModalOpen(false);
        fetchCollections();
      } else {
        showToast('Failed to save collection.');
      }
    } catch (err) {
      console.error('Save collection error:', err);
      showToast('Error saving collection.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout activeSection="Collection Management">
      <div className="space-y-6">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-800">
          <div>
            <h1 className="font-syne font-black text-2xl md:text-3xl uppercase tracking-tight text-white">
              COLLECTIONS & DROPS
            </h1>
            <p className="font-mono text-xs text-neutral-400 mt-1">
              Curate seasonal drops, New Arrivals, Best Sellers, and Custom streetwear themes.
            </p>
          </div>

          <button
            onClick={handleOpenAddModal}
            className="bg-[#00e65c] text-black font-syne font-extrabold text-xs uppercase px-5 py-3.5 hover:bg-[#00ff66] transition-colors flex items-center gap-2 self-start sm:self-auto"
          >
            <Plus size={16} />
            <span>CREATE NEW COLLECTION</span>
          </button>
        </div>

        {/* COLLECTIONS GRID */}
        {loading ? (
          <div className="py-20 text-center font-mono text-xs text-neutral-500">
            Loading collections...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {collections.map((col) => (
              <div
                key={col.collectionId}
                className="bg-neutral-900 border border-neutral-800 overflow-hidden flex flex-col justify-between"
              >
                <div className="relative h-44 bg-neutral-950">
                  <img
                    src={col.image}
                    alt={col.name}
                    className="w-full h-full object-cover opacity-80"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-transparent to-transparent"></div>
                  <div className="absolute top-3 right-3">
                    <span
                      className={`px-2 py-0.5 font-mono text-[10px] font-bold uppercase border ${
                        col.active
                          ? 'bg-[#00e65c]/20 text-[#00e65c] border-[#00e65c]/40'
                          : 'bg-neutral-800 text-neutral-400 border-neutral-700'
                      }`}
                    >
                      {col.active ? 'PUBLISHED' : 'HIDDEN'}
                    </span>
                  </div>
                  <div className="absolute bottom-3 left-4 right-4">
                    <h3 className="font-syne font-black text-lg text-white uppercase tracking-wide">
                      {col.name}
                    </h3>
                    <p className="font-mono text-[10px] text-neutral-400">slug: /{col.slug}</p>
                  </div>
                </div>

                <div className="p-4 space-y-4 font-mono text-xs text-neutral-300">
                  <p className="line-clamp-2 text-neutral-400">{col.description || 'No description set.'}</p>

                  <div className="flex items-center justify-between border-t border-neutral-800 pt-3">
                    <span className="text-[10px] text-neutral-500">PRIORITY ORDER: #{col.sortOrder}</span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenEditModal(col)}
                        className="px-3 py-1.5 bg-neutral-800 text-neutral-200 hover:text-white font-mono text-xs hover:bg-neutral-700 transition-colors flex items-center gap-1"
                      >
                        <Edit2 size={12} />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleDeleteCollection(col)}
                        className="p-1.5 bg-neutral-800 text-red-400 hover:bg-red-950 transition-colors"
                        title="Delete collection"
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
        {isModalOpen && editingCollection && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-neutral-900 border border-neutral-800 max-w-lg w-full p-6 space-y-6 shadow-2xl">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
                <h3 className="font-syne font-bold text-lg text-white uppercase">
                  {editingCollection.collectionId ? 'EDIT COLLECTION' : 'NEW COLLECTION'}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-neutral-500 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSaveCollection} className="space-y-4 font-mono text-xs">
                <div>
                  <label className="block text-neutral-400 mb-1">COLLECTION TITLE *</label>
                  <input
                    type="text"
                    value={editingCollection.name || ''}
                    onChange={(e) =>
                      setEditingCollection({
                        ...editingCollection,
                        name: e.target.value,
                        slug:
                          editingCollection.slug ||
                          e.target.value.toLowerCase().replace(/\s+/g, '-'),
                      })
                    }
                    placeholder="e.g. Summer Grails 2026 or Cyber Archive"
                    required
                    className="w-full bg-neutral-950 border border-neutral-800 text-white p-3 focus:outline-none focus:border-[#00e65c]"
                  />
                </div>

                <div>
                  <label className="block text-neutral-400 mb-1">SLUG</label>
                  <input
                    type="text"
                    value={editingCollection.slug || ''}
                    onChange={(e) =>
                      setEditingCollection({ ...editingCollection, slug: e.target.value })
                    }
                    placeholder="e.g. summer-grails-26"
                    className="w-full bg-neutral-950 border border-neutral-800 text-white p-3 focus:outline-none focus:border-[#00e65c]"
                  />
                </div>

                <div>
                  <label className="block text-neutral-400 mb-1">DESCRIPTION</label>
                  <textarea
                    rows={2}
                    value={editingCollection.description || ''}
                    onChange={(e) =>
                      setEditingCollection({ ...editingCollection, description: e.target.value })
                    }
                    placeholder="Curated theme notes..."
                    className="w-full bg-neutral-950 border border-neutral-800 text-white p-3 focus:outline-none focus:border-[#00e65c]"
                  />
                </div>

                <div>
                  <label className="block text-neutral-400 mb-1">BANNER IMAGE URL</label>
                  <input
                    type="url"
                    value={editingCollection.image || ''}
                    onChange={(e) =>
                      setEditingCollection({ ...editingCollection, image: e.target.value })
                    }
                    placeholder="https://..."
                    className="w-full bg-neutral-950 border border-neutral-800 text-white p-3 focus:outline-none focus:border-[#00e65c]"
                  />
                </div>

                <div className="flex items-center gap-4 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer text-neutral-300">
                    <input
                      type="checkbox"
                      checked={editingCollection.active !== false}
                      onChange={(e) =>
                        setEditingCollection({ ...editingCollection, active: e.target.checked })
                      }
                      className="accent-[#00e65c]"
                    />
                    <span>Active Collection</span>
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
                    {saving ? 'SAVING...' : 'SAVE COLLECTION'}
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
