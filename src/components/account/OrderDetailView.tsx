import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Package,
  Truck,
  MapPin,
  Phone,
  Mail,
  User as UserIcon,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  Copy,
  Check,
  Building,
  Home
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { getOrderByNumber } from '../../services/firebaseService';
import { Order, OrderStatus, formatPrice } from '../../types';

export const OrderDetailView: React.FC = () => {
  const { selectedOrderId, navigateToAccountOrders } = useShop();

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function fetchOrderDetails() {
      if (!selectedOrderId) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const found = await getOrderByNumber(selectedOrderId);
        if (isMounted) setOrder(found);
      } catch (err) {
        console.error('Error fetching order detail:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    fetchOrderDetails();

    return () => {
      isMounted = false;
    };
  }, [selectedOrderId]);

  const handleCopyOrderNumber = () => {
    if (!order) return;
    navigator.clipboard.writeText(order.orderNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const ORDER_STATUS_STEPS: OrderStatus[] = [
    'Pending',
    'Confirmed',
    'Processing',
    'Shipped',
    'Delivered',
  ];

  const getStepIndex = (status: OrderStatus) => {
    switch (status) {
      case 'Pending':
        return 0;
      case 'Confirmed':
        return 1;
      case 'Processing':
        return 2;
      case 'Shipped':
        return 3;
      case 'Delivered':
        return 4;
      case 'Cancelled':
      case 'Returned':
        return -1;
      default:
        return 0;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white pt-16 pb-20 px-4 flex items-center justify-center">
        <div className="text-center font-mono space-y-3">
          <div className="w-8 h-8 border-2 border-[#00e65c] border-t-transparent animate-spin rounded-full mx-auto" />
          <p className="text-xs text-neutral-400">LOADING ORDER SPECIFICATION...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-black text-white pt-12 pb-20 px-4 flex items-center justify-center">
        <div className="bg-[#0a0a0a] border border-neutral-800 p-8 text-center max-w-md mx-auto space-y-4">
          <AlertCircle size={32} className="text-rose-500 mx-auto" />
          <h2 className="font-syne font-extrabold text-lg uppercase text-white">
            ORDER NOT FOUND
          </h2>
          <p className="text-xs font-mono text-neutral-400">
            We could not locate details for this order. It may have been removed or placed under a different profile.
          </p>
          <button
            onClick={navigateToAccountOrders}
            className="bg-[#00e65c] text-black font-syne font-extrabold px-6 py-3 text-xs uppercase hover:bg-[#00ff66] transition-all inline-flex items-center gap-2"
          >
            <ArrowLeft size={14} />
            <span>RETURN TO MY ORDERS</span>
          </button>
        </div>
      </div>
    );
  }

  const currentStep = getStepIndex(order.orderStatus);

  return (
    <div className="min-h-screen bg-black text-white pt-8 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* TOP BAR */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-900 pb-6">
          <div>
            <button
              onClick={navigateToAccountOrders}
              className="inline-flex items-center gap-2 text-xs font-mono text-neutral-400 hover:text-[#00e65c] transition-colors mb-2"
            >
              <ArrowLeft size={14} />
              <span>RETURN TO ORDERS LIST</span>
            </button>
            <div className="flex items-center gap-3">
              <h1 className="font-syne font-extrabold text-2xl sm:text-3xl uppercase tracking-wider text-white">
                ORDER #{order.orderNumber}
              </h1>
              <button
                onClick={handleCopyOrderNumber}
                className="p-1 hover:text-[#00e65c] text-neutral-500 transition-colors"
                title="Copy Order Number"
              >
                {copied ? <Check size={14} className="text-[#00e65c]" /> : <Copy size={14} />}
              </button>
            </div>
          </div>

          <div className="font-mono text-xs text-neutral-400 text-left sm:text-right">
            <span>PLACED ON: {new Date(order.createdAt).toLocaleString()}</span>
          </div>
        </div>

        {/* STATUS TRACKER TIMELINE */}
        <div className="bg-[#0a0a0a] border border-neutral-800 p-6 sm:p-8 space-y-6">
          <h3 className="font-syne font-extrabold text-sm uppercase tracking-wider text-white border-b border-neutral-800 pb-3 flex items-center justify-between">
            <span>ORDER PROGRESS TIMELINE</span>
            <span
              className={`font-mono text-xs px-2.5 py-0.5 border uppercase font-bold ${
                order.orderStatus === 'Cancelled' || order.orderStatus === 'Returned'
                  ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                  : 'bg-[#00e65c]/10 text-[#00e65c] border-[#00e65c]/30'
              }`}
            >
              {order.orderStatus}
            </span>
          </h3>

          {order.orderStatus === 'Cancelled' || order.orderStatus === 'Returned' ? (
            <div className="bg-rose-950/40 border border-rose-800 p-4 text-xs font-mono text-rose-300 flex items-center gap-3">
              <AlertCircle size={18} className="text-rose-400 shrink-0" />
              <span>This order has been flagged as {order.orderStatus.toUpperCase()}. Please contact customer support if you need assistance.</span>
            </div>
          ) : (
            <div className="relative pt-4 pb-2">
              <div className="grid grid-cols-5 gap-2 relative z-10">
                {ORDER_STATUS_STEPS.map((stepName, idx) => {
                  const isCompleted = currentStep >= idx;
                  const isCurrent = currentStep === idx;
                  return (
                    <div key={stepName} className="text-center space-y-2">
                      <div
                        className={`w-8 h-8 rounded-full font-mono text-xs font-bold flex items-center justify-center mx-auto transition-all ${
                          isCompleted
                            ? 'bg-[#00e65c] text-black border-2 border-[#00e65c]'
                            : 'bg-neutral-900 text-neutral-500 border border-neutral-800'
                        }`}
                      >
                        {isCompleted ? <CheckCircle2 size={16} /> : idx + 1}
                      </div>
                      <p
                        className={`font-mono text-[10px] uppercase font-bold ${
                          isCurrent
                            ? 'text-[#00e65c]'
                            : isCompleted
                            ? 'text-white'
                            : 'text-neutral-500'
                        }`}
                      >
                        {stepName}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* ORDER DETAILS & ADDRESS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* LEFT: ITEMS */}
          <div className="md:col-span-7 bg-[#0a0a0a] border border-neutral-800 p-6 space-y-6">
            <h3 className="font-syne font-extrabold text-sm uppercase tracking-wider text-white border-b border-neutral-800 pb-3 flex items-center gap-2">
              <Package size={16} className="text-[#00e65c]" />
              <span>PURCHASED ITEMS ({order.items.length})</span>
            </h3>

            <div className="space-y-4">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex gap-4 items-center bg-neutral-900/60 p-3.5 border border-neutral-800">
                  <img
                    src={item.productImage}
                    alt={item.productName}
                    className="w-16 h-20 object-cover bg-black border border-neutral-800 shrink-0"
                  />
                  <div className="flex-1 min-w-0 font-mono text-xs">
                    <h4 className="font-syne font-bold text-white uppercase truncate">
                      {item.productName}
                    </h4>
                    <p className="text-neutral-400 text-[11px] mt-1">
                      SIZE: <span className="text-white">{item.size}</span> • COLOR:{' '}
                      <span className="text-white">{item.color}</span>
                    </p>
                    <p className="text-neutral-500 text-[10px] mt-1">
                      SKU: {item.sku}
                    </p>
                  </div>
                  <div className="text-right font-mono text-xs">
                    <p className="text-neutral-400 text-[10px]">{item.quantity} × {formatPrice(item.price)}</p>
                    <p className="font-bold text-white mt-1">{formatPrice(item.price * item.quantity)}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* FINANCIAL SUMMARY */}
            <div className="space-y-2 text-xs font-mono text-neutral-400 pt-4 border-t border-neutral-800">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="text-white">{formatPrice(order.subtotal)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-[#00e65c]">
                  <span>Discount</span>
                  <span>-{formatPrice(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping Fee</span>
                <span className="text-white">
                  {order.shippingFee === 0 ? 'FREE' : formatPrice(order.shippingFee)}
                </span>
              </div>
              <div className="pt-3 border-t border-neutral-800 flex justify-between items-baseline font-bold text-white">
                <span className="font-syne text-sm uppercase">TOTAL AMOUNT (COD)</span>
                <span className="font-syne text-2xl text-[#00e65c]">{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>

          {/* RIGHT: SHIPPING ADDRESS & PAYMENT INFO */}
          <div className="md:col-span-5 space-y-6">
            <div className="bg-[#0a0a0a] border border-neutral-800 p-6 space-y-4 font-mono text-xs">
              <h3 className="font-syne font-extrabold text-sm uppercase tracking-wider text-white border-b border-neutral-800 pb-3 flex items-center gap-2">
                <MapPin size={16} className="text-[#00e65c]" />
                <span>SHIPPING DESTINATION</span>
              </h3>

              <div className="space-y-3 text-neutral-300">
                <div className="flex items-start gap-2.5">
                  <UserIcon size={14} className="text-[#00e65c] shrink-0 mt-0.5" />
                  <div>
                    <span className="text-neutral-500 text-[10px] block">RECIPIENT NAME</span>
                    <span className="font-bold text-white">{order.customerName}</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <Phone size={14} className="text-[#00e65c] shrink-0 mt-0.5" />
                  <div>
                    <span className="text-neutral-500 text-[10px] block">PHONE</span>
                    <span>{order.phone}</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <Mail size={14} className="text-[#00e65c] shrink-0 mt-0.5" />
                  <div>
                    <span className="text-neutral-500 text-[10px] block">EMAIL</span>
                    <span>{order.email}</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <Home size={14} className="text-[#00e65c] shrink-0 mt-0.5" />
                  <div>
                    <span className="text-neutral-500 text-[10px] block">ADDRESS</span>
                    <span>
                      {order.shippingAddress.completeAddress}, {order.shippingAddress.area},{' '}
                      {order.shippingAddress.city}, {order.shippingAddress.province}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* PAYMENT INFORMATION */}
            <div className="bg-[#0a0a0a] border border-neutral-800 p-6 space-y-3 font-mono text-xs">
              <h4 className="font-syne font-bold text-xs uppercase text-white">
                PAYMENT DETAILS
              </h4>
              <div className="bg-neutral-900 p-3 border border-neutral-800 space-y-2">
                <div className="flex justify-between">
                  <span className="text-neutral-400">Payment Option:</span>
                  <span className="text-white font-bold">{order.paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Payment Status:</span>
                  <span className="text-[#00e65c] font-bold">{order.paymentStatus}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
