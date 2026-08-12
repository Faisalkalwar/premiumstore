import React from 'react';
import { X, Search, User, Heart, ShoppingBag, Sparkles, ChevronRight, Instagram, Globe } from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { Logo } from './Logo';
import { ProductCategory } from '../../types';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

const NAV_LINKS: { name: string; category: ProductCategory | 'lookbook' | 'contact' }[] = [
  { name: 'Shirts', category: 'shirts' },
  { name: 'Caps & Hats', category: 'caps' },
  { name: 'Jeans & Denim', category: 'jeans' },
  { name: 'New Arrivals', category: 'new-arrivals' },
  { name: 'Best Sellers', category: 'best-sellers' },
  { name: 'Editorial Lookbook', category: 'lookbook' },
  { name: 'Contact Us', category: 'contact' },
];

export const MobileNav: React.FC<MobileNavProps> = ({ isOpen, onClose }) => {
  const {
    setIsSearchOpen,
    setIsWishlistOpen,
    setIsCartOpen,
    setSelectedCategory,
    cartCount,
    wishlistCount,
    user,
    navigateTo,
  } = useShop();

  if (!isOpen) return null;

  const handleCategoryClick = (category: ProductCategory | 'lookbook' | 'contact') => {
    if (category === 'contact') {
      navigateTo('contact');
    } else if (category === 'lookbook') {
      navigateTo('home');
      setTimeout(() => {
        const el = document.getElementById('lookbook-section');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    } else {
      setSelectedCategory(category);
      navigateTo('home');
      setTimeout(() => {
        const el = document.getElementById('products-section');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden lg:hidden">
      {/* BACKDROP */}
      <div
        className="absolute inset-0 bg-black/85 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* SLIDE OUT PANEL */}
      <div className="fixed inset-y-0 left-0 max-w-full flex">
        <div className="w-screen max-w-xs sm:max-w-sm bg-[#0a0a0a] border-r border-neutral-800 text-white flex flex-col justify-between shadow-2xl">
          {/* HEADER */}
          <div className="p-5 border-b border-neutral-800 flex items-center justify-between">
            <Logo />
            <button
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-white transition-colors"
              aria-label="Close navigation"
            >
              <X size={20} />
            </button>
          </div>

          {/* SEARCH QUICK ACCESS */}
          <div className="p-4 border-b border-neutral-800">
            <button
              onClick={() => {
                onClose();
                setIsSearchOpen(true);
              }}
              className="w-full bg-neutral-900 border border-neutral-800 text-neutral-400 py-2.5 px-4 text-xs font-mono flex items-center gap-2 hover:border-[#00e65c] hover:text-white transition-colors"
            >
              <Search size={14} className="text-[#00e65c]" />
              <span>Search 300+ streetwear items...</span>
            </button>
          </div>

          {/* CATEGORY LINKS */}
          <div className="flex-1 overflow-y-auto p-5 space-y-1">
            <p className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest px-3 mb-2">
              CATEGORIES & COLLECTIONS
            </p>
            {NAV_LINKS.map((link) => (
              <button
                key={link.name}
                onClick={() => handleCategoryClick(link.category)}
                className="w-full font-syne font-bold text-sm uppercase py-3 px-3 text-left hover:bg-neutral-900 hover:text-[#00e65c] transition-colors flex items-center justify-between group border-b border-neutral-900/50"
              >
                <span>{link.name}</span>
                <ChevronRight
                  size={16}
                  className="text-neutral-600 group-hover:text-[#00e65c] group-hover:translate-x-1 transition-all"
                />
              </button>
            ))}

            {/* QUICK ACTIONS */}
            <div className="pt-6 space-y-2">
              <button
                onClick={() => {
                  onClose();
                  if (user) {
                    navigateTo('account');
                  } else {
                    navigateTo('login');
                  }
                }}
                className="w-full bg-neutral-900 border border-neutral-800 hover:border-[#00e65c] py-3 px-4 text-xs font-syne font-bold uppercase flex items-center gap-3 text-neutral-200"
              >
                <User size={16} className="text-[#00e65c]" />
                <span>{user ? 'My VIP Account' : 'Sign In / Register'}</span>
              </button>

              <button
                onClick={() => {
                  onClose();
                  setIsWishlistOpen(true);
                }}
                className="w-full bg-neutral-900 border border-neutral-800 hover:border-[#00e65c] py-3 px-4 text-xs font-syne font-bold uppercase flex items-center justify-between text-neutral-200"
              >
                <div className="flex items-center gap-3">
                  <Heart size={16} className="text-[#00e65c]" />
                  <span>My Wishlist</span>
                </div>
                <span className="bg-neutral-800 text-[#00e65c] px-2 py-0.5 text-[10px] font-mono">
                  {wishlistCount}
                </span>
              </button>

              <button
                onClick={() => {
                  onClose();
                  setIsCartOpen(true);
                }}
                className="w-full bg-[#00e65c] text-black font-syne font-extrabold py-3.5 px-4 text-xs uppercase flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <ShoppingBag size={16} />
                  <span>View Shopping Bag</span>
                </div>
                <span className="bg-black text-[#00e65c] px-2 py-0.5 text-[10px] font-mono">
                  {cartCount}
                </span>
              </button>
            </div>
          </div>

          {/* FOOTER INFO */}
          <div className="p-5 border-t border-neutral-800 bg-[#070707] flex items-center justify-between text-xs font-mono text-neutral-500">
            <div className="flex items-center gap-2">
              <Globe size={14} className="text-[#00e65c]" />
              <span>GLOBAL SHIPPING</span>
            </div>
            <a
              href="https://www.instagram.com/premiumstore._pk/"
              target="_blank"
              rel="noreferrer"
              className="text-neutral-400 hover:text-[#00e65c] transition-colors"
              aria-label="Instagram @premiumstore._pk"
            >
              <Instagram size={16} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
