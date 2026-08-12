import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Star,
  Sparkles,
  Flame,
  Check,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { AdminLayout } from './AdminLayout';
import {
  getProducts,
  deleteProductFromFirestore,
  updateProductStatusInFirestore,
  updateInventoryStockInFirestore
} from '../../services/firebaseService';
import { Product, ProductCategory, formatPrice } from '../../types';

export const AdminProductsList: React.FC = () => {
  const { navigateTo, navigateToAdminProductEdit, navigateToProduct, showToast } = useShop();

  const [productsList, setProductsList] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'draft'>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await getProducts({ limitCount: 200 });
      const mapped = res.products.map((p) => ({
        id: p.productId,
        name: p.name,
        category: p.categoryId as ProductCategory,
        price: p.salePrice && p.salePrice < p.price ? p.salePrice : p.price,
        originalPrice: p.salePrice && p.salePrice < p.price ? p.price : undefined,
        salePrice: p.salePrice,
        rating: 4.9,
        reviewsCount: 20,
        image: p.images[0] || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=1000&auto=format&fit=crop',
        hoverImage: p.images[1] || p.images[0] || '',
        sizes: p.sizes,
        colors: p.colors,
        description: p.description,
        isNew: p.newArrival,
        isBestSeller: p.bestSeller,
        isFeatured: p.featured,
        sku: p.sku,
        slug: p.slug,
        stock: p.stock,
        status: p.status || 'active',
      }));
      setProductsList(mapped as any);
    } catch (e) {
      console.error('Error fetching admin products:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleToggleStatus = async (product: any) => {
    const nextStatus = product.status === 'active' ? 'draft' : 'active';
    const ok = await updateProductStatusInFirestore(product.id, nextStatus);
    if (ok) {
      setProductsList((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, status: nextStatus } : p))
      );
      showToast(`Product "${product.name}" is now ${nextStatus.toUpperCase()}`);
    } else {
      showToast('Failed to update product status.');
    }
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${name}"?`)) {
      return;
    }
    setDeletingId(id);
    const ok = await deleteProductFromFirestore(id);
    if (ok) {
      setProductsList((prev) => prev.filter((p) => p.id !== id));
      showToast(`Deleted product "${name}"`);
    } else {
      showToast('Error deleting product.');
    }
    setDeletingId(null);
  };

  const filteredProducts = productsList.filter((p: any) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCat = categoryFilter === 'all' || p.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || (p.status || 'active') === statusFilter;
    return matchesSearch && matchesCat && matchesStatus;
  });

  return (
    <AdminLayout activeSection="Product Catalog Management">
      <div className="space-y-6">
        {/* TOP BAR */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-800">
          <div>
            <h1 className="font-syne font-black text-2xl md:text-3xl uppercase tracking-tight text-white">
              PRODUCTS CATALOG
            </h1>
            <p className="font-mono text-xs text-neutral-400 mt-1">
              Add, edit, modify pricing, stock variants, and publish status.
            </p>
          </div>

          <button
            onClick={() => navigateTo('admin-product-new')}
            className="bg-[#00e65c] text-black font-syne font-extrabold text-xs uppercase px-5 py-3.5 hover:bg-[#00ff66] transition-colors flex items-center gap-2 self-start sm:self-auto"
          >
            <Plus size={16} />
            <span>ADD NEW PRODUCT</span>
          </button>
        </div>

        {/* SEARCH & FILTERS BAR */}
        <div className="bg-neutral-900 border border-neutral-800 p-4 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:w-80">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by product title or SKU..."
              className="w-full bg-neutral-950 border border-neutral-800 text-white text-xs font-mono px-4 py-2.5 pl-9 focus:outline-none focus:border-[#00e65c]"
            />
            <Search size={14} className="absolute left-3 top-3 text-neutral-500" />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-neutral-950 border border-neutral-800 text-white text-xs font-mono px-3 py-2.5 focus:outline-none focus:border-[#00e65c]"
            >
              <option value="all">All Categories</option>
              <option value="shirts">Shirts</option>
              <option value="caps">Caps</option>
              <option value="jeans">Jeans</option>
              <option value="new-arrivals">New Arrivals</option>
              <option value="best-sellers">Best Sellers</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-neutral-950 border border-neutral-800 text-white text-xs font-mono px-3 py-2.5 focus:outline-none focus:border-[#00e65c]"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active (Published)</option>
              <option value="draft">Draft / Unpublished</option>
            </select>

            <button
              onClick={fetchProducts}
              disabled={loading}
              className="p-2.5 bg-neutral-800 border border-neutral-700 text-neutral-300 hover:text-white transition-colors"
              title="Refresh Catalog"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* PRODUCTS TABLE */}
        <div className="bg-neutral-900 border border-neutral-800 overflow-x-auto">
          {loading ? (
            <div className="py-20 text-center font-mono text-xs text-neutral-500">
              Fetching catalog products...
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="py-20 text-center space-y-3">
              <AlertCircle size={32} className="mx-auto text-neutral-600" />
              <p className="font-syne font-bold text-base uppercase text-neutral-400">
                NO PRODUCTS MATCH YOUR FILTER
              </p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setCategoryFilter('all');
                  setStatusFilter('all');
                }}
                className="font-mono text-xs text-[#00e65c] underline"
              >
                Reset Search Filters
              </button>
            </div>
          ) : (
            <table className="w-full text-left font-mono text-xs">
              <thead>
                <tr className="border-b border-neutral-800 text-neutral-400 text-[10px] uppercase tracking-wider bg-neutral-950/60">
                  <th className="py-3.5 px-4">Product</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Price</th>
                  <th className="py-3.5 px-4">Stock</th>
                  <th className="py-3.5 px-4">Flags</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800">
                {filteredProducts.map((p: any) => (
                  <tr key={p.id} className="hover:bg-neutral-800/40 transition-colors">
                    {/* PRODUCT CELL */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.image}
                          alt={p.name}
                          className="w-12 h-12 object-cover bg-neutral-950 border border-neutral-800 flex-shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="font-syne font-bold text-sm text-white truncate max-w-xs">
                            {p.name}
                          </p>
                          <p className="font-mono text-[10px] text-neutral-500">
                            SKU: {p.sku || p.id}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* CATEGORY */}
                    <td className="py-3.5 px-4 text-neutral-300 uppercase">{p.category}</td>

                    {/* PRICE */}
                    <td className="py-3.5 px-4 font-bold text-white">
                      {formatPrice(p.price)}
                      {p.originalPrice && (
                        <span className="block text-[10px] text-neutral-500 line-through">
                          {formatPrice(p.originalPrice)}
                        </span>
                      )}
                    </td>

                    {/* STOCK */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 text-[10px] font-bold border ${
                          (p.stock ?? 15) <= 5
                            ? 'bg-red-500/10 text-red-400 border-red-500/30'
                            : (p.stock ?? 15) <= 15
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                            : 'bg-[#00e65c]/10 text-[#00e65c] border-[#00e65c]/30'
                        }`}
                      >
                        {p.stock ?? 15} UNITS
                      </span>
                    </td>

                    {/* FLAGS */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {p.isNew && (
                          <span
                            title="New Arrival"
                            className="bg-[#00e65c] text-black text-[9px] font-black px-1.5 py-0.5 uppercase"
                          >
                            NEW
                          </span>
                        )}
                        {p.isBestSeller && (
                          <span
                            title="Best Seller"
                            className="bg-amber-400 text-black text-[9px] font-black px-1.5 py-0.5 uppercase"
                          >
                            BEST
                          </span>
                        )}
                        {p.isFeatured && (
                          <span
                            title="Featured Drop"
                            className="bg-purple-500 text-white text-[9px] font-black px-1.5 py-0.5 uppercase"
                          >
                            FEAT
                          </span>
                        )}
                      </div>
                    </td>

                    {/* STATUS */}
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => handleToggleStatus(p)}
                        className={`px-2.5 py-1 text-[10px] font-bold uppercase border transition-colors flex items-center gap-1 ${
                          (p.status || 'active') === 'active'
                            ? 'bg-[#00e65c]/10 text-[#00e65c] border-[#00e65c]/30 hover:bg-[#00e65c]/20'
                            : 'bg-neutral-800 text-neutral-400 border-neutral-700 hover:text-white'
                        }`}
                      >
                        {(p.status || 'active') === 'active' ? (
                          <>
                            <Eye size={12} />
                            <span>Active</span>
                          </>
                        ) : (
                          <>
                            <EyeOff size={12} />
                            <span>Draft</span>
                          </>
                        )}
                      </button>
                    </td>

                    {/* ACTIONS */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => navigateToAdminProductEdit(p.id)}
                          className="p-1.5 bg-neutral-800 text-neutral-300 hover:text-white hover:bg-neutral-700 transition-colors"
                          title="Edit Product"
                        >
                          <Edit2 size={14} />
                        </button>

                        <button
                          onClick={() => navigateToProduct(p.slug || p.id)}
                          className="p-1.5 bg-neutral-800 text-neutral-300 hover:text-white hover:bg-neutral-700 transition-colors"
                          title="View in Store"
                        >
                          <Eye size={14} />
                        </button>

                        <button
                          onClick={() => handleDeleteProduct(p.id, p.name)}
                          disabled={deletingId === p.id}
                          className="p-1.5 bg-neutral-800 text-red-400 hover:text-red-300 hover:bg-red-950 transition-colors"
                          title="Delete Product"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};
