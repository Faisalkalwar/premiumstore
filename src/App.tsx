import React from 'react';
import { ShopProvider, useShop } from './context/ShopContext';
import { AnnouncementBar } from './components/layout/AnnouncementBar';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { HeroSection } from './components/home/HeroSection';
import { PromotionalBanner } from './components/home/PromotionalBanner';
import { CategorySection } from './components/home/CategorySection';
import { NewArrivalsSection } from './components/home/NewArrivalsSection';
import { ProductGridFilter } from './components/home/ProductGridFilter';
import { FeaturedCollection } from './components/home/FeaturedCollection';
import { BestSellersSection } from './components/home/BestSellersSection';
import { LookbookSection } from './components/home/LookbookSection';
import { InstagramSection } from './components/home/InstagramSection';
import { NewsletterSection } from './components/home/NewsletterSection';
import { LoginView } from './components/auth/LoginView';
import { RegisterView } from './components/auth/RegisterView';
import { ForgotPasswordView } from './components/auth/ForgotPasswordView';
import { AccountView } from './components/auth/AccountView';
import { ProductDetailView } from './components/product/ProductDetailView';
import { CartView } from './components/cart/CartView';
import { WishlistView } from './components/wishlist/WishlistView';
import { CheckoutView } from './components/checkout/CheckoutView';
import { OrderSuccessView } from './components/checkout/OrderSuccessView';
import { OrdersView } from './components/account/OrdersView';
import { OrderDetailView } from './components/account/OrderDetailView';
import { ContactView } from './components/contact/ContactView';
import { WhatsAppFloatingButton } from './components/common/WhatsAppFloatingButton';

// Admin Components
import { AdminDashboardOverview } from './components/admin/AdminDashboardOverview';
import { AdminProductsList } from './components/admin/AdminProductsList';
import { AdminProductForm } from './components/admin/AdminProductForm';
import { AdminCategoriesView } from './components/admin/AdminCategoriesView';
import { AdminCollectionsView } from './components/admin/AdminCollectionsView';
import { AdminInventoryView } from './components/admin/AdminInventoryView';
import { AdminOrdersView } from './components/admin/AdminOrdersView';
import { AdminCustomersView } from './components/admin/AdminCustomersView';
import { AdminContentView } from './components/admin/AdminContentView';
import { AdminSettingsView } from './components/admin/AdminSettingsView';

import { CartDrawer } from './components/ui/CartDrawer';
import { WishlistDrawer } from './components/ui/WishlistDrawer';
import { SearchModal } from './components/ui/SearchModal';
import { QuickViewModal } from './components/ui/QuickViewModal';
import { AccountModal } from './components/ui/AccountModal';
import { FirebaseStatusWidget } from './components/ui/FirebaseStatusWidget';
import { Toast } from './components/ui/Toast';
import { SEO } from './components/common/SEO';

const MainContent: React.FC = () => {
  const { currentView } = useShop();

  // Admin Views
  if (currentView === 'admin') {
    return <AdminDashboardOverview />;
  }

  if (currentView === 'admin-products') {
    return <AdminProductsList />;
  }

  if (currentView === 'admin-product-new') {
    return <AdminProductForm mode="new" />;
  }

  if (currentView === 'admin-product-edit') {
    return <AdminProductForm mode="edit" />;
  }

  if (currentView === 'admin-categories') {
    return <AdminCategoriesView />;
  }

  if (currentView === 'admin-collections') {
    return <AdminCollectionsView />;
  }

  if (currentView === 'admin-inventory') {
    return <AdminInventoryView />;
  }

  if (currentView === 'admin-orders') {
    return <AdminOrdersView />;
  }

  if (currentView === 'admin-customers') {
    return <AdminCustomersView />;
  }

  if (currentView === 'admin-content') {
    return <AdminContentView />;
  }

  if (currentView === 'admin-settings') {
    return <AdminSettingsView />;
  }

  // Storefront Views
  if (currentView === 'login') {
    return <LoginView />;
  }

  if (currentView === 'register') {
    return <RegisterView />;
  }

  if (currentView === 'forgot-password') {
    return <ForgotPasswordView />;
  }

  if (currentView === 'account') {
    return <AccountView />;
  }

  if (currentView === 'product') {
    return <ProductDetailView />;
  }

  if (currentView === 'cart') {
    return <CartView />;
  }

  if (currentView === 'wishlist') {
    return <WishlistView />;
  }

  if (currentView === 'checkout') {
    return <CheckoutView />;
  }

  if (currentView === 'order-success') {
    return <OrderSuccessView />;
  }

  if (currentView === 'account-orders') {
    return <OrdersView />;
  }

  if (currentView === 'account-order-detail') {
    return <OrderDetailView />;
  }

  if (currentView === 'contact') {
    return <ContactView />;
  }

  return (
    <>
      <HeroSection />
      <PromotionalBanner />
      <CategorySection />
      <NewArrivalsSection />
      <ProductGridFilter />
      <FeaturedCollection />
      <BestSellersSection />
      <LookbookSection />
      <InstagramSection />
      <NewsletterSection />
    </>
  );
};

const AppInner: React.FC = () => {
  const { currentView } = useShop();

  const isAdminView = currentView.startsWith('admin');

  // Compute page SEO title based on active view
  const getSeoTitle = () => {
    switch (currentView) {
      case 'home':
        return 'Streetwear & Urban Fashion Catalog';
      case 'cart':
        return 'Shopping Cart';
      case 'wishlist':
        return 'Saved Wishlist';
      case 'checkout':
        return 'Checkout';
      case 'login':
        return 'Customer Sign In';
      case 'register':
        return 'Create Account';
      case 'forgot-password':
        return 'Reset Password';
      case 'account':
      case 'account-orders':
      case 'account-order-detail':
        return 'My Account & Orders';
      case 'order-success':
        return 'Order Confirmed';
      case 'contact':
        return 'Contact Us — Store Location & WhatsApp';
      default:
        if (isAdminView) return 'Store Administration Portal';
        return undefined;
    }
  };

  if (isAdminView) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white font-sans selection:bg-[#00e65c] selection:text-black">
        <SEO title="Admin Control Center" />
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2.5 focus:bg-[#00e65c] focus:text-black focus:font-syne focus:font-extrabold focus:uppercase text-xs tracking-wider shadow-2xl"
        >
          Skip to main content
        </a>
        <main id="main-content">
          <MainContent />
        </main>
        <Toast />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans selection:bg-[#00e65c] selection:text-black">
      {currentView !== 'product' && <SEO title={getSeoTitle()} />}

      {/* ACCESSIBILITY: SKIP TO MAIN CONTENT LINK */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2.5 focus:bg-[#00e65c] focus:text-black focus:font-syne focus:font-extrabold focus:uppercase text-xs tracking-wider shadow-2xl"
      >
        Skip to main content
      </a>

      <AnnouncementBar />
      <Header />
      <main id="main-content" className="flex-1 focus:outline-none" tabIndex={-1}>
        <MainContent />
      </main>
      <Footer />

      <CartDrawer />
      <WishlistDrawer />
      <SearchModal />
      <QuickViewModal />
      <AccountModal />
      <FirebaseStatusWidget />
      <WhatsAppFloatingButton />
      <Toast />
    </div>
  );
};

export default function App() {
  return (
    <ShopProvider>
      <AppInner />
    </ShopProvider>
  );
}
