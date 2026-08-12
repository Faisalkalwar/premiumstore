import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShieldCheck,
  Tag,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  ArrowLeft,
  Truck,
  RotateCcw,
  Sparkles,
  Info
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { ProductCard } from '../ui/ProductCard';
import { getProductById } from '../../services/firebaseService';
import { Product, formatPrice } from '../../types';

interface VerificationNotice {
  cartItemId: string;
  type: 'out_of_stock' | 'exceeds_stock' | 'price_changed' | 'deleted';
  message: string;
  actualPrice?: number;
  actualStock?: number;
}

export const CartView: React.FC = () => {
  const {
    cart,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartTotal,
    cartCount,
    navigateTo,
    navigateToProduct,
    navigateToCheckout,
    showToast,
    products,
    user,
  } = useShop();

  const [promoCode, setPromoCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [appliedPromoName, setAppliedPromoName] = useState<string | null>(null);
  const [shippingMethod, setShippingMethod] = useState<'standard' | 'express'>('standard');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationNotices, setVerificationNotices] = useState<VerificationNotice[]>([]);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Free shipping threshold logic (Rs. 3,500)
  const FREE_SHIPPING_THRESHOLD = 3500;
  const remainingForFree = Math.max(0, FREE_SHIPPING_THRESHOLD - cartTotal);
  const freeShippingProgress = Math.min(100, (cartTotal / FREE_SHIPPING_THRESHOLD) * 100);

  // Shipping cost
  const calculatedShippingCost =
    cartTotal >= FREE_SHIPPING_THRESHOLD
      ? 0
      : shippingMethod === 'express'
      ? 500
      : 250;

  // Discount calculation
  const discountAmount = cartTotal * discountPercent;
  const grandTotal = Math.max(0, cartTotal - discountAmount + calculatedShippingCost);

  // Apply promo handler
  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    const code = promoCode.trim().toUpperCase();
    if (!code) return;

    if (code === 'PREMIUM15') {
      setDiscountPercent(0.15);
      setAppliedPromoName('PREMIUM15 (15% OFF)');
      showToast('🎉 Promo code PREMIUM15 applied!');
    } else if (code === 'WELCOME10') {
      setDiscountPercent(0.10);
      setAppliedPromoName('WELCOME10 (10% OFF)');
      showToast('🎉 Promo code WELCOME10 applied!');
    } else if (code === 'VIP20') {
      setDiscountPercent(0.20);
      setAppliedPromoName('VIP20 (20% OFF)');
      showToast('🎉 VIP Promo code VIP20 applied!');
    } else {
      showToast('Invalid promo code. Try "PREMIUM15", "WELCOME10", or "VIP20"');
    }
  };

  const removePromo = () => {
    setDiscountPercent(0);
    setAppliedPromoName(null);
    setPromoCode('');
    showToast('Promo code removed.');
  };

  // Perform Live Firestore Verification of Prices & Stock
  const verifyCartWithFirestore = async () => {
    if (cart.length === 0) return;
    setIsVerifying(true);
    const notices: VerificationNotice[] = [];

    try {
      for (const item of cart) {
        // Fetch fresh product doc from Firestore
        const liveDoc = await getProductById(item.product.id);

        if (!liveDoc || liveDoc.status !== 'active') {
          notices.push({
            cartItemId: item.id,
            type: 'deleted',
            message: `"${item.product.name}" is no longer available in our store archive.`,
          });
          continue;
        }

        // Stock check
        const availableStock = liveDoc.stock ?? 0;
        if (availableStock <= 0) {
          notices.push({
            cartItemId: item.id,
            type: 'out_of_stock',
            message: `"${item.product.name}" is currently OUT OF STOCK.`,
            actualStock: 0,
          });
        } else if (item.quantity > availableStock) {
          notices.push({
            cartItemId: item.id,
            type: 'exceeds_stock',
            message: `Requested quantity (${item.quantity}) exceeds available stock (${availableStock}).`,
            actualStock: availableStock,
          });
        }

        // Live price check
        const livePrice = liveDoc.salePrice && liveDoc.salePrice < liveDoc.price ? liveDoc.salePrice : liveDoc.price;
        if (Math.abs(livePrice - item.product.price) > 0.01) {
          notices.push({
            cartItemId: item.id,
            type: 'price_changed',
            message: `Price updated for "${item.product.name}": was ${formatPrice(item.product.price)}, live price is ${formatPrice(livePrice)}.`,
            actualPrice: livePrice,
          });
        }
      }

      setVerificationNotices(notices);
      if (notices.length === 0) {
        showToast('✓ All items, live prices & stock quantities verified with Firestore!');
      } else {
        showToast('⚠️ Cart verified with stock warnings. Review notices above.');
      }
    } catch (err) {
      console.error('Error verifying cart:', err);
    } finally {
      setIsVerifying(false);
    }
  };

  // Auto verify on mount
  useEffect(() => {
    if (cart.length > 0) {
      verifyCartWithFirestore();
    }
  }, []);

  // Recommended products (excluding ones already in cart)
  const cartProductIds = new Set(cart.map((c) => c.product.id));
  const recommendedProducts = products
    .filter((p) => !cartProductIds.has(p.id))
    .slice(0, 4);

  return (
    <div className="min-h-screen bg-black text-white pt-6 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* BREADCRUMB & HEADER */}
        <div className="mb-8 border-b border-neutral-900 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <button
              onClick={() => navigateTo('home')}
              className="inline-flex items-center gap-2 text-xs font-mono text-neutral-400 hover:text-[#00e65c] transition-colors mb-3"
            >
              <ArrowLeft size={14} />
              <span>CONTINUE SHOPPING</span>
            </button>
            <div className="flex items-center gap-3">
              <h1 className="font-syne font-extrabold text-3xl sm:text-4xl uppercase tracking-wider text-white">
                SHOPPING CART
              </h1>
              <span className="bg-[#00e65c] text-black font-mono font-extrabold text-xs px-2.5 py-1">
                {cartCount} {cartCount === 1 ? 'ITEM' : 'ITEMS'}
              </span>
            </div>
          </div>

          {/* CLOUD VS LOCAL SYNC BADGE */}
          <div className="flex items-center gap-2 bg-neutral-900 border border-neutral-800 px-3.5 py-2 text-xs font-mono">
            <span className={`w-2 h-2 rounded-full ${user ? 'bg-[#00e65c] animate-pulse' : 'bg-amber-400'}`} />
            <span className="text-neutral-300">
              {user ? `Cloud Synchronized (${user.email || 'Member'})` : 'Local Session Cart (Guest)'}
            </span>
          </div>
        </div>

        {/* FREE SHIPPING PROGRESS BANNER */}
        <div className="mb-8 bg-neutral-900/80 border border-neutral-800 p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono mb-2">
            <div className="flex items-center gap-2 text-white">
              <Truck size={16} className="text-[#00e65c]" />
              <span className="font-bold">
                {remainingForFree > 0
                  ? `ADD ${formatPrice(remainingForFree)} MORE TO UNLOCK FREE EXPRESS SHIPPING`
                  : '🎉 YOU HAVE UNLOCKED FREE EXPRESS SHIPPING!'}
              </span>
            </div>
            <span className="text-neutral-400 font-bold">{freeShippingProgress.toFixed(0)}% QUALIFIED</span>
          </div>
          <div className="w-full bg-neutral-800 h-2 overflow-hidden">
            <div
              className="bg-[#00e65c] h-full transition-all duration-500"
              style={{ width: `${freeShippingProgress}%` }}
            />
          </div>
        </div>

        {/* FIRESTORE STOCK & PRICE VERIFICATION WARNING BANNER */}
        {verificationNotices.length > 0 && (
          <div className="mb-8 bg-amber-950/40 border border-amber-500/50 p-4 text-amber-200 text-xs font-mono space-y-2">
            <div className="flex items-center gap-2 font-bold text-amber-400 uppercase tracking-wider text-sm">
              <AlertTriangle size={18} />
              <span>LIVE STOCK & PRICING ATTENTION REQUIRED</span>
            </div>
            <ul className="list-disc pl-5 space-y-1">
              {verificationNotices.map((notice, idx) => (
                <li key={idx} className="leading-relaxed">
                  {notice.message}
                </li>
              ))}
            </ul>
            <p className="text-[11px] text-amber-300/80 pt-1 border-t border-amber-800/50">
              Prices and stock are synchronized directly with Firestore. Please adjust quantities before checkout.
            </p>
          </div>
        )}

        {cart.length === 0 ? (
          /* EMPTY CART STATE */
          <div className="bg-[#0a0a0a] border border-neutral-800 py-16 px-6 text-center max-w-2xl mx-auto my-12">
            <div className="w-20 h-20 bg-neutral-900 border border-neutral-800 rounded-full flex items-center justify-center mx-auto mb-6 text-neutral-600">
              <ShoppingBag size={36} className="stroke-1" />
            </div>
            <h2 className="font-syne font-extrabold text-2xl uppercase tracking-wider text-white mb-3">
              YOUR CART IS CURRENTLY EMPTY
            </h2>
            <p className="text-neutral-400 text-xs font-mono mb-8 max-w-md mx-auto leading-relaxed">
              Explore our latest heavyweight boxy tees, vintage washed denim, tactical caps, and archive streetwear drops.
            </p>
            <button
              onClick={() => navigateTo('home')}
              className="bg-[#00e65c] text-black font-syne font-extrabold px-8 py-4 text-xs uppercase tracking-wider hover:bg-[#00ff66] transition-all shadow-xl inline-flex items-center gap-2"
            >
              <span>EXPLORE ALL DROPS</span>
              <ArrowRight size={16} />
            </button>
          </div>
        ) : (
          /* CART GRID WITH ITEMS AND ORDER SUMMARY */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* LEFT COLUMN: ITEMS LIST */}
            <div className="lg:col-span-8 space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-800 text-xs font-mono text-neutral-400 uppercase">
                <span>PRODUCT DETAILS</span>
                <div className="flex gap-4">
                  <button
                    onClick={verifyCartWithFirestore}
                    disabled={isVerifying}
                    className="hover:text-[#00e65c] transition-colors flex items-center gap-1.5"
                    title="Re-check live prices & stock"
                  >
                    <RefreshCw size={12} className={isVerifying ? 'animate-spin' : ''} />
                    <span>{isVerifying ? 'VERIFYING...' : 'VERIFY LIVE STOCK'}</span>
                  </button>
                  <span>|</span>
                  <button
                    onClick={() => setShowClearConfirm(true)}
                    className="hover:text-rose-400 transition-colors flex items-center gap-1"
                  >
                    <Trash2 size={12} />
                    <span>CLEAR CART</span>
                  </button>
                </div>
              </div>

              {/* CLEAR CONFIRMATION MODAL */}
              {showClearConfirm && (
                <div className="bg-rose-950/30 border border-rose-800/80 p-4 text-xs font-mono flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2 text-rose-300">
                    <AlertTriangle size={16} />
                    <span>Are you sure you want to remove all items from your cart?</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        clearCart();
                        setShowClearConfirm(false);
                        showToast('Cart cleared.');
                      }}
                      className="bg-rose-600 hover:bg-rose-700 text-white px-3 py-1 font-bold uppercase transition-colors"
                    >
                      YES, CLEAR
                    </button>
                    <button
                      onClick={() => setShowClearConfirm(false)}
                      className="bg-neutral-800 hover:bg-neutral-700 text-neutral-300 px-3 py-1 font-bold uppercase transition-colors"
                    >
                      CANCEL
                    </button>
                  </div>
                </div>
              )}

              {/* ITEM CARDS */}
              <div className="space-y-4">
                {cart.map((item) => {
                  const itemNotice = verificationNotices.find((n) => n.cartItemId === item.id);
                  const maxStock = item.product.stock ?? 25;

                  return (
                    <div
                      key={item.id}
                      className={`bg-[#0d0d0d] border ${
                        itemNotice
                          ? 'border-amber-500/60'
                          : 'border-neutral-800 hover:border-neutral-700'
                      } p-4 sm:p-5 flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between transition-all`}
                    >
                      {/* THUMBNAIL & INFO */}
                      <div className="flex gap-4 items-center flex-1 min-w-0">
                        <div
                          className="w-20 h-24 sm:w-24 sm:h-28 bg-neutral-900 shrink-0 border border-neutral-800 overflow-hidden cursor-pointer"
                          onClick={() => navigateToProduct(item.product.slug || item.product.id)}
                        >
                          <img
                            src={item.product.image}
                            alt={item.product.name}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          />
                        </div>

                        <div className="flex-1 min-w-0 space-y-1.5">
                          <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest">
                            SKU: {item.product.sku || 'PS-GRAIL'}
                          </span>
                          <h3
                            onClick={() => navigateToProduct(item.product.slug || item.product.id)}
                            className="font-syne font-bold text-sm sm:text-base uppercase text-white hover:text-[#00e65c] transition-colors cursor-pointer line-clamp-1"
                          >
                            {item.product.name}
                          </h3>

                          {/* VARIANTS DISPLAY */}
                          <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-neutral-400">
                            <span className="bg-neutral-900 px-2 py-0.5 border border-neutral-800">
                              SIZE: <strong className="text-white">{item.selectedSize}</strong>
                            </span>
                            <span className="bg-neutral-900 px-2 py-0.5 border border-neutral-800">
                              COLOR: <strong className="text-white">{item.selectedColor}</strong>
                            </span>
                          </div>

                          {/* STOCK WARNING IF APPLICABLE */}
                          {itemNotice && (
                            <p className="text-xs text-amber-400 font-mono flex items-center gap-1 pt-1">
                              <AlertTriangle size={12} />
                              <span>{itemNotice.message}</span>
                            </p>
                          )}
                        </div>
                      </div>

                      {/* QUANTITY & PRICE CONTROLS */}
                      <div className="flex items-center justify-between w-full sm:w-auto gap-6 sm:gap-8 pt-3 sm:pt-0 border-t sm:border-t-0 border-neutral-900">
                        {/* QUANTITY SELECTOR */}
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-[10px] font-mono text-neutral-500 uppercase">QTY</span>
                          <div className="flex items-center border border-neutral-800 bg-neutral-900 text-xs">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="p-1.5 text-neutral-400 hover:text-white transition-colors"
                              aria-label="Decrease quantity"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="px-3 py-1 font-mono text-white font-bold text-sm">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => {
                                if (item.quantity >= maxStock) {
                                  showToast(`Maximum available stock is ${maxStock}`);
                                  return;
                                }
                                updateQuantity(item.id, item.quantity + 1);
                              }}
                              className="p-1.5 text-neutral-400 hover:text-white transition-colors"
                              aria-label="Increase quantity"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                        </div>

                        {/* LINE PRICE */}
                        <div className="text-right">
                          <span className="text-[10px] font-mono text-neutral-500 uppercase block">SUBTOTAL</span>
                          <span className="font-syne font-extrabold text-base sm:text-lg text-[#00e65c]">
                            {formatPrice(item.product.price * item.quantity)}
                          </span>
                          <span className="block text-[10px] font-mono text-neutral-500">
                            {formatPrice(item.product.price)} each
                          </span>
                        </div>

                        {/* REMOVE BUTTON */}
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="p-2 text-neutral-500 hover:text-rose-500 transition-colors"
                          title="Remove item"
                          aria-label="Remove item"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* SHIPPING & RETURN VALUE PROPS */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-neutral-900">
                <div className="bg-neutral-950 p-4 border border-neutral-900 flex items-center gap-3">
                  <Truck size={20} className="text-[#00e65c] shrink-0" />
                  <div>
                    <h4 className="font-syne font-bold text-xs uppercase text-white">WORLDWIDE EXPRESS</h4>
                    <p className="text-[11px] font-mono text-neutral-500">Fast 2-4 day dispatch via DHL</p>
                  </div>
                </div>
                <div className="bg-neutral-950 p-4 border border-neutral-900 flex items-center gap-3">
                  <RotateCcw size={20} className="text-[#00e65c] shrink-0" />
                  <div>
                    <h4 className="font-syne font-bold text-xs uppercase text-white">30-DAY RETURNS</h4>
                    <p className="text-[11px] font-mono text-neutral-500">Effortless exchanges & refunds</p>
                  </div>
                </div>
                <div className="bg-neutral-950 p-4 border border-neutral-900 flex items-center gap-3">
                  <ShieldCheck size={20} className="text-[#00e65c] shrink-0" />
                  <div>
                    <h4 className="font-syne font-bold text-xs uppercase text-white">VERIFIED AUTHENTIC</h4>
                    <p className="text-[11px] font-mono text-neutral-500">100% genuine craftsmanship</p>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: ORDER SUMMARY */}
            <div className="lg:col-span-4 bg-[#0a0a0a] border border-neutral-800 p-6 space-y-6 sticky top-24">
              <h2 className="font-syne font-extrabold text-lg uppercase tracking-wider text-white border-b border-neutral-800 pb-4">
                ORDER SUMMARY
              </h2>

              {/* PROMO CODE FORM */}
              <div>
                <label className="block text-xs font-mono text-neutral-400 mb-2 uppercase">
                  HAVE A PROMO CODE?
                </label>
                {appliedPromoName ? (
                  <div className="bg-neutral-900 border border-[#00e65c] p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-mono text-[#00e65c]">
                      <Tag size={14} />
                      <span className="font-bold">{appliedPromoName}</span>
                    </div>
                    <button
                      onClick={removePromo}
                      className="text-xs text-neutral-400 hover:text-rose-400 font-mono transition-colors"
                    >
                      REMOVE
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyPromo} className="flex gap-2">
                    <input
                      type="text"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      placeholder="e.g. PREMIUM15"
                      className="flex-1 bg-neutral-900 border border-neutral-800 text-white font-mono text-xs px-3 py-2.5 focus:outline-none focus:border-[#00e65c] uppercase"
                    />
                    <button
                      type="submit"
                      className="bg-neutral-800 hover:bg-neutral-700 text-white font-syne font-bold text-xs px-4 uppercase transition-colors"
                    >
                      APPLY
                    </button>
                  </form>
                )}
                <p className="text-[10px] font-mono text-neutral-500 mt-1.5">
                  Try promo code <span className="text-[#00e65c] font-bold cursor-pointer" onClick={() => setPromoCode('PREMIUM15')}>PREMIUM15</span> for 15% off!
                </p>
              </div>

              {/* SHIPPING METHOD SELECTOR */}
              <div className="space-y-2 border-t border-b border-neutral-800 py-4">
                <label className="block text-xs font-mono text-neutral-400 uppercase">
                  SHIPPING METHOD
                </label>
                <div className="space-y-2">
                  <label
                    onClick={() => setShippingMethod('standard')}
                    className={`flex items-center justify-between p-3 border cursor-pointer transition-all ${
                      shippingMethod === 'standard'
                        ? 'border-[#00e65c] bg-neutral-900/60 text-white'
                        : 'border-neutral-800 text-neutral-400 hover:border-neutral-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="radio"
                        name="shipping"
                        checked={shippingMethod === 'standard'}
                        onChange={() => setShippingMethod('standard')}
                        className="accent-[#00e65c]"
                      />
                      <div>
                        <span className="font-syne font-bold text-xs uppercase block">STANDARD EXPRESS</span>
                        <span className="text-[10px] font-mono text-neutral-500">3-5 Business Days</span>
                      </div>
                    </div>
                    <span className="font-mono text-xs font-bold text-[#00e65c]">
                      {cartTotal >= FREE_SHIPPING_THRESHOLD ? 'FREE' : 'Rs. 250'}
                    </span>
                  </label>

                  <label
                    onClick={() => setShippingMethod('express')}
                    className={`flex items-center justify-between p-3 border cursor-pointer transition-all ${
                      shippingMethod === 'express'
                        ? 'border-[#00e65c] bg-neutral-900/60 text-white'
                        : 'border-neutral-800 text-neutral-400 hover:border-neutral-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="radio"
                        name="shipping"
                        checked={shippingMethod === 'express'}
                        onChange={() => setShippingMethod('express')}
                        className="accent-[#00e65c]"
                      />
                      <div>
                        <span className="font-syne font-bold text-xs uppercase block">OVERNIGHT EXPRESS AIR</span>
                        <span className="text-[10px] font-mono text-neutral-500">1-2 Business Days</span>
                      </div>
                    </div>
                    <span className="font-mono text-xs font-bold text-[#00e65c]">
                      {cartTotal >= FREE_SHIPPING_THRESHOLD ? 'FREE' : 'Rs. 500'}
                    </span>
                  </label>
                </div>
              </div>

              {/* CALCULATION SUMMARY TABLE */}
              <div className="space-y-2.5 text-xs font-mono text-neutral-400">
                <div className="flex justify-between">
                  <span>Subtotal ({cartCount} items)</span>
                  <span className="text-white">{formatPrice(cartTotal)}</span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-[#00e65c]">
                    <span>Discount ({discountPercent * 100}%)</span>
                    <span>-{formatPrice(discountAmount)}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Estimated Shipping</span>
                  <span className="text-[#00e65c]">
                    {calculatedShippingCost === 0 ? 'FREE' : formatPrice(calculatedShippingCost)}
                  </span>
                </div>

                <div className="pt-3 border-t border-neutral-800 flex justify-between items-baseline">
                  <span className="font-syne font-extrabold text-sm text-white">GRAND TOTAL</span>
                  <div className="text-right">
                    <span className="font-syne font-extrabold text-2xl text-[#00e65c]">
                      {formatPrice(grandTotal)}
                    </span>
                    <span className="block text-[10px] text-neutral-500 font-mono">Taxes included</span>
                  </div>
                </div>
              </div>

              {/* CHECKOUT BUTTON */}
              <button
                onClick={() => {
                  navigateToCheckout();
                }}
                className="w-full bg-[#00e65c] text-black hover:bg-[#00ff66] font-syne font-extrabold py-4 text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-xl"
              >
                <span>PROCEED TO CHECKOUT</span>
                <ArrowRight size={16} />
              </button>

              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-center gap-2 text-[11px] font-mono text-neutral-500">
                  <ShieldCheck size={14} className="text-[#00e65c]" />
                  <span>256-BIT SSL ENCRYPTED PAYMENT</span>
                </div>
                <div className="flex justify-center gap-2 text-[10px] font-mono text-neutral-600">
                  <span>VISA</span> • <span>MASTERCARD</span> • <span>AMEX</span> • <span>APPLE PAY</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* RECOMMENDED PRODUCTS SECTION */}
        {recommendedProducts.length > 0 && (
          <div className="mt-20 pt-12 border-t border-neutral-900">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <span className="text-xs font-mono text-[#00e65c] uppercase tracking-widest block mb-1">
                  COMPLETE YOUR FIT
                </span>
                <h2 className="font-syne font-extrabold text-2xl uppercase tracking-wider text-white">
                  YOU MAY ALSO LIKE
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {recommendedProducts.map((prod) => (
                <ProductCard key={prod.id} product={prod} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
