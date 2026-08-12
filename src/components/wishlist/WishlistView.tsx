import React, { useState } from 'react';
import {
  Heart,
  ShoppingBag,
  Trash2,
  Share2,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Layers,
  ArrowRight
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { ProductCard } from '../ui/ProductCard';
import { Product, formatPrice } from '../../types';

export const WishlistView: React.FC = () => {
  const {
    wishlist,
    toggleWishlist,
    wishlistCount,
    addToCart,
    navigateTo,
    navigateToProduct,
    showToast,
    user,
    products,
  } = useShop();

  const [selectedSizes, setSelectedSizes] = useState<{ [productId: string]: string }>({});

  const handleSizeChange = (productId: string, size: string) => {
    setSelectedSizes((prev) => ({ ...prev, [productId]: size }));
  };

  const handleMoveToCart = (product: Product) => {
    const chosenSize = selectedSizes[product.id] || product.sizes[0] || 'M';
    const chosenColor = product.colors[0]?.name || 'Default';
    addToCart(product, chosenSize, chosenColor, 1);
    toggleWishlist(product);
  };

  const handleMoveAllToCart = () => {
    if (wishlist.length === 0) return;
    wishlist.forEach((product) => {
      const chosenSize = selectedSizes[product.id] || product.sizes[0] || 'M';
      const chosenColor = product.colors[0]?.name || 'Default';
      addToCart(product, chosenSize, chosenColor, 1);
    });
    // Optional: clear wishlist after moving all
    wishlist.forEach((product) => toggleWishlist(product));
    showToast('Moved all saved items to your shopping cart!');
  };

  const handleShareWishlist = () => {
    const shareUrl = window.location.href;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
      showToast('Wishlist link copied to clipboard!');
    } else {
      showToast('Copy URL from your browser address bar.');
    }
  };

  return (
    <div className="min-h-screen bg-black text-white pt-6 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* TOP HEADER */}
        <div className="mb-8 border-b border-neutral-900 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <button
              onClick={() => navigateTo('home')}
              className="inline-flex items-center gap-2 text-xs font-mono text-neutral-400 hover:text-[#00e65c] transition-colors mb-3"
            >
              <ArrowLeft size={14} />
              <span>BACK TO STOREFRONT</span>
            </button>
            <div className="flex items-center gap-3">
              <h1 className="font-syne font-extrabold text-3xl sm:text-4xl uppercase tracking-wider text-white">
                SAVED WISHLIST
              </h1>
              <span className="bg-rose-500 text-white font-mono font-extrabold text-xs px-2.5 py-1">
                {wishlistCount} {wishlistCount === 1 ? 'GRAIL' : 'GRAILS'}
              </span>
            </div>
          </div>

          {/* ACTION BUTTONS & CLOUD STATUS */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-neutral-900 border border-neutral-800 px-3.5 py-2 text-xs font-mono">
              <span className={`w-2 h-2 rounded-full ${user ? 'bg-[#00e65c] animate-pulse' : 'bg-amber-400'}`} />
              <span className="text-neutral-300">
                {user ? `Saved in Cloud (${user.email || 'Member'})` : 'Local Guest Storage'}
              </span>
            </div>

            {wishlistCount > 0 && (
              <>
                <button
                  onClick={handleShareWishlist}
                  className="bg-neutral-900 border border-neutral-800 hover:border-[#00e65c] text-neutral-200 hover:text-[#00e65c] font-syne font-bold text-xs px-3.5 py-2 uppercase tracking-wider flex items-center gap-1.5 transition-colors"
                >
                  <Share2 size={14} />
                  <span>SHARE WISHLIST</span>
                </button>

                <button
                  onClick={handleMoveAllToCart}
                  className="bg-[#00e65c] text-black font-syne font-extrabold text-xs px-4 py-2 uppercase tracking-wider hover:bg-[#00ff66] transition-all flex items-center gap-1.5"
                >
                  <ShoppingBag size={14} />
                  <span>MOVE ALL TO CART</span>
                </button>
              </>
            )}
          </div>
        </div>

        {wishlist.length === 0 ? (
          /* EMPTY WISHLIST STATE */
          <div className="bg-[#0a0a0a] border border-neutral-800 py-16 px-6 text-center max-w-2xl mx-auto my-12">
            <div className="w-20 h-20 bg-neutral-900 border border-neutral-800 rounded-full flex items-center justify-center mx-auto mb-6 text-neutral-600">
              <Heart size={36} className="stroke-1 text-neutral-600" />
            </div>
            <h2 className="font-syne font-extrabold text-2xl uppercase tracking-wider text-white mb-3">
              YOUR WISHLIST IS CURRENTLY EMPTY
            </h2>
            <p className="text-neutral-400 text-xs font-mono mb-8 max-w-md mx-auto leading-relaxed">
              Click the heart icon on any product or lookbook drop to bookmark your favorite streetwear pieces for later.
            </p>
            <button
              onClick={() => navigateTo('home')}
              className="bg-[#00e65c] text-black font-syne font-extrabold px-8 py-4 text-xs uppercase tracking-wider hover:bg-[#00ff66] transition-all shadow-xl inline-flex items-center gap-2"
            >
              <span>DISCOVER NEW DROPS</span>
              <ArrowRight size={16} />
            </button>
          </div>
        ) : (
          /* WISHLIST GRID */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlist.map((product) => {
              const currentStock = product.stock ?? 20;
              const isOutOfStock = currentStock <= 0;
              const isLowStock = currentStock > 0 && currentStock <= 5;
              const activeSize = selectedSizes[product.id] || product.sizes[0] || 'M';

              return (
                <div
                  key={product.id}
                  className="bg-[#0c0c0c] border border-neutral-800 hover:border-neutral-700 transition-all flex flex-col justify-between group overflow-hidden"
                >
                  <div>
                    {/* PRODUCT IMAGE & BADGES */}
                    <div
                      className="relative aspect-[4/5] bg-neutral-900 overflow-hidden cursor-pointer"
                      onClick={() => navigateToProduct(product.slug || product.id)}
                    >
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />

                      {/* REMOVE BUTTON */}
                      <button
                        onClick={() => toggleWishlist(product)}
                        className="absolute top-3 right-3 p-2 bg-black/80 backdrop-blur-md text-rose-500 hover:bg-rose-600 hover:text-white transition-colors"
                        title="Remove from Wishlist"
                        aria-label="Remove from Wishlist"
                      >
                        <Trash2 size={16} />
                      </button>

                      {/* STOCK STATUS BADGE */}
                      <div className="absolute bottom-3 left-3">
                        {isOutOfStock ? (
                          <span className="bg-rose-950 text-rose-300 border border-rose-800 text-[10px] font-mono font-bold px-2.5 py-1">
                            OUT OF STOCK
                          </span>
                        ) : isLowStock ? (
                          <span className="bg-amber-950 text-amber-300 border border-amber-800 text-[10px] font-mono font-bold px-2.5 py-1">
                            LOW STOCK ({currentStock} LEFT)
                          </span>
                        ) : (
                          <span className="bg-neutral-950/90 text-[#00e65c] border border-neutral-800 text-[10px] font-mono font-bold px-2.5 py-1">
                            IN STOCK ({currentStock})
                          </span>
                        )}
                      </div>
                    </div>

                    {/* DETAILS */}
                    <div className="p-5 space-y-3">
                      <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest block">
                        {product.category}
                      </span>
                      <h3
                        onClick={() => navigateToProduct(product.slug || product.id)}
                        className="font-syne font-bold text-base uppercase text-white hover:text-[#00e65c] transition-colors line-clamp-1 cursor-pointer"
                      >
                        {product.name}
                      </h3>

                      <div className="flex items-baseline gap-2">
                        <span className="font-syne font-extrabold text-lg text-[#00e65c]">
                          {formatPrice(product.price)}
                        </span>
                        {product.originalPrice && (
                          <span className="text-xs font-mono text-neutral-500 line-through">
                            {formatPrice(product.originalPrice)}
                          </span>
                        )}
                      </div>

                      {/* SIZE SELECTOR */}
                      <div className="pt-2">
                        <label className="block text-[10px] font-mono text-neutral-400 mb-1.5 uppercase">
                          SELECT SIZE BEFORE ADDING:
                        </label>
                        <div className="flex flex-wrap gap-1.5">
                          {product.sizes.map((sz) => (
                            <button
                              key={sz}
                              onClick={() => handleSizeChange(product.id, sz)}
                              className={`px-2.5 py-1 font-mono text-xs uppercase border transition-colors ${
                                activeSize === sz
                                  ? 'bg-[#00e65c] text-black border-[#00e65c] font-bold'
                                  : 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:border-neutral-600'
                              }`}
                            >
                              {sz}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* MOVE TO BAG ACTION */}
                  <div className="p-5 pt-0">
                    <button
                      onClick={() => handleMoveToCart(product)}
                      disabled={isOutOfStock}
                      className={`w-full py-3 font-syne font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                        isOutOfStock
                          ? 'bg-neutral-900 text-neutral-600 border border-neutral-800 cursor-not-allowed'
                          : 'bg-neutral-900 hover:bg-[#00e65c] text-white hover:text-black border border-neutral-800 hover:border-[#00e65c]'
                      }`}
                    >
                      <ShoppingBag size={14} />
                      <span>{isOutOfStock ? 'OUT OF STOCK' : `MOVE TO BAG (${activeSize})`}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* EXPLORE MORE DROPS */}
        {products.length > 0 && (
          <div className="mt-20 pt-12 border-t border-neutral-900">
            <h2 className="font-syne font-extrabold text-xl uppercase tracking-wider text-white mb-6">
              TRENDING STREETWEAR DROPS
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {products.slice(0, 4).map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
