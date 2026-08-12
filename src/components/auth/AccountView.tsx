import React, { useState, useEffect } from 'react';
import { useShop } from '../../context/ShopContext';
import { updateUserProfile, saveUserAddress, deleteUserAddress } from '../../services/firebaseService';
import { Address } from '../../types';
import {
  User,
  ShoppingBag,
  Heart,
  MapPin,
  LogOut,
  ShieldCheck,
  Plus,
  Trash2,
  Check,
  Save,
  Loader2,
  Mail,
  Phone,
  Clock,
  Sparkles,
  ExternalLink,
  Tag
} from 'lucide-react';

type AccountTab = 'profile' | 'orders' | 'wishlist' | 'addresses';

export const AccountView: React.FC = () => {
  const {
    user,
    userProfile,
    refreshUserProfile,
    logOut,
    navigateTo,
    navigateToAccountOrders,
    showToast,
    wishlist,
    toggleWishlist,
    addToCart,
    setIsCartOpen
  } = useShop();

  const [activeTab, setActiveTab] = useState<AccountTab>('profile');

  // Profile Form state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Address Form state
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [addressName, setAddressName] = useState('');
  const [addressPhone, setAddressPhone] = useState('');
  const [addressStreet, setAddressStreet] = useState('');
  const [addressCity, setAddressCity] = useState('');
  const [addressState, setAddressState] = useState('');
  const [addressZip, setAddressZip] = useState('');
  const [addressCountry, setAddressCountry] = useState('United States');
  const [isAddressDefault, setIsAddressDefault] = useState(false);
  const [isSavingAddress, setIsSavingAddress] = useState(false);

  useEffect(() => {
    if (userProfile) {
      setName(userProfile.name || '');
      setPhone(userProfile.phone || '');
    } else if (user) {
      setName(user.displayName || '');
    }
  }, [userProfile, user]);

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 sm:py-24 text-center">
        <div className="bg-neutral-950 border border-neutral-800 p-8">
          <div className="w-12 h-12 bg-neutral-900 border border-neutral-800 text-[#00e65c] flex items-center justify-center mx-auto mb-4">
            <User size={24} />
          </div>
          <h2 className="font-syne font-extrabold text-2xl uppercase tracking-tight text-white mb-2">
            MEMBER <span className="text-[#00e65c]">ACCESS REQUIRED</span>
          </h2>
          <p className="font-mono text-xs text-neutral-400 mb-6 uppercase tracking-wider">
            Please sign in or register to view your account, order history & saved addresses.
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => navigateTo('login')}
              className="w-full bg-[#00e65c] text-black font-syne font-extrabold text-xs uppercase tracking-wider py-3.5 hover:bg-[#00ff66] transition-colors"
            >
              SIGN IN TO ACCOUNT
            </button>
            <button
              onClick={() => navigateTo('register')}
              className="w-full bg-neutral-900 border border-neutral-700 hover:border-[#00e65c] text-white font-syne font-bold text-xs uppercase tracking-wider py-3.5 transition-colors"
            >
              CREATE NEW VIP ACCOUNT
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsUpdatingProfile(true);
    const success = await updateUserProfile(user.uid, {
      name,
      phone
    });
    setIsUpdatingProfile(false);

    if (success) {
      await refreshUserProfile();
      showToast('Profile updated successfully!');
    } else {
      showToast('Failed to update profile.');
    }
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSavingAddress(true);
    const newAddress: Address = {
      id: `addr_${Date.now()}`,
      name: addressName || name || 'Primary Contact',
      phone: addressPhone || phone,
      street: addressStreet,
      city: addressCity,
      state: addressState,
      zip: addressZip,
      country: addressCountry,
      isDefault: isAddressDefault || (userProfile?.addresses || []).length === 0
    };

    const success = await saveUserAddress(user.uid, newAddress);
    setIsSavingAddress(false);

    if (success) {
      await refreshUserProfile();
      setIsAddingAddress(false);
      setAddressName('');
      setAddressPhone('');
      setAddressStreet('');
      setAddressCity('');
      setAddressState('');
      setAddressZip('');
      setIsAddressDefault(false);
      showToast('New shipping address saved!');
    } else {
      showToast('Failed to save address.');
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (!user) return;
    const success = await deleteUserAddress(user.uid, addressId);
    if (success) {
      await refreshUserProfile();
      showToast('Address removed.');
    }
  };

  const handleLogout = async () => {
    await logOut();
    showToast('Signed out safely.');
    navigateTo('login');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      {/* ACCOUNT HEADER */}
      <div className="bg-neutral-950 border border-neutral-800 p-6 sm:p-8 mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-neutral-900 border-2 border-[#00e65c] flex items-center justify-center font-syne font-extrabold text-2xl text-[#00e65c]">
            {userProfile?.name?.charAt(0).toUpperCase() || user.displayName?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-syne font-extrabold text-2xl sm:text-3xl uppercase tracking-tight text-white">
                {userProfile?.name || user.displayName || 'VIP MEMBER'}
              </h1>
              <span className="font-mono text-[10px] bg-[#00e65c]/20 text-[#00e65c] border border-[#00e65c]/40 px-2 py-0.5 uppercase tracking-widest font-bold">
                {userProfile?.role || 'CUSTOMER'}
              </span>
            </div>
            <p className="font-mono text-xs text-neutral-400 mt-1 flex items-center gap-2">
              <Mail size={12} className="text-[#00e65c]" />
              <span>{user.email}</span>
              <span className="text-neutral-600">•</span>
              <ShieldCheck size={12} className="text-[#00e65c]" />
              <span>UID: {user.uid.slice(0, 8)}...</span>
            </p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="bg-neutral-900 border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 font-syne font-bold text-xs uppercase tracking-wider py-2.5 px-4 flex items-center gap-2 transition-colors"
        >
          <LogOut size={16} />
          <span>LOG OUT</span>
        </button>
      </div>

      {/* ACCOUNT TABS LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* SIDEBAR TABS */}
        <div className="lg:col-span-1 space-y-1 bg-neutral-950 border border-neutral-800 p-2 h-fit">
          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full font-syne font-bold text-xs uppercase p-3 text-left flex items-center justify-between transition-colors ${
              activeTab === 'profile'
                ? 'bg-[#00e65c] text-black font-extrabold'
                : 'text-neutral-300 hover:bg-neutral-900 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <User size={16} />
              <span>PROFILE DETAILS</span>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`w-full font-syne font-bold text-xs uppercase p-3 text-left flex items-center justify-between transition-colors ${
              activeTab === 'orders'
                ? 'bg-[#00e65c] text-black font-extrabold'
                : 'text-neutral-300 hover:bg-neutral-900 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <ShoppingBag size={16} />
              <span>ORDER HISTORY</span>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('wishlist')}
            className={`w-full font-syne font-bold text-xs uppercase p-3 text-left flex items-center justify-between transition-colors ${
              activeTab === 'wishlist'
                ? 'bg-[#00e65c] text-black font-extrabold'
                : 'text-neutral-300 hover:bg-neutral-900 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Heart size={16} />
              <span>SAVED WISHLIST</span>
            </div>
            <span className={`font-mono text-[10px] px-1.5 py-0.5 ${activeTab === 'wishlist' ? 'bg-black text-[#00e65c]' : 'bg-neutral-800 text-neutral-300'}`}>
              {wishlist.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('addresses')}
            className={`w-full font-syne font-bold text-xs uppercase p-3 text-left flex items-center justify-between transition-colors ${
              activeTab === 'addresses'
                ? 'bg-[#00e65c] text-black font-extrabold'
                : 'text-neutral-300 hover:bg-neutral-900 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <MapPin size={16} />
              <span>ADDRESS BOOK</span>
            </div>
            <span className={`font-mono text-[10px] px-1.5 py-0.5 ${activeTab === 'addresses' ? 'bg-black text-[#00e65c]' : 'bg-neutral-800 text-neutral-300'}`}>
              {(userProfile?.addresses || []).length}
            </span>
          </button>
        </div>

        {/* TAB CONTENT PANEL */}
        <div className="lg:col-span-3 bg-neutral-950 border border-neutral-800 p-6 sm:p-8">
          {/* TAB 1: PROFILE */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-syne font-extrabold text-xl uppercase text-white flex items-center gap-2">
                  <User size={20} className="text-[#00e65c]" />
                  ACCOUNT <span className="text-[#00e65c]">PROFILE</span>
                </h3>
                <p className="font-mono text-xs text-neutral-400 mt-1">
                  Manage your account contact details and preferences.
                </p>
              </div>

              <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-lg">
                <div>
                  <label className="block font-mono text-[11px] text-neutral-300 uppercase tracking-wider mb-1">
                    FULL NAME
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-800 focus:border-[#00e65c] text-white text-xs font-mono px-4 py-3 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-mono text-[11px] text-neutral-300 uppercase tracking-wider mb-1">
                    EMAIL ADDRESS (AUTHENTICATED)
                  </label>
                  <input
                    type="email"
                    disabled
                    value={user.email || ''}
                    className="w-full bg-neutral-900/50 border border-neutral-800/80 text-neutral-500 text-xs font-mono px-4 py-3 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block font-mono text-[11px] text-neutral-300 uppercase tracking-wider mb-1">
                    PHONE NUMBER
                  </label>
                  <div className="relative">
                    <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 (555) 019-2834"
                      className="w-full bg-neutral-900 border border-neutral-800 focus:border-[#00e65c] text-white text-xs font-mono pl-10 pr-4 py-3 outline-none"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isUpdatingProfile}
                    className="bg-[#00e65c] text-black font-syne font-extrabold text-xs uppercase tracking-wider py-3 px-6 flex items-center gap-2 hover:bg-[#00ff66] transition-colors disabled:opacity-50"
                  >
                    {isUpdatingProfile ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>SAVING...</span>
                      </>
                    ) : (
                      <>
                        <Save size={16} />
                        <span>SAVE PROFILE CHANGES</span>
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* SECURITY & ACCOUNT META */}
              <div className="mt-8 pt-6 border-t border-neutral-800 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-neutral-900/60 p-4 border border-neutral-800/80">
                  <p className="font-mono text-[10px] text-neutral-500 uppercase tracking-widest mb-1">ASSIGNED ROLE</p>
                  <p className="font-syne font-bold text-sm text-[#00e65c] uppercase flex items-center gap-2">
                    <ShieldCheck size={16} />
                    {userProfile?.role || 'CUSTOMER'} (SECURED)
                  </p>
                </div>
                <div className="bg-neutral-900/60 p-4 border border-neutral-800/80">
                  <p className="font-mono text-[10px] text-neutral-500 uppercase tracking-widest mb-1">ACCOUNT CREATED</p>
                  <p className="font-syne font-bold text-sm text-neutral-300 uppercase flex items-center gap-2">
                    <Clock size={16} className="text-[#00e65c]" />
                    {userProfile?.createdAt ? new Date(userProfile.createdAt).toLocaleDateString() : 'Active Member'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ORDERS */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-syne font-extrabold text-xl uppercase text-white flex items-center gap-2">
                  <ShoppingBag size={20} className="text-[#00e65c]" />
                  YOUR <span className="text-[#00e65c]">ORDERS</span>
                </h3>
                <p className="font-mono text-xs text-neutral-400 mt-1">
                  Track shipment status, view order receipts and historical drops.
                </p>
              </div>

              <div className="bg-neutral-900/50 border border-neutral-800 text-center py-10 px-4 space-y-4">
                <div className="w-12 h-12 bg-neutral-900 text-[#00e65c] border border-neutral-800 flex items-center justify-center mx-auto">
                  <ShoppingBag size={24} />
                </div>
                <h4 className="font-syne font-bold text-base text-white uppercase">VIEW FULL ORDER HISTORY</h4>
                <p className="font-mono text-xs text-neutral-400 max-w-sm mx-auto">
                  Access live order progress tracking, shipping info, and receipt breakdowns for all your orders.
                </p>
                <button
                  onClick={navigateToAccountOrders}
                  className="bg-[#00e65c] text-black font-syne font-extrabold text-xs uppercase tracking-wider py-3.5 px-6 hover:bg-[#00ff66] transition-colors inline-flex items-center gap-2"
                >
                  <span>OPEN ORDER HISTORY DASHBOARD</span>
                  <ExternalLink size={14} />
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: WISHLIST */}
          {activeTab === 'wishlist' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-syne font-extrabold text-xl uppercase text-white flex items-center gap-2">
                  <Heart size={20} className="text-[#00e65c]" />
                  SAVED <span className="text-[#00e65c]">GRAILS ({wishlist.length})</span>
                </h3>
                <p className="font-mono text-xs text-neutral-400 mt-1">
                  Your bookmarked items ready for quick checkout.
                </p>
              </div>

              {wishlist.length === 0 ? (
                <div className="bg-neutral-900/50 border border-neutral-800 text-center py-12 px-4">
                  <div className="w-12 h-12 bg-neutral-900 text-rose-500 border border-neutral-800 flex items-center justify-center mx-auto mb-3">
                    <Heart size={24} />
                  </div>
                  <p className="font-syne font-bold text-base text-white uppercase">WISHLIST IS EMPTY</p>
                  <p className="font-mono text-xs text-neutral-400 mt-1">
                    Click the heart icon on any article to save it here for later.
                  </p>
                  <button
                    onClick={() => navigateTo('home')}
                    className="mt-6 bg-[#00e65c] text-black font-syne font-extrabold text-xs uppercase tracking-wider py-3 px-6 hover:bg-[#00ff66] transition-colors"
                  >
                    DISCOVER ARTICLES
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {wishlist.map((item) => (
                    <div
                      key={item.id}
                      className="bg-neutral-900 border border-neutral-800 p-4 flex items-center gap-4 group"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-20 h-24 object-cover border border-neutral-800 bg-black"
                      />
                      <div className="flex-1 min-w-0">
                        <span className="font-mono text-[9px] text-[#00e65c] uppercase tracking-widest block">
                          {item.category}
                        </span>
                        <h4 className="font-syne font-bold text-sm text-white uppercase truncate">
                          {item.name}
                        </h4>
                        <p className="font-mono text-xs text-[#00e65c] font-bold mt-1">
                          ${item.price.toFixed(2)}
                        </p>
                        <div className="flex items-center gap-2 mt-3">
                          <button
                            onClick={() => {
                              addToCart(item, item.sizes[0] || 'M', item.colors[0]?.name || 'Black');
                              setIsCartOpen(true);
                            }}
                            className="bg-[#00e65c] text-black font-syne font-extrabold text-[10px] uppercase tracking-wider py-1.5 px-3 hover:bg-[#00ff66]"
                          >
                            ADD TO BAG
                          </button>
                          <button
                            onClick={() => toggleWishlist(item)}
                            className="text-neutral-500 hover:text-rose-400 p-1.5"
                            title="Remove from wishlist"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: ADDRESSES */}
          {activeTab === 'addresses' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-syne font-extrabold text-xl uppercase text-white flex items-center gap-2">
                    <MapPin size={20} className="text-[#00e65c]" />
                    ADDRESS <span className="text-[#00e65c]">BOOK</span>
                  </h3>
                  <p className="font-mono text-xs text-neutral-400 mt-1">
                    Manage your shipping destinations for effortless 1-click drops checkout.
                  </p>
                </div>

                {!isAddingAddress && (
                  <button
                    onClick={() => setIsAddingAddress(true)}
                    className="bg-[#00e65c] text-black font-syne font-extrabold text-xs uppercase tracking-wider py-2 px-4 flex items-center gap-1.5 hover:bg-[#00ff66] transition-colors"
                  >
                    <Plus size={16} />
                    <span>ADD NEW</span>
                  </button>
                )}
              </div>

              {/* ADD NEW ADDRESS FORM */}
              {isAddingAddress && (
                <form onSubmit={handleSaveAddress} className="bg-neutral-900 border border-neutral-800 p-5 space-y-4">
                  <h4 className="font-syne font-bold text-sm uppercase text-white border-b border-neutral-800 pb-2">
                    NEW SHIPPING DESTINATION
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-mono text-[10px] text-neutral-400 uppercase mb-1">
                        RECIPIENT NAME *
                      </label>
                      <input
                        type="text"
                        required
                        value={addressName}
                        onChange={(e) => setAddressName(e.target.value)}
                        placeholder="Marcus Vance"
                        className="w-full bg-black border border-neutral-800 text-white text-xs font-mono px-3 py-2 outline-none focus:border-[#00e65c]"
                      />
                    </div>

                    <div>
                      <label className="block font-mono text-[10px] text-neutral-400 uppercase mb-1">
                        CONTACT PHONE *
                      </label>
                      <input
                        type="tel"
                        required
                        value={addressPhone}
                        onChange={(e) => setAddressPhone(e.target.value)}
                        placeholder="+1 555-019-2834"
                        className="w-full bg-black border border-neutral-800 text-white text-xs font-mono px-3 py-2 outline-none focus:border-[#00e65c]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-mono text-[10px] text-neutral-400 uppercase mb-1">
                      STREET ADDRESS *
                    </label>
                    <input
                      type="text"
                      required
                      value={addressStreet}
                      onChange={(e) => setAddressStreet(e.target.value)}
                      placeholder="742 Evergreen Terrace, Apt 4B"
                      className="w-full bg-black border border-neutral-800 text-white text-xs font-mono px-3 py-2 outline-none focus:border-[#00e65c]"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block font-mono text-[10px] text-neutral-400 uppercase mb-1">CITY *</label>
                      <input
                        type="text"
                        required
                        value={addressCity}
                        onChange={(e) => setAddressCity(e.target.value)}
                        placeholder="Los Angeles"
                        className="w-full bg-black border border-neutral-800 text-white text-xs font-mono px-3 py-2 outline-none focus:border-[#00e65c]"
                      />
                    </div>

                    <div>
                      <label className="block font-mono text-[10px] text-neutral-400 uppercase mb-1">STATE *</label>
                      <input
                        type="text"
                        required
                        value={addressState}
                        onChange={(e) => setAddressState(e.target.value)}
                        placeholder="CA"
                        className="w-full bg-black border border-neutral-800 text-white text-xs font-mono px-3 py-2 outline-none focus:border-[#00e65c]"
                      />
                    </div>

                    <div>
                      <label className="block font-mono text-[10px] text-neutral-400 uppercase mb-1">ZIP *</label>
                      <input
                        type="text"
                        required
                        value={addressZip}
                        onChange={(e) => setAddressZip(e.target.value)}
                        placeholder="90001"
                        className="w-full bg-black border border-neutral-800 text-white text-xs font-mono px-3 py-2 outline-none focus:border-[#00e65c]"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="isDefaultAddr"
                      checked={isAddressDefault}
                      onChange={(e) => setIsAddressDefault(e.target.checked)}
                      className="accent-[#00e65c]"
                    />
                    <label htmlFor="isDefaultAddr" className="font-mono text-xs text-neutral-300">
                      Set as my default shipping address
                    </label>
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={isSavingAddress}
                      className="bg-[#00e65c] text-black font-syne font-extrabold text-xs uppercase py-2.5 px-5 hover:bg-[#00ff66]"
                    >
                      {isSavingAddress ? 'SAVING...' : 'SAVE ADDRESS'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsAddingAddress(false)}
                      className="bg-neutral-800 text-neutral-300 font-syne font-bold text-xs uppercase py-2.5 px-4 hover:text-white"
                    >
                      CANCEL
                    </button>
                  </div>
                </form>
              )}

              {/* LIST OF ADDRESSES */}
              {(userProfile?.addresses || []).length === 0 && !isAddingAddress ? (
                <div className="bg-neutral-900/50 border border-neutral-800 text-center py-12 px-4">
                  <MapPin size={24} className="text-neutral-500 mx-auto mb-2" />
                  <p className="font-syne font-bold text-base text-white uppercase">NO ADDRESSES SAVED</p>
                  <p className="font-mono text-xs text-neutral-400 mt-1">
                    Save your default delivery address to speed up checkout on exclusive drops.
                  </p>
                  <button
                    onClick={() => setIsAddingAddress(true)}
                    className="mt-6 bg-[#00e65c] text-black font-syne font-extrabold text-xs uppercase tracking-wider py-3 px-6 hover:bg-[#00ff66]"
                  >
                    ADD FIRST ADDRESS
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {(userProfile?.addresses || []).map((addr) => (
                    <div
                      key={addr.id}
                      className="bg-neutral-900 border border-neutral-800 p-5 relative flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-syne font-bold text-sm text-white uppercase">
                            {addr.name}
                          </span>
                          {addr.isDefault && (
                            <span className="font-mono text-[9px] bg-[#00e65c] text-black px-1.5 py-0.5 font-bold uppercase">
                              DEFAULT
                            </span>
                          )}
                        </div>
                        <p className="font-mono text-xs text-neutral-300">{addr.street}</p>
                        <p className="font-mono text-xs text-neutral-300">
                          {addr.city}, {addr.state} {addr.zip}
                        </p>
                        <p className="font-mono text-xs text-neutral-400 mt-1">{addr.country}</p>
                        <p className="font-mono text-xs text-neutral-500 mt-1">{addr.phone}</p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-neutral-800 flex items-center justify-end">
                        <button
                          onClick={() => handleDeleteAddress(addr.id)}
                          className="text-neutral-500 hover:text-rose-400 p-1 font-mono text-xs flex items-center gap-1"
                        >
                          <Trash2 size={14} />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
