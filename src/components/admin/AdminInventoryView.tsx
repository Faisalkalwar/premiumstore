import React, { useState, useEffect } from 'react';
import { Boxes, AlertTriangle, CheckCircle2, Search, Save, RefreshCw } from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { AdminLayout } from './AdminLayout';
import { getProducts, updateInventoryStockInFirestore } from '../../services/firebaseService';
import { Product } from '../../types';

export const AdminInventoryView: React.FC = () => {
  const { showToast } = useShop();

  const [inventory, setInventory] = useState<{ id: string; name: string; sku: string; category: string; stock: number; image: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [stockEdits, setStockEdits] = useState<{ [id: string]: number }>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'low' | 'out'>('all');

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const res = await getProducts({ limitCount: 200 });
      const mapped = res.products.map((p) => ({
        id: p.productId,
        name: p.name,
        sku: p.sku || p.productId,
        category: p.categoryId,
        stock: p.stock ?? 15,
        image: p.images[0] || '',
      }));
      setInventory(mapped);
      // init stockEdits map
      const initialMap: { [id: string]: number } = {};
      mapped.forEach((item) => {
        initialMap[item.id] = item.stock;
      });
      setStockEdits(initialMap);
    } catch (e) {
      console.error('Error fetching inventory:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleStockChange = (id: string, value: number) => {
    setStockEdits((prev) => ({ ...prev, [id]: Math.max(0, value) }));
  };

  const handleSaveStock = async (id: string, name: string) => {
    const newStock = stockEdits[id];
    if (newStock === undefined) return;

    setSavingId(id);
    const ok = await updateInventoryStockInFirestore(id, newStock);
    if (ok) {
      setInventory((prev) =>
        prev.map((item) => (item.id === id ? { ...item, stock: newStock } : item))
      );
      showToast(`Updated stock for "${name}" to ${newStock} units.`);
    } else {
      showToast('Error updating stock.');
    }
    setSavingId(null);
  };

  const filteredInventory = inventory.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    const currentStock = stockEdits[item.id] !== undefined ? stockEdits[item.id] : item.stock;
    if (filterMode === 'low') return currentStock > 0 && currentStock <= 10;
    if (filterMode === 'out') return currentStock === 0;
    return true;
  });

  return (
    <AdminLayout activeSection="Inventory & Stock Control">
      <div className="space-y-6">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-800">
          <div>
            <h1 className="font-syne font-black text-2xl md:text-3xl uppercase tracking-tight text-white">
              INVENTORY MANAGEMENT
            </h1>
            <p className="font-mono text-xs text-neutral-400 mt-1">
              Live stock counts, low-stock warnings, and rapid stock count adjustments.
            </p>
          </div>

          <button
            onClick={fetchInventory}
            disabled={loading}
            className="p-3 bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-neutral-300 font-mono text-xs transition-colors flex items-center gap-2 self-start sm:self-auto"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Refresh Inventory</span>
          </button>
        </div>

        {/* SEARCH & FILTER TABS */}
        <div className="bg-neutral-900 border border-neutral-800 p-4 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:w-80">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by product name or SKU..."
              className="w-full bg-neutral-950 border border-neutral-800 text-white text-xs font-mono px-4 py-2.5 pl-9 focus:outline-none focus:border-[#00e65c]"
            />
            <Search size={14} className="absolute left-3 top-3 text-neutral-500" />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
            <button
              onClick={() => setFilterMode('all')}
              className={`px-3.5 py-2 font-mono text-xs uppercase border transition-colors ${
                filterMode === 'all'
                  ? 'bg-[#00e65c] text-black border-[#00e65c] font-bold'
                  : 'bg-neutral-950 text-neutral-400 border-neutral-800 hover:text-white'
              }`}
            >
              All Items ({inventory.length})
            </button>

            <button
              onClick={() => setFilterMode('low')}
              className={`px-3.5 py-2 font-mono text-xs uppercase border transition-colors ${
                filterMode === 'low'
                  ? 'bg-amber-400 text-black border-amber-400 font-bold'
                  : 'bg-neutral-950 text-neutral-400 border-neutral-800 hover:text-white'
              }`}
            >
              Low Stock &le;10 ({inventory.filter((i) => i.stock > 0 && i.stock <= 10).length})
            </button>

            <button
              onClick={() => setFilterMode('out')}
              className={`px-3.5 py-2 font-mono text-xs uppercase border transition-colors ${
                filterMode === 'out'
                  ? 'bg-red-500 text-white border-red-500 font-bold'
                  : 'bg-neutral-950 text-neutral-400 border-neutral-800 hover:text-white'
              }`}
            >
              Out of Stock ({inventory.filter((i) => i.stock === 0).length})
            </button>
          </div>
        </div>

        {/* INVENTORY TABLE */}
        <div className="bg-neutral-900 border border-neutral-800 overflow-x-auto">
          {loading ? (
            <div className="py-20 text-center font-mono text-xs text-neutral-500">
              Loading inventory stock records...
            </div>
          ) : filteredInventory.length === 0 ? (
            <div className="py-20 text-center font-mono text-xs text-neutral-500">
              No inventory records match your query.
            </div>
          ) : (
            <table className="w-full text-left font-mono text-xs">
              <thead>
                <tr className="border-b border-neutral-800 text-neutral-400 text-[10px] uppercase tracking-wider bg-neutral-950/60">
                  <th className="py-3.5 px-4">Item</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">SKU</th>
                  <th className="py-3.5 px-4">Stock Status</th>
                  <th className="py-3.5 px-4">Stock Count</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800">
                {filteredInventory.map((item) => {
                  const currentStockVal =
                    stockEdits[item.id] !== undefined ? stockEdits[item.id] : item.stock;
                  const isModified = currentStockVal !== item.stock;

                  return (
                    <tr key={item.id} className="hover:bg-neutral-800/40 transition-colors">
                      {/* ITEM */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-10 h-10 object-cover bg-neutral-950 border border-neutral-800 flex-shrink-0"
                          />
                          <p className="font-syne font-bold text-sm text-white">{item.name}</p>
                        </div>
                      </td>

                      {/* CATEGORY */}
                      <td className="py-3.5 px-4 uppercase text-neutral-400">{item.category}</td>

                      {/* SKU */}
                      <td className="py-3.5 px-4 text-neutral-300">{item.sku}</td>

                      {/* STATUS BADGE */}
                      <td className="py-3.5 px-4">
                        {currentStockVal === 0 ? (
                          <span className="bg-red-500/10 text-red-400 border border-red-500/30 px-2 py-0.5 font-bold text-[10px]">
                            OUT OF STOCK
                          </span>
                        ) : currentStockVal <= 10 ? (
                          <span className="bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2 py-0.5 font-bold text-[10px]">
                            LOW STOCK
                          </span>
                        ) : (
                          <span className="bg-[#00e65c]/10 text-[#00e65c] border border-[#00e65c]/30 px-2 py-0.5 font-bold text-[10px]">
                            IN STOCK
                          </span>
                        )}
                      </td>

                      {/* STOCK EDIT INPUT */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleStockChange(item.id, currentStockVal - 1)}
                            className="w-7 h-7 bg-neutral-950 border border-neutral-800 text-neutral-300 font-bold hover:bg-neutral-800"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            min="0"
                            value={currentStockVal}
                            onChange={(e) =>
                              handleStockChange(item.id, parseInt(e.target.value) || 0)
                            }
                            className={`w-16 bg-neutral-950 border text-center font-bold text-xs p-1 focus:outline-none ${
                              isModified
                                ? 'border-amber-400 text-amber-400'
                                : 'border-neutral-800 text-white'
                            }`}
                          />
                          <button
                            onClick={() => handleStockChange(item.id, currentStockVal + 1)}
                            className="w-7 h-7 bg-neutral-950 border border-neutral-800 text-neutral-300 font-bold hover:bg-neutral-800"
                          >
                            +
                          </button>
                        </div>
                      </td>

                      {/* ACTION SAVE BUTTON */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleSaveStock(item.id, item.name)}
                          disabled={savingId === item.id || (!isModified && savingId !== item.id)}
                          className={`px-3 py-1.5 font-mono text-xs uppercase font-bold transition-colors inline-flex items-center gap-1 ${
                            isModified
                              ? 'bg-[#00e65c] text-black hover:bg-[#00ff66]'
                              : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                          }`}
                        >
                          <Save size={12} />
                          <span>{savingId === item.id ? 'SAVE...' : 'SAVE'}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};
