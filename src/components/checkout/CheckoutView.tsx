import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Truck,
  Tag,
  ArrowRight,
  ArrowLeft,
  Banknote,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  ShoppingBag,
  MapPin,
  User as UserIcon,
  Phone,
  Mail,
  Building,
  Home
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { createValidatedOrder, CreateOrderParams } from '../../services/firebaseService';
import { OrderShippingAddress, formatPrice } from '../../types';

export const CheckoutView: React.FC = () => {
  const {
    cart,
    cartTotal,
    cartCount,
    clearCart,
    user,
    userProfile,
    navigateTo,
    navigateToOrderSuccess,
    showToast,
  } = useShop();

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [province, setProvince] = useState('');
  const [city, setCity] = useState('');
  const [area, setArea] = useState('');
  const [completeAddress, setCompleteAddress] = useState('');

  // Shipping & Promo Code
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [shippingOption, setShippingOption] = useState<'standard' | 'express'>('standard');

  // Order Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Auto-fill form from user profile or auth
  useEffect(() => {
    if (userProfile) {
      if (userProfile.name) setFullName(userProfile.name);
      if (userProfile.email) setEmail(userProfile.email);
      if (userProfile.phone) setPhone(userProfile.phone);

      const defaultAddr = userProfile.addresses?.find((a) => a.isDefault) || userProfile.addresses?.[0];
      if (defaultAddr) {
        if (defaultAddr.street) setCompleteAddress(defaultAddr.street);
        if (defaultAddr.city) setCity(defaultAddr.city);
        if (defaultAddr.state) setProvince(defaultAddr.state);
        if (defaultAddr.name && !fullName) setFullName(defaultAddr.name);
        if (defaultAddr.phone && !phone) setPhone(defaultAddr.phone);
      }
    } else if (user) {
      if (user.displayName) setFullName(user.displayName);
      if (user.email) setEmail(user.email);
    }
  }, [userProfile, user]);

  // Redirect if cart is empty
  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-black text-white pt-12 pb-20 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="bg-[#0a0a0a] border border-neutral-800 p-8 sm:p-12 text-center max-w-lg mx-auto">
          <div className="w-16 h-16 bg-neutral-900 border border-neutral-800 rounded-full flex items-center justify-center mx-auto mb-4 text-neutral-500">
            <ShoppingBag size={28} />
          </div>
          <h2 className="font-syne font-extrabold text-2xl uppercase tracking-wider text-white mb-2">
            YOUR CART IS EMPTY
          </h2>
          <p className="text-neutral-400 text-xs font-mono mb-6">
            Please add streetwear pieces to your cart before proceeding to checkout.
          </p>
          <button
            onClick={() => navigateTo('home')}
            className="bg-[#00e65c] text-black font-syne font-extrabold px-6 py-3.5 text-xs uppercase tracking-wider hover:bg-[#00ff66] transition-all inline-flex items-center gap-2"
          >
            <ArrowLeft size={14} />
            <span>RETURN TO STORE</span>
          </button>
        </div>
      </div>
    );
  }

  // Calculated Order Financials
  const discountAmount = cartTotal * discountPercent;
  const shippingFee =
    cartTotal >= 3500 ? 0 : shippingOption === 'express' ? 500 : 250;
  const grandTotal = Math.max(0, cartTotal - discountAmount + shippingFee);

  // Apply promo handler
  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    const code = promoCode.trim().toUpperCase();
    if (!code) return;

    if (code === 'PREMIUM15') {
      setDiscountPercent(0.15);
      setAppliedPromo('PREMIUM15 (15% OFF)');
      showToast('🎉 Promo code PREMIUM15 applied!');
    } else if (code === 'WELCOME10') {
      setDiscountPercent(0.10);
      setAppliedPromo('WELCOME10 (10% OFF)');
      showToast('🎉 Promo code WELCOME10 applied!');
    } else if (code === 'VIP20') {
      setDiscountPercent(0.20);
      setAppliedPromo('VIP20 (20% OFF)');
      showToast('🎉 VIP Promo code VIP20 applied!');
    } else {
      showToast('Invalid promo code. Try "PREMIUM15", "WELCOME10", or "VIP20"');
    }
  };

  const removePromo = () => {
    setDiscountPercent(0);
    setAppliedPromo(null);
    setPromoCode('');
  };

  // Submit Order Handler
  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Form Validations
    if (!fullName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!phone.trim() || phone.length < 7) {
      setErrorMessage('Please enter a valid phone number.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (!province.trim()) {
      setErrorMessage('Please enter your province / state.');
      return;
    }
    if (!city.trim()) {
      setErrorMessage('Please enter your city.');
      return;
    }
    if (!area.trim()) {
      setErrorMessage('Please enter your area / district.');
      return;
    }
    if (!completeAddress.trim() || completeAddress.length < 10) {
      setErrorMessage('Please provide a complete street address (house/building #, street name).');
      return;
    }

    setIsSubmitting(true);

    try {
      const shippingAddressData: OrderShippingAddress = {
        fullName: fullName.trim(),
        phone: phone.trim(),
        email: email.trim().toLowerCase(),
        province: province.trim(),
        city: city.trim(),
        area: area.trim(),
        completeAddress: completeAddress.trim(),
      };

      const orderParams: CreateOrderParams = {
        userId: user?.uid || null,
        customerName: fullName.trim(),
        phone: phone.trim(),
        email: email.trim().toLowerCase(),
        cartItems: cart,
        shippingAddress: shippingAddressData,
        promoCode: appliedPromo ? promoCode : undefined,
        shippingOption,
      };

      // Call validated order creation (validates stock & live Firestore price)
      const placedOrder = await createValidatedOrder(orderParams);

      // Success cleanup
      clearCart();
      showToast(`🎉 Order #${placedOrder.orderNumber} placed successfully!`);
      navigateToOrderSuccess(placedOrder.orderNumber);
    } catch (err: any) {
      console.error('Checkout error:', err);
      setErrorMessage(
        err.message || 'Failed to place order. Please review your cart items and try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white pt-6 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* HEADER & BREADCRUMB */}
        <div className="mb-8 border-b border-neutral-900 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <button
              onClick={() => navigateTo('cart')}
              className="inline-flex items-center gap-2 text-xs font-mono text-neutral-400 hover:text-[#00e65c] transition-colors mb-3"
            >
              <ArrowLeft size={14} />
              <span>RETURN TO SHOPPING CART</span>
            </button>
            <h1 className="font-syne font-extrabold text-3xl sm:text-4xl uppercase tracking-wider text-white">
              SECURE CHECKOUT
            </h1>
          </div>

          <div className="flex items-center gap-2 bg-neutral-900 border border-neutral-800 px-3.5 py-2 text-xs font-mono">
            <ShieldCheck size={16} className="text-[#00e65c]" />
            <span className="text-neutral-300">
              {user ? `Authenticated (${user.email})` : 'Guest Checkout'}
            </span>
          </div>
        </div>

        {/* ERROR NOTIFICATION BANNER */}
        {errorMessage && (
          <div className="mb-8 bg-rose-950/50 border border-rose-800 p-4 text-rose-200 text-xs font-mono flex items-start gap-3">
            <AlertCircle size={18} className="text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-bold text-rose-300 uppercase block mb-1">VALIDATION ERROR</span>
              <p>{errorMessage}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT COLUMN: CUSTOMER & SHIPPING FORM */}
          <div className="lg:col-span-7 space-y-8">
            {/* STEP 1: CUSTOMER CONTACT */}
            <div className="bg-[#0a0a0a] border border-neutral-800 p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 bg-[#00e65c] text-black font-mono font-bold text-xs flex items-center justify-center">
                    1
                  </span>
                  <h2 className="font-syne font-extrabold text-lg uppercase tracking-wider text-white">
                    CUSTOMER CONTACT
                  </h2>
                </div>
                {!user && (
                  <button
                    type="button"
                    onClick={() => navigateTo('login')}
                    className="text-xs font-mono text-[#00e65c] hover:underline"
                  >
                    HAVE AN ACCOUNT? LOG IN
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-mono text-neutral-400 mb-2 uppercase">
                    FULL NAME *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Alex Morgan"
                      className="w-full bg-neutral-900 border border-neutral-800 text-white font-mono text-xs px-3.5 py-3 pl-10 focus:outline-none focus:border-[#00e65c]"
                    />
                    <UserIcon size={16} className="absolute left-3 top-3.5 text-neutral-500" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-neutral-400 mb-2 uppercase">
                    PHONE NUMBER *
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+92 323 0000000"
                      className="w-full bg-neutral-900 border border-neutral-800 text-white font-mono text-xs px-3.5 py-3 pl-10 focus:outline-none focus:border-[#00e65c]"
                    />
                    <Phone size={16} className="absolute left-3 top-3.5 text-neutral-500" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-neutral-400 mb-2 uppercase">
                    EMAIL ADDRESS *
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="alex@example.com"
                      className="w-full bg-neutral-900 border border-neutral-800 text-white font-mono text-xs px-3.5 py-3 pl-10 focus:outline-none focus:border-[#00e65c]"
                    />
                    <Mail size={16} className="absolute left-3 top-3.5 text-neutral-500" />
                  </div>
                </div>
              </div>
            </div>

            {/* STEP 2: SHIPPING ADDRESS */}
            <div className="bg-[#0a0a0a] border border-neutral-800 p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 bg-[#00e65c] text-black font-mono font-bold text-xs flex items-center justify-center">
                    2
                  </span>
                  <h2 className="font-syne font-extrabold text-lg uppercase tracking-wider text-white">
                    DELIVERY ADDRESS
                  </h2>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-mono text-neutral-400 mb-2 uppercase">
                    PROVINCE / STATE *
                  </label>
                  <input
                    type="text"
                    required
                    value={province}
                    onChange={(e) => setProvince(e.target.value)}
                    placeholder="e.g. California"
                    className="w-full bg-neutral-900 border border-neutral-800 text-white font-mono text-xs px-3.5 py-3 focus:outline-none focus:border-[#00e65c]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-neutral-400 mb-2 uppercase">
                    CITY *
                  </label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Los Angeles"
                    className="w-full bg-neutral-900 border border-neutral-800 text-white font-mono text-xs px-3.5 py-3 focus:outline-none focus:border-[#00e65c]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-neutral-400 mb-2 uppercase">
                    AREA / DISTRICT *
                  </label>
                  <input
                    type="text"
                    required
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    placeholder="e.g. Downtown / Zone 4"
                    className="w-full bg-neutral-900 border border-neutral-800 text-white font-mono text-xs px-3.5 py-3 focus:outline-none focus:border-[#00e65c]"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-xs font-mono text-neutral-400 mb-2 uppercase">
                    COMPLETE STREET ADDRESS *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={completeAddress}
                      onChange={(e) => setCompleteAddress(e.target.value)}
                      placeholder="House/Apartment #, Street name, Landmark"
                      className="w-full bg-neutral-900 border border-neutral-800 text-white font-mono text-xs px-3.5 py-3 pl-10 focus:outline-none focus:border-[#00e65c]"
                    />
                    <Home size={16} className="absolute left-3 top-3.5 text-neutral-500" />
                  </div>
                </div>
              </div>
            </div>

            {/* STEP 3: PAYMENT METHOD */}
            <div className="bg-[#0a0a0a] border border-neutral-800 p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 bg-[#00e65c] text-black font-mono font-bold text-xs flex items-center justify-center">
                    3
                  </span>
                  <h2 className="font-syne font-extrabold text-lg uppercase tracking-wider text-white">
                    PAYMENT METHOD
                  </h2>
                </div>
              </div>

              {/* CASH ON DELIVERY CARD */}
              <div className="border-2 border-[#00e65c] bg-neutral-900/80 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      checked
                      readOnly
                      className="accent-[#00e65c] w-4 h-4"
                    />
                    <div className="flex items-center gap-2">
                      <Banknote size={20} className="text-[#00e65c]" />
                      <span className="font-syne font-extrabold text-sm uppercase text-white">
                        CASH ON DELIVERY (COD)
                      </span>
                    </div>
                  </div>
                  <span className="bg-[#00e65c]/10 text-[#00e65c] border border-[#00e65c]/40 font-mono font-bold text-[10px] px-2.5 py-1 uppercase">
                    RECOMMENDED
                  </span>
                </div>
                <p className="text-xs font-mono text-neutral-400 pl-7 leading-relaxed">
                  Pay with exact cash directly to the courier upon safe receipt of your package at your doorstep. No prepayment required.
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: ORDER SUMMARY & SUBMIT */}
          <div className="lg:col-span-5 bg-[#0a0a0a] border border-neutral-800 p-6 sm:p-8 space-y-6 sticky top-24">
            <h2 className="font-syne font-extrabold text-lg uppercase tracking-wider text-white border-b border-neutral-800 pb-4 flex justify-between items-center">
              <span>ORDER SUMMARY</span>
              <span className="text-xs font-mono font-bold text-[#00e65c]">
                {cartCount} {cartCount === 1 ? 'ITEM' : 'ITEMS'}
              </span>
            </h2>

            {/* ITEMIZED CART LIST */}
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-3 items-center bg-neutral-900 p-2.5 border border-neutral-800 text-xs"
                >
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-12 h-14 object-cover bg-black border border-neutral-800 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-syne font-bold text-white uppercase truncate">
                      {item.product.name}
                    </h4>
                    <p className="text-[10px] font-mono text-neutral-400">
                      {item.selectedSize} / {item.selectedColor} • QTY: {item.quantity}
                    </p>
                  </div>
                  <div className="text-right font-mono font-bold text-white">
                    {formatPrice(item.product.price * item.quantity)}
                  </div>
                </div>
              ))}
            </div>

            {/* PROMO CODE SECTION */}
            <div className="pt-2 border-t border-neutral-800">
              <label className="block text-xs font-mono text-neutral-400 mb-2 uppercase">
                PROMO CODE
              </label>
              {appliedPromo ? (
                <div className="bg-neutral-900 border border-[#00e65c] p-2.5 flex items-center justify-between text-xs font-mono">
                  <span className="text-[#00e65c] font-bold flex items-center gap-1.5">
                    <Tag size={12} />
                    {appliedPromo}
                  </span>
                  <button
                    type="button"
                    onClick={removePromo}
                    className="text-neutral-400 hover:text-rose-400 text-[10px]"
                  >
                    REMOVE
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="e.g. PREMIUM15"
                    className="flex-1 bg-neutral-900 border border-neutral-800 text-white font-mono text-xs px-3 py-2 focus:outline-none focus:border-[#00e65c] uppercase"
                  />
                  <button
                    type="button"
                    onClick={handleApplyPromo}
                    className="bg-neutral-800 hover:bg-neutral-700 text-white font-syne font-bold text-xs px-3 uppercase transition-colors"
                  >
                    APPLY
                  </button>
                </div>
              )}
            </div>

            {/* FINANCIAL SUMMARY TABLE */}
            <div className="space-y-2 text-xs font-mono text-neutral-400 pt-2 border-t border-neutral-800">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="text-white">{formatPrice(cartTotal)}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-[#00e65c]">
                  <span>Discount</span>
                  <span>-{formatPrice(discountAmount)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="text-[#00e65c]">
                  {shippingFee === 0 ? 'FREE' : formatPrice(shippingFee)}
                </span>
              </div>

              <div className="pt-3 border-t border-neutral-800 flex justify-between items-baseline">
                <span className="font-syne font-extrabold text-sm text-white">TOTAL DUE (COD)</span>
                <span className="font-syne font-extrabold text-2xl text-[#00e65c]">
                  {formatPrice(grandTotal)}
                </span>
              </div>
            </div>

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#00e65c] text-black hover:bg-[#00ff66] font-syne font-extrabold py-4 text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-xl disabled:opacity-50 disabled:cursor-wait"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  <span>VALIDATING & CREATING ORDER...</span>
                </>
              ) : (
                <>
                  <span>CONFIRM ORDER (CASH ON DELIVERY)</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>

            <div className="space-y-2 text-center pt-2">
              <div className="flex items-center justify-center gap-2 text-[11px] font-mono text-neutral-500">
                <ShieldCheck size={14} className="text-[#00e65c]" />
                <span>STORE-VALIDATED FIRESTORE TRANSACTION</span>
              </div>
              <p className="text-[10px] font-mono text-neutral-600">
                By placing this order, you agree to inspect and pay cash upon courier arrival.
              </p>
            </div>

            {/* OFFICIAL CUSTOMER SUPPORT ASSISTANCE BOX */}
            <div className="mt-4 p-4 bg-neutral-900/90 border border-neutral-800 text-xs font-mono space-y-2">
              <p className="font-syne font-extrabold text-white text-xs uppercase flex items-center justify-between">
                <span>NEED ORDER ASSISTANCE?</span>
                <span className="text-[#00e65c]">SUPPORT</span>
              </p>
              <div className="text-neutral-300 space-y-1 text-[11px]">
                <p className="flex items-center justify-between">
                  <span className="text-neutral-500">WhatsApp:</span>
                  <a
                    href="https://wa.me/923237506649"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#00e65c] font-bold hover:underline"
                  >
                    +92 323 7506649
                  </a>
                </p>
                <p className="flex items-center justify-between">
                  <span className="text-neutral-500">Email:</span>
                  <a href="mailto:thepremiumstoree@gmail.com" className="text-white hover:text-[#00e65c]">
                    thepremiumstoree@gmail.com
                  </a>
                </p>
                <p className="text-[10px] text-neutral-500 pt-1 border-t border-neutral-800/60 leading-tight">
                  Flagship: Unique Shopping Mall, Main Autobhan Road, Hyderabad, Sindh, Pakistan
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
