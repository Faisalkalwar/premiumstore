import React, { useState, useEffect } from 'react';
import {
  Heart,
  ShoppingBag,
  Zap,
  Share2,
  Check,
  Copy,
  Ruler,
  Truck,
  RotateCcw,
  ShieldCheck,
  Star,
  ChevronRight,
  ChevronLeft,
  X,
  ZoomIn,
  AlertCircle,
  ArrowLeft,
  Sparkles,
  RefreshCw,
  Clock,
  Tag,
  Package,
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { Product, formatPrice } from '../../types';
import { getProductBySlug } from '../../services/firebaseService';
import { ProductCard } from '../ui/ProductCard';
import { SizeGuideModal } from './SizeGuideModal';
import { SEO } from '../common/SEO';

export const ProductDetailView: React.FC = () => {
  const {
    selectedProductSlug,
    products,
    navigateTo,
    navigateToProduct,
    addToCart,
    toggleWishlist,
    isInWishlist,
    recentlyViewed,
    addRecentlyViewed,
    showToast,
    setIsCartOpen,
  } = useShop();

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Gallery & Zoom Lightbox state
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState<boolean>(false);

  // Variant selections
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<{ name: string; hex: string }>({
    name: 'Black',
    hex: '#000000',
  });
  const [quantity, setQuantity] = useState<number>(1);

  // UI Accordions & Modals
  const [activeTab, setActiveTab] = useState<'desc' | 'specs' | 'care' | 'shipping' | 'returns'>('desc');
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [restockEmail, setRestockEmail] = useState<string>('');
  const [isRestockSubmitted, setIsRestockSubmitted] = useState<boolean>(false);

  // Fetch product from Firestore or Context cache
  useEffect(() => {
    let isMounted = true;

    async function loadProduct() {
      if (!selectedProductSlug) {
        setIsLoading(false);
        setError('No product specified');
        return;
      }

      setIsLoading(true);
      setError(null);
      setSelectedImageIndex(0);

      try {
        // 1. Try finding in context cached products first
        const cached = products.find(
          (p) => p.slug === selectedProductSlug || p.id === selectedProductSlug
        );

        if (cached) {
          if (isMounted) {
            setProduct(cached);
            setSelectedSize(cached.sizes[0] || 'M');
            if (cached.colors && cached.colors.length > 0) {
              setSelectedColor(cached.colors[0]);
            }
            addRecentlyViewed(cached);
            setIsLoading(false);
          }
          return;
        }

        // 2. Otherwise fetch directly from Firestore
        const fp = await getProductBySlug(selectedProductSlug);
        if (fp) {
          const { mapFirestoreProductToProduct } = await import('../../types');
          const mappedProduct = mapFirestoreProductToProduct(fp);
          if (isMounted) {
            setProduct(mappedProduct);
            setSelectedSize(mappedProduct.sizes[0] || 'M');
            if (mappedProduct.colors && mappedProduct.colors.length > 0) {
              setSelectedColor(mappedProduct.colors[0]);
            }
            addRecentlyViewed(mappedProduct);
            setIsLoading(false);
          }
        } else {
          if (isMounted) {
            setProduct(null);
            setError('PRODUCT_NOT_FOUND');
            setIsLoading(false);
          }
        }
      } catch (err: unknown) {
        console.error('Error loading product detail:', err);
        if (isMounted) {
          setProduct(null);
          setError(err instanceof Error ? err.message : 'Failed to load product details');
          setIsLoading(false);
        }
      }
    }

    loadProduct();

    return () => {
      isMounted = false;
    };
  }, [selectedProductSlug, products]);

  // Handle Share Links
  const handleCopyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    showToast('Product link copied to clipboard!');
    setTimeout(() => setCopiedLink(false), 3000);
  };

  const handleShareTwitter = () => {
    if (!product) return;
    const text = encodeURIComponent(`Check out ${product.name} on Premium Store!`);
    const url = encodeURIComponent(window.location.href);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
  };

  const handleShareWhatsApp = () => {
    if (!product) return;
    const text = encodeURIComponent(`Check out ${product.name} on Premium Store: ${window.location.href}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleRestockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!restockEmail) return;
    setIsRestockSubmitted(true);
    showToast(`Subscribed ${restockEmail} for restock alerts!`);
  };

  // Add to cart & Buy Now
  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product, selectedSize, selectedColor.name, quantity);
  };

  const handleBuyNow = () => {
    if (!product) return;
    addToCart(product, selectedSize, selectedColor.name, quantity);
    setIsCartOpen(true);
  };

  // Gallery Images computation
  const galleryImages = React.useMemo(() => {
    if (!product) return [];
    if (product.images && product.images.length > 0) {
      return product.images;
    }
    const base = [product.image];
    if (product.hoverImage && product.hoverImage !== product.image) {
      base.push(product.hoverImage);
    }
    return base;
  }, [product]);

  // Related products
  const relatedProducts = React.useMemo(() => {
    if (!product) return [];
    return products
      .filter((p) => p.id !== product.id && (p.category === product.category || p.tags?.some((t) => product.tags?.includes(t))))
      .slice(0, 4);
  }, [product, products]);

  // Loading Skeleton State
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-pulse">
        <div className="h-4 bg-neutral-900 w-48 mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-7 space-y-4">
            <div className="aspect-[3/4] bg-neutral-900 w-full" />
            <div className="grid grid-cols-4 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="aspect-square bg-neutral-900" />
              ))}
            </div>
          </div>
          <div className="lg:col-span-5 space-y-6">
            <div className="h-6 bg-neutral-900 w-3/4" />
            <div className="h-10 bg-neutral-900 w-full" />
            <div className="h-8 bg-neutral-900 w-1/3" />
            <div className="h-24 bg-neutral-900 w-full" />
            <div className="h-12 bg-neutral-900 w-full" />
          </div>
        </div>
      </div>
    );
  }

  // Error or 404 Not Found State
  if (error === 'PRODUCT_NOT_FOUND' || !product) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 py-16 bg-black">
        <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-full mb-6 text-neutral-400">
          <AlertCircle size={48} className="text-[#00e65c]" />
        </div>
        <h1 className="font-syne font-extrabold text-2xl sm:text-4xl text-white mb-3 uppercase tracking-wider">
          PRODUCT NOT FOUND
        </h1>
        <p className="text-neutral-400 font-mono text-xs sm:text-sm max-w-md mb-8 leading-relaxed">
          The requested product slug ({selectedProductSlug}) does not exist or may have been archived from our drop catalog.
        </p>
        <button
          onClick={() => navigateTo('home')}
          className="bg-[#00e65c] text-black hover:bg-[#00ff66] font-syne font-bold px-8 py-3.5 text-xs uppercase tracking-widest flex items-center gap-2 transition-all shadow-lg"
        >
          <ArrowLeft size={16} /> RETURN TO STORE CATALOG
        </button>
      </div>
    );
  }

  const isOutOfStock = product.stock === 0;
  const inWishlist = isInWishlist(product.id);

  return (
    <div className="bg-black text-white min-h-screen pb-24">
      {/* PRODUCT METADATA & STRUCTURED DATA */}
      <SEO
        title={product.name}
        description={product.description}
        image={galleryImages[0] || product.image}
        type="product"
        productData={{
          name: product.name,
          description: product.description,
          image: galleryImages[0] || product.image,
          price: product.price,
          currency: 'USD',
          sku: product.sku || product.id,
          inStock: !isOutOfStock,
          category: product.category,
        }}
      />

      {/* BREADCRUMBS */}
      <nav className="border-b border-neutral-800/80 bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center gap-2 text-[11px] font-mono text-neutral-400 uppercase tracking-wider overflow-x-auto">
          <button
            onClick={() => navigateTo('home')}
            className="hover:text-[#00e65c] transition-colors whitespace-nowrap"
          >
            HOME
          </button>
          <ChevronRight size={12} className="text-neutral-600 flex-shrink-0" />
          <button
            onClick={() => navigateTo('home')}
            className="hover:text-[#00e65c] transition-colors whitespace-nowrap"
          >
            {product.category}
          </button>
          <ChevronRight size={12} className="text-neutral-600 flex-shrink-0" />
          <span className="text-white font-bold truncate max-w-[200px] sm:max-w-xs">
            {product.name}
          </span>
        </div>
      </nav>

      {/* MAIN PRODUCT DETAIL SECTION */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 lg:pt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          
          {/* LEFT COLUMN: IMAGE GALLERY & LIGHTBOX TRIGGER */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            {/* LARGE MAIN IMAGE DISPLAY */}
            <div className="relative aspect-[3/4] w-full bg-[#0d0d0d] border border-neutral-800 overflow-hidden group cursor-zoom-in">
              {/* BADGES */}
              <div className="absolute top-4 left-4 z-10 flex flex-col gap-2 items-start pointer-events-none">
                {product.discountPercent && (
                  <span className="bg-[#00e65c] text-black font-syne font-extrabold text-xs uppercase tracking-wider px-3 py-1">
                    -{product.discountPercent}% OFF
                  </span>
                )}
                {product.isNew && (
                  <span className="bg-white text-black font-syne font-extrabold text-xs uppercase tracking-wider px-3 py-1">
                    NEW DROP
                  </span>
                )}
                {product.isBestSeller && (
                  <span className="bg-neutral-900 border border-neutral-700 text-neutral-200 font-syne font-bold text-xs uppercase tracking-wider px-3 py-1">
                    BESTSELLER
                  </span>
                )}
              </div>

              {/* MAIN IMAGE */}
              <img
                src={galleryImages[selectedImageIndex] || product.image}
                alt={product.name}
                className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                onClick={() => setIsLightboxOpen(true)}
              />

              {/* ZOOM OVERLAY BUTTON */}
              <button
                onClick={() => setIsLightboxOpen(true)}
                className="absolute bottom-4 right-4 bg-black/80 hover:bg-black text-white hover:text-[#00e65c] border border-neutral-700 p-3 backdrop-blur-md transition-all flex items-center gap-2 text-xs font-mono uppercase tracking-wider"
                title="Click to view full image lightbox"
              >
                <ZoomIn size={16} />
                <span>FULLSCREEN ZOOM</span>
              </button>
            </div>

            {/* THUMBNAIL GALLERY STRIP */}
            {galleryImages.length > 1 && (
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                {galleryImages.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`relative aspect-square bg-[#0d0d0d] border overflow-hidden transition-all ${
                      selectedImageIndex === idx
                        ? 'border-[#00e65c] ring-2 ring-[#00e65c]/30 scale-[0.98]'
                        : 'border-neutral-800 opacity-70 hover:opacity-100 hover:border-neutral-600'
                    }`}
                  >
                    <img
                      src={imgUrl}
                      alt={`${product.name} view ${idx + 1}`}
                      className="w-full h-full object-cover object-center"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: PRODUCT INFO & BUYING CONTROLS */}
          <div className="lg:col-span-5 flex flex-col space-y-6">
            {/* BRAND EYEBROW */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-[#00e65c] tracking-widest uppercase flex items-center gap-1.5">
                <Sparkles size={14} /> PREMIUM STORE // OFFICIAL DROP
              </span>
              <span className="text-xs font-mono text-neutral-500 uppercase">
                SKU: {product.sku || `PS-${product.id.slice(0, 6)}`}
              </span>
            </div>

            {/* TITLE */}
            <h1 className="font-syne font-extrabold text-2xl sm:text-3xl lg:text-4xl text-white uppercase tracking-wide leading-tight">
              {product.name}
            </h1>

            {/* REVIEWS & RATING */}
            <div className="flex items-center gap-3 border-b border-neutral-800 pb-4 text-xs font-mono">
              <div className="flex items-center gap-1 text-amber-400">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} size={14} className="fill-amber-400" />
                ))}
              </div>
              <span className="text-white font-bold">{product.rating} / 5.0</span>
              <span className="text-neutral-500">({product.reviewsCount} Customer Reviews)</span>
            </div>

            {/* PRICE & DISCOUNTS */}
            <div className="flex items-baseline gap-4">
              <span className="font-syne font-extrabold text-3xl sm:text-4xl text-[#00e65c]">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && (
                <span className="font-mono text-lg text-neutral-500 line-through">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
              {product.discountPercent && (
                <span className="bg-[#00e65c]/10 text-[#00e65c] border border-[#00e65c]/30 font-mono text-xs font-bold px-2.5 py-1 uppercase">
                  SAVE {product.discountPercent}%
                </span>
              )}
            </div>

            {/* STOCK STATUS BANNER */}
            <div className="flex items-center gap-2 p-3 bg-neutral-950 border border-neutral-800 text-xs font-mono">
              {!isOutOfStock ? (
                <>
                  <span className="w-2.5 h-2.5 rounded-full bg-[#00e65c] animate-pulse" />
                  <span className="text-neutral-200 uppercase font-bold">
                    IN STOCK & READY TO SHIP
                  </span>
                  <span className="text-neutral-500 ml-auto">
                    ({product.stock || 18} remaining)
                  </span>
                </>
              ) : (
                <>
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <span className="text-rose-400 uppercase font-bold">
                    CURRENTLY OUT OF STOCK
                  </span>
                </>
              )}
            </div>

            {/* COLOR SELECTOR */}
            {product.colors && product.colors.length > 0 && (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-neutral-300 font-bold uppercase">
                    COLOR: <span className="text-[#00e65c]">{selectedColor.name}</span>
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  {product.colors.map((color) => (
                    <button
                      key={color.name}
                      onClick={() => setSelectedColor(color)}
                      className={`relative w-8 h-8 rounded-full border transition-all ${
                        selectedColor.name === color.name
                          ? 'border-[#00e65c] ring-2 ring-[#00e65c]/40 scale-110'
                          : 'border-neutral-700 hover:border-white'
                      }`}
                      style={{ backgroundColor: color.hex }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* SIZE SELECTOR & SIZE GUIDE TRIGGER */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-neutral-300 font-bold uppercase">
                  SELECT SIZE: <span className="text-[#00e65c]">{selectedSize}</span>
                </span>
                <button
                  onClick={() => setIsSizeGuideOpen(true)}
                  className="text-neutral-400 hover:text-[#00e65c] uppercase underline flex items-center gap-1 transition-colors"
                >
                  <Ruler size={14} /> SIZE GUIDE
                </button>
              </div>

              <div className="grid grid-cols-5 gap-2">
                {product.sizes.map((size) => {
                  const isSelected = selectedSize === size;
                  return (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      disabled={isOutOfStock}
                      className={`py-3 text-xs font-mono font-bold uppercase border transition-all ${
                        isSelected
                          ? 'bg-[#00e65c] text-black border-[#00e65c] shadow-lg'
                          : 'bg-neutral-900 text-white border-neutral-800 hover:border-neutral-600'
                      } ${isOutOfStock ? 'opacity-40 cursor-not-allowed' : ''}`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* QUANTITY SELECTOR */}
            {!isOutOfStock && (
              <div className="space-y-2">
                <span className="text-xs font-mono text-neutral-300 font-bold uppercase">
                  QUANTITY:
                </span>
                <div className="flex items-center w-36 bg-neutral-900 border border-neutral-800">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-10 py-2.5 text-neutral-400 hover:text-white font-mono font-bold"
                  >
                    -
                  </button>
                  <span className="flex-1 text-center font-mono font-bold text-sm text-white">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(product.stock || 20, q + 1))}
                    className="w-10 py-2.5 text-neutral-400 hover:text-white font-mono font-bold"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {/* OUT OF STOCK RESTOCK SUBSCRIPTION FORM */}
            {isOutOfStock ? (
              <div className="p-4 bg-neutral-900 border border-neutral-800 space-y-3">
                <p className="text-xs font-mono text-neutral-300 uppercase font-bold">
                  GET NOTIFIED WHEN RESTOCKED:
                </p>
                {!isRestockSubmitted ? (
                  <form onSubmit={handleRestockSubmit} className="flex gap-2">
                    <input
                      type="email"
                      required
                      placeholder="ENTER YOUR EMAIL..."
                      value={restockEmail}
                      onChange={(e) => setRestockEmail(e.target.value)}
                      className="flex-1 bg-black border border-neutral-700 px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#00e65c]"
                    />
                    <button
                      type="submit"
                      className="bg-[#00e65c] text-black font-syne font-bold px-4 text-xs uppercase"
                    >
                      NOTIFY ME
                    </button>
                  </form>
                ) : (
                  <p className="text-xs font-mono text-[#00e65c] flex items-center gap-2">
                    <Check size={14} /> RESTOCK ALERT ACTIVATED FOR {restockEmail}!
                  </p>
                )}
              </div>
            ) : (
              /* PRIMARY ACTION BUTTONS: ADD TO CART & BUY NOW */
              <div className="space-y-3 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={handleAddToCart}
                    className="w-full bg-[#00e65c] text-black hover:bg-[#00ff66] font-syne font-extrabold py-4 text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-xl"
                  >
                    <ShoppingBag size={16} />
                    ADD TO CART
                  </button>

                  <button
                    onClick={handleBuyNow}
                    className="w-full bg-white text-black hover:bg-neutral-200 font-syne font-extrabold py-4 text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-xl"
                  >
                    <Zap size={16} className="fill-black" />
                    BUY IT NOW
                  </button>
                </div>

                {/* WISHLIST TOGGLE */}
                <button
                  onClick={() => toggleWishlist(product)}
                  className={`w-full py-3 px-4 border font-syne font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                    inWishlist
                      ? 'bg-rose-500/10 text-rose-400 border-rose-500/40'
                      : 'bg-neutral-900 text-neutral-300 border-neutral-800 hover:border-neutral-600 hover:text-white'
                  }`}
                >
                  <Heart size={16} className={inWishlist ? 'fill-rose-500 text-rose-500' : ''} />
                  <span>{inWishlist ? 'SAVED IN WISHLIST' : 'ADD TO WISHLIST'}</span>
                </button>
              </div>
            )}

            {/* TRUST BADGES */}
            <div className="grid grid-cols-3 gap-2 pt-4 border-t border-neutral-800/80 text-[10px] font-mono text-neutral-400 text-center">
              <div className="p-2.5 bg-neutral-950 border border-neutral-800/60 flex flex-col items-center gap-1">
                <Truck size={16} className="text-[#00e65c]" />
                <span>EXPRESS SHIPPING</span>
              </div>
              <div className="p-2.5 bg-neutral-950 border border-neutral-800/60 flex flex-col items-center gap-1">
                <RotateCcw size={16} className="text-[#00e65c]" />
                <span>30-DAY RETURNS</span>
              </div>
              <div className="p-2.5 bg-neutral-950 border border-neutral-800/60 flex flex-col items-center gap-1">
                <ShieldCheck size={16} className="text-[#00e65c]" />
                <span>AUTHENTIC GUARANTEE</span>
              </div>
            </div>

            {/* SHARE BUTTONS */}
            <div className="pt-2 flex items-center justify-between border-t border-neutral-800 text-xs font-mono">
              <span className="text-neutral-400 uppercase font-bold flex items-center gap-1.5">
                <Share2 size={14} /> SHARE THIS ITEM:
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyLink}
                  className="p-2 bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-[#00e65c] transition-colors"
                  title="Copy direct product link"
                >
                  {copiedLink ? <Check size={14} className="text-[#00e65c]" /> : <Copy size={14} />}
                </button>
                <button
                  onClick={handleShareTwitter}
                  className="px-3 py-1.5 bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-[#00e65c] transition-colors text-[11px] font-bold"
                >
                  X / TWITTER
                </button>
                <button
                  onClick={handleShareWhatsApp}
                  className="px-3 py-1.5 bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-[#00e65c] transition-colors text-[11px] font-bold"
                >
                  WHATSAPP
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* ACCORDION / TABBED SPECIFICATIONS & INFORMATION */}
        <div className="mt-16 border-t border-neutral-800 pt-10">
          <div className="flex items-center gap-2 border-b border-neutral-800 overflow-x-auto">
            <button
              onClick={() => setActiveTab('desc')}
              className={`pb-4 px-4 font-syne font-bold text-xs uppercase tracking-wider transition-all whitespace-nowrap border-b-2 ${
                activeTab === 'desc'
                  ? 'border-[#00e65c] text-[#00e65c]'
                  : 'border-transparent text-neutral-400 hover:text-white'
              }`}
            >
              PRODUCT OVERVIEW
            </button>
            <button
              onClick={() => setActiveTab('specs')}
              className={`pb-4 px-4 font-syne font-bold text-xs uppercase tracking-wider transition-all whitespace-nowrap border-b-2 ${
                activeTab === 'specs'
                  ? 'border-[#00e65c] text-[#00e65c]'
                  : 'border-transparent text-neutral-400 hover:text-white'
              }`}
            >
              MATERIAL & SPECS
            </button>
            <button
              onClick={() => setActiveTab('care')}
              className={`pb-4 px-4 font-syne font-bold text-xs uppercase tracking-wider transition-all whitespace-nowrap border-b-2 ${
                activeTab === 'care'
                  ? 'border-[#00e65c] text-[#00e65c]'
                  : 'border-transparent text-neutral-400 hover:text-white'
              }`}
            >
              CARE INSTRUCTIONS
            </button>
            <button
              onClick={() => setActiveTab('shipping')}
              className={`pb-4 px-4 font-syne font-bold text-xs uppercase tracking-wider transition-all whitespace-nowrap border-b-2 ${
                activeTab === 'shipping'
                  ? 'border-[#00e65c] text-[#00e65c]'
                  : 'border-transparent text-neutral-400 hover:text-white'
              }`}
            >
              SHIPPING & DELIVERY
            </button>
            <button
              onClick={() => setActiveTab('returns')}
              className={`pb-4 px-4 font-syne font-bold text-xs uppercase tracking-wider transition-all whitespace-nowrap border-b-2 ${
                activeTab === 'returns'
                  ? 'border-[#00e65c] text-[#00e65c]'
                  : 'border-transparent text-neutral-400 hover:text-white'
              }`}
            >
              RETURNS & EXCHANGES
            </button>
          </div>

          <div className="py-8 text-neutral-300 text-sm leading-relaxed max-w-4xl">
            {activeTab === 'desc' && (
              <div className="space-y-4">
                <p className="text-base font-sans text-neutral-200">
                  {product.description ||
                    'Engineered for maximum street impact, this garment incorporates custom heavyweight construction, precision dropped shoulders, and subtle branding tags.'}
                </p>
                {product.tags && product.tags.length > 0 && (
                  <div className="pt-4 flex flex-wrap gap-2">
                    {product.tags.map((tag) => (
                      <span
                        key={tag}
                        className="bg-neutral-900 border border-neutral-800 text-neutral-400 text-xs font-mono px-3 py-1 uppercase"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'specs' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono text-xs">
                <div className="p-4 bg-neutral-900/60 border border-neutral-800 space-y-2">
                  <span className="text-[#00e65c] font-bold uppercase">FABRIC / COMPOSITION:</span>
                  <p className="text-neutral-200">{product.fabric || '100% Premium Heavyweight Organic Cotton (320 GSM)'}</p>
                </div>
                <div className="p-4 bg-neutral-900/60 border border-neutral-800 space-y-2">
                  <span className="text-[#00e65c] font-bold uppercase">SILHOUETTE / FIT:</span>
                  <p className="text-neutral-200">{product.fit || 'Oversized Boxy Silhouette with Dropped Shoulders'}</p>
                </div>
              </div>
            )}

            {activeTab === 'care' && (
              <p className="font-mono text-xs leading-relaxed text-neutral-300">
                {product.care ||
                  'Machine wash cold with like colors inside out. Do not bleach. Lay flat to dry or tumble dry low. Cool iron on reverse.'}
              </p>
            )}

            {activeTab === 'shipping' && (
              <p className="font-mono text-xs leading-relaxed text-neutral-300">
                {product.shippingInfo ||
                  'Standard dispatch within 24 hours. Free express shipping on orders over Rs. 3,500.'}
              </p>
            )}

            {activeTab === 'returns' && (
              <p className="font-mono text-xs leading-relaxed text-neutral-300">
                {product.returnInfo ||
                  '30-day effortless return and exchange policy. Items must be unworn, unwashed with original hangtags attached.'}
              </p>
            )}
          </div>
        </div>

        {/* RELATED PRODUCTS */}
        {relatedProducts.length > 0 && (
          <div className="mt-20 border-t border-neutral-800 pt-12">
            <div className="flex items-center justify-between mb-8">
              <div>
                <span className="text-xs font-mono text-[#00e65c] uppercase tracking-wider">
                  COMPLETE THE LOOK
                </span>
                <h2 className="font-syne font-extrabold text-xl sm:text-2xl text-white uppercase tracking-wider">
                  RELATED DROPS
                </h2>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {relatedProducts.map((rel) => (
                <ProductCard key={rel.id} product={rel} />
              ))}
            </div>
          </div>
        )}

        {/* RECENTLY VIEWED PRODUCTS */}
        {recentlyViewed.length > 1 && (
          <div className="mt-20 border-t border-neutral-800 pt-12">
            <div className="flex items-center justify-between mb-8">
              <div>
                <span className="text-xs font-mono text-neutral-400 uppercase tracking-wider">
                  YOUR SESSION HISTORY
                </span>
                <h2 className="font-syne font-extrabold text-xl sm:text-2xl text-white uppercase tracking-wider">
                  RECENTLY VIEWED
                </h2>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {recentlyViewed
                .filter((rv) => rv.id !== product.id)
                .slice(0, 4)
                .map((rv) => (
                  <ProductCard key={rv.id} product={rv} />
                ))}
            </div>
          </div>
        )}
      </div>

      {/* FULLSCREEN LIGHTBOX / ZOOM MODAL */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-between p-4 sm:p-8 animate-fadeIn">
          {/* LIGHTBOX HEADER */}
          <div className="w-full max-w-7xl flex items-center justify-between z-10 text-xs font-mono text-neutral-400">
            <span>
              {product.name} ({selectedImageIndex + 1} / {galleryImages.length})
            </span>
            <button
              onClick={() => setIsLightboxOpen(false)}
              className="p-2.5 bg-neutral-900 border border-neutral-800 text-white hover:text-[#00e65c] transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* LIGHTBOX IMAGE & NAVIGATION */}
          <div className="relative flex-1 w-full max-w-5xl flex items-center justify-center my-4 overflow-hidden">
            <img
              src={galleryImages[selectedImageIndex] || product.image}
              alt={product.name}
              className="max-h-[80vh] max-w-full object-contain cursor-zoom-out"
              onClick={() => setIsLightboxOpen(false)}
            />

            {galleryImages.length > 1 && (
              <>
                <button
                  onClick={() =>
                    setSelectedImageIndex((prev) =>
                      prev === 0 ? galleryImages.length - 1 : prev - 1
                    )
                  }
                  className="absolute left-2 top-1/2 -translate-y-1/2 p-3 bg-black/80 text-white hover:text-[#00e65c] border border-neutral-800 backdrop-blur-md"
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  onClick={() =>
                    setSelectedImageIndex((prev) =>
                      prev === galleryImages.length - 1 ? 0 : prev + 1
                    )
                  }
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-3 bg-black/80 text-white hover:text-[#00e65c] border border-neutral-800 backdrop-blur-md"
                >
                  <ChevronRight size={24} />
                </button>
              </>
            )}
          </div>

          {/* LIGHTBOX THUMBNAILS FOOTER */}
          {galleryImages.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto py-2 z-10">
              {galleryImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`w-12 h-12 border overflow-hidden transition-all ${
                    selectedImageIndex === idx
                      ? 'border-[#00e65c] ring-2 ring-[#00e65c]/40'
                      : 'border-neutral-800 opacity-60'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SIZE GUIDE MODAL */}
      <SizeGuideModal
        isOpen={isSizeGuideOpen}
        onClose={() => setIsSizeGuideOpen(false)}
        category={product.category}
      />
    </div>
  );
};
