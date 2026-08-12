import React from 'react';
import { ArrowRight, Flame, Zap } from 'lucide-react';
import { useShop } from '../../context/ShopContext';

export const HeroSection: React.FC = () => {
  const { setSelectedCategory, cmsContent } = useShop();
  const hero = cmsContent?.heroBanner;

  const handleShopNow = () => {
    setSelectedCategory('all');
    const targetLink = hero?.primaryButtonLink || '#products-section';
    if (targetLink.startsWith('#')) {
      const el = document.querySelector(targetLink);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else {
      const el = document.getElementById('products-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleExploreCollection = () => {
    const targetLink = hero?.secondaryButtonLink || '#lookbook-section';
    if (targetLink.startsWith('#')) {
      const el = document.querySelector(targetLink);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else {
      const el = document.getElementById('lookbook-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const bgImg = hero?.backgroundImage || 'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=2000&auto=format&fit=crop';
  const seasonBadge = hero?.seasonBadge || "METROPOLIS URBAN COLLECTION '26 — DROP 04 LIVE";
  const mainTitle1 = hero?.mainTitleLine1 || 'PREMIUM';
  const mainTitleHighlight = hero?.mainTitleHighlight || 'STREETWEAR';
  const subtitleUpper = hero?.subtitleUpper || 'WEAR THE BEST.';
  const subtitleHighlight = hero?.subtitleHighlight || 'FOR LESS.';
  const description = hero?.description || 'Elevated streetwear essentials, heavyweight boxy tees, unstructured trucker caps and raw denim cuts. Creative, bold, and strictly affordable.';
  const primaryBtn = hero?.primaryButtonText || 'SHOP NOW';
  const secondaryBtn = hero?.secondaryButtonText || 'EXPLORE COLLECTION';
  const highlights = hero?.featureHighlights && hero.featureHighlights.length > 0
    ? hero.featureHighlights
    : ['100% HEAVYWEIGHT COTTON', 'LIMITED EDITION DROPS', 'EXPRESS GLOBAL SHIPPING'];

  return (
    <section className="relative w-full min-h-[85vh] bg-black text-white flex items-center overflow-hidden border-b border-neutral-900">
      {/* BACKGROUND IMAGE WITH EDITORIAL OVERLAY */}
      <div className="absolute inset-0 z-0">
        <img
          src={bgImg}
          alt="Streetwear Editorial Hero"
          className="w-full h-full object-cover object-center opacity-45 scale-105 filter grayscale contrast-125 hover:scale-100 transition-transform duration-1000"
        />
        {/* Dark Vignette & Neon Gradient Accent */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/30" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#00e65c]/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* HERO CONTENT */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24 w-full">
        <div className="max-w-3xl">
          {/* SEASON BADGE */}
          {seasonBadge && (
            <div className="inline-flex items-center gap-2 bg-neutral-900/90 border border-neutral-800 text-[#00e65c] text-[11px] font-mono px-3.5 py-1.5 uppercase tracking-widest mb-6 backdrop-blur-md">
              <Flame size={14} className="text-[#00e65c] animate-pulse" />
              <span>{seasonBadge}</span>
            </div>
          )}

          {/* MAIN HEADING */}
          <h1 className="font-syne font-extrabold text-4xl sm:text-6xl md:text-7xl lg:text-8xl uppercase tracking-tighter text-white leading-[0.95] mb-4">
            {mainTitle1} <br />
            {mainTitleHighlight && (
              <span className="text-[#00e65c] font-graffiti text-5xl sm:text-7xl md:text-8xl lg:text-9xl transform -rotate-1 inline-block glow-green">
                {mainTitleHighlight}
              </span>
            )}
          </h1>

          {/* SUBTITLE */}
          <p className="font-syne font-bold text-lg sm:text-2xl text-neutral-300 uppercase tracking-wide mb-8 max-w-xl">
            {subtitleUpper} {subtitleHighlight && <span className="text-[#00e65c]">{subtitleHighlight}</span>}
          </p>

          <p className="text-xs sm:text-sm font-mono text-neutral-400 mb-10 max-w-lg leading-relaxed">
            {description}
          </p>

          {/* ACTION BUTTONS */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <button
              onClick={handleShopNow}
              className="bg-[#00e65c] text-black hover:bg-[#00ff66] font-syne font-extrabold text-sm px-8 py-4 uppercase tracking-wider flex items-center justify-center gap-3 transition-all shadow-xl hover:scale-105"
            >
              <span>{primaryBtn}</span>
              <ArrowRight size={18} />
            </button>

            <button
              onClick={handleExploreCollection}
              className="bg-neutral-900/80 hover:bg-black border border-neutral-700 hover:border-[#00e65c] text-white font-syne font-bold text-sm px-8 py-4 uppercase tracking-wider flex items-center justify-center gap-2 transition-all backdrop-blur-md"
            >
              <Zap size={16} className="text-[#00e65c]" />
              <span>{secondaryBtn}</span>
            </button>
          </div>

          {/* FEATURE HIGHLIGHTS BAR */}
          {highlights.length > 0 && (
            <div className="mt-16 pt-8 border-t border-neutral-800/80 flex flex-wrap gap-6 text-xs font-mono text-neutral-400">
              {highlights.map((feat, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-[#00e65c] rounded-full" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
