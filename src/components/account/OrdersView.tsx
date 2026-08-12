import React, { useState, useEffect } from 'react';
import {
  Package,
  Search,
  Calendar,
  Clock,
  ArrowRight,
  Filter,
  RefreshCw,
  ShoppingBag,
  ChevronRight,
  CheckCircle2,
  Truck,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { getUserOrders } from '../../services/firebaseService';
import { Order, OrderStatus, formatPrice } from '../../types';

export const OrdersView: React.FC = () => {
  const { user, userProfile, navigateTo, navigateToOrderDetail } = useShop();

  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  useEffect(() => {
    let isMounted = true;

    async function fetchOrders() {
      setIsLoading(true);
      try {
        const userId = user?.uid || null;
        const email = user?.email || userProfile?.email || undefined;
        const fetched = await getUserOrders(userId, email);
        if (isMounted) {
          setOrders(fetched);
        }
      } catch (err) {
        console.error('Error fetching user orders:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    fetchOrders();

    return () => {
      isMounted = false;
    };
  }, [user, userProfile]);

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.items.some((item) => item.productName.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus =
      statusFilter === 'ALL' || order.orderStatus.toUpperCase() === statusFilter.toUpperCase();

    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'Pending':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'Confirmed':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case 'Processing':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
      case 'Shipped':
        return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30';
      case 'Delivered':
        return 'bg-[#00e65c]/10 text-[#00e65c] border-[#00e65c]/30';
      case 'Cancelled':
      case 'Returned':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      default:
        return 'bg-neutral-800 text-neutral-300 border-neutral-700';
    }
  };

  return (
    <div className="min-h-screen bg-black text-white pt-8 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* HEADER & BREADCRUMB */}
        <div className="border-b border-neutral-900 pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <button
              onClick={() => navigateTo('account')}
              className="text-xs font-mono text-neutral-400 hover:text-[#00e65c] transition-colors mb-2 block"
            >
              ← BACK TO ACCOUNT DASHBOARD
            </button>
            <h1 className="font-syne font-extrabold text-3xl sm:text-4xl uppercase tracking-wider text-white">
              MY ORDERS HISTORY
            </h1>
          </div>

          <div className="flex items-center gap-2 bg-neutral-900 border border-neutral-800 px-3.5 py-2 text-xs font-mono text-neutral-400">
            <Package size={16} className="text-[#00e65c]" />
            <span>TOTAL ORDERS: {orders.length}</span>
          </div>
        </div>

        {/* SEARCH & FILTER BAR */}
        <div className="bg-[#0a0a0a] border border-neutral-800 p-4 flex flex-col md:flex-row gap-4 justify-between items-center">
          {/* SEARCH INPUT */}
          <div className="relative w-full md:w-80">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by order # or product name..."
              className="w-full bg-neutral-900 border border-neutral-800 text-white font-mono text-xs px-3.5 py-2.5 pl-9 focus:outline-none focus:border-[#00e65c]"
            />
            <Search size={14} className="absolute left-3 top-3 text-neutral-500" />
          </div>

          {/* STATUS FILTER TABS */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 font-mono text-xs">
            {['ALL', 'PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map(
              (status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1.5 whitespace-nowrap text-[11px] font-bold uppercase transition-all ${
                    statusFilter === status
                      ? 'bg-[#00e65c] text-black'
                      : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
                  }`}
                >
                  {status}
                </button>
              )
            )}
          </div>
        </div>

        {/* ORDER LIST CONTAINER */}
        {isLoading ? (
          <div className="bg-[#0a0a0a] border border-neutral-800 p-12 text-center">
            <div className="w-8 h-8 border-2 border-[#00e65c] border-t-transparent animate-spin rounded-full mx-auto mb-3" />
            <p className="text-xs font-mono text-neutral-400">LOADING YOUR ORDERS...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-[#0a0a0a] border border-neutral-800 p-12 text-center space-y-4">
            <div className="w-16 h-16 bg-neutral-900 border border-neutral-800 rounded-full flex items-center justify-center mx-auto text-neutral-600">
              <Package size={28} />
            </div>
            <h3 className="font-syne font-extrabold text-lg uppercase text-white">
              NO ORDERS FOUND
            </h3>
            <p className="text-xs font-mono text-neutral-400 max-w-sm mx-auto">
              {searchQuery || statusFilter !== 'ALL'
                ? 'No orders matched your search or status filter parameters.'
                : "You haven't placed any orders yet. Discover our premium streetwear drop!"}
            </p>
            <button
              onClick={() => navigateTo('home')}
              className="bg-[#00e65c] text-black font-syne font-extrabold px-6 py-3 text-xs uppercase tracking-wider hover:bg-[#00ff66] transition-all inline-flex items-center gap-2"
            >
              <ShoppingBag size={14} />
              <span>EXPLORE CATALOG</span>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((ord) => (
              <div
                key={ord.id}
                className="bg-[#0a0a0a] border border-neutral-800 hover:border-neutral-700 p-6 transition-all space-y-4"
              >
                {/* ORDER HEADER */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800 pb-4">
                  <div className="space-y-1 font-mono">
                    <div className="flex items-center gap-3">
                      <span className="font-syne font-extrabold text-base text-white">
                        {ord.orderNumber}
                      </span>
                      <span
                        className={`text-[10px] font-mono font-bold px-2.5 py-0.5 border uppercase ${getStatusColor(
                          ord.orderStatus
                        )}`}
                      >
                        {ord.orderStatus}
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-400 flex items-center gap-2">
                      <Calendar size={12} className="text-[#00e65c]" />
                      <span>{new Date(ord.createdAt).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>Payment: {ord.paymentMethod}</span>
                    </p>
                  </div>

                  <div className="text-left sm:text-right font-mono">
                    <span className="text-[10px] text-neutral-500 uppercase block">TOTAL AMOUNT</span>
                    <span className="font-syne font-extrabold text-lg text-[#00e65c]">
                      {formatPrice(ord.total)}
                    </span>
                  </div>
                </div>

                {/* ORDER ITEMS PREVIEW */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3 overflow-x-auto max-w-full pb-1 sm:pb-0">
                    {ord.items.map((item, i) => (
                      <div key={i} className="relative group shrink-0">
                        <img
                          src={item.productImage}
                          alt={item.productName}
                          className="w-14 h-16 object-cover bg-black border border-neutral-800"
                        />
                        <span className="absolute -top-1.5 -right-1.5 bg-[#00e65c] text-black font-mono font-bold text-[9px] w-4 h-4 rounded-full flex items-center justify-center">
                          {item.quantity}
                        </span>
                      </div>
                    ))}
                    {ord.items.length > 3 && (
                      <span className="font-mono text-xs text-neutral-500 pl-2">
                        +{ord.items.length - 3} more
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => navigateToOrderDetail(ord.id)}
                    className="w-full sm:w-auto bg-neutral-900 border border-neutral-800 hover:border-[#00e65c] text-white hover:text-[#00e65c] font-syne font-bold px-5 py-2.5 text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2"
                  >
                    <span>VIEW ORDER DETAILS</span>
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
