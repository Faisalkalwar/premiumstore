import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Search,
  Filter,
  Eye,
  X,
  Truck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RefreshCw,
  Phone,
  Mail,
  MapPin
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { AdminLayout } from './AdminLayout';
import { getAllOrdersAdmin, updateOrderStatusInFirestore } from '../../services/firebaseService';
import { Order, OrderStatus, formatPrice } from '../../types';

export const AdminOrdersView: React.FC = () => {
  const { showToast } = useShop();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Selected Order for Modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await getAllOrdersAdmin();
      setOrders(data as Order[]);
    } catch (e) {
      console.error('Error fetching admin orders:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (orderId: string, orderNumber: string, newStatus: OrderStatus) => {
    setUpdatingId(orderId);
    const ok = await updateOrderStatusInFirestore(orderId, newStatus);
    if (ok) {
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, orderStatus: newStatus } : o))
      );
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder((prev) => (prev ? { ...prev, orderStatus: newStatus } : null));
      }
      showToast(`Order ${orderNumber} updated to ${newStatus.toUpperCase()}`);
    } else {
      showToast('Error updating order status.');
    }
    setUpdatingId(null);
  };

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.phone.includes(searchTerm);

    if (!matchesSearch) return false;
    if (statusFilter === 'all') return true;
    return o.orderStatus.toLowerCase() === statusFilter.toLowerCase();
  });

  const statuses: OrderStatus[] = [
    'Pending',
    'Confirmed',
    'Processing',
    'Shipped',
    'Delivered',
    'Cancelled',
    'Returned',
  ];

  return (
    <AdminLayout activeSection="Orders & Fulfillment">
      <div className="space-y-6">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-800">
          <div>
            <h1 className="font-syne font-black text-2xl md:text-3xl uppercase tracking-tight text-white">
              CUSTOMER ORDERS ({orders.length})
            </h1>
            <p className="font-mono text-xs text-neutral-400 mt-1">
              Process incoming Cash on Delivery orders, dispatch status updates, and view details.
            </p>
          </div>

          <button
            onClick={fetchOrders}
            disabled={loading}
            className="p-3 bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-neutral-300 font-mono text-xs transition-colors flex items-center gap-2 self-start sm:self-auto"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Refresh Orders</span>
          </button>
        </div>

        {/* SEARCH & STATUS TABS */}
        <div className="bg-neutral-900 border border-neutral-800 p-4 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:w-80">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by Order #, Customer Name, Email, Phone..."
              className="w-full bg-neutral-950 border border-neutral-800 text-white text-xs font-mono px-4 py-2.5 pl-9 focus:outline-none focus:border-[#00e65c]"
            />
            <Search size={14} className="absolute left-3 top-3 text-neutral-500" />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 font-mono text-xs uppercase border transition-colors whitespace-nowrap ${
                statusFilter === 'all'
                  ? 'bg-[#00e65c] text-black border-[#00e65c] font-bold'
                  : 'bg-neutral-950 text-neutral-400 border-neutral-800 hover:text-white'
              }`}
            >
              All ({orders.length})
            </button>
            {statuses.map((st) => {
              const count = orders.filter((o) => o.orderStatus === st).length;
              const isSelected = statusFilter.toLowerCase() === st.toLowerCase();
              return (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st.toLowerCase())}
                  className={`px-3 py-1.5 font-mono text-xs uppercase border transition-colors whitespace-nowrap ${
                    isSelected
                      ? 'bg-neutral-200 text-black border-white font-bold'
                      : 'bg-neutral-950 text-neutral-400 border-neutral-800 hover:text-white'
                  }`}
                >
                  {st} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* ORDERS TABLE */}
        <div className="bg-neutral-900 border border-neutral-800 overflow-x-auto">
          {loading ? (
            <div className="py-20 text-center font-mono text-xs text-neutral-500">
              Loading order fulfillment history...
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="py-20 text-center font-mono text-xs text-neutral-500">
              No orders found matching your criteria.
            </div>
          ) : (
            <table className="w-full text-left font-mono text-xs">
              <thead>
                <tr className="border-b border-neutral-800 text-neutral-400 text-[10px] uppercase tracking-wider bg-neutral-950/60">
                  <th className="py-3.5 px-4">Order #</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Location</th>
                  <th className="py-3.5 px-4">Total</th>
                  <th className="py-3.5 px-4">Order Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-neutral-800/40 transition-colors">
                    {/* ORDER # */}
                    <td className="py-3.5 px-4 font-bold text-white">{order.orderNumber}</td>

                    {/* DATE */}
                    <td className="py-3.5 px-4 text-neutral-400 text-[11px]">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>

                    {/* CUSTOMER */}
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-white truncate max-w-[150px]">
                        {order.customerName}
                      </p>
                      <p className="text-[10px] text-neutral-500 truncate max-w-[150px]">
                        {order.phone}
                      </p>
                    </td>

                    {/* LOCATION */}
                    <td className="py-3.5 px-4 text-neutral-300">
                      {order.shippingAddress.city}, {order.shippingAddress.province}
                    </td>

                    {/* TOTAL */}
                    <td className="py-3.5 px-4 font-bold text-[#00e65c]">
                      {formatPrice(order.total)}
                    </td>

                    {/* STATUS DROPDOWN */}
                    <td className="py-3.5 px-4">
                      <select
                        value={order.orderStatus}
                        onChange={(e) =>
                          handleUpdateStatus(order.id, order.orderNumber, e.target.value as OrderStatus)
                        }
                        disabled={updatingId === order.id}
                        className={`bg-neutral-950 border text-xs font-mono font-bold px-2.5 py-1 focus:outline-none ${
                          order.orderStatus === 'Pending'
                            ? 'text-amber-400 border-amber-500/40'
                            : order.orderStatus === 'Delivered'
                            ? 'text-[#00e65c] border-[#00e65c]/40'
                            : order.orderStatus === 'Cancelled'
                            ? 'text-red-400 border-red-500/40'
                            : 'text-blue-400 border-blue-500/40'
                        }`}
                      >
                        {statuses.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* DETAILS ACTION */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="px-3 py-1.5 bg-neutral-800 text-neutral-200 hover:text-white font-mono text-xs hover:bg-neutral-700 transition-colors inline-flex items-center gap-1"
                      >
                        <Eye size={12} />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* ORDER DETAILS MODAL */}
        {selectedOrder && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-neutral-900 border border-neutral-800 max-w-2xl w-full p-6 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
                <div>
                  <h3 className="font-syne font-black text-xl text-white uppercase">
                    ORDER #{selectedOrder.orderNumber}
                  </h3>
                  <p className="font-mono text-xs text-neutral-400">
                    Placed on {new Date(selectedOrder.createdAt).toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-neutral-500 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>

              {/* CUSTOMER INFO & SHIPPING ADDRESS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
                <div className="bg-neutral-950 p-4 border border-neutral-800 space-y-2">
                  <p className="font-bold text-[#00e65c] uppercase text-[10px]">CUSTOMER INFO</p>
                  <p className="font-syne font-bold text-sm text-white">{selectedOrder.customerName}</p>
                  <p className="text-neutral-400 flex items-center gap-1.5">
                    <Mail size={12} />
                    <span>{selectedOrder.email}</span>
                  </p>
                  <p className="text-neutral-400 flex items-center gap-1.5">
                    <Phone size={12} />
                    <span>{selectedOrder.phone}</span>
                  </p>
                </div>

                <div className="bg-neutral-950 p-4 border border-neutral-800 space-y-2">
                  <p className="font-bold text-[#00e65c] uppercase text-[10px]">SHIPPING ADDRESS</p>
                  <p className="text-white font-bold">{selectedOrder.shippingAddress.completeAddress}</p>
                  <p className="text-neutral-400">
                    {selectedOrder.shippingAddress.area}, {selectedOrder.shippingAddress.city},{' '}
                    {selectedOrder.shippingAddress.province}
                  </p>
                </div>
              </div>

              {/* ORDERED ITEMS */}
              <div className="space-y-3 font-mono text-xs">
                <p className="font-bold text-white uppercase text-xs border-b border-neutral-800 pb-2">
                  PURCHASED ITEMS ({selectedOrder.items.length})
                </p>
                <div className="space-y-2">
                  {selectedOrder.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between bg-neutral-950 p-3 border border-neutral-800"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={item.productImage}
                          alt={item.productName}
                          className="w-12 h-12 object-cover bg-neutral-900 border border-neutral-800 flex-shrink-0"
                        />
                        <div>
                          <p className="font-syne font-bold text-sm text-white">{item.productName}</p>
                          <p className="text-[10px] text-neutral-400">
                            Variant: {item.selectedSize} / {item.selectedColor}
                          </p>
                          <p className="text-[10px] text-neutral-500">Qty: {item.quantity}</p>
                        </div>
                      </div>

                      <div className="text-right font-bold text-white">
                        {formatPrice(item.price * item.quantity)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* PAYMENT & TOTAL SUMMARY */}
              <div className="bg-neutral-950 p-4 border border-neutral-800 font-mono text-xs space-y-2">
                <div className="flex justify-between text-neutral-400">
                  <span>Subtotal</span>
                  <span>{formatPrice(selectedOrder.subtotal)}</span>
                </div>
                <div className="flex justify-between text-neutral-400">
                  <span>Shipping Fee</span>
                  <span>
                    {selectedOrder.shippingFee === 0
                      ? 'FREE'
                      : formatPrice(selectedOrder.shippingFee)}
                  </span>
                </div>
                {selectedOrder.discount > 0 && (
                  <div className="flex justify-between text-[#00e65c]">
                    <span>Discount</span>
                    <span>-{formatPrice(selectedOrder.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-white font-bold text-sm border-t border-neutral-800 pt-2">
                  <span>Total Amount</span>
                  <span className="text-[#00e65c]">{formatPrice(selectedOrder.total)}</span>
                </div>
                <p className="text-[10px] text-neutral-500 pt-1">
                  Payment Method: <span className="text-white font-bold">{selectedOrder.paymentMethod}</span> ({selectedOrder.paymentStatus})
                </p>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="px-6 py-2.5 bg-neutral-800 text-white font-mono text-xs uppercase font-bold hover:bg-neutral-700"
                >
                  Close Window
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};
