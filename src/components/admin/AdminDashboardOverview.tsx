import React, { useEffect, useState } from 'react';
import {
  Package,
  ShoppingBag,
  Users,
  Clock,
  AlertTriangle,
  DollarSign,
  TrendingUp,
  Plus,
  ArrowRight,
  RefreshCw,
  ExternalLink,
  Tag,
  CheckCircle2
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { AdminLayout } from './AdminLayout';
import { getAdminDashboardStats } from '../../services/firebaseService';
import { Order, Product, formatPrice } from '../../types';

export const AdminDashboardOverview: React.FC = () => {
  const { navigateTo, navigateToAdminProductEdit, navigateToOrderDetail } = useShop();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<{
    totalProducts: number;
    totalOrders: number;
    totalCustomers: number;
    pendingOrders: number;
    lowStockCount: number;
    lowStockProducts: Product[];
    totalRevenue: number;
    recentOrders: Order[];
  }>({
    totalProducts: 0,
    totalOrders: 0,
    totalCustomers: 0,
    pendingOrders: 0,
    lowStockCount: 0,
    lowStockProducts: [],
    totalRevenue: 0,
    recentOrders: [],
  });

  const loadStats = async () => {
    setLoading(true);
    try {
      const data = await getAdminDashboardStats();
      setStats(data as any);
    } catch (e) {
      console.error('Error loading dashboard stats:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  return (
    <AdminLayout activeSection="Dashboard Overview">
      <div className="space-y-8">
        {/* TOP TITLE & QUICK ACTIONS */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-800">
          <div>
            <h1 className="font-syne font-black text-2xl md:text-3xl uppercase tracking-tight text-white">
              STORE PERFORMANCE OVERVIEW
            </h1>
            <p className="font-mono text-xs text-neutral-400 mt-1">
              Live updates on catalog stock, sales orders, customer signups, and revenues.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadStats}
              disabled={loading}
              className="p-3 bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-neutral-300 font-mono text-xs transition-colors flex items-center gap-2"
              title="Refresh Stats"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <button
              onClick={() => navigateTo('admin-product-new')}
              className="bg-[#00e65c] text-black font-syne font-extrabold text-xs uppercase px-4 py-3 hover:bg-[#00ff66] transition-colors flex items-center gap-2"
            >
              <Plus size={16} />
              <span>ADD NEW PRODUCT</span>
            </button>
          </div>
        </div>

        {/* STAT METRICS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {/* TOTAL REVENUE */}
          <div className="bg-neutral-900 border border-neutral-800 p-5 space-y-2">
            <div className="flex items-center justify-between text-neutral-400">
              <span className="font-mono text-[10px] uppercase tracking-wider">TOTAL SALES</span>
              <DollarSign size={18} className="text-[#00e65c]" />
            </div>
            <p className="font-syne font-black text-2xl text-white">
              {formatPrice(stats.totalRevenue)}
            </p>
            <p className="font-mono text-[10px] text-neutral-500 flex items-center gap-1">
              <TrendingUp size={12} className="text-[#00e65c]" />
              <span>Gross order volume</span>
            </p>
          </div>

          {/* TOTAL ORDERS */}
          <div className="bg-neutral-900 border border-neutral-800 p-5 space-y-2">
            <div className="flex items-center justify-between text-neutral-400">
              <span className="font-mono text-[10px] uppercase tracking-wider">TOTAL ORDERS</span>
              <ShoppingBag size={18} className="text-blue-400" />
            </div>
            <p className="font-syne font-black text-2xl text-white">{stats.totalOrders}</p>
            <p className="font-mono text-[10px] text-neutral-500">Processed orders</p>
          </div>

          {/* PENDING ORDERS */}
          <div className="bg-neutral-900 border border-neutral-800 p-5 space-y-2">
            <div className="flex items-center justify-between text-neutral-400">
              <span className="font-mono text-[10px] uppercase tracking-wider">PENDING ORDERS</span>
              <Clock size={18} className="text-amber-400" />
            </div>
            <div className="flex items-center justify-between">
              <p className="font-syne font-black text-2xl text-amber-400">{stats.pendingOrders}</p>
              {stats.pendingOrders > 0 && (
                <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 font-mono text-[10px] px-2 py-0.5 animate-pulse">
                  NEEDS ATTENTION
                </span>
              )}
            </div>
            <p className="font-mono text-[10px] text-neutral-500">Awaiting processing</p>
          </div>

          {/* TOTAL PRODUCTS */}
          <div className="bg-neutral-900 border border-neutral-800 p-5 space-y-2">
            <div className="flex items-center justify-between text-neutral-400">
              <span className="font-mono text-[10px] uppercase tracking-wider">TOTAL PRODUCTS</span>
              <Package size={18} className="text-purple-400" />
            </div>
            <p className="font-syne font-black text-2xl text-white">{stats.totalProducts}</p>
            <p className="font-mono text-[10px] text-neutral-500">Active catalog listings</p>
          </div>

          {/* LOW STOCK PRODUCTS */}
          <div className="bg-neutral-900 border border-neutral-800 p-5 space-y-2">
            <div className="flex items-center justify-between text-neutral-400">
              <span className="font-mono text-[10px] uppercase tracking-wider">LOW STOCK ALERTS</span>
              <AlertTriangle size={18} className="text-red-400" />
            </div>
            <p className={`font-syne font-black text-2xl ${stats.lowStockCount > 0 ? 'text-red-400' : 'text-white'}`}>
              {stats.lowStockCount}
            </p>
            <p className="font-mono text-[10px] text-neutral-500">Items stock &le; 10</p>
          </div>

          {/* TOTAL CUSTOMERS */}
          <div className="bg-neutral-900 border border-neutral-800 p-5 space-y-2">
            <div className="flex items-center justify-between text-neutral-400">
              <span className="font-mono text-[10px] uppercase tracking-wider">CUSTOMERS</span>
              <Users size={18} className="text-teal-400" />
            </div>
            <p className="font-syne font-black text-2xl text-white">{stats.totalCustomers}</p>
            <p className="font-mono text-[10px] text-neutral-500">Registered members</p>
          </div>
        </div>

        {/* RECENT ORDERS & LOW STOCK ALERTS ROW */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* RECENT ORDERS TABLE (2 COLS) */}
          <div className="lg:col-span-2 bg-neutral-900 border border-neutral-800 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
              <div className="flex items-center gap-2">
                <ShoppingBag className="text-[#00e65c]" size={18} />
                <h3 className="font-syne font-bold text-base uppercase text-white">
                  RECENT ORDERS
                </h3>
              </div>
              <button
                onClick={() => navigateTo('admin-orders')}
                className="font-mono text-xs text-[#00e65c] hover:underline flex items-center gap-1"
              >
                <span>View All Orders</span>
                <ArrowRight size={14} />
              </button>
            </div>

            {loading ? (
              <div className="py-12 text-center text-neutral-500 font-mono text-xs">
                Loading live order records...
              </div>
            ) : stats.recentOrders.length === 0 ? (
              <div className="py-12 text-center text-neutral-500 font-mono text-xs">
                No orders recorded yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-xs">
                  <thead>
                    <tr className="border-b border-neutral-800 text-neutral-400 text-[10px] uppercase tracking-wider">
                      <th className="py-3 px-2">Order #</th>
                      <th className="py-3 px-2">Customer</th>
                      <th className="py-3 px-2">Total</th>
                      <th className="py-3 px-2">Payment</th>
                      <th className="py-3 px-2">Status</th>
                      <th className="py-3 px-2 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800 text-neutral-300">
                    {stats.recentOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-neutral-800/40 transition-colors">
                        <td className="py-3 px-2 font-bold text-white">{order.orderNumber}</td>
                        <td className="py-3 px-2 truncate max-w-[140px]">{order.customerName}</td>
                        <td className="py-3 px-2 font-bold text-[#00e65c]">
                          {formatPrice(order.total)}
                        </td>
                        <td className="py-3 px-2">
                          <span className="bg-neutral-800 px-2 py-0.5 text-[10px] text-neutral-300 border border-neutral-700">
                            {order.paymentMethod}
                          </span>
                        </td>
                        <td className="py-3 px-2">
                          <span
                            className={`px-2 py-0.5 text-[10px] font-bold border ${
                              order.orderStatus === 'Pending'
                                ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                                : order.orderStatus === 'Delivered'
                                ? 'bg-[#00e65c]/10 text-[#00e65c] border-[#00e65c]/30'
                                : 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                            }`}
                          >
                            {order.orderStatus.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-right">
                          <button
                            onClick={() => navigateToOrderDetail(order.id)}
                            className="text-neutral-400 hover:text-white underline text-[11px]"
                          >
                            Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* LOW STOCK WARNINGS PANEL */}
          <div className="bg-neutral-900 border border-neutral-800 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="text-red-400" size={18} />
                <h3 className="font-syne font-bold text-base uppercase text-white">
                  LOW STOCK ALERTS
                </h3>
              </div>
              <button
                onClick={() => navigateTo('admin-inventory')}
                className="font-mono text-xs text-red-400 hover:underline flex items-center gap-1"
              >
                <span>Inventory</span>
                <ArrowRight size={14} />
              </button>
            </div>

            {loading ? (
              <div className="py-8 text-center text-neutral-500 font-mono text-xs">
                Checking inventory levels...
              </div>
            ) : stats.lowStockProducts.length === 0 ? (
              <div className="py-8 text-center text-neutral-500 font-mono text-xs flex flex-col items-center gap-2">
                <CheckCircle2 className="text-[#00e65c]" size={24} />
                <span>All product stock levels healthy!</span>
              </div>
            ) : (
              <div className="space-y-3">
                {stats.lowStockProducts.slice(0, 5).map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between bg-neutral-950 p-3 border border-neutral-800"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-10 h-10 object-cover bg-neutral-900 border border-neutral-800 flex-shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="font-syne font-bold text-xs text-white truncate">
                          {item.name}
                        </p>
                        <p className="font-mono text-[10px] text-neutral-500 uppercase">
                          CAT: {item.category}
                        </p>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <span className="font-mono text-xs font-bold text-red-400 bg-red-950/60 border border-red-800 px-2 py-0.5">
                        {item.stock} LEFT
                      </span>
                      <button
                        onClick={() => navigateToAdminProductEdit(item.id)}
                        className="block font-mono text-[10px] text-neutral-400 hover:text-white underline mt-1 ml-auto"
                      >
                        Restock
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};
