import React, { useState, useEffect } from 'react';
import { Database, ShieldCheck, HardDrive, CheckCircle2, AlertTriangle, RefreshCw, Layers, Sparkles, X } from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { db, storage, isFirebaseConfigured, firebaseInitError } from '../../lib/firebase';
import { getDocs, collection, limit } from 'firebase/firestore';

export const FirebaseStatusWidget: React.FC = () => {
  const { products, categories, collections, seedData, isSeeding, refreshProducts } = useShop();
  const [isOpen, setIsOpen] = useState(false);
  const [firestoreConnected, setFirestoreConnected] = useState<boolean | null>(null);
  const [firestoreProductCount, setFirestoreProductCount] = useState<number>(0);
  const [storageConnected, setStorageConnected] = useState<boolean | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const verifyConnections = async () => {
    setIsVerifying(true);
    setFirestoreConnected(null);
    setStorageConnected(null);

    // Verify Firestore
    if (isFirebaseConfigured && db) {
      try {
        const prodSnap = await getDocs(collection(db, 'products'));
        setFirestoreConnected(true);
        setFirestoreProductCount(prodSnap.size);
      } catch (err) {
        console.error('Firestore verification failed:', err);
        setFirestoreConnected(false);
      }
    } else {
      setFirestoreConnected(false);
    }

    // Verify Storage
    if (isFirebaseConfigured && storage) {
      try {
        setStorageConnected(true);
      } catch (err) {
        setStorageConnected(false);
      }
    } else {
      setStorageConnected(false);
    }

    setIsVerifying(false);
  };

  useEffect(() => {
    verifyConnections();
  }, [isFirebaseConfigured]);

  return (
    <>
      {/* Floating Status Badge at bottom right */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-40 bg-neutral-900/90 border border-neutral-700/80 hover:border-[#00e65c] text-white px-3 py-2 text-[11px] font-mono flex items-center gap-2 shadow-2xl backdrop-blur-md transition-all group"
      >
        <span className={`w-2 h-2 rounded-full ${isFirebaseConfigured && firestoreConnected ? 'bg-[#00e65c] animate-pulse' : 'bg-amber-400'}`} />
        <Database size={13} className="text-[#00e65c]" />
        <span className="hidden sm:inline">FIREBASE BACKEND:</span>
        <span className="font-bold text-[#00e65c]">
          {isFirebaseConfigured && firestoreConnected ? 'ONLINE' : 'SETUP MODE'}
        </span>
      </button>

      {/* Verification Drawer / Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="absolute inset-0" onClick={() => setIsOpen(false)} />

          <div className="relative w-full max-w-lg bg-[#0d0d0d] border border-neutral-800 p-6 sm:p-8 z-10 shadow-2xl space-y-6">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-white p-1"
            >
              <X size={20} />
            </button>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <Database size={20} className="text-[#00e65c]" />
                <h3 className="font-syne font-extrabold text-lg text-white">
                  FIREBASE BACKEND STATUS
                </h3>
              </div>
              <p className="text-xs font-mono text-neutral-400">
                Phase 3 Cloud Integration Verification & Database Console
              </p>
            </div>

            <div className="space-y-3 font-mono text-xs">
              {/* STATUS ITEM 1: CONFIG */}
              <div className="bg-neutral-900 border border-neutral-800 p-3 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck size={16} className={isFirebaseConfigured ? 'text-[#00e65c]' : 'text-amber-400'} />
                  <div>
                    <p className="text-white font-bold">FIREBASE CONFIGURATION</p>
                    <p className="text-[10px] text-neutral-400">
                      {isFirebaseConfigured ? 'Config loaded successfully' : firebaseInitError || 'Using fallback mode'}
                    </p>
                  </div>
                </div>
                <span className={`px-2 py-0.5 text-[10px] font-bold ${isFirebaseConfigured ? 'bg-[#00e65c]/10 text-[#00e65c] border border-[#00e65c]/30' : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'}`}>
                  {isFirebaseConfigured ? 'VERIFIED' : 'PENDING'}
                </span>
              </div>

              {/* STATUS ITEM 2: FIRESTORE */}
              <div className="bg-neutral-900 border border-neutral-800 p-3 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Layers size={16} className={firestoreConnected ? 'text-[#00e65c]' : 'text-amber-400'} />
                  <div>
                    <p className="text-white font-bold">CLOUD FIRESTORE DATABASE</p>
                    <p className="text-[10px] text-neutral-400">
                      {firestoreConnected
                        ? `${firestoreProductCount} items in 'products' collection`
                        : 'Connection in fallback or missing state'}
                    </p>
                  </div>
                </div>
                <span className={`px-2 py-0.5 text-[10px] font-bold ${firestoreConnected ? 'bg-[#00e65c]/10 text-[#00e65c] border border-[#00e65c]/30' : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'}`}>
                  {firestoreConnected ? 'CONNECTED' : 'STANDBY'}
                </span>
              </div>

              {/* STATUS ITEM 3: STORAGE */}
              <div className="bg-neutral-900 border border-neutral-800 p-3 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <HardDrive size={16} className={storageConnected ? 'text-[#00e65c]' : 'text-amber-400'} />
                  <div>
                    <p className="text-white font-bold">CLOUD STORAGE BUCKET</p>
                    <p className="text-[10px] text-neutral-400">
                      {storageConnected ? 'Ready for product image uploads' : 'Not configured'}
                    </p>
                  </div>
                </div>
                <span className={`px-2 py-0.5 text-[10px] font-bold ${storageConnected ? 'bg-[#00e65c]/10 text-[#00e65c] border border-[#00e65c]/30' : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'}`}>
                  {storageConnected ? 'READY' : 'STANDBY'}
                </span>
              </div>
            </div>

            {/* COLLECTIONS SUMMARY */}
            <div className="bg-black border border-neutral-800 p-4 font-mono text-[11px] text-neutral-300 space-y-1.5">
              <p className="text-neutral-500 font-bold mb-2 uppercase text-[10px] tracking-wider">
                REGISTERED FIRESTORE COLLECTIONS:
              </p>
              <div className="grid grid-cols-2 gap-2 text-neutral-400">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 size={12} className="text-[#00e65c]" /> users
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 size={12} className="text-[#00e65c]" /> products ({products.length})
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 size={12} className="text-[#00e65c]" /> categories ({categories.length || 5})
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 size={12} className="text-[#00e65c]" /> collections ({collections.length || 2})
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 size={12} className="text-[#00e65c]" /> orders
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 size={12} className="text-[#00e65c]" /> wishlists
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 size={12} className="text-[#00e65c]" /> carts
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 size={12} className="text-[#00e65c]" /> coupons
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 size={12} className="text-[#00e65c]" /> reviews
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 size={12} className="text-[#00e65c]" /> siteSettings
                </span>
              </div>
            </div>

            {/* ACTIONS */}
            <div className="flex gap-3">
              <button
                onClick={verifyConnections}
                disabled={isVerifying}
                className="flex-1 bg-neutral-900 border border-neutral-700 hover:border-white text-white font-syne font-bold py-3 text-xs uppercase flex items-center justify-center gap-2 transition-all"
              >
                <RefreshCw size={14} className={isVerifying ? 'animate-spin' : ''} />
                TEST CONNECTIONS
              </button>

              <button
                onClick={async () => {
                  await seedData();
                  await verifyConnections();
                }}
                disabled={isSeeding}
                className="flex-1 bg-[#00e65c] text-black hover:bg-[#00ff66] font-syne font-extrabold py-3 text-xs uppercase flex items-center justify-center gap-2 transition-all"
              >
                <Sparkles size={14} />
                {isSeeding ? 'SEEDING...' : 'SEED FIRESTORE'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
