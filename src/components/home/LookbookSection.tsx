import React, { useState } from 'react';
import { Camera, Plus, ShoppingBag, Eye, X } from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { Product, formatPrice } from '../../types';

export const LookbookSection: React.FC = () => {
  const { setQuickViewProduct, addToCart, products, cmsContent } = useShop();
  const cms = cmsContent?.lookbook;

  const [activeLookIndex, setActiveLookIndex] = useState(0);
  const [activeHotspotProduct, setActiveHotspotProduct] = useState<Product | null>(null);

  if (cms?.enabled === false) return null;

  const tagline = cms?.tagline || 'EDITORIAL STREETWEAR LOOKBOOK';
  const title = cms?.title || 'SHOP THE LOOK';

  const looks = cms?.looks && cms.looks.length > 0
    ? cms.looks
    : [
        {
          id: 'look-1',
          season: 'METROPOLIS \'26',
          title: 'METROPOLIS INDUSTRIAL FIT',
          subtitle: 'Heavyweight Spray Tee paired with Vintage Acid Wash Denim and Premium Trucker Hat.',
          image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1200&auto=format&fit=crop',
          hotspots: [
            { id: 'hs-1', productId: 'p1', topPercent: 38, leftPercent: 52 },
            { id: 'hs-2', productId: 'p3', topPercent: 72, leftPercent: 48 },
          ],
        },
      ];

  const currentLook = looks[activeLookIndex] || looks[0];

  const handleHotspotClick = (productId: string) => {
    const found = products.find((p) => p.id === productId || p.sku === productId);
    if (found) {
      setActiveHotspotProduct(found);
    } else if (products.length > 0) {
      setActiveHotspotProduct(products[0]);
    }
  };

  return (
    <section id="lookbook-section" className="py-16 sm:py-24 bg-[#070707] text-white border-b border-neutral-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* SECTION HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-[#00e65c] uppercase tracking-widest mb-2">
              <Camera size={14} />
              <span>{tagline}</span>
            </div>
            <h2 className="font-syne font-extrabold text-3xl sm:text-5xl uppercase tracking-tight text-white">
              {title}
            </h2>
          </div>

          {/* LOOKBOOK SWITCHER TABS */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {looks.map((item, idx) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveLookIndex(idx);
                  setActiveHotspotProduct(null);
                }}
                className={`px-4 py-2 font-syne font-bold text-xs uppercase transition-all whitespace-nowrap border ${
                  activeLookIndex === idx
                    ? 'bg-[#00e65c] text-black border-[#00e65c]'
                    : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-white'
                }`}
              >
                {item.season}
              </button>
            ))}
          </div>
        </div>

        {/* LOOKBOOK DISPLAY STAGE */}
        <div className="relative bg-neutral-950 border border-neutral-800 overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[500px] lg:min-h-[600px]">
          {/* IMAGE WITH HOTSPOTS */}
          <div className="lg:col-span-8 relative aspect-[4/5] lg:aspect-auto w-full bg-neutral-900 overflow-hidden">
            <img
              src={currentLook.image}
              alt={currentLook.title}
              className="w-full h-full object-cover object-center filter grayscale contrast-110"
            />
            <div className="absolute inset-0 bg-black/20" />

            {/* HOTSPOT PINS */}
            {currentLook.hotspots.map((hs) => {
              const product = products.find((p) => p.id === hs.productId || p.sku === hs.productId) || products[0];
              if (!product) return null;
              const isSelected = activeHotspotProduct?.id === product.id;

              return (
                <div
                  key={hs.id}
                  className="absolute z-20 transform -translate-x-1/2 -translate-y-1/2"
                  style={{ top: `${hs.topPercent}%`, left: `${hs.leftPercent}%` }}
                >
                  <button
                    onClick={() => handleHotspotClick(hs.productId)}
                    className={`relative w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                      isSelected
                        ? 'bg-[#00e65c] text-black scale-125 shadow-[0_0_15px_#00e65c]'
                        : 'bg-black/80 text-[#00e65c] hover:bg-[#00e65c] hover:text-black border border-[#00e65c] backdrop-blur-md'
                    }`}
                    title={`Tag: ${product.name}`}
                  >
                    <Plus size={16} className="animate-pulse" />
                  </button>
                </div>
              );
            })}

            {/* OVERLAY LOOK TITLE */}
            <div className="absolute bottom-6 left-6 z-10">
              <p className="text-xs font-mono text-[#00e65c] uppercase mb-1">
                {currentLook.season}
              </p>
              <h3 className="font-syne font-extrabold text-2xl sm:text-3xl text-white uppercase tracking-wider">
                {currentLook.title}
              </h3>
            </div>
          </div>

          {/* RIGHT SIDE: FEATURED HOTSPOT PREVIEW PANEL */}
          <div className="lg:col-span-4 p-6 sm:p-8 bg-[#0a0a0a] flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-neutral-800">
            <div>
              <p className="text-xs font-mono text-neutral-400 uppercase tracking-widest mb-1">
                FEATURED LOOKBOOK ITEMS
              </p>
              <h4 className="font-syne font-bold text-lg text-white uppercase mb-6">
                CLICK + PINS ON IMAGE TO SHOP
              </h4>

              {activeHotspotProduct ? (
                <div className="bg-[#111111] border border-[#00e65c] p-4 relative animate-fadeIn">
                  <button
                    onClick={() => setActiveHotspotProduct(null)}
                    className="absolute top-2 right-2 text-neutral-400 hover:text-white"
                  >
                    <X size={16} />
                  </button>

                  <div className="flex gap-4 items-center mb-4">
                    <img
                      src={activeHotspotProduct.image}
                      alt={activeHotspotProduct.name}
                      className="w-20 h-24 object-cover bg-neutral-900"
                    />
                    <div>
                      <span className="text-[10px] font-mono text-[#00e65c] uppercase">
                        TAGGED PRODUCT
                      </span>
                      <h5 className="font-syne font-bold text-sm text-white uppercase line-clamp-1">
                        {activeHotspotProduct.name}
                      </h5>
                      <span className="font-syne font-extrabold text-base text-[#00e65c]">
                        {formatPrice(activeHotspotProduct.price)}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => addToCart(activeHotspotProduct, activeHotspotProduct.sizes[0] || 'M', activeHotspotProduct.colors[0] || 'Black')}
                      className="flex-1 bg-[#00e65c] text-black font-syne font-extrabold py-2 text-xs uppercase flex items-center justify-center gap-1.5 hover:bg-[#00ff66]"
                    >
                      <ShoppingBag size={14} />
                      ADD TO CART
                    </button>
                    <button
                      onClick={() => setQuickViewProduct(activeHotspotProduct)}
                      className="bg-neutral-800 text-white p-2 hover:bg-neutral-700"
                      title="Quick View"
                    >
                      <Eye size={16} />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-8 border border-dashed border-neutral-800 text-center text-neutral-500 font-mono text-xs">
                  Select any green (+) pin on the lookbook photo to inspect and buy tagged streetwear apparel.
                </div>
              )}
            </div>

            <div className="mt-8 pt-6 border-t border-neutral-900">
              <p className="text-xs font-mono text-neutral-400">
                {currentLook.subtitle}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
