import React from 'react';
import { X, Heart, ShoppingBag, Trash2 } from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { formatPrice } from '../../types';

export const WishlistDrawer: React.FC = () => {
  const {
    wishlist,
    toggleWishlist,
    wishlistCount,
    isWishlistOpen,
    setIsWishlistOpen,
    addToCart,
    navigateTo,
  } = useShop();

  if (!isWishlistOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div
        className="absolute inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
        onClick={() => setIsWishlistOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10" role="dialog" aria-modal="true" aria-label="Saved Wishlist Drawer">
        <div className="w-screen max-w-md bg-[#0a0a0a] border-l border-neutral-800 text-white flex flex-col justify-between shadow-2xl">
          {/* HEADER */}
          <div className="p-6 border-b border-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Heart size={20} className="text-[#00e65c] fill-[#00e65c]" />
              <h2 className="font-syne font-extrabold text-lg uppercase tracking-wider">
                WISHLIST ({wishlistCount})
              </h2>
            </div>
            <button
              onClick={() => setIsWishlistOpen(false)}
              className="p-1.5 text-neutral-400 hover:text-white transition-colors"
              aria-label="Close wishlist drawer"
            >
              <X size={20} />
            </button>
          </div>

          {/* LIST */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {wishlist.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <Heart size={48} className="text-neutral-700 mb-4 stroke-1" />
                <p className="font-syne font-bold text-base text-neutral-300 mb-2">
                  YOUR WISHLIST IS EMPTY
                </p>
                <p className="text-xs text-neutral-500 mb-6 font-mono">
                  Save your favorite streetwear grails to keep track of upcoming drops.
                </p>
                <button
                  onClick={() => setIsWishlistOpen(false)}
                  className="bg-[#00e65c] text-black font-syne font-extrabold px-6 py-3 text-xs uppercase tracking-wider hover:bg-[#00ff66] transition-colors"
                >
                  DISCOVER DROPS
                </button>
              </div>
            ) : (
              wishlist.map((product) => (
                <div
                  key={product.id}
                  className="bg-[#111111] p-3 border border-neutral-800 flex gap-4 items-center"
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-20 h-24 object-cover bg-neutral-900 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <h4 className="font-syne font-bold text-xs uppercase text-white line-clamp-1">
                        {product.name}
                      </h4>
                      <button
                        onClick={() => toggleWishlist(product)}
                        className="text-neutral-500 hover:text-rose-500 transition-colors p-1"
                        aria-label="Remove from wishlist"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="font-syne font-bold text-sm text-[#00e65c]">
                        {formatPrice(product.price)}
                      </span>
                      {product.originalPrice && (
                        <span className="text-xs text-neutral-500 line-through font-mono">
                          {formatPrice(product.originalPrice)}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        addToCart(product);
                        toggleWishlist(product);
                      }}
                      className="mt-3 w-full bg-neutral-800 hover:bg-[#00e65c] text-white hover:text-black font-syne font-bold text-[11px] py-1.5 uppercase transition-colors flex items-center justify-center gap-1.5"
                    >
                      <ShoppingBag size={12} />
                      MOVE TO BAG
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* FOOTER ACTION */}
          {wishlist.length > 0 && (
            <div className="p-6 border-t border-neutral-800 bg-[#070707]">
              <button
                onClick={() => {
                  setIsWishlistOpen(false);
                  navigateTo('wishlist');
                }}
                className="w-full bg-[#00e65c] text-black hover:bg-[#00ff66] font-syne font-extrabold py-3.5 text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-xl"
              >
                <span>VIEW FULL WISHLIST PAGE</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
