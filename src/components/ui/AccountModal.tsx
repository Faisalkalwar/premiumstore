import React, { useState } from 'react';
import { X, Lock, Mail, ArrowRight, Shield, Crown, LogOut, CheckCircle2 } from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { Logo } from '../layout/Logo';

export const AccountModal: React.FC = () => {
  const {
    isAccountModalOpen,
    setIsAccountModalOpen,
    showToast,
    user,
    googleSignIn,
    anonymousSignIn,
    logOut,
    isFirebaseConfigured,
    navigateTo,
  } = useShop();

  const [activeTab, setActiveTab] = useState<'signin' | 'join'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  if (!isAccountModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === 'signin') {
      showToast('Signed in successfully! Welcome back to Premium Store.');
    } else {
      showToast('Welcome to the Premium Store Streetwear Club! Check your email for 15% off.');
    }
    setIsAccountModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="absolute inset-0" onClick={() => setIsAccountModalOpen(false)} />

      <div className="relative w-full max-w-md bg-[#0d0d0d] border border-neutral-800 p-6 sm:p-8 z-10 shadow-2xl" role="dialog" aria-modal="true" aria-label="Account Authentication Modal">
        <button
          onClick={() => setIsAccountModalOpen(false)}
          className="absolute top-4 right-4 text-neutral-400 hover:text-white p-1"
          aria-label="Close modal"
        >
          <X size={20} />
        </button>

        {/* LOGO & CLUB BADGE */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-2">
            <Logo heightClass="h-9 sm:h-10" />
          </div>
          <p className="text-xs font-mono text-neutral-400 uppercase tracking-widest flex items-center justify-center gap-1">
            <Crown size={12} className="text-[#00e65c]" />
            STREETWEAR VIP CLUB
          </p>
        </div>

        {/* LOGGED IN VIEW */}
        {user ? (
          <div className="space-y-6 text-center py-4">
            <div className="w-16 h-16 rounded-full bg-[#00e65c]/10 border border-[#00e65c]/30 flex items-center justify-center mx-auto text-[#00e65c]">
              {user.photoURL ? (
                <img src={user.photoURL} alt={user.displayName || 'Avatar'} className="w-full h-full rounded-full object-cover" />
              ) : (
                <Crown size={28} />
              )}
            </div>

            <div>
              <h3 className="font-syne font-extrabold text-lg text-white">
                {user.displayName || user.email || 'VIP Member'}
              </h3>
              <p className="text-xs font-mono text-neutral-400 mt-1 flex items-center justify-center gap-1">
                <CheckCircle2 size={12} className="text-[#00e65c]" />
                {user.isAnonymous ? 'Guest Account Connected' : user.email || 'Firebase Auth Verified'}
              </p>
            </div>

            <div className="bg-neutral-900/80 border border-neutral-800 p-4 text-left font-mono text-xs text-neutral-300 space-y-2">
              <div className="flex justify-between border-b border-neutral-800 pb-1.5">
                <span className="text-neutral-500">MEMBER TIER:</span>
                <span className="text-[#00e65c] font-bold">BLACK DIAMOND VIP</span>
              </div>
              <div className="flex justify-between border-b border-neutral-800 pb-1.5">
                <span className="text-neutral-500">PERKS STATUS:</span>
                <span className="text-white">Early Drop Access Active</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">STORE CREDITS:</span>
                <span className="text-white">$15.00 OFF</span>
              </div>
            </div>

            <button
              onClick={() => {
                logOut();
                setIsAccountModalOpen(false);
              }}
              className="w-full border border-red-500/30 bg-red-950/20 text-red-400 hover:bg-red-900/30 font-syne font-bold py-3 text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
            >
              <LogOut size={16} />
              SIGN OUT OF ACCOUNT
            </button>
          </div>
        ) : (
          <>
            {/* GOOGLE & GUEST QUICK AUTH */}
            {isFirebaseConfigured && (
              <div className="space-y-2.5 mb-6">
                <button
                  type="button"
                  onClick={googleSignIn}
                  className="w-full bg-white text-black hover:bg-neutral-200 font-syne font-bold py-3 text-xs uppercase tracking-wider flex items-center justify-center gap-2.5 transition-all"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  CONTINUE WITH GOOGLE
                </button>

                <button
                  type="button"
                  onClick={anonymousSignIn}
                  className="w-full bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white hover:border-neutral-700 font-syne font-semibold py-2.5 text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
                >
                  <Shield size={14} className="text-[#00e65c]" />
                  GUEST QUICK ACCESS
                </button>

                <div className="flex items-center my-4">
                  <div className="flex-1 border-t border-neutral-800"></div>
                  <span className="px-3 font-mono text-[10px] text-neutral-500 uppercase">OR EMAIL</span>
                  <div className="flex-1 border-t border-neutral-800"></div>
                </div>
              </div>
            )}

            {/* TABS */}
            <div className="flex border-b border-neutral-800 mb-6 font-syne font-bold text-xs uppercase">
              <button
                onClick={() => setActiveTab('signin')}
                className={`flex-1 py-3 text-center border-b-2 transition-colors ${
                  activeTab === 'signin'
                    ? 'border-[#00e65c] text-[#00e65c]'
                    : 'border-transparent text-neutral-500 hover:text-white'
                }`}
              >
                SIGN IN
              </button>
              <button
                onClick={() => setActiveTab('join')}
                className={`flex-1 py-3 text-center border-b-2 transition-colors ${
                  activeTab === 'join'
                    ? 'border-[#00e65c] text-[#00e65c]'
                    : 'border-transparent text-neutral-500 hover:text-white'
                }`}
              >
                JOIN CLUB (15% OFF)
              </button>
            </div>

            {/* FORM */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-neutral-400 uppercase mb-1.5">
                  EMAIL ADDRESS
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-3.5 text-neutral-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="YOURNAME@STREETWEAR.COM"
                    className="w-full bg-neutral-900 border border-neutral-800 text-white text-xs font-mono pl-10 pr-4 py-3 focus:outline-none focus:border-[#00e65c]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-neutral-400 uppercase mb-1.5">
                  PASSWORD
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-3.5 text-neutral-500" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-neutral-900 border border-neutral-800 text-white text-xs font-mono pl-10 pr-4 py-3 focus:outline-none focus:border-[#00e65c]"
                  />
                </div>
              </div>

              {activeTab === 'signin' && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAccountModalOpen(false);
                      navigateTo('forgot-password');
                    }}
                    className="text-[11px] font-mono text-neutral-400 hover:text-[#00e65c] underline"
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-[#00e65c] text-black hover:bg-[#00ff66] font-syne font-extrabold py-3.5 text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all mt-4"
              >
                {activeTab === 'signin' ? 'SIGN IN TO ACCOUNT' : 'CREATE MEMBER ACCOUNT'}
                <ArrowRight size={16} />
              </button>
            </form>
          </>
        )}

        <div className="mt-6 pt-4 border-t border-neutral-800/80 text-center text-[11px] font-mono text-neutral-500 flex items-center justify-center gap-1.5">
          <Shield size={12} className="text-[#00e65c]" />
          <span>Members enjoy early drop access, order tracking & perks.</span>
        </div>
      </div>
    </div>
  );
};
