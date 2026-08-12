import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  Upload,
  Image as ImageIcon,
  Check,
  AlertCircle,
  HelpCircle,
  Sparkles
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { AdminLayout } from './AdminLayout';
import {
  createOrUpdateProduct,
  getProductById,
  uploadProductImage,
  getAllCategoriesAdmin,
  getAllCollectionsAdmin
} from '../../services/firebaseService';
import { FirestoreProduct, FirestoreCategory, FirestoreCollection } from '../../types';

interface AdminProductFormProps {
  mode: 'new' | 'edit';
}

export const AdminProductForm: React.FC<AdminProductFormProps> = ({ mode }) => {
  const { navigateTo, editingProductId, showToast } = useShop();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<FirestoreCategory[]>([]);
  const [collections, setCollections] = useState<FirestoreCollection[]>([]);

  // Form State
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [sku, setSku] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('shirts');
  const [selectedCollections, setSelectedCollections] = useState<string[]>([]);
  const [price, setPrice] = useState<number>(65);
  const [salePrice, setSalePrice] = useState<number | undefined>(undefined);
  const [stock, setStock] = useState<number>(25);
  const [images, setImages] = useState<string[]>([
    'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=1000&auto=format&fit=crop',
  ]);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);

  const [sizes, setSizes] = useState<string[]>(['S', 'M', 'L', 'XL']);
  const [colors, setColors] = useState<{ name: string; hex: string }[]>([
    { name: 'Onyx Black', hex: '#000000' },
  ]);
  const [newColorName, setNewColorName] = useState('');
  const [newColorHex, setNewColorHex] = useState('#000000');

  const [featured, setFeatured] = useState(false);
  const [newArrival, setNewArrival] = useState(true);
  const [bestSeller, setBestSeller] = useState(false);
  const [status, setStatus] = useState<'active' | 'draft' | 'archived'>('active');

  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');

  // Load Categories & Collections
  useEffect(() => {
    const initData = async () => {
      const cats = await getAllCategoriesAdmin();
      setCategories(cats);
      const cols = await getAllCollectionsAdmin();
      setCollections(cols);
    };
    initData();
  }, []);

  // Load Existing Product data if in EDIT mode
  useEffect(() => {
    if (mode === 'edit' && editingProductId) {
      setLoading(true);
      getProductById(editingProductId)
        .then((p) => {
          if (p) {
            setName(p.name || '');
            setSlug(p.slug || '');
            setSku(p.sku || '');
            setDescription(p.description || '');
            setCategoryId(p.categoryId || 'shirts');
            setSelectedCollections(p.collectionIds || []);
            setPrice(p.price || 0);
            setSalePrice(p.salePrice);
            setStock(p.stock ?? 20);
            setImages(p.images && p.images.length > 0 ? p.images : []);
            setSizes(p.sizes || ['S', 'M', 'L', 'XL']);
            setColors(p.colors || [{ name: 'Black', hex: '#000000' }]);
            setFeatured(!!p.featured);
            setNewArrival(!!p.newArrival);
            setBestSeller(!!p.bestSeller);
            setStatus(p.status || 'active');
            setSeoTitle(p.seoTitle || p.name || '');
            setSeoDescription(p.seoDescription || p.description || '');
          }
        })
        .finally(() => setLoading(false));
    }
  }, [mode, editingProductId]);

  // Auto generate slug from name if not manually modified
  const handleNameChange = (val: string) => {
    setName(val);
    if (mode === 'new' || !slug) {
      setSlug(val.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''));
    }
    if (!seoTitle) {
      setSeoTitle(val);
    }
  };

  const handleAddImageUrl = () => {
    if (!newImageUrl.trim()) return;
    setImages((prev) => [...prev, newImageUrl.trim()]);
    setNewImageUrl('');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setUploadingImage(true);
    try {
      const downloadUrl = await uploadProductImage(file, file.name);
      if (downloadUrl) {
        setImages((prev) => [...prev, downloadUrl]);
        showToast('Image uploaded successfully!');
      } else {
        // Fallback local preview URL if Storage not configured
        const localPreview = URL.createObjectURL(file);
        setImages((prev) => [...prev, localPreview]);
        showToast('Added local preview image.');
      }
    } catch (err) {
      showToast('Error uploading image file.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const toggleSize = (size: string) => {
    setSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const handleAddColor = () => {
    if (!newColorName.trim()) return;
    setColors((prev) => [...prev, { name: newColorName.trim(), hex: newColorHex }]);
    setNewColorName('');
    setNewColorHex('#000000');
  };

  const handleRemoveColor = (index: number) => {
    setColors((prev) => prev.filter((_, i) => i !== index));
  };

  const toggleCollection = (id: string) => {
    setSelectedCollections((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Please enter a product name.');
      return;
    }
    if (images.length === 0) {
      showToast('Please add at least one product image.');
      return;
    }

    setSaving(true);
    try {
      const payload: Partial<FirestoreProduct> = {
        productId: mode === 'edit' && editingProductId ? editingProductId : `prod-${Date.now()}`,
        name: name.trim(),
        slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
        sku: sku || `PS-${Date.now().toString().slice(-6)}`,
        description,
        categoryId,
        collectionIds: selectedCollections,
        images,
        price: Number(price),
        salePrice: salePrice ? Number(salePrice) : undefined,
        currency: 'PKR',
        sizes,
        colors,
        stock: Number(stock),
        featured,
        newArrival,
        bestSeller,
        status,
        seoTitle: seoTitle || name,
        seoDescription: seoDescription || description,
      };

      const resultId = await createOrUpdateProduct(payload);
      if (resultId) {
        showToast(mode === 'new' ? 'New product created successfully!' : 'Product updated successfully!');
        navigateTo('admin-products');
      } else {
        showToast('Saved product locally.');
        navigateTo('admin-products');
      }
    } catch (err) {
      console.error('Save product error:', err);
      showToast('Error saving product.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout activeSection={mode === 'new' ? 'Add New Product' : 'Edit Product'}>
      <form onSubmit={handleSubmit} className="space-y-8 max-w-5xl">
        {/* HEADER BAR */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-800">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => navigateTo('admin-products')}
              className="p-2.5 bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white transition-colors"
            >
              <ArrowLeft size={16} />
            </button>
            <div>
              <h1 className="font-syne font-black text-2xl uppercase tracking-tight text-white">
                {mode === 'new' ? 'CREATE NEW PRODUCT' : `EDIT: ${name || 'PRODUCT'}`}
              </h1>
              <p className="font-mono text-xs text-neutral-400">
                Configure details, variants, media, pricing, and SEO parameters.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigateTo('admin-products')}
              className="px-4 py-3 bg-neutral-900 border border-neutral-800 text-neutral-400 font-mono text-xs hover:text-white transition-colors"
            >
              CANCEL
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-[#00e65c] text-black font-syne font-extrabold text-xs uppercase tracking-wider hover:bg-[#00ff66] transition-colors flex items-center gap-2"
            >
              <Save size={16} />
              <span>{saving ? 'SAVING...' : 'SAVE PRODUCT'}</span>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="py-20 text-center font-mono text-xs text-neutral-500">
            Loading product payload...
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* MAIN FORM COLS (2 COLS) */}
            <div className="lg:col-span-2 space-y-6">
              {/* BASIC DETAILS */}
              <div className="bg-neutral-900 border border-neutral-800 p-6 space-y-4">
                <h3 className="font-syne font-bold text-sm uppercase text-white border-b border-neutral-800 pb-3">
                  BASIC INFORMATION
                </h3>

                <div className="space-y-4 font-mono text-xs">
                  <div>
                    <label className="block text-neutral-400 mb-1">PRODUCT TITLE *</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => handleNameChange(e.target.value)}
                      placeholder="e.g. Acid Wash Oversized Hoodie"
                      required
                      className="w-full bg-neutral-950 border border-neutral-800 text-white p-3 focus:outline-none focus:border-[#00e65c]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-neutral-400 mb-1">SLUG (URL KEY)</label>
                      <input
                        type="text"
                        value={slug}
                        onChange={(e) => setSlug(e.target.value)}
                        placeholder="acid-wash-oversized-hoodie"
                        className="w-full bg-neutral-950 border border-neutral-800 text-white p-3 focus:outline-none focus:border-[#00e65c]"
                      />
                    </div>
                    <div>
                      <label className="block text-neutral-400 mb-1">SKU CODE</label>
                      <input
                        type="text"
                        value={sku}
                        onChange={(e) => setSku(e.target.value)}
                        placeholder="PS-HD-001"
                        className="w-full bg-neutral-950 border border-neutral-800 text-white p-3 focus:outline-none focus:border-[#00e65c]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-neutral-400 mb-1">PRODUCT DESCRIPTION</label>
                    <textarea
                      rows={5}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Detailed fabric specs, GSM weight, fit silhouette guidelines..."
                      className="w-full bg-neutral-950 border border-neutral-800 text-white p-3 focus:outline-none focus:border-[#00e65c]"
                    />
                  </div>
                </div>
              </div>

              {/* PRICING & INVENTORY */}
              <div className="bg-neutral-900 border border-neutral-800 p-6 space-y-4">
                <h3 className="font-syne font-bold text-sm uppercase text-white border-b border-neutral-800 pb-3">
                  PRICING & STOCK
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
                  <div>
                    <label className="block text-neutral-400 mb-1">REGULAR PRICE (PKR Rs.) *</label>
                    <input
                      type="number"
                      step="1"
                      min="0"
                      value={price}
                      onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                      required
                      className="w-full bg-neutral-950 border border-neutral-800 text-white p-3 focus:outline-none focus:border-[#00e65c]"
                    />
                  </div>

                  <div>
                    <label className="block text-neutral-400 mb-1">SALE PRICE (PKR Rs.)</label>
                    <input
                      type="number"
                      step="1"
                      min="0"
                      value={salePrice !== undefined ? salePrice : ''}
                      onChange={(e) =>
                        setSalePrice(e.target.value ? parseFloat(e.target.value) : undefined)
                      }
                      placeholder="Optional discount price"
                      className="w-full bg-neutral-950 border border-neutral-800 text-white p-3 focus:outline-none focus:border-[#00e65c]"
                    />
                  </div>

                  <div>
                    <label className="block text-neutral-400 mb-1">STOCK UNITS *</label>
                    <input
                      type="number"
                      min="0"
                      value={stock}
                      onChange={(e) => setStock(parseInt(e.target.value) || 0)}
                      required
                      className="w-full bg-neutral-950 border border-neutral-800 text-white p-3 focus:outline-none focus:border-[#00e65c]"
                    />
                  </div>
                </div>
              </div>

              {/* VARIANTS (SIZES & COLORS) */}
              <div className="bg-neutral-900 border border-neutral-800 p-6 space-y-6">
                <h3 className="font-syne font-bold text-sm uppercase text-white border-b border-neutral-800 pb-3">
                  VARIANTS (SIZES & COLORS)
                </h3>

                {/* SIZES */}
                <div className="space-y-2 font-mono text-xs">
                  <label className="block text-neutral-400">AVAILABLE SIZES</label>
                  <div className="flex flex-wrap gap-2">
                    {['XS', 'S', 'M', 'L', 'XL', 'XXL', 'ONE SIZE'].map((sz) => {
                      const selected = sizes.includes(sz);
                      return (
                        <button
                          key={sz}
                          type="button"
                          onClick={() => toggleSize(sz)}
                          className={`px-3 py-2 font-bold uppercase border transition-colors ${
                            selected
                              ? 'bg-[#00e65c] text-black border-[#00e65c]'
                              : 'bg-neutral-950 text-neutral-400 border-neutral-800 hover:text-white'
                          }`}
                        >
                          {sz}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* COLORS */}
                <div className="space-y-3 font-mono text-xs">
                  <label className="block text-neutral-400">COLORWAY VARIANTS</label>
                  <div className="flex flex-wrap gap-3">
                    {colors.map((c, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 bg-neutral-950 border border-neutral-800 px-3 py-1.5"
                      >
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-neutral-700"
                          style={{ backgroundColor: c.hex }}
                        ></span>
                        <span className="text-white font-bold">{c.name}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveColor(i)}
                          className="text-neutral-500 hover:text-red-400 ml-1"
                        >
                          &times;
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="text"
                      placeholder="Color Name (e.g. Acid Wash Gray)"
                      value={newColorName}
                      onChange={(e) => setNewColorName(e.target.value)}
                      className="bg-neutral-950 border border-neutral-800 text-white p-2 text-xs flex-1 focus:outline-none"
                    />
                    <input
                      type="color"
                      value={newColorHex}
                      onChange={(e) => setNewColorHex(e.target.value)}
                      className="w-10 h-9 bg-neutral-950 border border-neutral-800 cursor-pointer"
                    />
                    <button
                      type="button"
                      onClick={handleAddColor}
                      className="px-3 py-2 bg-neutral-800 text-white font-bold text-xs uppercase hover:bg-neutral-700"
                    >
                      ADD
                    </button>
                  </div>
                </div>
              </div>

              {/* MEDIA GALLERY */}
              <div className="bg-neutral-900 border border-neutral-800 p-6 space-y-4">
                <h3 className="font-syne font-bold text-sm uppercase text-white border-b border-neutral-800 pb-3">
                  MEDIA GALLERY ({images.length} IMAGES)
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {images.map((imgUrl, i) => (
                    <div key={i} className="relative group bg-neutral-950 border border-neutral-800 aspect-square">
                      <img src={imgUrl} alt={`Product ${i}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(i)}
                        className="absolute top-1 right-1 bg-red-950/80 text-red-400 border border-red-800 p-1 hover:bg-red-900 transition-colors"
                        title="Remove image"
                      >
                        <Trash2 size={12} />
                      </button>
                      {i === 0 && (
                        <span className="absolute bottom-1 left-1 bg-black/80 text-[#00e65c] font-mono text-[9px] font-bold px-1.5 py-0.5">
                          PRIMARY
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                <div className="space-y-3 pt-2 font-mono text-xs">
                  <div className="flex items-center gap-2">
                    <input
                      type="url"
                      placeholder="Paste image URL (https://...)"
                      value={newImageUrl}
                      onChange={(e) => setNewImageUrl(e.target.value)}
                      className="bg-neutral-950 border border-neutral-800 text-white p-2.5 text-xs flex-1 focus:outline-none focus:border-[#00e65c]"
                    />
                    <button
                      type="button"
                      onClick={handleAddImageUrl}
                      className="px-4 py-2.5 bg-neutral-800 text-white font-bold uppercase hover:bg-neutral-700"
                    >
                      ADD URL
                    </button>
                  </div>

                  <div className="flex items-center gap-3 border-t border-neutral-800 pt-3">
                    <label className="cursor-pointer bg-neutral-950 border border-neutral-800 hover:border-[#00e65c] text-neutral-300 hover:text-white px-4 py-2.5 text-xs font-mono inline-flex items-center gap-2 transition-colors">
                      <Upload size={14} className="text-[#00e65c]" />
                      <span>{uploadingImage ? 'UPLOADING...' : 'UPLOAD IMAGE FILE'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        disabled={uploadingImage}
                        className="hidden"
                      />
                    </label>
                    <span className="text-[10px] text-neutral-500">JPG, PNG, WEBP max 5MB</span>
                  </div>
                </div>
              </div>

              {/* SEO SETTINGS */}
              <div className="bg-neutral-900 border border-neutral-800 p-6 space-y-4">
                <h3 className="font-syne font-bold text-sm uppercase text-white border-b border-neutral-800 pb-3">
                  SEO SEARCH METADATA
                </h3>

                <div className="space-y-4 font-mono text-xs">
                  <div>
                    <label className="block text-neutral-400 mb-1">SEO META TITLE</label>
                    <input
                      type="text"
                      value={seoTitle}
                      onChange={(e) => setSeoTitle(e.target.value)}
                      placeholder="Title for Google search results"
                      className="w-full bg-neutral-950 border border-neutral-800 text-white p-3 focus:outline-none focus:border-[#00e65c]"
                    />
                  </div>

                  <div>
                    <label className="block text-neutral-400 mb-1">SEO META DESCRIPTION</label>
                    <textarea
                      rows={3}
                      value={seoDescription}
                      onChange={(e) => setSeoDescription(e.target.value)}
                      placeholder="Brief search snippet description..."
                      className="w-full bg-neutral-950 border border-neutral-800 text-white p-3 focus:outline-none focus:border-[#00e65c]"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* SIDEBAR PARAMETERS (1 COL) */}
            <div className="space-y-6">
              {/* PUBLISH STATUS */}
              <div className="bg-neutral-900 border border-neutral-800 p-6 space-y-4">
                <h3 className="font-syne font-bold text-sm uppercase text-white border-b border-neutral-800 pb-3">
                  PUBLICATION STATUS
                </h3>

                <div className="space-y-2 font-mono text-xs">
                  {[
                    { id: 'active', label: 'Active (Visible on Store)', desc: 'Live for all users' },
                    { id: 'draft', label: 'Draft / Unpublished', desc: 'Hidden from storefront' },
                    { id: 'archived', label: 'Archived', desc: 'Discontinued product' },
                  ].map((st) => (
                    <label
                      key={st.id}
                      className={`flex items-start gap-3 p-3 border cursor-pointer transition-colors ${
                        status === st.id
                          ? 'bg-[#00e65c]/10 border-[#00e65c] text-white'
                          : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white'
                      }`}
                    >
                      <input
                        type="radio"
                        name="productStatus"
                        checked={status === st.id}
                        onChange={() => setStatus(st.id as any)}
                        className="mt-0.5 accent-[#00e65c]"
                      />
                      <div>
                        <p className="font-bold text-xs">{st.label}</p>
                        <p className="text-[10px] text-neutral-500">{st.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* CATEGORY & COLLECTIONS */}
              <div className="bg-neutral-900 border border-neutral-800 p-6 space-y-4">
                <h3 className="font-syne font-bold text-sm uppercase text-white border-b border-neutral-800 pb-3">
                  ORGANIZATION
                </h3>

                <div className="space-y-4 font-mono text-xs">
                  <div>
                    <label className="block text-neutral-400 mb-1">CATEGORY *</label>
                    <select
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 text-white p-3 focus:outline-none focus:border-[#00e65c]"
                    >
                      {categories.map((cat) => (
                        <option key={cat.categoryId} value={cat.categoryId}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-neutral-400 mb-1">COLLECTIONS</label>
                    <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                      {collections.map((col) => {
                        const checked = selectedCollections.includes(col.collectionId);
                        return (
                          <label
                            key={col.collectionId}
                            className="flex items-center gap-2 cursor-pointer text-xs text-neutral-300 hover:text-white"
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleCollection(col.collectionId)}
                              className="accent-[#00e65c]"
                            />
                            <span>{col.name}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* PROMOTIONAL FLAGS */}
              <div className="bg-neutral-900 border border-neutral-800 p-6 space-y-4">
                <h3 className="font-syne font-bold text-sm uppercase text-white border-b border-neutral-800 pb-3">
                  BADGES & FLAGS
                </h3>

                <div className="space-y-3 font-mono text-xs">
                  <label className="flex items-center justify-between p-3 bg-neutral-950 border border-neutral-800 cursor-pointer">
                    <span className="text-white font-bold">New Arrival Tag</span>
                    <input
                      type="checkbox"
                      checked={newArrival}
                      onChange={(e) => setNewArrival(e.target.checked)}
                      className="w-4 h-4 accent-[#00e65c]"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 bg-neutral-950 border border-neutral-800 cursor-pointer">
                    <span className="text-white font-bold">Best Seller Tag</span>
                    <input
                      type="checkbox"
                      checked={bestSeller}
                      onChange={(e) => setBestSeller(e.target.checked)}
                      className="w-4 h-4 accent-amber-400"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 bg-neutral-950 border border-neutral-800 cursor-pointer">
                    <span className="text-white font-bold">Featured Home Banner</span>
                    <input
                      type="checkbox"
                      checked={featured}
                      onChange={(e) => setFeatured(e.target.checked)}
                      className="w-4 h-4 accent-purple-500"
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}
      </form>
    </AdminLayout>
  );
};
