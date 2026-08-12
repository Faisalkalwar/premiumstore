import React, { useState } from 'react';
import { useShop } from '../../context/ShopContext';
import { loginWithEmailPassword, signInWithGoogle } from '../../services/firebaseService';
import { Lock, Mail, ArrowRight, Loader2, ShieldCheck } from 'lucide-react';
import { Logo } from '../layout/Logo';

export const LoginView: React.FC = () => {
  const { navigateTo, showToast } = useShop();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    setIsLoading(true);
    const res = await loginWithEmailPassword(email, password);
    setIsLoading(false);

    if (res.error) {
      setError(res.error);
    } else {
      showToast('Welcome back! Signed in successfully.');
      navigateTo('account');
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setIsGoogleLoading(true);
    const user = await signInWithGoogle();
    setIsGoogleLoading(false);

    if (user) {
      showToast(`Welcome, ${user.displayName || 'Customer'}!`);
      navigateTo('account');
    } else {
      setError('Google Sign-In was cancelled or failed.');
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 sm:py-20">
      <div className="bg-neutral-950 border border-neutral-800 p-6 sm:p-8 rounded-none shadow-2xl">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Logo heightClass="h-10 sm:h-12" />
          </div>
          <h1 className="font-syne font-extrabold text-2xl sm:text-3xl uppercase tracking-tight text-white">
            MEMBER <span className="text-[#00e65c]">SIGN IN</span>
          </h1>
          <p className="font-mono text-xs text-neutral-400 mt-2 uppercase tracking-wider">
            Access your VIP drops, orders & saved grails
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono">
            ⚠️ {error}
          </div>
        )}

        {/* GOOGLE SIGN IN */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isGoogleLoading || isLoading}
          className="w-full bg-neutral-900 border border-neutral-700 hover:border-[#00e65c] text-white py-3 px-4 text-xs font-syne font-bold uppercase tracking-wider flex items-center justify-center gap-3 transition-colors mb-6 disabled:opacity-50"
        >
          {isGoogleLoading ? (
            <Loader2 size={16} className="animate-spin text-[#00e65c]" />
          ) : (
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#EA4335"
                d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.1 9 5 12 5z"
              />
              <path
                fill="#4285F4"
                d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
              />
              <path
                fill="#FBBC05"
                d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15s.7 5.3 1.9 7.7l3.7-2.9c-.8-.7-1.4-1.6-1.7-2.7z"
              />
              <path
                fill="#34A853"
                d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.1-6.4-5.2L1.9 16c1.8 3.7 5.6 7 10.1 7z"
              />
            </svg>
          )}
          <span>Continue with Google</span>
        </button>

        <div className="relative flex items-center justify-center mb-6">
          <div className="border-t border-neutral-800 w-full" />
          <span className="bg-neutral-950 px-3 font-mono text-[10px] text-neutral-500 uppercase tracking-widest absolute">
            OR WITH EMAIL
          </span>
        </div>

        {/* LOGIN FORM */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-mono text-[11px] text-neutral-300 uppercase tracking-wider mb-1">
              EMAIL ADDRESS *
            </label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vip@streetwear.com"
                className="w-full bg-neutral-900 border border-neutral-800 focus:border-[#00e65c] text-white text-xs font-mono pl-10 pr-4 py-3 outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block font-mono text-[11px] text-neutral-300 uppercase tracking-wider">
                PASSWORD *
              </label>
              <button
                type="button"
                onClick={() => navigateTo('forgot-password')}
                className="font-mono text-[10px] text-[#00e65c] hover:underline uppercase tracking-wider"
              >
                Forgot?
              </button>
            </div>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-neutral-900 border border-neutral-800 focus:border-[#00e65c] text-white text-xs font-mono pl-10 pr-4 py-3 outline-none transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || isGoogleLoading}
            className="w-full bg-[#00e65c] text-black font-syne font-extrabold text-xs uppercase tracking-wider py-3.5 px-4 flex items-center justify-center gap-2 hover:bg-[#00ff66] transition-colors mt-6 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>SIGNING IN...</span>
              </>
            ) : (
              <>
                <span>SIGN IN TO ACCOUNT</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-neutral-800 text-center">
          <p className="font-mono text-xs text-neutral-400">
            DON'T HAVE AN ACCOUNT?{' '}
            <button
              onClick={() => navigateTo('register')}
              className="text-[#00e65c] font-bold hover:underline uppercase ml-1"
            >
              CREATE VIP ACCOUNT
            </button>
          </p>
        </div>

        <div className="mt-6 flex items-center justify-center gap-2 text-[10px] font-mono text-neutral-500">
          <ShieldCheck size={14} className="text-[#00e65c]" />
          <span>256-BIT ENCRYPTED FIREBASE AUTHENTICATION</span>
        </div>
      </div>
    </div>
  );
};
