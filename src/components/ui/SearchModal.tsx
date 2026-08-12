import React from 'react';
import { Search, X, TrendingUp, Sparkles } from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { ProductCard } from './ProductCard';

const TRENDING_TAGS = [
  'Oversized Tees',
  'Trucker Caps',
  'Baggy Denim',
  'Graffiti Hoodie',
  'Acid Wash',
  'Bomber Jacket',
];

export const SearchModal: React.FC = () => {
  const {
    searchQuery,
    setSearchQuery,
    isSearchOpen,
    setIsSearchOpen,
    searchResults,
  } = useShop();

  if (!isSearchOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md animate-fadeIn flex flex-col" role="dialog" aria-modal="true" aria-label="Search Catalog Modal">
      {/* HEADER BAR */}
      <div className="p-4 sm:p-6 border-b border-neutral-800 max-w-7xl mx-auto w-full flex items-center justify-between gap-4">
        {/* Search Input Box */}
        <div className="flex-1 relative flex items-center">
          <Search size={22} className="absolute left-4 text-[#00e65c]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="SEARCH STREETWEAR, SHIRTS, CAPS, DENIM..."
            className="w-full bg-neutral-900 border border-neutral-800 text-white font-syne font-bold text-sm sm:text-lg pl-12 pr-10 py-3.5 focus:outline-none focus:border-[#00e65c] uppercase placeholder:text-neutral-600"
            autoFocus
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 text-neutral-400 hover:text-white"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* CLOSE SEARCH */}
        <button
          onClick={() => {
            setIsSearchOpen(false);
            setSearchQuery('');
          }}
          className="p-3 bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white hover:border-neutral-600 transition-colors"
          aria-label="Close search"
        >
          <X size={20} />
        </button>
      </div>

      {/* SEARCH CONTENT CONTAINER */}
      <div className="flex-1 overflow-y-auto max-w-7xl mx-auto w-full p-6">
        {!searchQuery.trim() ? (
          <div className="py-8">
            <div className="flex items-center gap-2 text-xs font-mono text-neutral-400 uppercase mb-4">
              <TrendingUp size={16} className="text-[#00e65c]" />
              TRENDING STREETWEAR SEARCHES
            </div>

            <div className="flex flex-wrap gap-2.5 mb-12">
              {TRENDING_TAGS.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSearchQuery(tag)}
                  className="bg-neutral-900 border border-neutral-800 hover:border-[#00e65c] hover:text-[#00e65c] text-white font-syne font-semibold text-xs px-4 py-2.5 uppercase transition-colors flex items-center gap-2"
                >
                  <Sparkles size={12} className="text-[#00e65c]" />
                  {tag}
                </button>
              ))}
            </div>

            <div className="text-center py-12 border-t border-neutral-900">
              <p className="font-syne font-bold text-sm text-neutral-400 uppercase tracking-widest">
                PREMIUM STORE SEARCH ENGINE
              </p>
              <p className="text-xs font-mono text-neutral-600 mt-1">
                Type keywords like &quot;shirts&quot;, &quot;cargo&quot;, &quot;caps&quot; or &quot;hoodie&quot; to discover live streetwear drops.
              </p>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-6 pb-2 border-b border-neutral-800">
              <h3 className="font-syne font-bold text-sm uppercase text-neutral-300 tracking-wider">
                SEARCH RESULTS FOR &quot;{searchQuery}&quot; ({searchResults.length})
              </h3>
            </div>

            {searchResults.length === 0 ? (
              <div className="text-center py-16">
                <p className="font-syne font-bold text-lg text-neutral-300 mb-2 uppercase">
                  NO PRODUCTS FOUND
                </p>
                <p className="text-xs font-mono text-neutral-500 max-w-md mx-auto">
                  We couldn&apos;t find matching articles for &quot;{searchQuery}&quot;. Try searching for &quot;caps&quot;, &quot;denim&quot;, or &quot;graphic tee&quot;.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {searchResults.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
