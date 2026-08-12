import React from 'react';
import { ProductCard } from '../ui/ProductCard';
import { Award, ArrowRight } from 'lucide-react';
import { useShop } from '../../context/ShopContext';

export const BestSellersSection: React.FC = () => {
  const { products, setSelectedCategory, cmsContent } = useShop();
  const cms = cmsContent?.bestSellers;

  if (cms?.enabled === false) return null;

  const count = cms?.displayCount || 4;
  const tagline = cms?.tagline || 'MOST WANTED GRAILS';
  const title = cms?.title || 'BEST SELLERS';
  const buttonText = cms?.buttonText || 'EXPLORE ALL BESTSELLERS';

  const bestSellers = products.filter((p) => p.isBestSeller || p.category === 'best-sellers').slice(0, count);

  const handleViewAll = () => {
    setSelectedCategory('best-sellers');
    const el = document.getElementById('products-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="py-16 sm:py-24 bg-black text-white border-b border-neutral-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-[#00e65c] uppercase tracking-widest mb-2">
              <Award size={14} />
              <span>{tagline}</span>
            </div>
            <h2 className="font-syne font-extrabold text-3xl sm:text-5xl uppercase tracking-tight text-white">
              {title}
            </h2>
          </div>

          <button
            onClick={handleViewAll}
            className="inline-flex items-center gap-2 font-syne font-extrabold text-xs text-[#00e65c] hover:text-white uppercase tracking-wider underline underline-offset-4 transition-colors"
          >
            <span>{buttonText}</span>
            <ArrowRight size={14} />
          </button>
        </div>

        {/* PRODUCT CARDS GRID */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {bestSellers.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
};
