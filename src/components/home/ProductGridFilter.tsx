import React, { useState } from 'react';
import { ProductCard } from '../ui/ProductCard';
import { useShop } from '../../context/ShopContext';
import { ProductCategory } from '../../types';
import { Sparkles, Loader2, ChevronDown } from 'lucide-react';
import { ProductSkeleton } from '../common/ProductSkeleton';

export const ProductGridFilter: React.FC = () => {
  const { products, isLoadingProducts, selectedCategory, setSelectedCategory } = useShop();

  const [visibleCount, setVisibleCount] = useState<number>(8);

  const categories: { label: string; value: ProductCategory | 'all' }[] = [
    { label: 'ALL PRODUCTS', value: 'all' },
    { label: 'SHIRTS', value: 'shirts' },
    { label: 'CAPS', value: 'caps' },
    { label: 'JEANS & DENIM', value: 'jeans' },
    { label: 'NEW ARRIVALS', value: 'new-arrivals' },
    { label: 'BEST SELLERS', value: 'best-sellers' },
  ];

  const filteredProducts = products.filter((product) => {
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'new-arrivals') return product.isNew || product.category === 'new-arrivals';
    if (selectedCategory === 'best-sellers') return product.isBestSeller || product.category === 'best-sellers';
    return product.category === selectedCategory;
  });

  const displayedProducts = filteredProducts.slice(0, visibleCount);
  const hasMore = visibleCount < filteredProducts.length;

  const handleCategoryChange = (cat: ProductCategory | 'all') => {
    setSelectedCategory(cat);
    setVisibleCount(8);
  };

  return (
    <section id="products-section" className="py-16 sm:py-24 bg-[#080808] text-white border-b border-neutral-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* SECTION TITLE & CATEGORY FILTER TABS */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-[#00e65c] uppercase tracking-widest mb-2">
              <Sparkles size={14} />
              THE PREMIUM COLLECTION (FIRESTORE POWERED)
            </div>
            <h2 className="font-syne font-extrabold text-3xl sm:text-5xl uppercase tracking-tight text-white">
              FEATURED <span className="text-[#00e65c]">ARTICLES</span>
            </h2>
          </div>

          {/* FILTER BUTTON TABS */}
          <div
            role="tablist"
            aria-label="Product categories"
            className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none max-w-full"
          >
            {categories.map((cat) => {
              const isActive = selectedCategory === cat.value;
              return (
                <button
                  key={cat.value}
                  role="tab"
                  aria-selected={isActive}
                  aria-controls="product-grid"
                  onClick={() => handleCategoryChange(cat.value)}
                  className={`px-4 py-2.5 text-xs font-syne font-bold uppercase tracking-wider whitespace-nowrap border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00e65c] ${
                    isActive
                      ? 'bg-[#00e65c] text-black border-[#00e65c] shadow-lg scale-105'
                      : 'bg-neutral-900 text-neutral-300 border-neutral-800 hover:border-neutral-600 hover:text-white'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* LOADING SKELETON */}
        {isLoadingProducts ? (
          <ProductSkeleton count={8} />
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-16 bg-neutral-900/50 border border-neutral-800">
            <p className="font-syne font-bold text-lg uppercase text-neutral-300">
              NO PRODUCTS FOUND IN THIS CATEGORY
            </p>
            <button
              onClick={() => handleCategoryChange('all')}
              className="mt-4 bg-[#00e65c] text-black font-syne font-extrabold text-xs px-6 py-3 uppercase hover:bg-[#00ff66] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00e65c]"
            >
              SHOW ALL PRODUCTS
            </button>
          </div>
        ) : (
          <>
            {/* PRODUCT GRID */}
            <div id="product-grid" className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {displayedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* LOAD MORE / PAGINATION CONTROL */}
            {hasMore && (
              <div className="flex justify-center mt-12">
                <button
                  onClick={() => setVisibleCount((prev) => prev + 8)}
                  className="bg-neutral-900 text-white hover:text-[#00e65c] hover:border-[#00e65c] border border-neutral-800 font-syne font-bold text-xs uppercase tracking-widest px-8 py-4 flex items-center gap-2 transition-all hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00e65c]"
                >
                  <span>LOAD MORE PRODUCTS ({filteredProducts.length - visibleCount} REMAINING)</span>
                  <ChevronDown size={16} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};
