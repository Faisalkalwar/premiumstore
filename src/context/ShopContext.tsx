import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from 'firebase/auth';
import {
  Product,
  CartItem,
  ProductCategory,
  FirestoreProduct,
  FirestoreCategory,
  FirestoreCollection,
  UserProfile,
  HomepageCMSContent,
  DEFAULT_HOMEPAGE_CMS,
  mapFirestoreProductToProduct
} from '../types';
import { MOCK_PRODUCTS } from '../data/mockProducts';
import {
  getProducts,
  getCategories,
  getCollections,
  seedFirestoreDatabase,
  signInWithGoogle,
  signInAnonymouslyUser,
  signOutUser,
  subscribeToAuthState,
  getUserProfile,
  saveUserCart,
  getUserCart,
  saveUserWishlist,
  getUserWishlist,
  GetProductsQueryOptions,
  getHomepageCMSContentFromFirestore,
  saveHomepageCMSContentToFirestore
} from '../services/firebaseService';
import { isFirebaseConfigured, firebaseInitError } from '../lib/firebase';

export type ViewType =
  | 'home'
  | 'login'
  | 'register'
  | 'forgot-password'
  | 'account'
  | 'product'
  | 'cart'
  | 'wishlist'
  | 'checkout'
  | 'order-success'
  | 'account-orders'
  | 'account-order-detail'
  | 'admin'
  | 'admin-products'
  | 'admin-product-new'
  | 'admin-product-edit'
  | 'admin-categories'
  | 'admin-collections'
  | 'admin-inventory'
  | 'admin-orders'
  | 'admin-customers'
  | 'admin-content'
  | 'admin-settings';

interface ShopContextType {
  // Navigation Routing
  currentView: ViewType;
  selectedProductSlug: string | null;
  selectedOrderNumber: string | null;
  selectedOrderId: string | null;
  editingProductId: string | null;
  setEditingProductId: (id: string | null) => void;
  navigateTo: (view: ViewType) => void;
  navigateToProduct: (slug: string) => void;
  navigateToCheckout: () => void;
  navigateToOrderSuccess: (orderNumber: string) => void;
  navigateToAccountOrders: () => void;
  navigateToOrderDetail: (orderId: string) => void;
  navigateToAdminProductEdit: (productId: string) => void;

  // Admin Session & Authorization
  isAdminSession: boolean;
  unlockAdminSession: (key: string) => boolean;
  lockAdminSession: () => void;

  // Products & Collections
  products: Product[];
  categories: FirestoreCategory[];
  collections: FirestoreCollection[];
  isLoadingProducts: boolean;
  refreshProducts: (options?: GetProductsQueryOptions) => Promise<void>;
  seedData: () => Promise<void>;
  isSeeding: boolean;
  recentlyViewed: Product[];
  addRecentlyViewed: (product: Product) => void;

  // Firebase Auth & User Profile
  isFirebaseConfigured: boolean;
  firebaseInitError: string | null;
  user: User | null;
  userProfile: UserProfile | null;
  refreshUserProfile: () => Promise<void>;
  googleSignIn: () => Promise<void>;
  anonymousSignIn: () => Promise<void>;
  logOut: () => Promise<void>;

  // Cart
  cart: CartItem[];
  addToCart: (product: Product, size?: string, color?: string, quantity?: number) => void;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;

  // Wishlist
  wishlist: Product[];
  toggleWishlist: (product: Product) => void;
  isInWishlist: (productId: string) => boolean;
  wishlistCount: number;
  isWishlistOpen: boolean;
  setIsWishlistOpen: (open: boolean) => void;

  // Search
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  searchResults: Product[];

  // Quick View
  quickViewProduct: Product | null;
  setQuickViewProduct: (product: Product | null) => void;

  // Account Modal
  isAccountModalOpen: boolean;
  setIsAccountModalOpen: (open: boolean) => void;

  // Category Filter
  selectedCategory: ProductCategory | 'all';
  setSelectedCategory: (category: ProductCategory | 'all') => void;

  // Toast
  toastMessage: string | null;
  showToast: (message: string) => void;

  // Homepage CMS Content
  cmsContent: HomepageCMSContent;
  refreshCMSContent: () => Promise<void>;
  saveCMSContent: (newContent: HomepageCMSContent) => Promise<boolean>;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

export const ShopProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // CMS state
  const [cmsContent, setCmsContent] = useState<HomepageCMSContent>(DEFAULT_HOMEPAGE_CMS);

  const refreshCMSContent = async () => {
    try {
      const data = await getHomepageCMSContentFromFirestore();
      if (data) setCmsContent(data);
    } catch (e) {
      console.warn('Error fetching homepage CMS content:', e);
    }
  };

  const saveCMSContent = async (newContent: HomepageCMSContent): Promise<boolean> => {
    setCmsContent(newContent);
    return await saveHomepageCMSContentToFirestore(newContent);
  };

  useEffect(() => {
    refreshCMSContent();
  }, []);

  // Products state
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [categories, setCategories] = useState<FirestoreCategory[]>([]);
  const [collections, setCollections] = useState<FirestoreCollection[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);

  // Routing & Selected State
  const [selectedProductSlug, setSelectedProductSlug] = useState<string | null>(() => {
    const path = window.location.pathname.toLowerCase();
    if (path.startsWith('/product/')) {
      return path.replace('/product/', '').trim();
    }
    return null;
  });

  const [selectedOrderNumber, setSelectedOrderNumber] = useState<string | null>(() => {
    const path = window.location.pathname.toLowerCase();
    if (path.startsWith('/order-success/')) {
      return path.replace('/order-success/', '').trim();
    }
    return null;
  });

  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(() => {
    const path = window.location.pathname.toLowerCase();
    if (path.startsWith('/account/orders/')) {
      return path.replace('/account/orders/', '').trim();
    }
    return null;
  });

  const [editingProductId, setEditingProductId] = useState<string | null>(() => {
    const path = window.location.pathname.toLowerCase();
    if (path.startsWith('/admin/products/') && path.endsWith('/edit')) {
      return path.replace('/admin/products/', '').replace('/edit', '').trim();
    }
    return null;
  });

  const [isAdminUnlocked, setIsAdminUnlocked] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('admin_unlocked') === 'true';
    } catch {
      return false;
    }
  });

  const [currentView, setCurrentView] = useState<ViewType>(() => {
    const path = window.location.pathname.toLowerCase();
    if (path.startsWith('/admin/products/') && path.endsWith('/edit')) return 'admin-product-edit';
    if (path === '/admin/products/new') return 'admin-product-new';
    if (path === '/admin/products') return 'admin-products';
    if (path === '/admin/categories') return 'admin-categories';
    if (path === '/admin/collections') return 'admin-collections';
    if (path === '/admin/inventory') return 'admin-inventory';
    if (path === '/admin/orders') return 'admin-orders';
    if (path === '/admin/customers') return 'admin-customers';
    if (path === '/admin/content') return 'admin-content';
    if (path === '/admin/settings') return 'admin-settings';
    if (path === '/admin') return 'admin';
    if (path.startsWith('/product/')) return 'product';
    if (path === '/cart') return 'cart';
    if (path === '/wishlist') return 'wishlist';
    if (path === '/checkout') return 'checkout';
    if (path.startsWith('/order-success/')) return 'order-success';
    if (path.startsWith('/account/orders/')) return 'account-order-detail';
    if (path === '/account/orders') return 'account-orders';
    if (path === '/login') return 'login';
    if (path === '/register') return 'register';
    if (path === '/forgot-password') return 'forgot-password';
    if (path === '/account') return 'account';
    return 'home';
  });

  // Recently Viewed state
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('premium_store_recently_viewed');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const addRecentlyViewed = (product: Product) => {
    setRecentlyViewed((prev) => {
      const filtered = prev.filter((p) => p.id !== product.id);
      const updated = [product, ...filtered].slice(0, 8);
      try {
        localStorage.setItem('premium_store_recently_viewed', JSON.stringify(updated));
      } catch {
        // ignore storage errors
      }
      return updated;
    });
  };

  const unlockAdminSession = (key: string): boolean => {
    if (key === 'admin123' || key.toLowerCase() === 'admin' || key === 'ps-admin-2026') {
      setIsAdminUnlocked(true);
      try {
        sessionStorage.setItem('admin_unlocked', 'true');
      } catch (e) {}
      return true;
    }
    return false;
  };

  const lockAdminSession = () => {
    setIsAdminUnlocked(false);
    try {
      sessionStorage.removeItem('admin_unlocked');
    } catch (e) {}
  };

  const navigateTo = (view: ViewType) => {
    if (view !== 'product') setSelectedProductSlug(null);
    setCurrentView(view);
    let path = '/';
    if (view === 'cart') path = '/cart';
    if (view === 'wishlist') path = '/wishlist';
    if (view === 'checkout') path = '/checkout';
    if (view === 'account-orders') path = '/account/orders';
    if (view === 'login') path = '/login';
    if (view === 'register') path = '/register';
    if (view === 'forgot-password') path = '/forgot-password';
    if (view === 'account') path = '/account';
    if (view === 'admin') path = '/admin';
    if (view === 'admin-products') path = '/admin/products';
    if (view === 'admin-product-new') path = '/admin/products/new';
    if (view === 'admin-product-edit') path = `/admin/products/${editingProductId || 'edit'}/edit`;
    if (view === 'admin-categories') path = '/admin/categories';
    if (view === 'admin-collections') path = '/admin/collections';
    if (view === 'admin-inventory') path = '/admin/inventory';
    if (view === 'admin-orders') path = '/admin/orders';
    if (view === 'admin-customers') path = '/admin/customers';
    if (view === 'admin-content') path = '/admin/content';
    if (view === 'admin-settings') path = '/admin/settings';

    if (window.location.pathname !== path) {
      window.history.pushState(null, '', path);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToProduct = (slug: string) => {
    if (!slug) return;
    setSelectedProductSlug(slug);
    setCurrentView('product');
    const path = `/product/${slug}`;
    if (window.location.pathname !== path) {
      window.history.pushState(null, '', path);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToCheckout = () => {
    setCurrentView('checkout');
    const path = '/checkout';
    if (window.location.pathname !== path) {
      window.history.pushState(null, '', path);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToOrderSuccess = (orderNumber: string) => {
    setSelectedOrderNumber(orderNumber);
    setCurrentView('order-success');
    const path = `/order-success/${orderNumber}`;
    if (window.location.pathname !== path) {
      window.history.pushState(null, '', path);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToAccountOrders = () => {
    setCurrentView('account-orders');
    const path = '/account/orders';
    if (window.location.pathname !== path) {
      window.history.pushState(null, '', path);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToOrderDetail = (orderId: string) => {
    setSelectedOrderId(orderId);
    setCurrentView('account-order-detail');
    const path = `/account/orders/${orderId}`;
    if (window.location.pathname !== path) {
      window.history.pushState(null, '', path);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToAdminProductEdit = (productId: string) => {
    setEditingProductId(productId);
    setCurrentView('admin-product-edit');
    const path = `/admin/products/${productId}/edit`;
    if (window.location.pathname !== path) {
      window.history.pushState(null, '', path);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Listen for browser navigation (back / forward)
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.toLowerCase();
      if (path.startsWith('/admin/products/') && path.endsWith('/edit')) {
        const id = path.replace('/admin/products/', '').replace('/edit', '').trim();
        setEditingProductId(id);
        setCurrentView('admin-product-edit');
      } else if (path === '/admin/products/new') {
        setCurrentView('admin-product-new');
      } else if (path === '/admin/products') {
        setCurrentView('admin-products');
      } else if (path === '/admin/categories') {
        setCurrentView('admin-categories');
      } else if (path === '/admin/collections') {
        setCurrentView('admin-collections');
      } else if (path === '/admin/inventory') {
        setCurrentView('admin-inventory');
      } else if (path === '/admin/orders') {
        setCurrentView('admin-orders');
      } else if (path === '/admin/customers') {
        setCurrentView('admin-customers');
      } else if (path === '/admin/content') {
        setCurrentView('admin-content');
      } else if (path === '/admin/settings') {
        setCurrentView('admin-settings');
      } else if (path === '/admin') {
        setCurrentView('admin');
      } else if (path.startsWith('/product/')) {
        const slug = path.replace('/product/', '').trim();
        setSelectedProductSlug(slug);
        setCurrentView('product');
      } else if (path === '/cart') {
        setSelectedProductSlug(null);
        setCurrentView('cart');
      } else if (path === '/wishlist') {
        setSelectedProductSlug(null);
        setCurrentView('wishlist');
      } else if (path === '/checkout') {
        setSelectedProductSlug(null);
        setCurrentView('checkout');
      } else if (path.startsWith('/order-success/')) {
        const num = path.replace('/order-success/', '').trim();
        setSelectedOrderNumber(num);
        setCurrentView('order-success');
      } else if (path.startsWith('/account/orders/')) {
        const id = path.replace('/account/orders/', '').trim();
        setSelectedOrderId(id);
        setCurrentView('account-order-detail');
      } else if (path === '/account/orders') {
        setCurrentView('account-orders');
      } else if (path === '/login') {
        setSelectedProductSlug(null);
        setCurrentView('login');
      } else if (path === '/register') {
        setSelectedProductSlug(null);
        setCurrentView('register');
      } else if (path === '/forgot-password') {
        setSelectedProductSlug(null);
        setCurrentView('forgot-password');
      } else if (path === '/account') {
        setSelectedProductSlug(null);
        setCurrentView('account');
      } else {
        setSelectedProductSlug(null);
        setCurrentView('home');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Auth & Firebase state
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  const refreshUserProfile = async () => {
    if (!user) {
      setUserProfile(null);
      return;
    }
    const profile = await getUserProfile(user.uid);
    setUserProfile(profile);
  };

  const isAdminSession = userProfile?.role === 'admin' || isAdminUnlocked;

  // Subscribe to Auth state & sync user profile, cart, and wishlist
  useEffect(() => {
    const unsubscribe = subscribeToAuthState(async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const profile = await getUserProfile(currentUser.uid);
        setUserProfile(profile);

        // Fetch remote cart & wishlist and merge with local guest items
        try {
          const remoteCart = await getUserCart(currentUser.uid);
          if (remoteCart && remoteCart.length > 0) {
            setCart((prevCart) => {
              // Merge local items with remote items avoiding duplicates
              const merged = [...remoteCart];
              prevCart.forEach((localItem) => {
                const idx = merged.findIndex((m) => m.id === localItem.id);
                if (idx >= 0) {
                  merged[idx].quantity = Math.max(merged[idx].quantity, localItem.quantity);
                } else {
                  merged.push(localItem);
                }
              });
              return merged;
            });
          }

          const remoteWishlist = await getUserWishlist(currentUser.uid);
          if (remoteWishlist && remoteWishlist.length > 0) {
            setWishlist((prevWishlist) => {
              const merged = [...remoteWishlist];
              prevWishlist.forEach((localProd) => {
                if (!merged.some((p) => p.id === localProd.id)) {
                  merged.push(localProd);
                }
              });
              return merged;
            });
          }
        } catch (err) {
          console.warn('Error fetching user cart/wishlist from Firestore:', err);
        }
      } else {
        setUserProfile(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // Cart state stored locally with fallback
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('premium_store_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Wishlist state
  const [wishlist, setWishlist] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('premium_store_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'all'>('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Initial products & categories load from Firestore
  useEffect(() => {
    let isMounted = true;

    async function loadInitialData() {
      if (!isFirebaseConfigured) return;

      setIsLoadingProducts(true);
      try {
        // Attempt to fetch products
        const res = await getProducts({ limitCount: 40 });

        if (isMounted) {
          if (res.products && res.products.length > 0) {
            const mapped = res.products.map(mapFirestoreProductToProduct);
            setProducts(mapped);
          } else {
            // Auto seed if empty
            console.log('Firestore is empty. Triggering initial database seed...');
            const seedRes = await seedFirestoreDatabase();
            if (seedRes.success) {
              const freshRes = await getProducts({ limitCount: 40 });
              if (freshRes.products.length > 0) {
                setProducts(freshRes.products.map(mapFirestoreProductToProduct));
              }
            }
          }

          // Fetch categories & collections
          const fetchedCats = await getCategories();
          const fetchedCols = await getCollections();
          setCategories(fetchedCats);
          setCollections(fetchedCols);
        }
      } catch (err) {
        console.warn('Could not load Firestore data, falling back to mock products:', err);
      } finally {
        if (isMounted) setIsLoadingProducts(false);
      }
    }

    loadInitialData();

    return () => {
      isMounted = false;
    };
  }, []);

  // Sync Cart to localStorage and Firestore
  useEffect(() => {
    try {
      localStorage.setItem('premium_store_cart', JSON.stringify(cart));
    } catch {
      // ignore
    }
    if (user) {
      saveUserCart(user.uid, cart);
    }
  }, [cart, user]);

  // Sync Wishlist to localStorage and Firestore
  useEffect(() => {
    try {
      localStorage.setItem('premium_store_wishlist', JSON.stringify(wishlist));
    } catch {
      // ignore
    }
    if (user) {
      saveUserWishlist(user.uid, wishlist);
    }
  }, [wishlist, user]);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const refreshProducts = async (options?: GetProductsQueryOptions) => {
    setIsLoadingProducts(true);
    try {
      const res = await getProducts(options);
      if (res.products && res.products.length > 0) {
        setProducts(res.products.map(mapFirestoreProductToProduct));
      }
    } catch (err) {
      console.error('Failed to refresh products:', err);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  const seedData = async () => {
    setIsSeeding(true);
    try {
      const res = await seedFirestoreDatabase();
      if (res.success) {
        showToast('Firestore seeded successfully with products & categories!');
        await refreshProducts();
      } else {
        showToast(`Seeding notice: ${res.message}`);
      }
    } catch (err: any) {
      showToast(`Seeding error: ${err?.message || 'Unknown'}`);
    } finally {
      setIsSeeding(false);
    }
  };

  const googleSignIn = async () => {
    const u = await signInWithGoogle();
    if (u) {
      showToast(`Welcome ${u.displayName || 'Member'}! Signed in with Google.`);
      setIsAccountModalOpen(false);
    } else {
      showToast('Sign in cancelled or not configured.');
    }
  };

  const anonymousSignIn = async () => {
    const u = await signInAnonymouslyUser();
    if (u) {
      showToast('Signed in as Guest Member!');
      setIsAccountModalOpen(false);
    }
  };

  const logOut = async () => {
    await signOutUser();
    showToast('Signed out successfully.');
  };

  const addToCart = (product: Product, size?: string, color?: string, quantity: number = 1) => {
    const finalSize = size || product.sizes[0] || 'M';
    const finalColor = color || (product.colors[0] ? product.colors[0].name : 'Default');
    const cartItemId = `${product.id}-${finalSize}-${finalColor}`;

    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.id === cartItemId);
      if (existing) {
        return prevCart.map((item) =>
          item.id === cartItemId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        return [
          ...prevCart,
          {
            id: cartItemId,
            product,
            selectedSize: finalSize,
            selectedColor: finalColor,
            quantity,
          },
        ];
      }
    });

    showToast(`Added "${product.name}" (${finalSize}) to Cart!`);
    setIsCartOpen(true);
  };

  const removeFromCart = (cartItemId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== cartItemId));
    showToast('Item removed from cart.');
  };

  const updateQuantity = (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) => (item.id === cartItemId ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const toggleWishlist = (product: Product) => {
    const exists = wishlist.some((p) => p.id === product.id);
    if (exists) {
      setWishlist((prev) => prev.filter((p) => p.id !== product.id));
      showToast(`Removed "${product.name}" from Wishlist.`);
    } else {
      setWishlist((prev) => [...prev, product]);
      showToast(`Saved "${product.name}" to Wishlist!`);
    }
  };

  const isInWishlist = (productId: string) => {
    return wishlist.some((p) => p.id === productId);
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const wishlistCount = wishlist.length;

  const searchResults = searchQuery.trim()
    ? products.filter((p) => {
        const query = searchQuery.toLowerCase();
        return (
          p.name.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query) ||
          p.tags?.some((t) => t.toLowerCase().includes(query))
        );
      })
    : [];

  return (
    <ShopContext.Provider
      value={{
        currentView,
        selectedProductSlug,
        selectedOrderNumber,
        selectedOrderId,
        editingProductId,
        setEditingProductId,
        navigateTo,
        navigateToProduct,
        navigateToCheckout,
        navigateToOrderSuccess,
        navigateToAccountOrders,
        navigateToOrderDetail,
        navigateToAdminProductEdit,

        isAdminSession,
        unlockAdminSession,
        lockAdminSession,

        products,
        categories,
        collections,
        isLoadingProducts,
        refreshProducts,
        seedData,
        isSeeding,
        recentlyViewed,
        addRecentlyViewed,

        isFirebaseConfigured,
        firebaseInitError,
        user,
        userProfile,
        refreshUserProfile,
        googleSignIn,
        anonymousSignIn,
        logOut,

        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartTotal,
        cartCount,
        isCartOpen,
        setIsCartOpen,

        wishlist,
        toggleWishlist,
        isInWishlist,
        wishlistCount,
        isWishlistOpen,
        setIsWishlistOpen,

        searchQuery,
        setSearchQuery,
        isSearchOpen,
        setIsSearchOpen,
        searchResults,

        quickViewProduct,
        setQuickViewProduct,

        isAccountModalOpen,
        setIsAccountModalOpen,

        selectedCategory,
        setSelectedCategory,

        toastMessage,
        showToast,

        cmsContent,
        refreshCMSContent,
        saveCMSContent,
      }}
    >
      {children}
    </ShopContext.Provider>
  );
};

export const useShop = () => {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error('useShop must be used within a ShopProvider');
  }
  return context;
};
