import React from 'react';
import { Sparkles, ArrowRight, Clock, Tag } from 'lucide-react';
import { useShop } from '../../context/ShopContext';

export const PromotionalBanner: React.FC = () => {
  const { cmsContent, setSelectedCategory } = useShop();
  const promo = cmsContent?.promotionalBanner;

  if (!promo || !promo.enabled) return null;

  const handleClick = () => {
    if (promo.buttonLink && promo.buttonLink.startsWith('#')) {
      const el = document.querySelector(promo.buttonLink);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else if (promo.buttonLink && promo.buttonLink.startsWith('/')) {
      setSelectedCategory('all');
      const el = document.getElementById('products-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else {
      setSelectedCategory('all');
      const el = document.getElementById('products-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="py-12 bg-neutral-950 text-white border-b border-neutral-900 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="relative bg-neutral-900 border border-neutral-800 overflow-hidden rounded-none p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-8 group">
          {/* Background Image */}
          {promo.image && (
            <div className="absolute inset-0 z-0">
              <img
                src={promo.image}
                alt="Promotional Campaign"
                className="w-full h-full object-cover object-center opacity-30 group-hover:scale-105 transition-transform duration-700 filter grayscale contrast-125"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" />
            </div>
          )}

          {/* Text Content */}
          <div className="relative z-10 max-w-2xl space-y-3 text-left">
            <div className="inline-flex items-center gap-2 bg-[#00e65c] text-black font-syne font-extrabold text-[10px] uppercase px-3 py-1 tracking-wider">
              <Tag size={12} />
              <span>{promo.badge || 'SPECIAL CAMPAIGN'}</span>
            </div>

            <h2 className="font-syne font-black text-2xl sm:text-4xl uppercase tracking-tight text-white leading-tight">
              {promo.title}
            </h2>

            <p className="font-mono text-xs text-neutral-300 leading-relaxed max-w-xl">
              {promo.subtitle}
            </p>

            {promo.expiryText && (
              <div className="flex items-center gap-2 text-[11px] font-mono text-[#00e65c]">
                <Clock size={14} />
                <span>{promo.expiryText}</span>
              </div>
            )}
          </div>

          {/* Action CTA Button */}
          <div className="relative z-10 shrink-0 w-full md:w-auto">
            <button
              onClick={handleClick}
              className="w-full md:w-auto bg-[#00e65c] text-black hover:bg-[#00ff66] font-syne font-extrabold text-xs uppercase px-8 py-4 tracking-wider flex items-center justify-center gap-2 transition-all shadow-xl hover:scale-105"
            >
              <span>{promo.buttonText || 'CLAIM OFFERS'}</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
