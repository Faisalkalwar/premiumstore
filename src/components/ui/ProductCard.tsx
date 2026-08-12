import React, { useState } from 'react';
import { Heart, Eye, ShoppingBag, Star } from 'lucide-react';
import { Product, formatPrice } from '../../types';
import { useShop } from '../../context/ShopContext';
import { OptimizedImage } from '../common/OptimizedImage';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const {
    addToCart,
    toggleWishlist,
    isInWishlist,
    setQuickViewProduct,
    navigateToProduct,
  } = useShop();

  const [isHovered, setIsHovered] = useState(false);
  const [showSizePicker, setShowSizePicker] = useState(false);

  const inWishlist = isInWishlist(product.id);

  const handleProductClick = () => {
    navigateToProduct(product.slug || product.id);
  };

  const handleQuickAdd = (e: React.MouseEvent, size: string) => {
    e.stopPropagation();
    addToCart(product, size);
    setShowSizePicker(false);
  };

  return (
    <div
      className="group relative bg-[#0d0d0d] border border-neutral-800/80 rounded-none overflow-hidden transition-all duration-300 hover:border-neutral-700 hover:shadow-xl flex flex-col h-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setShowSizePicker(false);
      }}
    >
      {/* BADGES (Discount / New / Best Seller) */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 items-start">
        {product.discountPercent && (
          <span className="bg-[#00e65c] text-black font-syne font-extrabold text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-none shadow-md">
            -{product.discountPercent}% OFF
          </span>
        )}
        {product.isNew && (
          <span className="bg-white text-black font-syne font-extrabold text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-none">
            NEW DROP
          </span>
        )}
        {product.isBestSeller && !product.isNew && (
          <span className="bg-neutral-800 text-neutral-200 font-syne font-bold text-[10px] uppercase tracking-wider px-2 py-0.5 border border-neutral-700">
            BESTSELLER
          </span>
        )}
      </div>

      {/* WISHLIST BUTTON */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          toggleWishlist(product);
        }}
        className={`absolute top-3 right-3 z-10 p-2 rounded-full transition-all duration-200 ${
          inWishlist
            ? 'bg-rose-500 text-white scale-110 shadow-lg'
            : 'bg-black/60 text-neutral-300 hover:text-white hover:bg-black/90 backdrop-blur-md'
        }`}
        aria-label={inWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
        title={inWishlist ? 'Remove from Wishlist' : 'Save to Wishlist'}
      >
        <Heart size={16} className={inWishlist ? 'fill-white' : ''} />
      </button>

      {/* IMAGE CONTAINER WITH HOVER EFFECT */}
      <div
        className="relative aspect-[3/4] w-full bg-neutral-900 overflow-hidden cursor-pointer"
        onClick={handleProductClick}
      >
        <OptimizedImage
          src={isHovered && product.hoverImage ? product.hoverImage : product.image}
          alt={product.name}
          className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
        />

        {/* OVERLAY ACTION BUTTONS */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3 pointer-events-none group-hover:pointer-events-auto">
          {/* QUICK VIEW TRIGGER */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setQuickViewProduct(product);
            }}
            className="w-full mb-2 bg-neutral-900/90 text-white hover:bg-black hover:text-[#00e65c] border border-neutral-700 py-2 text-xs font-syne font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors backdrop-blur-md"
          >
            <Eye size={14} />
            Quick View
          </button>

          {/* QUICK ADD BUTTON / SIZE PICKER */}
          {!showSizePicker ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (product.sizes.length === 1) {
                  addToCart(product, product.sizes[0]);
                } else {
                  setShowSizePicker(true);
                }
              }}
              className="w-full bg-[#00e65c] text-black hover:bg-[#00ff66] font-syne font-extrabold py-2.5 text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-lg"
            >
              <ShoppingBag size={14} />
              Quick Add
            </button>
          ) : (
            <div
              className="w-full bg-black/95 border border-[#00e65c] p-2 text-center animate-fadeIn"
              onClick={(e) => e.stopPropagation()}
            >
              <p className="text-[10px] text-neutral-400 font-mono uppercase mb-1.5">
                SELECT SIZE
              </p>
              <div className="flex items-center justify-center gap-1 flex-wrap">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={(e) => handleQuickAdd(e, size)}
                    className="px-2.5 py-1 text-xs font-mono font-bold bg-neutral-800 text-white hover:bg-[#00e65c] hover:text-black transition-colors"
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* PRODUCT INFORMATION */}
      <div className="p-4 flex flex-col flex-1 justify-between bg-[#0d0d0d]">
        <div>
          {/* CATEGORY & RATING */}
          <div className="flex items-center justify-between text-[11px] text-neutral-400 mb-1 font-mono uppercase tracking-wider">
            <span>{product.category.replace('-', ' ')}</span>
            <div className="flex items-center gap-1 text-amber-400">
              <Star size={12} className="fill-amber-400" />
              <span className="text-neutral-300 font-semibold">{product.rating}</span>
              <span className="text-neutral-500">({product.reviewsCount})</span>
            </div>
          </div>

          {/* PRODUCT NAME */}
          <h3
            onClick={handleProductClick}
            className="font-syne font-bold text-sm sm:text-base text-white hover:text-[#00e65c] transition-colors line-clamp-1 cursor-pointer mb-2 uppercase tracking-wide"
            title={product.name}
          >
            {product.name}
          </h3>
        </div>

        {/* PRICING & COLOR SWATCH PREVIEW */}
        <div className="flex items-center justify-between pt-2 border-t border-neutral-800/80">
          <div className="flex items-baseline gap-2">
            <span className="font-syne font-extrabold text-base text-[#00e65c]">
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && (
              <span className="text-xs text-neutral-500 line-through font-mono">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>

          {/* Color Dots */}
          {product.colors && product.colors.length > 0 && (
            <div className="flex items-center gap-1">
              {product.colors.map((c) => (
                <span
                  key={c.name}
                  className="w-2.5 h-2.5 rounded-full border border-neutral-700"
                  style={{ backgroundColor: c.hex }}
                  title={c.name}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
