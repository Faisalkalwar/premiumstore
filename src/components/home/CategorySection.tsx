import React from 'react';
import { ArrowUpRight, Sparkles } from 'lucide-react';
import { CATEGORIES } from '../../data/categories';
import { useShop } from '../../context/ShopContext';
import { ProductCategory } from '../../types';

export const CategorySection: React.FC = () => {
  const { setSelectedCategory, selectedCategory, cmsContent } = useShop();
  const featCat = cmsContent?.featuredCategories;

  if (featCat?.enabled === false) return null;

  const categories = featCat?.categories && featCat.categories.length > 0
    ? featCat.categories
    : CATEGORIES;

  const tagline = featCat?.tagline || 'EXPLORE BY CATEGORY';
  const title = featCat?.title || 'STREETWEAR CATEGORIES';
  const subtitle = featCat?.subtitle || 'Discover curated streetwear apparel crafted for maximum comfort, durability and uncompromised style.';

  const handleSelect = (categoryId: string) => {
    setSelectedCategory(categoryId as ProductCategory);
    const el = document.getElementById('products-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="py-16 sm:py-24 bg-black text-white border-b border-neutral-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* SECTION HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-[#00e65c] uppercase tracking-widest mb-2">
              <Sparkles size={14} />
              <span>{tagline}</span>
            </div>
            <h2 className="font-syne font-extrabold text-3xl sm:text-5xl uppercase tracking-tight text-white">
              {title}
            </h2>
          </div>
          <p className="text-xs font-mono text-neutral-400 max-w-sm">
            {subtitle}
          </p>
        </div>

        {/* CATEGORIES GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat, idx) => {
            const isSelected = selectedCategory === (cat.linkCategory || cat.id);
            return (
              <div
                key={cat.id}
                onClick={() => handleSelect(cat.linkCategory || cat.id)}
                className={`group relative h-80 sm:h-96 bg-neutral-900 overflow-hidden cursor-pointer border transition-all duration-300 ${
                  isSelected
                    ? 'border-[#00e65c] ring-2 ring-[#00e65c]/50'
                    : 'border-neutral-800 hover:border-neutral-600'
                }`}
              >
                {/* Background Image */}
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-110 filter brightness-90 contrast-110"
                  loading="lazy"
                />

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent transition-opacity group-hover:opacity-90" />

                {/* Content Box */}
                <div className="absolute inset-0 p-6 flex flex-col justify-between z-10">
                  <div className="flex justify-between items-start">
                    <span className="bg-black/80 text-neutral-300 border border-neutral-700 font-mono text-[11px] px-2.5 py-1 uppercase backdrop-blur-md">
                      {cat.itemCount ? `${cat.itemCount}+ ARTICLES` : 'STREETWEAR'}
                    </span>
                    <div className="w-10 h-10 rounded-none bg-black/80 border border-neutral-700 text-white group-hover:bg-[#00e65c] group-hover:text-black group-hover:border-[#00e65c] transition-all flex items-center justify-center">
                      <ArrowUpRight size={20} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </div>
                  </div>

                  <div>
                    <h3 className="font-syne font-extrabold text-2xl sm:text-3xl text-white uppercase tracking-wider mb-1.5 group-hover:text-[#00e65c] transition-colors">
                      {cat.name}
                    </h3>
                    <p className="text-xs font-mono text-neutral-300 line-clamp-1">
                      {cat.tagline}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
