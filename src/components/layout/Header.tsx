import React, { useState, useEffect } from 'react';
import { Search, User, Heart, ShoppingBag, Menu, LogOut, UserCheck } from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { Logo } from './Logo';
import { MobileNav } from './MobileNav';
import { ProductCategory } from '../../types';

export const Header: React.FC = () => {
  const {
    cartCount,
    wishlistCount,
    setIsCartOpen,
    setIsWishlistOpen,
    setIsSearchOpen,
    setSelectedCategory,
    selectedCategory,
    user,
    userProfile,
    logOut,
    navigateTo,
    showToast,
  } = useShop();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems: { label: string; category: ProductCategory | 'lookbook' | 'contact' }[] = [
    { label: 'SHIRTS', category: 'shirts' },
    { label: 'CAPS', category: 'caps' },
    { label: 'JEANS', category: 'jeans' },
    { label: 'NEW ARRIVALS', category: 'new-arrivals' },
    { label: 'BEST SELLERS', category: 'best-sellers' },
    { label: 'LOOKBOOK', category: 'lookbook' },
    { label: 'CONTACT', category: 'contact' },
  ];

  const handleNavClick = (category: ProductCategory | 'lookbook' | 'contact') => {
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
  };

  return (
    <>
      <header
        className={`sticky top-0 z-40 w-full transition-all duration-300 ${
          isScrolled
            ? 'bg-black/90 backdrop-blur-md border-b border-neutral-800/80 py-3 shadow-2xl'
            : 'bg-black border-b border-neutral-900 py-4'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-4">
          {/* LEFT: Mobile Menu Button + Desktop Nav */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => setIsMobileNavOpen(true)}
              className="lg:hidden text-neutral-300 hover:text-[#00e65c] transition-colors p-1"
              aria-label="Open mobile navigation"
            >
              <Menu size={24} />
            </button>

            {/* BRAND LOGO */}
            <button onClick={() => navigateTo('home')} className="flex items-center focus:outline-none">
              <Logo />
            </button>
          </div>

          {/* DESKTOP NAVIGATION */}
          <nav className="hidden lg:flex items-center gap-8 font-syne font-bold text-xs uppercase tracking-wider">
            {navItems.map((item) => {
              const isActive = selectedCategory === item.category;
              return (
                <button
                  key={item.label}
                  onClick={() => handleNavClick(item.category)}
                  className={`relative py-1 transition-colors ${
                    isActive
                      ? 'text-[#00e65c] font-extrabold'
                      : 'text-neutral-300 hover:text-[#00e65c]'
                  }`}
                >
                  {item.label}
                  {item.category === 'new-arrivals' && (
                    <span className="absolute -top-2 -right-3 text-[9px] bg-[#00e65c] text-black px-1 font-mono font-extrabold rounded-none">
                      HOT
                    </span>
                  )}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00e65c]" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* RIGHT ACTION ICONS */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* SEARCH */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-2 text-neutral-300 hover:text-[#00e65c] transition-colors"
              title="Search"
              aria-label="Search"
            >
              <Search size={18} />
            </button>

            {/* GUEST VS LOGGED IN CUSTOMER STATES */}
            {!user ? (
              <button
                onClick={() => navigateTo('login')}
                className="bg-neutral-900 border border-neutral-800 hover:border-[#00e65c] text-white hover:text-[#00e65c] px-3 py-1.5 font-syne font-extrabold text-[11px] uppercase tracking-wider flex items-center gap-1.5 transition-colors"
              >
                <User size={14} className="text-[#00e65c]" />
                <span>LOGIN / SIGN UP</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                {/* ACCOUNT */}
                <button
                  onClick={() => navigateTo('account')}
                  className="bg-neutral-900 border border-neutral-800 hover:border-[#00e65c] text-white hover:text-[#00e65c] px-3 py-1.5 font-syne font-extrabold text-[11px] uppercase tracking-wider flex items-center gap-1.5 transition-colors"
                  title="View Account"
                >
                  <UserCheck size={14} className="text-[#00e65c]" />
                  <span className="hidden md:inline">ACCOUNT</span>
                </button>

                {/* LOGOUT */}
                <button
                  onClick={async () => {
                    await logOut();
                    showToast('Logged out successfully.');
                    navigateTo('login');
                  }}
                  className="p-2 text-neutral-400 hover:text-rose-400 transition-colors hidden sm:block"
                  title="Log Out"
                  aria-label="Log Out"
                >
                  <LogOut size={16} />
                </button>
              </div>
            )}

            {/* WISHLIST */}
            <button
              onClick={() => setIsWishlistOpen(true)}
              className="relative p-2 text-neutral-300 hover:text-[#00e65c] transition-colors"
              title="Wishlist"
              aria-label="Wishlist"
            >
              <Heart size={18} />
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 bg-rose-500 text-white font-mono text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* SHOPPING BAG / CART */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative bg-[#00e65c] text-black hover:bg-[#00ff66] transition-colors font-syne font-extrabold text-xs flex items-center gap-1.5 px-3 py-1.5"
              title="Shopping Cart"
              aria-label="Shopping Cart"
            >
              <ShoppingBag size={16} />
              <span className="font-mono text-xs font-bold">{cartCount}</span>
            </button>
          </div>
        </div>
      </header>

      {/* MOBILE DRAWER */}
      <MobileNav isOpen={isMobileNavOpen} onClose={() => setIsMobileNavOpen(false)} />
    </>
  );
};
