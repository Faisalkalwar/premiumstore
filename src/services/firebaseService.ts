import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  QueryConstraint,
  QueryDocumentSnapshot,
  Timestamp,
  writeBatch,
  runTransaction
} from 'firebase/firestore';
import {
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  User,
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, auth, storage, isFirebaseConfigured } from '../lib/firebase';
import {
  Product,
  CartItem,
  FirestoreProduct,
  FirestoreCategory,
  FirestoreCollection,
  UserProfile,
  Address,
  Order,
  OrderItem,
  OrderShippingAddress,
  OrderStatus,
  PaymentStatus,
  OrderInternalNote,
  HomepageCMSContent,
  DEFAULT_HOMEPAGE_CMS,
  mapFirestoreProductToProduct
} from '../types';
import { MOCK_PRODUCTS } from '../data/mockProducts';
import { CATEGORIES } from '../data/categories';

export interface GetProductsQueryOptions {
  categoryId?: string;
  collectionId?: string;
  minPrice?: number;
  maxPrice?: number;
  size?: string;
  color?: string;
  inStockOnly?: boolean;
  featuredOnly?: boolean;
  newArrivalOnly?: boolean;
  bestSellerOnly?: boolean;
  searchQuery?: string;
  sortBy?: 'newest' | 'popular' | 'price-asc' | 'price-desc' | 'best-sellers';
  limitCount?: number;
  lastDocSnap?: QueryDocumentSnapshot | null;
}

export interface GetProductsResult {
  products: FirestoreProduct[];
  lastDocSnap: QueryDocumentSnapshot | null;
  hasMore: boolean;
}

// ----------------------------------------------------------------------
// PRODUCTS
// ----------------------------------------------------------------------

export function getMockFirestoreProducts(): FirestoreProduct[] {
  return MOCK_PRODUCTS.map((p) => ({
    productId: p.id,
    name: p.name,
    slug: p.slug || p.id,
    sku: p.sku || `SKU-${p.id}`,
    description: p.description,
    categoryId: p.category,
    collectionIds: p.isFeatured ? ['summer-grails-24'] : ['cyber-archive'],
    images: [p.image, p.hoverImage].filter(Boolean),
    price: p.originalPrice ? p.originalPrice : p.price,
    salePrice: p.originalPrice ? p.price : undefined,
    currency: 'PKR',
    sizes: p.sizes,
    colors: p.colors,
    variants: [],
    stock: p.stock ?? 25,
    tags: p.tags || [],
    featured: !!p.isFeatured,
    newArrival: !!p.isNew,
    bestSeller: !!p.isBestSeller,
    status: 'active' as const,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }));
}

export async function getProducts(options: GetProductsQueryOptions = {}): Promise<GetProductsResult> {
  if (!isFirebaseConfigured || !db) {
    console.warn('Firestore not initialized, returning filtered mock data');
    const mockList = getMockFirestoreProducts();
    let filtered = [...mockList];

    if (options.categoryId && options.categoryId !== 'all') {
      filtered = filtered.filter((p) => p.categoryId === options.categoryId);
    }
    if (options.minPrice !== undefined) {
      filtered = filtered.filter((p) => (p.salePrice || p.price) >= options.minPrice!);
    }
    if (options.maxPrice !== undefined) {
      filtered = filtered.filter((p) => (p.salePrice || p.price) <= options.maxPrice!);
    }
    if (options.size) {
      filtered = filtered.filter((p) => p.sizes.includes(options.size!));
    }
    if (options.searchQuery) {
      const q = options.searchQuery.toLowerCase();
      filtered = filtered.filter((p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q)
      );
    }

    if (options.sortBy === 'price-asc') {
      filtered.sort((a, b) => (a.salePrice || a.price) - (b.salePrice || b.price));
    } else if (options.sortBy === 'price-desc') {
      filtered.sort((a, b) => (b.salePrice || b.price) - (a.salePrice || a.price));
    }

    return {
      products: filtered,
      lastDocSnap: null,
      hasMore: false,
    };
  }

  try {
    const productsRef = collection(db, 'products');
    const constraints: QueryConstraint[] = [];

    // Always filter for active products
    constraints.push(where('status', '==', 'active'));

    if (options.categoryId && options.categoryId !== 'all') {
      constraints.push(where('categoryId', '==', options.categoryId));
    }

    if (options.featuredOnly) {
      constraints.push(where('featured', '==', true));
    }

    if (options.newArrivalOnly) {
      constraints.push(where('newArrival', '==', true));
    }

    if (options.bestSellerOnly) {
      constraints.push(where('bestSeller', '==', true));
    }

    // Sort order
    if (options.sortBy === 'price-asc') {
      constraints.push(orderBy('price', 'asc'));
    } else if (options.sortBy === 'price-desc') {
      constraints.push(orderBy('price', 'desc'));
    } else {
      constraints.push(orderBy('createdAt', 'desc'));
    }

    // Pagination limit
    const fetchLimit = options.limitCount || 20;
    constraints.push(limit(fetchLimit));

    if (options.lastDocSnap) {
      constraints.push(startAfter(options.lastDocSnap));
    }

    const q = query(productsRef, ...constraints);
    const querySnapshot = await getDocs(q);

    let fetchedProducts: FirestoreProduct[] = querySnapshot.docs.map((doc) => ({
      ...(doc.data() as FirestoreProduct),
      productId: doc.id,
    }));

    // Client-side filtering for complex properties (sizes, price range, search)
    if (options.minPrice !== undefined) {
      fetchedProducts = fetchedProducts.filter((p) => (p.salePrice || p.price) >= options.minPrice!);
    }

    if (options.maxPrice !== undefined) {
      fetchedProducts = fetchedProducts.filter((p) => (p.salePrice || p.price) <= options.maxPrice!);
    }

    if (options.size) {
      fetchedProducts = fetchedProducts.filter((p) => p.sizes && p.sizes.includes(options.size!));
    }

    if (options.searchQuery && options.searchQuery.trim()) {
      const qStr = options.searchQuery.toLowerCase().trim();
      fetchedProducts = fetchedProducts.filter(
        (p) =>
          p.name.toLowerCase().includes(qStr) ||
          p.description.toLowerCase().includes(qStr) ||
          p.sku.toLowerCase().includes(qStr) ||
          (p.tags && p.tags.some((t) => t.toLowerCase().includes(qStr)))
      );
    }

    const lastSnap = querySnapshot.docs[querySnapshot.docs.length - 1] || null;

    return {
      products: fetchedProducts,
      lastDocSnap: lastSnap,
      hasMore: querySnapshot.docs.length === fetchLimit,
    };
  } catch (error) {
    console.warn('Firestore products fetch issue, attempting unconstrained query fallback:', error);
    try {
      const snap = await getDocs(collection(db, 'products'));
      if (!snap.empty) {
        let fetchedProducts: FirestoreProduct[] = snap.docs.map((d) => ({
          ...(d.data() as FirestoreProduct),
          productId: d.id,
        }));
        if (options.categoryId && options.categoryId !== 'all') {
          fetchedProducts = fetchedProducts.filter((p) => p.categoryId === options.categoryId);
        }
        return {
          products: fetchedProducts,
          lastDocSnap: snap.docs[snap.docs.length - 1] || null,
          hasMore: false,
        };
      }
    } catch (fallbackErr) {
      console.warn('Firestore fallback query failed or offline, returning mock products:', fallbackErr);
    }

    const mockList = getMockFirestoreProducts();
    let filtered = options.categoryId && options.categoryId !== 'all'
      ? mockList.filter((p) => p.categoryId === options.categoryId)
      : mockList;

    return {
      products: filtered,
      lastDocSnap: null,
      hasMore: false,
    };
  }
}

export async function getProductBySlug(slug: string): Promise<FirestoreProduct | null> {
  const findInMock = () => {
    const mockList = getMockFirestoreProducts();
    return mockList.find((p) => p.slug === slug || p.productId === slug) || null;
  };

  if (!isFirebaseConfigured || !db) return findInMock();

  try {
    const productsRef = collection(db, 'products');
    const q = query(productsRef, where('slug', '==', slug), limit(1));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      // Try fetching by productId directly
      const docRef = doc(db, 'products', slug);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { ...(docSnap.data() as FirestoreProduct), productId: docSnap.id };
      }
      return findInMock();
    }

    const docSnap = snapshot.docs[0];
    return { ...(docSnap.data() as FirestoreProduct), productId: docSnap.id };
  } catch (error) {
    console.warn(`Error getting product by slug ${slug}, checking fallback:`, error);
    return findInMock();
  }
}

export async function getProductById(productId: string): Promise<FirestoreProduct | null> {
  const findInMock = () => {
    const mockList = getMockFirestoreProducts();
    return mockList.find((p) => p.productId === productId) || null;
  };

  if (!isFirebaseConfigured || !db) return findInMock();

  try {
    const docRef = doc(db, 'products', productId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { ...(docSnap.data() as FirestoreProduct), productId: docSnap.id };
    }
    return findInMock();
  } catch (error) {
    console.warn(`Error getting product by ID ${productId}, checking fallback:`, error);
    return findInMock();
  }
}

// ----------------------------------------------------------------------
// CATEGORIES & COLLECTIONS
// ----------------------------------------------------------------------

export async function getCategories(): Promise<FirestoreCategory[]> {
  const fallbackCategories = CATEGORIES.map((c, i) => ({
    categoryId: c.id,
    name: c.name,
    slug: c.id,
    description: c.tagline,
    image: c.image,
    active: true,
    sortOrder: i,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }));

  if (!isFirebaseConfigured || !db) {
    return fallbackCategories;
  }

  try {
    const categoriesRef = collection(db, 'categories');
    const q = query(categoriesRef, where('active', '==', true), orderBy('sortOrder', 'asc'));
    const snapshot = await getDocs(q);

    if (snapshot.empty) return fallbackCategories;

    return snapshot.docs.map((doc) => ({
      ...(doc.data() as FirestoreCategory),
      categoryId: doc.id,
    }));
  } catch (error) {
    console.warn('Error getting categories from Firestore, returning fallback:', error);
    return fallbackCategories;
  }
}

export async function getCollections(): Promise<FirestoreCollection[]> {
  const fallbackCollections: FirestoreCollection[] = [
    {
      collectionId: 'summer-grails-24',
      name: 'Summer Grails 2024',
      slug: 'summer-grails-24',
      description: 'Acid wash oversized boxy silhouettes & industrial cutouts',
      image: 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?q=80&w=1000&auto=format&fit=crop',
      active: true,
      sortOrder: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      collectionId: 'cyber-archive',
      name: 'Cyber Archive',
      slug: 'cyber-archive',
      description: 'Tactical cargo outerwear and technical headwear drops',
      image: 'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?q=80&w=1000&auto=format&fit=crop',
      active: true,
      sortOrder: 2,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  if (!isFirebaseConfigured || !db) {
    return fallbackCollections;
  }

  try {
    const collectionsRef = collection(db, 'collections');
    const q = query(collectionsRef, where('active', '==', true), orderBy('sortOrder', 'asc'));
    const snapshot = await getDocs(q);

    if (snapshot.empty) return fallbackCollections;

    return snapshot.docs.map((doc) => ({
      ...(doc.data() as FirestoreCollection),
      collectionId: doc.id,
    }));
  } catch (error) {
    console.warn('Error getting collections from Firestore, returning fallback:', error);
    return fallbackCollections;
  }
}

// ----------------------------------------------------------------------
// SEARCH
// ----------------------------------------------------------------------

export async function searchProducts(searchTerm: string): Promise<FirestoreProduct[]> {
  const result = await getProducts({ searchQuery: searchTerm, limitCount: 30 });
  return result.products;
}

// ----------------------------------------------------------------------
// WRITE OPERATIONS
// ----------------------------------------------------------------------

export async function createOrUpdateProduct(product: Partial<FirestoreProduct>): Promise<string | null> {
  if (!isFirebaseConfigured || !db) {
    console.warn('Firestore is not initialized');
    return null;
  }

  try {
    const now = new Date().toISOString();
    const productId = product.productId || `prod-${Date.now()}`;
    const docRef = doc(db, 'products', productId);

    const fullProduct: FirestoreProduct = {
      productId,
      name: product.name || 'Untitled Product',
      slug: product.slug || (product.name ? product.name.toLowerCase().replace(/\s+/g, '-') : productId),
      sku: product.sku || `SKU-${productId.toUpperCase()}`,
      description: product.description || '',
      categoryId: product.categoryId || 'shirts',
      collectionIds: product.collectionIds || [],
      images: product.images || ['https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=1000&auto=format&fit=crop'],
      price: product.price || 45,
      salePrice: product.salePrice,
      sizes: product.sizes || ['S', 'M', 'L', 'XL'],
      colors: product.colors || [{ name: 'Black', hex: '#000000' }],
      variants: product.variants || [],
      stock: product.stock ?? 50,
      tags: product.tags || [],
      featured: !!product.featured,
      newArrival: !!product.newArrival,
      bestSeller: !!product.bestSeller,
      status: product.status || 'active',
      seoTitle: product.seoTitle || product.name,
      seoDescription: product.seoDescription || product.description,
      createdAt: product.createdAt || now,
      updatedAt: now,
    };

    await setDoc(docRef, fullProduct, { merge: true });
    return productId;
  } catch (error) {
    console.error('Error saving product to Firestore:', error);
    return null;
  }
}

export async function uploadProductImage(file: File | Blob, fileName: string): Promise<string | null> {
  if (!isFirebaseConfigured || !storage) {
    console.warn('Firebase Storage not configured');
    return null;
  }

  try {
    const storageRef = ref(storage, `products/${Date.now()}_${fileName}`);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadUrl = await getDownloadURL(snapshot.ref);
    return downloadUrl;
  } catch (error) {
    console.error('Error uploading product image:', error);
    return null;
  }
}

// ----------------------------------------------------------------------
// DATABASE SEEDING
// ----------------------------------------------------------------------

export async function seedFirestoreDatabase(): Promise<{ success: boolean; message: string }> {
  if (!isFirebaseConfigured || !db) {
    return { success: false, message: 'Firebase is not initialized or configured.' };
  }

  try {
    const productsRef = collection(db, 'products');
    const existingSnap = await getDocs(query(productsRef, limit(1)));

    // Seeding Categories first
    const batch = writeBatch(db);

    CATEGORIES.forEach((cat, index) => {
      const catRef = doc(db, 'categories', cat.id);
      const catData: FirestoreCategory = {
        categoryId: cat.id,
        name: cat.name,
        slug: cat.id,
        description: cat.tagline,
        image: cat.image,
        active: true,
        sortOrder: index + 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      batch.set(catRef, catData, { merge: true });
    });

    // Seeding Collections
    const defaultCollections = [
      {
        collectionId: 'summer-grails-24',
        name: 'Summer Grails 2024',
        slug: 'summer-grails-24',
        description: 'Acid wash oversized boxy silhouettes & industrial cutouts',
        image: 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?q=80&w=1000&auto=format&fit=crop',
        active: true,
        sortOrder: 1,
      },
      {
        collectionId: 'cyber-archive',
        name: 'Cyber Archive',
        slug: 'cyber-archive',
        description: 'Tactical cargo outerwear and technical headwear drops',
        image: 'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?q=80&w=1000&auto=format&fit=crop',
        active: true,
        sortOrder: 2,
      },
    ];

    defaultCollections.forEach((col) => {
      const colRef = doc(db, 'collections', col.collectionId);
      const colData: FirestoreCollection = {
        ...col,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      batch.set(colRef, colData, { merge: true });
    });

    // Seeding Products if products collection is empty
    if (existingSnap.empty) {
      MOCK_PRODUCTS.forEach((mp) => {
        const prodRef = doc(db, 'products', mp.id);
        const prodData: FirestoreProduct = {
          productId: mp.id,
          name: mp.name,
          slug: mp.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
          sku: `PSTORE-${mp.id.toUpperCase()}`,
          description: mp.description,
          categoryId: mp.category,
          collectionIds: mp.isFeatured ? ['summer-grails-24'] : ['cyber-archive'],
          images: [mp.image, mp.hoverImage].filter(Boolean),
          price: mp.originalPrice ? mp.originalPrice : mp.price,
          salePrice: mp.originalPrice ? mp.price : undefined,
          currency: 'PKR',
          sizes: mp.sizes,
          colors: mp.colors,
          variants: mp.sizes.map((sz) => ({
            size: sz,
            color: mp.colors[0]?.name || 'Default',
            sku: `PSTORE-${mp.id.toUpperCase()}-${sz}`,
            stock: 15,
          })),
          stock: 45,
          tags: mp.tags || ['Streetwear', mp.category],
          featured: !!mp.isFeatured,
          newArrival: !!mp.isNew,
          bestSeller: !!mp.isBestSeller,
          status: 'active',
          seoTitle: `${mp.name} | Premium Streetwear Store`,
          seoDescription: mp.description,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        batch.set(prodRef, prodData);
      });
    }

    await batch.commit();
    return { success: true, message: 'Firestore collections, categories, and products seeded successfully!' };
  } catch (error: any) {
    console.error('Error seeding Firestore database:', error);
    return { success: false, message: `Seeding failed: ${error?.message || 'Unknown error'}` };
  }
}

// ----------------------------------------------------------------------
// AUTHENTICATION & USER PROFILES
// ----------------------------------------------------------------------

export async function ensureUserProfile(user: User, extraName?: string): Promise<UserProfile | null> {
  if (!isFirebaseConfigured || !db) return null;

  try {
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      return userSnap.data() as UserProfile;
    }

    const now = new Date().toISOString();
    const newProfile: UserProfile = {
      uid: user.uid,
      name: extraName || user.displayName || user.email?.split('@')[0] || 'Customer',
      email: user.email || '',
      phone: '',
      photoURL: user.photoURL || '',
      role: 'customer', // Security mandate: Default role must be customer
      addresses: [],
      createdAt: now,
      updatedAt: now,
    };

    await setDoc(userRef, newProfile);
    return newProfile;
  } catch (error) {
    console.error('Error ensuring user profile:', error);
    return null;
  }
}

export async function registerWithEmailPassword(email: string, pass: string, name: string): Promise<{ user: User | null; error?: string }> {
  if (!isFirebaseConfigured || !auth) {
    return { user: null, error: 'Firebase Auth is not configured.' };
  }

  try {
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    if (name && cred.user) {
      await updateProfile(cred.user, { displayName: name });
    }
    await ensureUserProfile(cred.user, name);
    return { user: cred.user };
  } catch (error: any) {
    console.error('Registration error:', error);
    let errMsg = error.message || 'Failed to register account.';
    if (error.code === 'auth/operation-not-allowed') {
      errMsg = 'Email/Password sign-in is disabled in your Firebase console. Please go to Firebase Console > Authentication > Sign-in method and enable Email/Password.';
    } else if (error.code === 'auth/email-already-in-use') {
      errMsg = 'An account with this email address already exists. Please sign in instead.';
    } else if (error.code === 'auth/invalid-email') {
      errMsg = 'Please enter a valid email address.';
    } else if (error.code === 'auth/weak-password') {
      errMsg = 'Password must be at least 6 characters long.';
    }
    return { user: null, error: errMsg };
  }
}

export async function loginWithEmailPassword(email: string, pass: string): Promise<{ user: User | null; error?: string }> {
  if (!isFirebaseConfigured || !auth) {
    return { user: null, error: 'Firebase Auth is not configured.' };
  }

  try {
    const cred = await signInWithEmailAndPassword(auth, email, pass);
    await ensureUserProfile(cred.user);
    return { user: cred.user };
  } catch (error: any) {
    console.error('Login error:', error);
    let errMsg = error.message || 'Failed to sign in.';
    if (error.code === 'auth/operation-not-allowed') {
      errMsg = 'Email/Password sign-in is disabled in your Firebase console. Please go to Firebase Console > Authentication > Sign-in method and enable Email/Password.';
    } else if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
      errMsg = 'Invalid email or password. Please check your credentials and try again.';
    }
    return { user: null, error: errMsg };
  }
}

export async function sendPasswordReset(email: string): Promise<{ success: boolean; error?: string }> {
  if (!isFirebaseConfigured || !auth) {
    return { success: false, error: 'Firebase Auth is not configured.' };
  }

  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true };
  } catch (error: any) {
    console.error('Password reset error:', error);
    return { success: false, error: error.message || 'Failed to send reset email.' };
  }
}

export async function signInWithGoogle(): Promise<User | null> {
  if (!isFirebaseConfigured || !auth) {
    console.warn('Firebase Auth is not configured');
    return null;
  }

  try {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    const result = await signInWithPopup(auth, provider);
    if (result.user) {
      await ensureUserProfile(result.user);
    }
    return result.user;
  } catch (error: any) {
    console.error('Google Sign-in error:', error);
    if (error.code === 'auth/popup-closed-by-user') {
      console.warn('Google Sign-In popup was closed before completing.');
    } else if (error.code === 'auth/unauthorized-domain') {
      console.error('Domain not authorized in Firebase Console > Authentication > Settings > Authorized domains.');
    } else if (error.code === 'auth/operation-not-allowed') {
      console.error('Google Provider disabled in Firebase Console > Authentication > Sign-in method.');
    }
    return null;
  }
}

export async function signInAnonymouslyUser(): Promise<User | null> {
  if (!isFirebaseConfigured || !auth) return null;

  try {
    const result = await signInAnonymously(auth);
    if (result.user) {
      await ensureUserProfile(result.user, 'Guest Member');
    }
    return result.user;
  } catch (error) {
    console.error('Anonymous sign in error:', error);
    return null;
  }
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  if (!isFirebaseConfigured || !db) return null;

  try {
    const userRef = doc(db, 'users', uid);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      return snap.data() as UserProfile;
    }
    return null;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
}

export async function updateUserProfile(uid: string, updates: Partial<Omit<UserProfile, 'role' | 'uid'>>): Promise<boolean> {
  if (!isFirebaseConfigured || !db) return false;

  try {
    const userRef = doc(db, 'users', uid);
    const safeUpdates = {
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    // Delete role if present to enforce security constraint (users cannot change role)
    delete (safeUpdates as any).role;
    delete (safeUpdates as any).uid;

    await updateDoc(userRef, safeUpdates);
    return true;
  } catch (error) {
    console.error('Error updating user profile:', error);
    return false;
  }
}

export async function saveUserAddress(uid: string, address: Address): Promise<boolean> {
  if (!isFirebaseConfigured || !db) return false;

  try {
    const current = await getUserProfile(uid);
    if (!current) return false;

    let updatedAddresses = [...(current.addresses || [])];
    const index = updatedAddresses.findIndex((a) => a.id === address.id);

    if (index >= 0) {
      updatedAddresses[index] = address;
    } else {
      updatedAddresses.push(address);
    }

    if (address.isDefault) {
      updatedAddresses = updatedAddresses.map((a) => ({
        ...a,
        isDefault: a.id === address.id,
      }));
    }

    return await updateUserProfile(uid, { addresses: updatedAddresses });
  } catch (error) {
    console.error('Error saving address:', error);
    return false;
  }
}

export async function deleteUserAddress(uid: string, addressId: string): Promise<boolean> {
  if (!isFirebaseConfigured || !db) return false;

  try {
    const current = await getUserProfile(uid);
    if (!current) return false;

    const updatedAddresses = (current.addresses || []).filter((a) => a.id !== addressId);
    return await updateUserProfile(uid, { addresses: updatedAddresses });
  } catch (error) {
    console.error('Error deleting address:', error);
    return false;
  }
}

export async function signOutUser(): Promise<void> {
  if (!isFirebaseConfigured || !auth) return;
  await signOut(auth);
}

// ----------------------------------------------------------------------
// CART & WISHLIST FIRESTORE PERSISTENCE
// ----------------------------------------------------------------------

export async function saveUserCart(userId: string, items: CartItem[]): Promise<boolean> {
  if (!isFirebaseConfigured || !db || !userId) return false;
  try {
    const cartRef = doc(db, 'carts', userId);
    await setDoc(cartRef, {
      userId,
      items,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
    return true;
  } catch (error) {
    console.error('Error saving user cart to Firestore:', error);
    return false;
  }
}

export async function getUserCart(userId: string): Promise<CartItem[]> {
  if (!isFirebaseConfigured || !db || !userId) return [];
  try {
    const cartRef = doc(db, 'carts', userId);
    const snap = await getDoc(cartRef);
    if (snap.exists()) {
      const data = snap.data();
      return data.items || [];
    }
    return [];
  } catch (error) {
    console.error('Error getting user cart from Firestore:', error);
    return [];
  }
}

export async function saveUserWishlist(userId: string, items: Product[]): Promise<boolean> {
  if (!isFirebaseConfigured || !db || !userId) return false;
  try {
    const wishlistRef = doc(db, 'wishlists', userId);
    await setDoc(wishlistRef, {
      userId,
      items,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
    return true;
  } catch (error) {
    console.error('Error saving user wishlist to Firestore:', error);
    return false;
  }
}

export async function getUserWishlist(userId: string): Promise<Product[]> {
  if (!isFirebaseConfigured || !db || !userId) return [];
  try {
    const wishlistRef = doc(db, 'wishlists', userId);
    const snap = await getDoc(wishlistRef);
    if (snap.exists()) {
      const data = snap.data();
      return data.items || [];
    }
    return [];
  } catch (error) {
    console.error('Error getting user wishlist from Firestore:', error);
    return [];
  }
}

export function subscribeToAuthState(callback: (user: User | null) => void): () => void {
  if (!isFirebaseConfigured || !auth) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
}

// ----------------------------------------------------------------------
// CHECKOUT & ORDER FIRESTORE SYSTEM
// ----------------------------------------------------------------------

export interface CreateOrderParams {
  userId: string | null;
  customerName: string;
  phone: string;
  email: string;
  cartItems: CartItem[];
  shippingAddress: OrderShippingAddress;
  promoCode?: string;
  shippingOption?: 'standard' | 'express';
}

export async function createValidatedOrder(params: CreateOrderParams): Promise<Order> {
  const {
    userId,
    customerName,
    phone,
    email,
    cartItems,
    shippingAddress,
    promoCode,
    shippingOption = 'standard',
  } = params;

  if (!cartItems || cartItems.length === 0) {
    throw new Error('Cannot create order with an empty cart.');
  }

  // 1. Calculate order financials & create item objects
  let calculatedSubtotal = 0;
  const validatedItems: OrderItem[] = [];

  // Determine promo code discount
  let discountRate = 0;
  if (promoCode) {
    const code = promoCode.trim().toUpperCase();
    if (code === 'PREMIUM15') discountRate = 0.15;
    else if (code === 'WELCOME10') discountRate = 0.10;
    else if (code === 'VIP20') discountRate = 0.20;
  }

  // Generate readable order number: PS-2026-XXXXX
  const randomNum = Math.floor(10000 + Math.random() * 90000);
  const orderNumber = `PS-2026-${randomNum}`;
  const now = new Date().toISOString();
  const orderId = db ? doc(collection(db, 'orders')).id : `ord_${Date.now()}`;

  // If Firebase is configured, execute Firestore order creation
  if (isFirebaseConfigured && db) {
    try {
      // Step A: Read product documents involved in the order to validate stock & prices
      const prodSnaps: { cartItem: CartItem; ref: any; snap: any }[] = [];
      for (const item of cartItems) {
        const prodRef = doc(db, 'products', item.product.id);
        const prodSnap = await getDoc(prodRef);
        if (prodSnap.exists()) {
          prodSnaps.push({ cartItem: item, ref: prodRef, snap: prodSnap });
        }
      }

      // Step B: Validate stock and compute totals
      calculatedSubtotal = 0;
      validatedItems.length = 0; // reset

      const pendingStockUpdates: { ref: any; newStock: number; newVariants: any[] }[] = [];

      for (const cartItem of cartItems) {
        const match = prodSnaps.find((s) => s.cartItem.product.id === cartItem.product.id);
        const prodData = match?.snap.exists() ? (match.snap.data() as FirestoreProduct) : null;

        const variants = prodData?.variants || [];
        const variantIndex = variants.findIndex(
          (v) =>
            v.size.toLowerCase() === cartItem.selectedSize.toLowerCase() &&
            v.color.toLowerCase() === cartItem.selectedColor.toLowerCase()
        );

        let availableStock = prodData ? (prodData.stock ?? 15) : 15;
        if (variantIndex >= 0) {
          availableStock = variants[variantIndex].stock;
        }

        if (availableStock < cartItem.quantity) {
          throw new Error(
            `Insufficient stock for "${cartItem.product.name}" (${cartItem.selectedSize} / ${cartItem.selectedColor}). Available: ${availableStock}, Requested: ${cartItem.quantity}`
          );
        }

        const unitPrice =
          prodData?.salePrice && prodData.salePrice < prodData.price
            ? prodData.salePrice
            : cartItem.product.price;

        calculatedSubtotal += unitPrice * cartItem.quantity;

        validatedItems.push({
          productId: cartItem.product.id,
          productName: cartItem.product.name,
          productImage: (prodData?.images && prodData.images[0]) || cartItem.product.image,
          sku: (variantIndex >= 0 && variants[variantIndex].sku) || prodData?.sku || 'PS-STD',
          size: cartItem.selectedSize,
          color: cartItem.selectedColor,
          quantity: cartItem.quantity,
          price: unitPrice,
        });

        if (match) {
          const updatedVariants = variants.map((v, idx) => {
            if (idx === variantIndex) {
              return { ...v, stock: Math.max(0, v.stock - cartItem.quantity) };
            }
            return v;
          });
          const newOverallStock = Math.max(0, (prodData?.stock ?? 15) - cartItem.quantity);
          pendingStockUpdates.push({
            ref: match.ref,
            newStock: newOverallStock,
            newVariants: updatedVariants,
          });
        }
      }

      // Financials
      const validatedDiscount = calculatedSubtotal * discountRate;
      const validatedShippingFee =
        calculatedSubtotal >= 75 ? 0 : shippingOption === 'express' ? 18.0 : 9.95;
      const validatedTotal = Math.max(0, calculatedSubtotal - validatedDiscount + validatedShippingFee);

      const finalOrder: Order = {
        id: orderId,
        orderNumber,
        userId: userId || null,
        customerName,
        phone,
        email,
        items: validatedItems,
        shippingAddress,
        subtotal: Number(calculatedSubtotal.toFixed(2)),
        shippingFee: Number(validatedShippingFee.toFixed(2)),
        discount: Number(validatedDiscount.toFixed(2)),
        total: Number(validatedTotal.toFixed(2)),
        paymentMethod: 'Cash on Delivery',
        paymentStatus: 'Pending',
        orderStatus: 'Pending',
        internalNotes: [],
        createdAt: now,
        updatedAt: now,
      };

      // Step C: Save order document into Firestore orders collection
      const orderRef = doc(db, 'orders', orderId);
      await setDoc(orderRef, finalOrder);

      // Attempt inventory update on product docs (admin only; safely ignored for customers/guests)
      for (const update of pendingStockUpdates) {
        try {
          await updateDoc(update.ref, {
            stock: update.newStock,
            variants: update.newVariants,
            updatedAt: now,
          });
        } catch (stockErr) {
          // Customers/guests are restricted from modifying catalog inventory directly
        }
      }

      // Save to localStorage fallback
      try {
        const existingOrdersJson = localStorage.getItem('premium_store_orders') || '[]';
        const localOrders: Order[] = JSON.parse(existingOrdersJson);
        localOrders.unshift(finalOrder);
        localStorage.setItem('premium_store_orders', JSON.stringify(localOrders));
      } catch (e) {}

      return finalOrder;
    } catch (err: any) {
      console.error('Error creating order in Firestore:', err);
      throw err;
    }
  }

  // Fallback mode when Firebase is not configured
  for (const item of cartItems) {
    const unitPrice =
      item.product.salePrice && item.product.salePrice < item.product.price
        ? item.product.salePrice
        : item.product.price;
    calculatedSubtotal += unitPrice * item.quantity;

    validatedItems.push({
      productId: item.product.id,
      productName: item.product.name,
      productImage: item.product.image,
      sku: item.product.sku || 'PS-STD',
      size: item.selectedSize,
      color: item.selectedColor,
      quantity: item.quantity,
      price: unitPrice,
    });
  }

  const validatedDiscount = calculatedSubtotal * discountRate;
  const validatedShippingFee = calculatedSubtotal >= 75 ? 0 : shippingOption === 'express' ? 18.0 : 9.95;
  const validatedTotal = Math.max(0, calculatedSubtotal - validatedDiscount + validatedShippingFee);

  const localOrder: Order = {
    id: orderId,
    orderNumber,
    userId: userId || null,
    customerName,
    phone,
    email,
    items: validatedItems,
    shippingAddress,
    subtotal: Number(calculatedSubtotal.toFixed(2)),
    shippingFee: Number(validatedShippingFee.toFixed(2)),
    discount: Number(validatedDiscount.toFixed(2)),
    total: Number(validatedTotal.toFixed(2)),
    paymentMethod: 'Cash on Delivery',
    paymentStatus: 'Pending',
    orderStatus: 'Pending',
    internalNotes: [],
    createdAt: now,
    updatedAt: now,
  };

  try {
    const existingOrdersJson = localStorage.getItem('premium_store_orders') || '[]';
    const localOrders: Order[] = JSON.parse(existingOrdersJson);
    localOrders.unshift(localOrder);
    localStorage.setItem('premium_store_orders', JSON.stringify(localOrders));
  } catch (e) {}

  return localOrder;
}

export async function getOrderByNumber(orderNumberOrId: string): Promise<Order | null> {
  // 1. Check local storage first
  try {
    const localOrdersJson = localStorage.getItem('premium_store_orders');
    if (localOrdersJson) {
      const localOrders: Order[] = JSON.parse(localOrdersJson);
      const found = localOrders.find(
        (o) => o.orderNumber.toLowerCase() === orderNumberOrId.toLowerCase() || o.id === orderNumberOrId
      );
      if (found) return found;
    }
  } catch (e) {}

  // 2. Query Firestore
  if (isFirebaseConfigured && db) {
    try {
      const q = query(collection(db, 'orders'), where('orderNumber', '==', orderNumberOrId));
      const snap = await getDocs(q);
      if (!snap.empty) {
        return snap.docs[0].data() as Order;
      }

      const docRef = doc(db, 'orders', orderNumberOrId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data() as Order;
      }
    } catch (err) {
      console.error('Error getting order by number from Firestore:', err);
    }
  }

  return null;
}

export async function getUserOrders(userId: string | null, email?: string): Promise<Order[]> {
  const results: Order[] = [];

  if (isFirebaseConfigured && db && userId) {
    try {
      const q = query(
        collection(db, 'orders'),
        where('userId', '==', userId)
      );
      const snap = await getDocs(q);
      snap.forEach((docSnap) => {
        results.push(docSnap.data() as Order);
      });
    } catch (err) {
      console.warn('Error fetching user orders from Firestore:', err);
    }
  }

  // Check local storage
  try {
    const localOrdersJson = localStorage.getItem('premium_store_orders');
    if (localOrdersJson) {
      const localOrders: Order[] = JSON.parse(localOrdersJson);
      localOrders.forEach((o) => {
        if (
          ((userId && o.userId === userId) || (email && o.email.toLowerCase() === email.toLowerCase())) &&
          !results.some((r) => r.id === o.id)
        ) {
          results.push(o);
        }
      });
    }
  } catch (e) {}

  return results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

// ----------------------------------------------------------------------
// ADMIN FUNCTIONS
// ----------------------------------------------------------------------

export async function deleteProductFromFirestore(productId: string): Promise<boolean> {
  if (isFirebaseConfigured && db) {
    try {
      const { deleteDoc } = await import('firebase/firestore');
      await deleteDoc(doc(db, 'products', productId));
      return true;
    } catch (err) {
      console.error('Error deleting product from Firestore:', err);
      return false;
    }
  }
  return true;
}

export async function updateProductStatusInFirestore(
  productId: string,
  status: 'active' | 'draft' | 'archived'
): Promise<boolean> {
  if (isFirebaseConfigured && db) {
    try {
      await updateDoc(doc(db, 'products', productId), {
        status,
        updatedAt: new Date().toISOString(),
      });
      return true;
    } catch (err) {
      console.error('Error updating product status:', err);
      return false;
    }
  }
  return true;
}

export async function getAllCategoriesAdmin(): Promise<FirestoreCategory[]> {
  if (isFirebaseConfigured && db) {
    try {
      const snap = await getDocs(collection(db, 'categories'));
      if (!snap.empty) {
        return snap.docs.map((d) => ({
          ...(d.data() as FirestoreCategory),
          categoryId: d.id,
        }));
      }
    } catch (err) {
      console.warn('Error fetching admin categories from Firestore:', err);
    }
  }

  // Fallback default categories
  return CATEGORIES.map((c, idx) => ({
    categoryId: c.id,
    name: c.name,
    slug: c.id,
    description: c.tagline,
    image: c.image,
    active: true,
    sortOrder: idx + 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }));
}

export async function createOrUpdateCategory(cat: Partial<FirestoreCategory>): Promise<boolean> {
  if (!cat.categoryId && !cat.name) return false;
  const id = cat.categoryId || cat.name!.toLowerCase().replace(/\s+/g, '-');
  const now = new Date().toISOString();

  const fullCategory: FirestoreCategory = {
    categoryId: id,
    name: cat.name || 'Untitled Category',
    slug: cat.slug || id,
    description: cat.description || '',
    image: cat.image || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=1000&auto=format&fit=crop',
    active: cat.active !== undefined ? cat.active : true,
    sortOrder: cat.sortOrder || 1,
    createdAt: cat.createdAt || now,
    updatedAt: now,
  };

  if (isFirebaseConfigured && db) {
    try {
      await setDoc(doc(db, 'categories', id), fullCategory, { merge: true });
      return true;
    } catch (err) {
      console.error('Error saving category to Firestore:', err);
      return false;
    }
  }
  return true;
}

export async function deleteCategoryInFirestore(categoryId: string): Promise<boolean> {
  if (isFirebaseConfigured && db) {
    try {
      const { deleteDoc } = await import('firebase/firestore');
      await deleteDoc(doc(db, 'categories', categoryId));
      return true;
    } catch (err) {
      console.error('Error deleting category:', err);
      return false;
    }
  }
  return true;
}

export async function getAllCollectionsAdmin(): Promise<FirestoreCollection[]> {
  if (isFirebaseConfigured && db) {
    try {
      const snap = await getDocs(collection(db, 'collections'));
      if (!snap.empty) {
        return snap.docs.map((d) => ({
          ...(d.data() as FirestoreCollection),
          collectionId: d.id,
        }));
      }
    } catch (err) {
      console.warn('Error fetching admin collections:', err);
    }
  }

  return [
    {
      collectionId: 'new-arrivals',
      name: 'New Arrivals',
      slug: 'new-arrivals',
      description: 'The latest streetwear drops & seasonal pieces',
      image: 'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?q=80&w=1000&auto=format&fit=crop',
      active: true,
      sortOrder: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      collectionId: 'best-sellers',
      name: 'Best Sellers',
      slug: 'best-sellers',
      description: 'Top requested streetwear essentials',
      image: 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?q=80&w=1000&auto=format&fit=crop',
      active: true,
      sortOrder: 2,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      collectionId: 'summer-grails-24',
      name: 'Summer Grails 2024',
      slug: 'summer-grails-24',
      description: 'Acid wash oversized boxy silhouettes & industrial cutouts',
      image: 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?q=80&w=1000&auto=format&fit=crop',
      active: true,
      sortOrder: 3,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];
}

export async function createOrUpdateCollection(col: Partial<FirestoreCollection>): Promise<boolean> {
  if (!col.collectionId && !col.name) return false;
  const id = col.collectionId || col.name!.toLowerCase().replace(/\s+/g, '-');
  const now = new Date().toISOString();

  const fullCol: FirestoreCollection = {
    collectionId: id,
    name: col.name || 'Untitled Collection',
    slug: col.slug || id,
    description: col.description || '',
    image: col.image || 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?q=80&w=1000&auto=format&fit=crop',
    active: col.active !== undefined ? col.active : true,
    sortOrder: col.sortOrder || 1,
    createdAt: col.createdAt || now,
    updatedAt: now,
  };

  if (isFirebaseConfigured && db) {
    try {
      await setDoc(doc(db, 'collections', id), fullCol, { merge: true });
      return true;
    } catch (err) {
      console.error('Error saving collection:', err);
      return false;
    }
  }
  return true;
}

export async function deleteCollectionInFirestore(collectionId: string): Promise<boolean> {
  if (isFirebaseConfigured && db) {
    try {
      const { deleteDoc } = await import('firebase/firestore');
      await deleteDoc(doc(db, 'collections', collectionId));
      return true;
    } catch (err) {
      console.error('Error deleting collection:', err);
      return false;
    }
  }
  return true;
}

export async function updateInventoryStockInFirestore(
  productId: string,
  stock: number,
  lowStockThreshold?: number
): Promise<boolean> {
  if (isFirebaseConfigured && db) {
    try {
      const payload: any = {
        stock: Math.max(0, stock),
        updatedAt: new Date().toISOString(),
      };
      if (typeof lowStockThreshold === 'number') {
        payload.lowStockThreshold = Math.max(1, lowStockThreshold);
      }
      await updateDoc(doc(db, 'products', productId), payload);
      return true;
    } catch (err) {
      console.error('Error updating stock in Firestore:', err);
      return false;
    }
  }
  return true;
}

export async function updateInventoryVariantsInFirestore(
  productId: string,
  variants: Array<{ size: string; color: string; sku: string; stock: number }>,
  totalStock: number,
  lowStockThreshold?: number
): Promise<boolean> {
  if (isFirebaseConfigured && db) {
    try {
      const payload: any = {
        variants,
        stock: Math.max(0, totalStock),
        updatedAt: new Date().toISOString(),
      };
      if (typeof lowStockThreshold === 'number') {
        payload.lowStockThreshold = Math.max(1, lowStockThreshold);
      }
      await updateDoc(doc(db, 'products', productId), payload);
      return true;
    } catch (err) {
      console.error('Error updating variants in Firestore:', err);
      return false;
    }
  }
  return true;
}

export async function addOrderInternalNoteInFirestore(
  orderId: string,
  noteText: string,
  author: string = 'Admin'
): Promise<{ success: boolean; notes: OrderInternalNote[] }> {
  const newNote: OrderInternalNote = {
    id: `note_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    note: noteText.trim(),
    createdAt: new Date().toISOString(),
    author,
  };

  let updatedNotes: OrderInternalNote[] = [];

  if (isFirebaseConfigured && db) {
    try {
      const orderRef = doc(db, 'orders', orderId);
      const orderSnap = await getDoc(orderRef);
      if (orderSnap.exists()) {
        const orderData = orderSnap.data() as Order;
        const existingNotes = orderData.internalNotes || [];
        updatedNotes = [newNote, ...existingNotes];
        await updateDoc(orderRef, {
          internalNotes: updatedNotes,
          updatedAt: new Date().toISOString(),
        });
      }
    } catch (err) {
      console.error('Error adding internal note in Firestore:', err);
    }
  }

  // Sync to localStorage as well
  try {
    const localOrdersJson = localStorage.getItem('premium_store_orders');
    if (localOrdersJson) {
      const localOrders: Order[] = JSON.parse(localOrdersJson);
      const updated = localOrders.map((o) => {
        if (o.id === orderId || o.orderNumber === orderId) {
          const currentNotes = o.internalNotes || [];
          if (updatedNotes.length === 0) {
            updatedNotes = [newNote, ...currentNotes];
          }
          return {
            ...o,
            internalNotes: updatedNotes,
            updatedAt: new Date().toISOString(),
          };
        }
        return o;
      });
      localStorage.setItem('premium_store_orders', JSON.stringify(updated));
    }
  } catch (e) {}

  if (updatedNotes.length === 0) {
    updatedNotes = [newNote];
  }

  return { success: true, notes: updatedNotes };
}

export async function getAllOrdersAdmin(): Promise<Order[]> {
  const allOrders: Order[] = [];

  if (isFirebaseConfigured && db) {
    try {
      const snap = await getDocs(collection(db, 'orders'));
      snap.forEach((d) => {
        allOrders.push(d.data() as Order);
      });
    } catch (err) {
      console.warn('Error fetching all admin orders:', err);
    }
  }

  // Merge with local orders
  try {
    const localOrdersJson = localStorage.getItem('premium_store_orders');
    if (localOrdersJson) {
      const localOrders: Order[] = JSON.parse(localOrdersJson);
      localOrders.forEach((lo) => {
        if (!allOrders.some((o) => o.id === lo.id || o.orderNumber === lo.orderNumber)) {
          allOrders.push(lo);
        }
      });
    }
  } catch (e) {}

  return allOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function updateOrderStatusInFirestore(
  orderId: string,
  orderStatus: OrderStatus,
  paymentStatus?: PaymentStatus
): Promise<boolean> {
  const updatePayload: any = {
    orderStatus,
    updatedAt: new Date().toISOString(),
  };
  if (paymentStatus) {
    updatePayload.paymentStatus = paymentStatus;
  }

  if (isFirebaseConfigured && db) {
    try {
      const orderRef = doc(db, 'orders', orderId);
      const prevSnap = await getDoc(orderRef);
      if (prevSnap.exists()) {
        const prevOrder = prevSnap.data() as Order;
        const previousStatus = prevOrder.orderStatus;

        // Restore stock if transitioning to Cancelled or Returned from active status
        if (
          (orderStatus === 'Cancelled' || orderStatus === 'Returned') &&
          previousStatus !== 'Cancelled' &&
          previousStatus !== 'Returned'
        ) {
          for (const item of prevOrder.items) {
            try {
              const prodRef = doc(db, 'products', item.productId);
              const prodSnap = await getDoc(prodRef);
              if (prodSnap.exists()) {
                const prodData = prodSnap.data() as FirestoreProduct;
                const currentStock = prodData.stock ?? 0;
                const restoredStock = currentStock + item.quantity;

                const variants = prodData.variants || [];
                const updatedVariants = variants.map((v) => {
                  if (
                    v.size.toLowerCase() === item.size.toLowerCase() &&
                    v.color.toLowerCase() === item.color.toLowerCase()
                  ) {
                    return { ...v, stock: v.stock + item.quantity };
                  }
                  return v;
                });

                await updateDoc(prodRef, {
                  stock: restoredStock,
                  variants: updatedVariants,
                  updatedAt: new Date().toISOString(),
                });
              }
            } catch (err) {
              console.warn('Error restoring stock on cancellation:', err);
            }
          }
        }
      }

      await updateDoc(orderRef, updatePayload);
    } catch (err) {
      console.error('Error updating order in Firestore:', err);
    }
  }

  // Update in localStorage
  try {
    const localOrdersJson = localStorage.getItem('premium_store_orders');
    if (localOrdersJson) {
      const localOrders: Order[] = JSON.parse(localOrdersJson);
      const updated = localOrders.map((o) => {
        if (o.id === orderId || o.orderNumber === orderId) {
          return {
            ...o,
            orderStatus,
            paymentStatus: paymentStatus || o.paymentStatus,
            updatedAt: new Date().toISOString(),
          };
        }
        return o;
      });
      localStorage.setItem('premium_store_orders', JSON.stringify(updated));
    }
  } catch (e) {}

  return true;
}

export async function getAllCustomersAdmin(): Promise<UserProfile[]> {
  const customers: UserProfile[] = [];

  if (isFirebaseConfigured && db) {
    try {
      const snap = await getDocs(collection(db, 'users'));
      snap.forEach((d) => {
        customers.push(d.data() as UserProfile);
      });
    } catch (err) {
      console.warn('Error fetching customers from Firestore:', err);
    }
  }

  if (customers.length === 0) {
    // Fallback sample customer data if database empty
    return [
      {
        uid: 'usr_001',
        name: 'Alex Rivera',
        email: 'alex.rivera@example.com',
        phone: '+1 (555) 234-5678',
        photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
        role: 'customer',
        addresses: [
          {
            id: 'addr_1',
            name: 'Alex Rivera',
            phone: '+1 (555) 234-5678',
            street: '742 Evergreen Terrace',
            city: 'Los Angeles',
            state: 'CA',
            zip: '90001',
            country: 'USA',
            isDefault: true,
          },
        ],
        createdAt: '2026-01-15T10:30:00Z',
        updatedAt: '2026-01-15T10:30:00Z',
      },
      {
        uid: 'usr_002',
        name: 'Jordan Chen',
        email: 'jordan.chen@example.com',
        phone: '+1 (555) 876-5432',
        photoURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop',
        role: 'customer',
        addresses: [],
        createdAt: '2026-02-01T14:20:00Z',
        updatedAt: '2026-02-01T14:20:00Z',
      },
    ];
  }

  return customers;
}

export async function getAdminDashboardStats() {
  const products = (await getProducts({ limitCount: 200 })).products;
  const orders = await getAllOrdersAdmin();
  const customers = await getAllCustomersAdmin();

  const totalProducts = products.length;
  const totalOrders = orders.length;
  const totalCustomers = customers.length;
  const pendingOrders = orders.filter((o) => o.orderStatus === 'Pending').length;
  const lowStockProducts = products.filter((p) => p.stock <= 10);
  const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);

  return {
    totalProducts,
    totalOrders,
    totalCustomers,
    pendingOrders,
    lowStockCount: lowStockProducts.length,
    lowStockProducts,
    totalRevenue,
    recentOrders: orders.slice(0, 5),
  };
}

export async function updateUserRoleInFirestore(uid: string, role: 'admin' | 'customer'): Promise<boolean> {
  if (isFirebaseConfigured && db) {
    try {
      await updateDoc(doc(db, 'users', uid), {
        role,
        updatedAt: new Date().toISOString(),
      });
      return true;
    } catch (err) {
      console.error('Error updating user role in Firestore:', err);
      return false;
    }
  }
  return true;
}

export async function getSiteSettingsFromFirestore() {
  return await getSiteSettings();
}

export async function saveSiteSettingsToFirestore(settings: any) {
  return await saveSiteSettings(settings);
}

export async function getSiteSettings() {
  if (isFirebaseConfigured && db) {
    try {
      const snap = await getDoc(doc(db, 'site_settings', 'general'));
      if (snap.exists()) {
        return snap.data();
      }
    } catch (e) {}
  }

  try {
    const local = localStorage.getItem('premium_store_settings');
    if (local) return JSON.parse(local);
  } catch (e) {}

  return {
    storeName: 'PREMIUM STORE',
    announcementText: 'FREE EXPRESS SHIPPING ON ORDERS OVER Rs. 3,500 • USE CODE "PREMIUM15" FOR 15% OFF',
    currency: 'PKR (Rs.)',
    enableCOD: true,
    supportEmail: 'thepremiumstoree@gmail.com',
    supportPhone: '+92 323 7506649',
    heroHeadline: 'STREETWEAR CULT GRAILS',
    heroSubheadline: 'SPRING / SUMMER 2026 LIMITED DROP',
  };
}

export async function saveSiteSettings(settings: any) {
  if (isFirebaseConfigured && db) {
    try {
      await setDoc(doc(db, 'site_settings', 'general'), settings, { merge: true });
    } catch (e) {}
  }
  try {
    localStorage.setItem('premium_store_settings', JSON.stringify(settings));
  } catch (e) {}
  return true;
}

// ------------------------------------
// HOMEPAGE CMS FIRESTORE & STORAGE
// ------------------------------------

export async function getHomepageCMSContentFromFirestore(): Promise<HomepageCMSContent> {
  if (isFirebaseConfigured && db) {
    try {
      const snap = await getDoc(doc(db, 'site_settings', 'homepage_cms'));
      if (snap.exists()) {
        const data = snap.data() as Partial<HomepageCMSContent>;
        // Deep merge with DEFAULT_HOMEPAGE_CMS to ensure all fields are defined
        return {
          ...DEFAULT_HOMEPAGE_CMS,
          ...data,
          announcementBar: { ...DEFAULT_HOMEPAGE_CMS.announcementBar, ...(data.announcementBar || {}) },
          heroBanner: { ...DEFAULT_HOMEPAGE_CMS.heroBanner, ...(data.heroBanner || {}) },
          featuredCategories: { ...DEFAULT_HOMEPAGE_CMS.featuredCategories, ...(data.featuredCategories || {}) },
          newArrivals: { ...DEFAULT_HOMEPAGE_CMS.newArrivals, ...(data.newArrivals || {}) },
          bestSellers: { ...DEFAULT_HOMEPAGE_CMS.bestSellers, ...(data.bestSellers || {}) },
          featuredCollection: { ...DEFAULT_HOMEPAGE_CMS.featuredCollection, ...(data.featuredCollection || {}) },
          promotionalBanner: { ...DEFAULT_HOMEPAGE_CMS.promotionalBanner, ...(data.promotionalBanner || {}) },
          lookbook: { ...DEFAULT_HOMEPAGE_CMS.lookbook, ...(data.lookbook || {}) },
          instagramSection: { ...DEFAULT_HOMEPAGE_CMS.instagramSection, ...(data.instagramSection || {}) },
          newsletterSection: { ...DEFAULT_HOMEPAGE_CMS.newsletterSection, ...(data.newsletterSection || {}) },
        };
      }
    } catch (e) {
      console.warn('Error fetching homepage CMS from Firestore:', e);
    }
  }

  try {
    const local = localStorage.getItem('premium_store_homepage_cms');
    if (local) {
      const parsed = JSON.parse(local);
      return {
        ...DEFAULT_HOMEPAGE_CMS,
        ...parsed,
      };
    }
  } catch (e) {}

  return DEFAULT_HOMEPAGE_CMS;
}

export async function saveHomepageCMSContentToFirestore(cmsContent: HomepageCMSContent): Promise<boolean> {
  if (isFirebaseConfigured && db) {
    try {
      await setDoc(doc(db, 'site_settings', 'homepage_cms'), cmsContent, { merge: true });
    } catch (err) {
      console.error('Error saving homepage CMS content to Firestore:', err);
    }
  }

  try {
    localStorage.setItem('premium_store_homepage_cms', JSON.stringify(cmsContent));
  } catch (e) {}

  return true;
}

export async function uploadCMSImageToFirebaseStorage(
  file: File,
  folderName: string = 'cms_assets'
): Promise<string> {
  if (isFirebaseConfigured && storage) {
    try {
      const fileName = `${folderName}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const storageRef = ref(storage, fileName);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadUrl = await getDownloadURL(snapshot.ref);
      return downloadUrl;
    } catch (err) {
      console.warn('Firebase Storage upload failed, converting to local Data URL fallback:', err);
    }
  }

  // Fallback: convert file to Base64 Data URL so local session/offline admin works smoothly
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}



