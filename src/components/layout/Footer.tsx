import React from 'react';
import { Logo } from './Logo';
import { Instagram, MessageSquare, Mail, MapPin, ShieldCheck, Globe, ArrowUp } from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { ProductCategory } from '../../types';

export const Footer: React.FC = () => {
  const { setSelectedCategory, navigateTo } = useShop();

  const handleCategoryClick = (category: ProductCategory | 'lookbook') => {
    if (category === 'lookbook') {
      const el = document.getElementById('lookbook-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else {
      setSelectedCategory(category);
      const el = document.getElementById('products-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-black text-white border-t border-neutral-900 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* TOP ROW: BRAND SUMMARY & QUICK NAVIGATION */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-16">
          {/* BRAND INFO & OFFICIAL CONTACTS */}
          <div className="lg:col-span-2 space-y-4">
            <Logo />
            <p className="font-syne font-extrabold text-sm text-[#00e65c] uppercase tracking-wider">
              "WEAR THE BEST. FOR LESS."
            </p>
            <p className="text-xs font-mono text-neutral-400 max-w-sm leading-relaxed">
              PREMIUM STORE is your premier destination for modern streetwear, heavyweight apparel, unstructured caps, and raw baggy denim.
            </p>

            {/* OFFICIAL STORE CONTACT DETAILS */}
            <div className="space-y-2 pt-2 text-xs font-mono text-neutral-300">
              <div className="flex items-start gap-2">
                <MapPin size={15} className="text-[#00e65c] shrink-0 mt-0.5" />
                <span>Unique Shopping Mall, Main Autobhan Road, Hyderabad, Sindh, Pakistan</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={15} className="text-[#00e65c] shrink-0" />
                <a href="mailto:thepremiumstoree@gmail.com" className="hover:text-[#00e65c] transition-colors">
                  thepremiumstoree@gmail.com
                </a>
              </div>
              <div className="flex items-center gap-2">
                <MessageSquare size={15} className="text-[#00e65c] shrink-0" />
                <a
                  href="https://wa.me/923237506649"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-[#00e65c] transition-colors font-bold text-[#00e65c]"
                >
                  +92 323 7506649 (WhatsApp)
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Instagram size={15} className="text-[#00e65c] shrink-0" />
                <a
                  href="https://www.instagram.com/premiumstore._pk/"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-[#00e65c] transition-colors"
                >
                  @premiumstore._pk
                </a>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-3">
              <a
                href="https://www.instagram.com/premiumstore._pk/"
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 border border-neutral-800 bg-neutral-900 text-xs font-mono flex items-center gap-2 text-neutral-300 hover:text-[#00e65c] hover:border-[#00e65c] transition-colors"
                aria-label="Instagram @premiumstore._pk"
              >
                <Instagram size={16} />
                <span>@premiumstore._pk</span>
              </a>
              <a
                href="https://wa.me/923237506649"
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 border border-[#00e65c]/40 bg-[#00e65c]/10 text-xs font-mono flex items-center gap-2 text-[#00e65c] hover:bg-[#00e65c] hover:text-black transition-colors"
                aria-label="WhatsApp +92 323 7506649"
              >
                <MessageSquare size={16} />
                <span>WhatsApp</span>
              </a>
            </div>
          </div>

          {/* COLUMN 1: SHOP */}
          <div className="space-y-3">
            <p className="font-syne font-extrabold text-xs uppercase tracking-wider text-[#00e65c]">
              SHOP COLLECTION
            </p>
            <ul className="space-y-2 text-xs font-mono text-neutral-400">
              <li>
                <button onClick={() => handleCategoryClick('shirts')} className="hover:text-white transition-colors">
                  Oversized Shirts
                </button>
              </li>
              <li>
                <button onClick={() => handleCategoryClick('caps')} className="hover:text-white transition-colors">
                  Trucker Caps & Beanies
                </button>
              </li>
              <li>
                <button onClick={() => handleCategoryClick('jeans')} className="hover:text-white transition-colors">
                  Baggy Jeans & Cargo Denim
                </button>
              </li>
              <li>
                <button onClick={() => handleCategoryClick('new-arrivals')} className="hover:text-white transition-colors">
                  New Weekly Drops
                </button>
              </li>
              <li>
                <button onClick={() => handleCategoryClick('best-sellers')} className="hover:text-white transition-colors">
                  Best Seller Grails
                </button>
              </li>
              <li>
                <button onClick={() => handleCategoryClick('lookbook')} className="hover:text-white transition-colors">
                  Editorial Lookbook
                </button>
              </li>
            </ul>
          </div>

          {/* COLUMN 2: CUSTOMER CARE */}
          <div className="space-y-3">
            <p className="font-syne font-extrabold text-xs uppercase tracking-wider text-[#00e65c]">
              CUSTOMER CARE
            </p>
            <ul className="space-y-2 text-xs font-mono text-neutral-400">
              <li>
                <button onClick={() => navigateTo('contact')} className="text-[#00e65c] font-bold hover:underline transition-colors">
                  Contact Us
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('account')} className="hover:text-white transition-colors">
                  VIP Account & Profile
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('login')} className="hover:text-white transition-colors">
                  Sign In / Register
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('account-orders')} className="hover:text-white transition-colors">
                  Track Your Orders
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('admin')}
                  className="text-[#00e65c] font-bold hover:underline transition-colors flex items-center gap-1"
                >
                  <ShieldCheck size={12} />
                  <span>Admin Portal</span>
                </button>
              </li>
            </ul>
          </div>

          {/* COLUMN 3: BRAND LOCATION */}
          <div className="space-y-3">
            <p className="font-syne font-extrabold text-xs uppercase tracking-wider text-[#00e65c]">
              THE BRAND
            </p>
            <ul className="space-y-2 text-xs font-mono text-neutral-400">
              <li>
                <button onClick={() => navigateTo('contact')} className="hover:text-white transition-colors">
                  Store Location
                </button>
              </li>
              <li>
                <a href="https://wa.me/923237506649" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
                  Order Assistance
                </a>
              </li>
              <li>
                <a href="https://www.instagram.com/premiumstore._pk/" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
                  Instagram Community
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* BOTTOM BAR: PAYMENT METHODS & COPYRIGHT */}
        <div className="pt-8 border-t border-neutral-900 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-mono text-neutral-500">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-neutral-400">
              <Globe size={14} className="text-[#00e65c]" />
              <span>HYDERABAD, PAKISTAN</span>
            </div>
            <span>© 2026 PREMIUM STORE. ALL RIGHTS RESERVED.</span>
          </div>

          {/* PAYMENT BADGES */}
          <div className="flex items-center gap-3">
            <span className="px-2 py-1 bg-[#00e65c]/10 border border-[#00e65c]/40 text-[10px] font-bold text-[#00e65c]">
              CASH ON DELIVERY (COD)
            </span>
          </div>

          {/* BACK TO TOP */}
          <button
            onClick={scrollToTop}
            className="p-2.5 bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-[#00e65c] hover:border-[#00e65c] transition-colors"
            title="Back to Top"
            aria-label="Back to Top"
          >
            <ArrowUp size={16} />
          </button>
        </div>
      </div>
    </footer>
  );
};

