import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  Copy,
  Check,
  ShoppingBag,
  Truck,
  MapPin,
  Phone,
  Mail,
  User as UserIcon,
  Clock,
  ArrowRight,
  Package,
  Calendar
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { getOrderByNumber } from '../../services/firebaseService';
import { Order, formatPrice } from '../../types';

export const OrderSuccessView: React.FC = () => {
  const { selectedOrderNumber, navigateTo, navigateToAccountOrders, user } = useShop();

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function fetchOrder() {
      if (!selectedOrderNumber) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const found = await getOrderByNumber(selectedOrderNumber);
        if (isMounted) setOrder(found);
      } catch (e) {
        console.error('Error fetching order for success view:', e);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    fetchOrder();
    return () => {
      isMounted = false;
    };
  }, [selectedOrderNumber]);

  const handleCopyOrderNumber = () => {
    if (!order) return;
    navigator.clipboard.writeText(order.orderNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white pt-16 pb-20 px-4 flex items-center justify-center">
        <div className="text-center font-mono space-y-3">
          <div className="w-8 h-8 border-2 border-[#00e65c] border-t-transparent animate-spin rounded-full mx-auto" />
          <p className="text-xs text-neutral-400">RETRIEVING ORDER DETAILS...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pt-8 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* SUCCESS CONFIRMATION BANNER */}
        <div className="bg-[#0a0a0a] border-2 border-[#00e65c] p-6 sm:p-10 text-center relative overflow-hidden">
          <div className="w-16 h-16 bg-[#00e65c]/10 border border-[#00e65c] rounded-full flex items-center justify-center mx-auto mb-4 text-[#00e65c]">
            <CheckCircle2 size={36} />
          </div>

          <p className="text-xs font-mono text-[#00e65c] uppercase tracking-widest font-bold mb-1">
            ORDER CONFIRMED
          </p>
          <h1 className="font-syne font-extrabold text-2xl sm:text-4xl uppercase tracking-wider text-white mb-2">
            YOUR ORDER HAS BEEN PLACED SUCCESSFULLY!
          </h1>
          <p className="text-neutral-400 font-mono text-xs max-w-md mx-auto">
            Thank you for shopping with Premium Store. We have registered your Cash on Delivery order and are preparing it for shipment.
          </p>

          {/* ORDER NUMBER CHIP */}
          <div className="mt-6 inline-flex items-center gap-3 bg-neutral-900 border border-neutral-800 px-4 py-2.5 font-mono text-xs">
            <span className="text-neutral-400">ORDER NUMBER:</span>
            <span className="text-[#00e65c] font-bold text-sm tracking-wider">
              {order ? order.orderNumber : selectedOrderNumber || 'PS-2026-CONFIRMED'}
            </span>
            <button
              onClick={handleCopyOrderNumber}
              className="p-1 hover:text-[#00e65c] text-neutral-400 transition-colors"
              title="Copy Order Number"
            >
              {copied ? <Check size={14} className="text-[#00e65c]" /> : <Copy size={14} />}
            </button>
          </div>
        </div>

        {/* ORDER DETAILS & DELIVERY INFO GRID */}
        {order ? (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            {/* LEFT: ITEMS & FINANCIALS */}
            <div className="md:col-span-7 bg-[#0a0a0a] border border-neutral-800 p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                <h3 className="font-syne font-extrabold text-sm uppercase tracking-wider text-white flex items-center gap-2">
                  <Package size={16} className="text-[#00e65c]" />
                  <span>ORDERED ITEMS ({order.items.length})</span>
                </h3>
                <span className="bg-[#00e65c]/10 text-[#00e65c] border border-[#00e65c]/30 font-mono text-[10px] font-bold px-2 py-0.5 uppercase">
                  {order.orderStatus}
                </span>
              </div>

              {/* ITEM LIST */}
              <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex gap-4 items-center bg-neutral-900/60 p-3 border border-neutral-800">
                    <img
                      src={item.productImage}
                      alt={item.productName}
                      className="w-14 h-16 object-cover bg-black border border-neutral-800 shrink-0"
                    />
                    <div className="flex-1 min-w-0 font-mono text-xs">
                      <h4 className="font-syne font-bold text-white uppercase truncate">
                        {item.productName}
                      </h4>
                      <p className="text-neutral-400 text-[10px] mt-0.5">
                        SIZE: {item.size} • COLOR: {item.color}
                      </p>
                      <p className="text-neutral-500 text-[10px] mt-0.5">
                        QTY: {item.quantity} × {formatPrice(item.price)}
                      </p>
                    </div>
                    <div className="font-mono font-bold text-white text-xs text-right">
                      {formatPrice(item.price * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>

              {/* FINANCIAL BREAKDOWN */}
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
                  <span className="font-syne text-sm uppercase">TOTAL (COD DUE)</span>
                  <span className="font-syne text-xl text-[#00e65c]">{formatPrice(order.total)}</span>
                </div>
              </div>
            </div>

            {/* RIGHT: DELIVERY & PAYMENT INFO */}
            <div className="md:col-span-5 space-y-6">
              <div className="bg-[#0a0a0a] border border-neutral-800 p-6 space-y-4">
                <h3 className="font-syne font-extrabold text-sm uppercase tracking-wider text-white border-b border-neutral-800 pb-3 flex items-center gap-2">
                  <Truck size={16} className="text-[#00e65c]" />
                  <span>DELIVERY DETAILS</span>
                </h3>

                <div className="space-y-3 font-mono text-xs text-neutral-300">
                  <div className="flex items-start gap-2.5">
                    <UserIcon size={14} className="text-[#00e65c] shrink-0 mt-0.5" />
                    <div>
                      <span className="text-neutral-500 text-[10px] block">RECIPIENT</span>
                      <span className="font-bold text-white">{order.customerName}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <Phone size={14} className="text-[#00e65c] shrink-0 mt-0.5" />
                    <div>
                      <span className="text-neutral-500 text-[10px] block">CONTACT PHONE</span>
                      <span>{order.phone}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <Mail size={14} className="text-[#00e65c] shrink-0 mt-0.5" />
                    <div>
                      <span className="text-neutral-500 text-[10px] block">CONFIRMATION EMAIL</span>
                      <span>{order.email}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <MapPin size={14} className="text-[#00e65c] shrink-0 mt-0.5" />
                    <div>
                      <span className="text-neutral-500 text-[10px] block">SHIPPING ADDRESS</span>
                      <span>
                        {order.shippingAddress.completeAddress}, {order.shippingAddress.area}, {order.shippingAddress.city}, {order.shippingAddress.province}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* PAYMENT & STATUS CARDS */}
              <div className="bg-[#0a0a0a] border border-neutral-800 p-6 space-y-3 font-mono text-xs">
                <h4 className="font-syne font-bold text-xs uppercase text-white">
                  PAYMENT & ESTIMATED DELIVERY
                </h4>
                <div className="bg-neutral-900 p-3 border border-neutral-800 space-y-1.5">
                  <div className="flex justify-between text-neutral-400">
                    <span>Payment Method:</span>
                    <span className="text-white font-bold">{order.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between text-neutral-400">
                    <span>Payment Status:</span>
                    <span className="text-[#00e65c] font-bold">{order.paymentStatus}</span>
                  </div>
                  <div className="flex justify-between text-neutral-400 pt-1 border-t border-neutral-800">
                    <span>Est. Delivery:</span>
                    <span className="text-white">2 - 4 Business Days</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {/* ACTION BUTTONS */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <button
            onClick={() => navigateTo('home')}
            className="w-full sm:w-auto bg-[#00e65c] text-black font-syne font-extrabold px-8 py-4 text-xs uppercase tracking-wider hover:bg-[#00ff66] transition-all flex items-center justify-center gap-2"
          >
            <ShoppingBag size={16} />
            <span>CONTINUE SHOPPING</span>
          </button>

          {user && (
            <button
              onClick={navigateToAccountOrders}
              className="w-full sm:w-auto bg-neutral-900 border border-neutral-800 text-white hover:border-[#00e65c] font-syne font-extrabold px-8 py-4 text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2"
            >
              <Package size={16} />
              <span>VIEW MY ORDERS</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
