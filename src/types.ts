export type ProductCategory = 'shirts' | 'caps' | 'jeans' | 'new-arrivals' | 'best-sellers';

// UI Product representation
export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  price: number;
  originalPrice?: number;
  salePrice?: number;
  discountPercent?: number;
  isNew?: boolean;
  isBestSeller?: boolean;
  isFeatured?: boolean;
  rating: number;
  reviewsCount: number;
  image: string;
  hoverImage: string;
  images?: string[];
  sizes: string[];
  colors: { name: string; hex: string }[];
  description: string;
  fabric?: string;
  fit?: string;
  care?: string;
  shippingInfo?: string;
  returnInfo?: string;
  tags?: string[];
  sku?: string;
  slug?: string;
  stock?: number;
  lowStockThreshold?: number;
  variants?: Array<{
    size: string;
    color: string;
    sku: string;
    stock: number;
  }>;
}

// Firestore Product Data Model
export interface FirestoreProduct {
  productId: string;
  name: string;
  slug: string;
  sku: string;
  description: string;
  categoryId: string;
  collectionIds: string[];
  images: string[];
  price: number;
  salePrice?: number;
  currency?: string;
  sizes: string[];
  colors: { name: string; hex: string }[];
  variants: Array<{
    size: string;
    color: string;
    sku: string;
    stock: number;
  }>;
  stock: number;
  lowStockThreshold?: number;
  tags: string[];
  featured: boolean;
  newArrival: boolean;
  bestSeller: boolean;
  status: 'active' | 'draft' | 'archived';
  seoTitle?: string;
  seoDescription?: string;
  createdAt: string;
  updatedAt: string;
}

// Firestore Category Data Model
export interface FirestoreCategory {
  categoryId: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  active: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

// Firestore Collection Data Model
export interface FirestoreCollection {
  collectionId: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  active: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

// Format price in PKR currency (e.g., Rs. 600, Rs. 1,600)
export function formatPrice(price: number | undefined | null): string {
  if (price === undefined || price === null || isNaN(price)) {
    return 'Rs. 0';
  }
  return `Rs. ${Math.round(price).toLocaleString('en-PK')}`;
}

// Convert FirestoreProduct to UI Product model
export function mapFirestoreProductToProduct(fp: FirestoreProduct): Product {
  const allImages = fp.images && fp.images.length > 0 ? fp.images : [];
  const primaryImage = allImages.length > 0 ? allImages[0] : '';
  const hoverImage = allImages.length > 1 ? allImages[1] : primaryImage;
  
  let categoryKey: ProductCategory = 'shirts';
  const cat = (fp.categoryId || '').toLowerCase();
  if (cat === 'caps' || cat === 'jeans' || cat === 'shirts' || cat === 'new-arrivals' || cat === 'best-sellers') {
    categoryKey = cat as ProductCategory;
  }

  let originalPrice = fp.salePrice && fp.salePrice < fp.price ? fp.price : undefined;
  let effectivePrice = fp.salePrice && fp.salePrice < fp.price ? fp.salePrice : fp.price;

  const discountPercent = originalPrice ? Math.round(((originalPrice - effectivePrice) / originalPrice) * 100) : undefined;

  return {
    id: fp.productId,
    name: fp.name,
    category: categoryKey,
    price: effectivePrice,
    originalPrice,
    salePrice: fp.salePrice,
    discountPercent,
    isNew: fp.newArrival,
    isBestSeller: fp.bestSeller,
    isFeatured: fp.featured,
    rating: 4.9,
    reviewsCount: 38,
    image: primaryImage,
    hoverImage: hoverImage,
    images: allImages.length > 0 ? allImages : [primaryImage],
    sizes: fp.sizes && fp.sizes.length > 0 ? fp.sizes : ['S', 'M', 'L', 'XL'],
    colors: fp.colors && fp.colors.length > 0 ? fp.colors : [{ name: 'Black', hex: '#000000' }],
    description: fp.description || '',
    fabric: '100% Premium Heavyweight Cotton Canvas / 320 GSM',
    fit: 'Oversized Boxy Dropped-Shoulder Silhouette',
    care: 'Machine wash cold with like colors inside out. Do not bleach. Lay flat to dry or tumble dry low. Cool iron on reverse.',
    shippingInfo: 'Standard dispatch within 24 hours. Free express shipping on orders over Rs. 3,500.',
    returnInfo: '30-day effortless return and exchange policy. Items must be unworn, unwashed with original hangtags attached.',
    tags: fp.tags || [],
    sku: fp.sku || `PS-${fp.productId.slice(0, 6).toUpperCase()}`,
    slug: fp.slug,
    stock: typeof fp.stock === 'number' ? fp.stock : 15,
    lowStockThreshold: typeof fp.lowStockThreshold === 'number' ? fp.lowStockThreshold : 10,
    variants: fp.variants || [],
  };
}

export interface CartItem {
  id: string; // unique key combining product.id + selectedSize + selectedColor
  product: Product;
  selectedSize: string;
  selectedColor: string;
  quantity: number;
}

export interface LookbookHotspot {
  id: string;
  productId: string;
  topPercent: number; // e.g. 45
  leftPercent: number; // e.g. 60
}

export interface LookbookItem {
  id: string;
  title: string;
  tagline: string;
  season: string;
  image: string;
  hotspots: LookbookHotspot[];
}

export interface CategoryInfo {
  id: ProductCategory;
  name: string;
  tagline: string;
  image: string;
  itemCount: number;
  slug: string;
}

export interface InstagramPost {
  id: string;
  username: string;
  image: string;
  likes: number;
  comments: number;
  productTag?: string;
}

export interface Address {
  id: string;
  name: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  isDefault?: boolean;
}

export type OrderStatus =
  | 'Pending'
  | 'Confirmed'
  | 'Processing'
  | 'Shipped'
  | 'Delivered'
  | 'Cancelled'
  | 'Returned';

export type PaymentStatus = 'Pending' | 'Paid' | 'Refunded';

export interface OrderShippingAddress {
  fullName: string;
  phone: string;
  email: string;
  province: string;
  city: string;
  area: string;
  completeAddress: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  productImage: string;
  sku: string;
  size: string;
  color: string;
  quantity: number;
  price: number;
}

export interface OrderInternalNote {
  id: string;
  note: string;
  createdAt: string;
  author: string;
}

export interface Order {
  id: string; // Firestore doc ID
  orderNumber: string; // e.g. PS-2026-00001
  userId: string | null;
  customerName: string;
  phone: string;
  email: string;
  items: OrderItem[];
  shippingAddress: OrderShippingAddress;
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
  paymentMethod: 'Cash on Delivery';
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  internalNotes?: OrderInternalNote[];
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  phone: string;
  photoURL: string;
  role: 'customer' | 'admin';
  addresses: Address[];
  createdAt: string;
  updatedAt: string;
}

// ------------------------------------
// HOMEPAGE CMS TYPES & DEFAULT VALUES
// ------------------------------------

export interface AnnouncementItem {
  id: string;
  text: string;
  linkText?: string;
  linkUrl?: string;
  icon?: 'sparkles' | 'truck' | 'tag' | 'flame';
}

export interface CMSAnnouncementBar {
  enabled: boolean;
  announcements: AnnouncementItem[];
}

export interface CMSHeroBanner {
  backgroundImage: string;
  seasonBadge: string;
  mainTitleLine1: string;
  mainTitleHighlight: string;
  subtitleUpper: string;
  subtitleHighlight: string;
  description: string;
  primaryButtonText: string;
  primaryButtonLink: string;
  secondaryButtonText: string;
  secondaryButtonLink: string;
  featureHighlights: string[];
}

export interface CMSFeaturedCategories {
  enabled: boolean;
  tagline: string;
  title: string;
  subtitle: string;
  categories: Array<{
    id: string;
    name: string;
    tagline: string;
    image: string;
    itemCount?: number;
    linkCategory?: string;
  }>;
}

export interface CMSNewArrivals {
  enabled: boolean;
  tagline: string;
  title: string;
  displayCount: number;
  buttonText: string;
}

export interface CMSBestSellers {
  enabled: boolean;
  tagline: string;
  title: string;
  displayCount: number;
  buttonText: string;
}

export interface CMSFeaturedCollection {
  enabled: boolean;
  badge: string;
  title: string;
  subtitle: string;
  headerTag: string;
  archiveTitle: string;
  description: string;
  fabricWeight: string;
  fitProfile: string;
  colorways: string;
  image: string;
  buttonText: string;
  buttonCategory: string;
}

export interface CMSPromotionalBanner {
  enabled: boolean;
  badge: string;
  title: string;
  subtitle: string;
  buttonText: string;
  buttonLink: string;
  image: string;
  expiryText?: string;
}

export interface CMSLookbookItem {
  id: string;
  season: string;
  title: string;
  subtitle: string;
  image: string;
  hotspots: Array<{
    id: string;
    productId: string;
    topPercent: number;
    leftPercent: number;
  }>;
}

export interface CMSLookbook {
  enabled: boolean;
  tagline: string;
  title: string;
  looks: CMSLookbookItem[];
}

export interface CMSInstagramPost {
  id: string;
  image: string;
  likes: string;
  comments: number;
  tag: string;
  linkUrl?: string;
}

export interface CMSInstagramSection {
  enabled: boolean;
  handle: string;
  title: string;
  hashtag: string;
  posts: CMSInstagramPost[];
}

export interface CMSNewsletterSection {
  enabled: boolean;
  badge: string;
  title: string;
  titleHighlight: string;
  subtitle: string;
  placeholder: string;
  buttonText: string;
  discountCode: string;
  footerNotice: string;
}

export interface HomepageCMSContent {
  announcementBar: CMSAnnouncementBar;
  heroBanner: CMSHeroBanner;
  featuredCategories: CMSFeaturedCategories;
  newArrivals: CMSNewArrivals;
  bestSellers: CMSBestSellers;
  featuredCollection: CMSFeaturedCollection;
  promotionalBanner: CMSPromotionalBanner;
  lookbook: CMSLookbook;
  instagramSection: CMSInstagramSection;
  newsletterSection: CMSNewsletterSection;
}

export const DEFAULT_HOMEPAGE_CMS: HomepageCMSContent = {
  announcementBar: {
    enabled: true,
    announcements: [
      {
        id: 'ann-1',
        text: 'NEW DROP LIVE: METROPOLIS \'26 URBAN STREETWEAR COLLECTION',
        linkText: 'EXPLORE DROP',
        icon: 'sparkles',
      },
      {
        id: 'ann-2',
        text: 'FREE EXPRESS SHIPPING ON ALL ORDERS OVER Rs. 3,500',
        linkText: 'DETAILS',
        icon: 'truck',
      },
      {
        id: 'ann-3',
        text: 'GET 15% OFF YOUR FIRST ORDER — USE CODE: PREMIUM15',
        linkText: 'COPY CODE',
        icon: 'tag',
      },
    ],
  },
  heroBanner: {
    backgroundImage: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=2000&auto=format&fit=crop',
    seasonBadge: 'METROPOLIS URBAN COLLECTION \'26 — DROP 04 LIVE',
    mainTitleLine1: 'PREMIUM',
    mainTitleHighlight: 'STREETWEAR',
    subtitleUpper: 'WEAR THE BEST.',
    subtitleHighlight: 'FOR LESS.',
    description: 'Elevated streetwear essentials, heavyweight boxy tees, unstructured trucker caps and raw denim cuts. Creative, bold, and strictly affordable.',
    primaryButtonText: 'SHOP NOW',
    primaryButtonLink: '#products-section',
    secondaryButtonText: 'EXPLORE COLLECTION',
    secondaryButtonLink: '#lookbook-section',
    featureHighlights: [
      '100% HEAVYWEIGHT COTTON',
      'LIMITED EDITION DROPS',
      'EXPRESS GLOBAL SHIPPING',
    ],
  },
  featuredCategories: {
    enabled: true,
    tagline: 'EXPLORE BY CATEGORY',
    title: 'STREETWEAR CATEGORIES',
    subtitle: 'Discover curated streetwear apparel crafted for maximum comfort, durability and uncompromised style.',
    categories: [
      {
        id: 'cat-shirts',
        name: 'Graphic Tees & Tops',
        tagline: 'Heavyweight Cotton & Oversized Boxy Cuts',
        image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=800&auto=format&fit=crop',
        itemCount: 24,
        linkCategory: 'shirts',
      },
      {
        id: 'cat-hoodies',
        name: 'Hoodies & Outerwear',
        tagline: '450GSM French Terry & Zip-Up Fleeces',
        image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=800&auto=format&fit=crop',
        itemCount: 18,
        linkCategory: 'hoodies',
      },
      {
        id: 'cat-pants',
        name: 'Cargo Pants & Denim',
        tagline: 'Relaxed Fit, Tactical Pockets & Washes',
        image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=800&auto=format&fit=crop',
        itemCount: 16,
        linkCategory: 'pants',
      },
      {
        id: 'cat-hats',
        name: 'Headwear & Caps',
        tagline: 'Unstructured Truckers & Knit Beanies',
        image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?q=80&w=800&auto=format&fit=crop',
        itemCount: 12,
        linkCategory: 'hats',
      },
      {
        id: 'cat-footwear',
        name: 'Footwear & Kicks',
        tagline: 'Low-Top Chunky Trainers & Skate Shoes',
        image: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?q=80&w=800&auto=format&fit=crop',
        itemCount: 10,
        linkCategory: 'footwear',
      },
    ],
  },
  newArrivals: {
    enabled: true,
    tagline: 'WEEKLY DROP 04',
    title: 'NEW ARRIVALS',
    displayCount: 4,
    buttonText: 'VIEW ALL NEW DROPS',
  },
  bestSellers: {
    enabled: true,
    tagline: 'MOST WANTED GRAILS',
    title: 'BEST SELLERS',
    displayCount: 4,
    buttonText: 'EXPLORE ALL BESTSELLERS',
  },
  featuredCollection: {
    enabled: true,
    badge: 'LIMITED EDITORIAL CAPSULE',
    title: 'METROPOLIS \'26',
    subtitle: 'RAW GRAFFITI & HEAVYWEIGHT CUTS',
    headerTag: 'THE GRAIL COLLECTION',
    archiveTitle: 'URBAN STREETWEAR ARCHIVE',
    description: 'Inspired by brutalist concrete architecture and underground spray art culture. Engineered using heavyweight 450GSM organic French terry and 14oz rigid Japanese denim.',
    fabricWeight: '450 GSM / 14OZ DENIM',
    fitProfile: 'BOXY OVERSIZED',
    colorways: 'PITCH BLACK / NEON ACCENT',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1200&auto=format&fit=crop',
    buttonText: 'SHOP METROPOLIS CAPSULE',
    buttonCategory: 'shirts',
  },
  promotionalBanner: {
    enabled: true,
    badge: 'EXCLUSIVE ONLINE CAMPAIGN',
    title: 'SPRING ARCHIVE DROP — FREE EXPRESS SHIPPING OVER Rs. 3,500',
    subtitle: 'Unlock instant VIP savings with code PREMIUM15 at checkout. Limited inventory per drop.',
    buttonText: 'SHOP LIMITED DROPS',
    buttonLink: '#products-section',
    image: 'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?q=80&w=1600&auto=format&fit=crop',
    expiryText: 'LIMITED STOCK REMAINING',
  },
  lookbook: {
    enabled: true,
    tagline: 'EDITORIAL STREETWEAR LOOKBOOK',
    title: 'SHOP THE LOOK',
    looks: [
      {
        id: 'look-1',
        season: 'METROPOLIS \'26',
        title: 'METROPOLIS INDUSTRIAL FIT',
        subtitle: 'Heavyweight Spray Tee paired with Vintage Acid Wash Denim and Premium Trucker Hat.',
        image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1200&auto=format&fit=crop',
        hotspots: [
          { id: 'hs-1', productId: 'p1', topPercent: 38, leftPercent: 52 },
          { id: 'hs-2', productId: 'p3', topPercent: 72, leftPercent: 48 },
          { id: 'hs-3', productId: 'p2', topPercent: 18, leftPercent: 50 },
        ],
      },
      {
        id: 'look-2',
        season: 'ARCHIVE DROPS',
        title: 'OVERSIZED STREET SILHOUETTE',
        subtitle: 'Acid Wash Boxy Hoodie paired with Multi-Pocket Tactical Cargo Pants.',
        image: 'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?q=80&w=1200&auto=format&fit=crop',
        hotspots: [
          { id: 'hs-4', productId: 'p4', topPercent: 35, leftPercent: 50 },
          { id: 'hs-5', productId: 'p7', topPercent: 68, leftPercent: 53 },
        ],
      },
    ],
  },
  instagramSection: {
    enabled: true,
    handle: '@premiumstore._pk',
    title: 'STREETWEAR COMMUNITY',
    hashtag: '#WEARTHEBESTFORLESS',
    posts: [
      {
        id: 'ig-1',
        image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800&auto=format&fit=crop',
        likes: '2.4k',
        comments: 184,
        tag: 'Graffiti Tee',
        linkUrl: 'https://www.instagram.com/premiumstore._pk/',
      },
      {
        id: 'ig-2',
        image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?q=80&w=800&auto=format&fit=crop',
        likes: '3.1k',
        comments: 242,
        tag: 'P-Store Trucker',
        linkUrl: 'https://www.instagram.com/premiumstore._pk/',
      },
      {
        id: 'ig-3',
        image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=800&auto=format&fit=crop',
        likes: '4.8k',
        comments: 310,
        tag: 'Baggy Denim',
        linkUrl: 'https://www.instagram.com/premiumstore._pk/',
      },
      {
        id: 'ig-4',
        image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=800&auto=format&fit=crop',
        likes: '1.9k',
        comments: 145,
        tag: 'Metropolis Hoodie',
        linkUrl: 'https://www.instagram.com/premiumstore._pk/',
      },
    ],
  },
  newsletterSection: {
    enabled: true,
    badge: 'STREETWEAR CLUB VIP ACCESS',
    title: 'GET 15% OFF YOUR FIRST DROP',
    titleHighlight: '15% OFF',
    subtitle: 'Subscribe to receive secret password drops, early access to limited streetwear capsules, and private promo codes directly to your inbox.',
    placeholder: 'ENTER YOUR EMAIL ADDRESS',
    buttonText: 'CLAIM 15% OFF',
    discountCode: 'PREMIUM15',
    footerNotice: 'NO SPAM. UNSUBSCRIBE ANYTIME WITH ONE CLICK.',
  },
};



