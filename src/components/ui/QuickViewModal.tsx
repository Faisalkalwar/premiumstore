import React, { useState } from 'react';
import { X, Heart, ShoppingBag, Star, ShieldCheck, Truck, RefreshCw } from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { formatPrice } from '../../types';

export const QuickViewModal: React.FC = () => {
  const {
    quickViewProduct,
    setQuickViewProduct,
    addToCart,
    toggleWishlist,
    isInWishlist,
    navigateToProduct,
  } = useShop();

  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [activeImage, setActiveImage] = useState<'main' | 'hover'>('main');

  if (!quickViewProduct) return null;

  const product = quickViewProduct;
  const inWishlist = isInWishlist(product.id);
  const currentSize = selectedSize || product.sizes[0] || 'M';
  const currentColor = selectedColor || (product.colors[0] ? product.colors[0].name : 'Default');

  const handleClose = () => {
    setQuickViewProduct(null);
    setSelectedSize('');
    setSelectedColor('');
    setQuantity(1);
  };

  const handleAddToCart = () => {
    addToCart(product, currentSize, currentColor, quantity);
    handleClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-fadeIn">
      {/* Modal backdrop */}
      <div className="absolute inset-0" onClick={handleClose} />

      {/* Modal Content Box */}
      <div className="relative w-full max-w-4xl bg-[#0f0f0f] border border-neutral-800 rounded-none shadow-2xl overflow-hidden z-10 max-h-[90vh] flex flex-col md:flex-row" role="dialog" aria-modal="true" aria-label={`Quick view ${product.name}`}>
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-20 p-2 text-neutral-400 hover:text-white bg-black/60 rounded-full transition-colors"
          aria-label="Close modal"
        >
          <X size={20} />
        </button>

        {/* Left: Product Images */}
        <div className="w-full md:w-1/2 bg-neutral-950 p-4 flex flex-col justify-between">
          <div className="relative aspect-[3/4] w-full bg-neutral-900 overflow-hidden mb-3">
            <img
              src={activeImage === 'main' ? product.image : product.hoverImage || product.image}
              alt={product.name}
              className="w-full h-full object-cover object-center transition-all duration-300"
            />
            {product.discountPercent && (
              <span className="absolute top-3 left-3 bg-[#00e65c] text-black font-syne font-extrabold text-xs px-2.5 py-1">
                -{product.discountPercent}% OFF
              </span>
            )}
          </div>

          {/* Thumbnail switchers */}
          {product.hoverImage && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveImage('main')}
                className={`w-16 h-20 border ${
                  activeImage === 'main' ? 'border-[#00e65c]' : 'border-neutral-800'
                } overflow-hidden`}
              >
                <img src={product.image} alt="Main" className="w-full h-full object-cover" />
              </button>
              <button
                onClick={() => setActiveImage('hover')}
                className={`w-16 h-20 border ${
                  activeImage === 'hover' ? 'border-[#00e65c]' : 'border-neutral-800'
                } overflow-hidden`}
              >
                <img src={product.hoverImage} alt="Hover" className="w-full h-full object-cover" />
              </button>
            </div>
          )}
        </div>

        {/* Right: Product Details */}
        <div className="w-full md:w-1/2 p-6 overflow-y-auto flex flex-col justify-between">
          <div>
            {/* Category & Ratings */}
            <div className="flex items-center justify-between text-xs text-neutral-400 font-mono uppercase mb-2">
              <span>{product.category.replace('-', ' ')}</span>
              <div className="flex items-center gap-1 text-amber-400">
                <Star size={14} className="fill-amber-400" />
                <span className="font-bold">{product.rating}</span>
                <span className="text-neutral-500">({product.reviewsCount} reviews)</span>
              </div>
            </div>

            {/* Title */}
            <h2 className="font-syne font-extrabold text-xl sm:text-2xl text-white uppercase tracking-wide mb-3">
              {product.name}
            </h2>

            {/* Pricing */}
            <div className="flex items-baseline gap-3 mb-4 pb-4 border-b border-neutral-800">
              <span className="font-syne font-extrabold text-2xl text-[#00e65c]">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && (
                <span className="text-sm text-neutral-500 line-through font-mono">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
            </div>

            {/* Description */}
            <p className="text-neutral-300 text-xs sm:text-sm leading-relaxed mb-6">
              {product.description}
            </p>

            {/* COLOR SELECTOR */}
            {product.colors && product.colors.length > 0 && (
              <div className="mb-5">
                <label className="block text-xs font-mono text-neutral-400 uppercase mb-2">
                  COLOR: <span className="text-white font-bold">{currentColor}</span>
                </label>
                <div className="flex items-center gap-2">
                  {product.colors.map((c) => (
                    <button
                      key={c.name}
                      onClick={() => setSelectedColor(c.name)}
                      className={`flex items-center gap-2 px-3 py-1.5 border text-xs font-mono transition-all ${
                        currentColor === c.name
                          ? 'border-[#00e65c] text-white bg-neutral-900'
                          : 'border-neutral-800 text-neutral-400 hover:border-neutral-600'
                      }`}
                    >
                      <span
                        className="w-3 h-3 rounded-full border border-neutral-700"
                        style={{ backgroundColor: c.hex }}
                      />
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* SIZE SELECTOR */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-mono text-neutral-400 uppercase">
                  SIZE: <span className="text-white font-bold">{currentSize}</span>
                </label>
                <span className="text-[11px] text-[#00e65c] underline cursor-pointer">
                  Size Guide
                </span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-4 py-2 text-xs font-mono font-bold border transition-all ${
                      currentSize === size
                        ? 'border-[#00e65c] bg-[#00e65c] text-black'
                        : 'border-neutral-800 text-neutral-300 hover:border-neutral-600'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* QUANTITY & ADD TO CART */}
            <div className="flex items-center gap-3 mb-6">
              {/* Quantity selector */}
              <div className="flex items-center border border-neutral-800 bg-neutral-900">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-3 py-2 text-neutral-400 hover:text-white font-mono"
                >
                  -
                </button>
                <span className="px-3 py-2 font-mono text-xs text-white font-bold min-w-[32px] text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="px-3 py-2 text-neutral-400 hover:text-white font-mono"
                >
                  +
                </button>
              </div>

              {/* Add to cart */}
              <button
                onClick={handleAddToCart}
                className="flex-1 bg-[#00e65c] text-black hover:bg-[#00ff66] font-syne font-extrabold py-3 text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
              >
                <ShoppingBag size={16} />
                ADD TO CART
              </button>

              {/* Wishlist toggle */}
              <button
                onClick={() => toggleWishlist(product)}
                className={`p-3 border border-neutral-800 transition-colors ${
                  inWishlist
                    ? 'bg-rose-500 text-white border-rose-500'
                    : 'text-neutral-400 hover:text-white hover:border-neutral-600'
                }`}
                title="Wishlist"
                aria-label={inWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
              >
                <Heart size={18} className={inWishlist ? 'fill-white' : ''} />
              </button>
            </div>

            {/* FULL DETAILS LINK */}
            <button
              onClick={() => {
                handleClose();
                navigateToProduct(product.slug || product.id);
              }}
              className="w-full mb-4 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-[#00e65c] border border-neutral-800 font-syne font-bold text-xs uppercase tracking-wider transition-colors"
            >
              VIEW FULL PRODUCT DETAILS →
            </button>

            {/* FABRIC & FIT SPECS */}
            {(product.fabric || product.fit) && (
              <div className="space-y-2 pt-4 border-t border-neutral-800 text-xs font-mono text-neutral-400">
                {product.fabric && (
                  <div>
                    <span className="text-neutral-200">Fabric:</span> {product.fabric}
                  </div>
                )}
                {product.fit && (
                  <div>
                    <span className="text-neutral-200">Fit:</span> {product.fit}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* FOOTER SERVICE BADGES */}
          <div className="mt-6 pt-4 border-t border-neutral-800/80 grid grid-cols-3 gap-2 text-[10px] text-neutral-400 font-mono text-center">
            <div className="flex flex-col items-center gap-1">
              <Truck size={14} className="text-[#00e65c]" />
              <span>Fast Shipping</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <RefreshCw size={14} className="text-[#00e65c]" />
              <span>30 Day Returns</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <ShieldCheck size={14} className="text-[#00e65c]" />
              <span>100% Authentic</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
