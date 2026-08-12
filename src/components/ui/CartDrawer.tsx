import React, { useState } from 'react';
import { X, Trash2, ShoppingBag, ArrowRight, ShieldCheck, Tag, Plus, Minus } from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { formatPrice } from '../../types';

export const CartDrawer: React.FC = () => {
  const {
    cart,
    removeFromCart,
    updateQuantity,
    cartTotal,
    cartCount,
    isCartOpen,
    setIsCartOpen,
    navigateTo,
    navigateToCheckout,
    showToast,
  } = useShop();

  const [promoCode, setPromoCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0);

  if (!isCartOpen) return null;

  const freeShippingThreshold = 3500;
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - cartTotal);
  const freeShippingPercent = Math.min(100, (cartTotal / freeShippingThreshold) * 100);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (promoCode.trim().toUpperCase() === 'PREMIUM15') {
      setAppliedDiscount(0.15);
      showToast('15% Promo Code "PREMIUM15" Applied!');
    } else {
      showToast('Invalid promo code. Try "PREMIUM15"');
    }
  };

  const finalTotal = cartTotal * (1 - appliedDiscount);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10" role="dialog" aria-modal="true" aria-label="Shopping Cart Drawer">
        <div className="w-screen max-w-md bg-[#0a0a0a] border-l border-neutral-800 text-white flex flex-col justify-between shadow-2xl">
          {/* CART HEADER */}
          <div className="p-6 border-b border-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag size={20} className="text-[#00e65c]" />
              <h2 className="font-syne font-extrabold text-lg uppercase tracking-wider">
                YOUR BAG ({cartCount})
              </h2>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1.5 text-neutral-400 hover:text-white transition-colors"
              aria-label="Close cart drawer"
            >
              <X size={20} />
            </button>
          </div>

          {/* FREE SHIPPING PROGRESS BAR */}
          <div className="bg-neutral-900 px-6 py-3 border-b border-neutral-800">
            <div className="flex justify-between items-center text-xs font-mono text-neutral-300 mb-1.5">
              <span>
                {remainingForFreeShipping > 0
                  ? `Add ${formatPrice(remainingForFreeShipping)} more for FREE EXPRESS SHIPPING`
                  : '🎉 YOU UNLOCKED FREE EXPRESS SHIPPING!'}
              </span>
            </div>
            <div className="w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-[#00e65c] h-full transition-all duration-500"
                style={{ width: `${freeShippingPercent}%` }}
              />
            </div>
          </div>

          {/* ITEM LIST AREA */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 divide-y divide-neutral-900">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <ShoppingBag size={48} className="text-neutral-700 mb-4 stroke-1" />
                <p className="font-syne font-bold text-base text-neutral-300 mb-2">
                  YOUR BAG IS EMPTY
                </p>
                <p className="text-xs text-neutral-500 mb-6 max-w-xs font-mono">
                  Explore our latest streetwear drops, oversized tees, caps and denim.
                </p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="bg-[#00e65c] text-black font-syne font-extrabold px-6 py-3 text-xs uppercase tracking-wider hover:bg-[#00ff66] transition-colors"
                >
                  START SHOPPING
                </button>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.id} className="pt-4 first:pt-0 flex gap-4 items-center">
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-20 h-24 object-cover bg-neutral-900 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <h4 className="font-syne font-bold text-xs uppercase text-white line-clamp-1">
                        {item.product.name}
                      </h4>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-neutral-500 hover:text-rose-500 transition-colors p-1"
                        aria-label="Remove item"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    <p className="text-[11px] font-mono text-neutral-400 mt-0.5">
                      SIZE: <span className="text-white">{item.selectedSize}</span> | COLOR:{' '}
                      <span className="text-white">{item.selectedColor}</span>
                    </p>

                    <div className="flex items-center justify-between mt-3">
                      {/* Quantity control */}
                      <div className="flex items-center border border-neutral-800 bg-neutral-900 text-xs">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="px-2 py-1 text-neutral-400 hover:text-white"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="px-2 py-1 font-mono text-white font-bold">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="px-2 py-1 text-neutral-400 hover:text-white"
                        >
                          <Plus size={12} />
                        </button>
                      </div>

                      <span className="font-syne font-bold text-sm text-[#00e65c]">
                        {formatPrice(item.product.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* CART FOOTER */}
          {cart.length > 0 && (
            <div className="p-6 border-t border-neutral-800 bg-[#070707] space-y-4">
              {/* PROMO CODE INPUT */}
              <form onSubmit={handleApplyPromo} className="flex gap-2">
                <div className="relative flex-1">
                  <Tag size={14} className="absolute left-3 top-3 text-neutral-500" />
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="PROMO CODE (Try: PREMIUM15)"
                    className="w-full bg-neutral-900 border border-neutral-800 text-white text-xs font-mono pl-9 pr-3 py-2 focus:outline-none focus:border-[#00e65c]"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-neutral-800 text-white hover:bg-neutral-700 font-syne font-bold text-xs px-4 uppercase transition-colors"
                >
                  APPLY
                </button>
              </form>

              {/* TOTAL BREAKDOWN */}
              <div className="space-y-1.5 text-xs font-mono text-neutral-400">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-white">{formatPrice(cartTotal)}</span>
                </div>
                {appliedDiscount > 0 && (
                  <div className="flex justify-between text-[#00e65c]">
                    <span>Promo Discount (15%)</span>
                    <span>-{formatPrice(cartTotal * appliedDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Estimated Shipping</span>
                  <span className="text-[#00e65c]">
                    {remainingForFreeShipping === 0 ? 'FREE' : 'Rs. 250'}
                  </span>
                </div>
                <div className="flex justify-between text-base font-syne font-extrabold text-white pt-2 border-t border-neutral-800">
                  <span>TOTAL</span>
                  <span className="text-[#00e65c]">{formatPrice(finalTotal)}</span>
                </div>
              </div>

              {/* CHECKOUT & VIEW CART TRIGGERS */}
              <div className="space-y-2">
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    navigateToCheckout();
                  }}
                  className="w-full bg-[#00e65c] text-black hover:bg-[#00ff66] font-syne font-extrabold py-3.5 text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-xl"
                >
                  <span>PROCEED TO CHECKOUT (COD)</span>
                  <ArrowRight size={16} />
                </button>
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    navigateTo('cart');
                  }}
                  className="w-full bg-neutral-900 border border-neutral-800 text-white hover:border-[#00e65c] font-syne font-bold py-2.5 text-[11px] uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
                >
                  <span>VIEW FULL SHOPPING CART PAGE</span>
                </button>
              </div>

              <div className="flex items-center justify-center gap-2 text-[10px] text-neutral-500 font-mono">
                <ShieldCheck size={12} className="text-[#00e65c]" />
                <span>SECURE 256-BIT ENCRYPTED CHECKOUT</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
