import React, { useState } from 'react';
import { useShop } from '../../context/ShopContext';
import { sendPasswordReset } from '../../services/firebaseService';
import { Mail, ArrowRight, Loader2, KeyRound, CheckCircle, ArrowLeft } from 'lucide-react';

export const ForgotPasswordView: React.FC = () => {
  const { navigateTo, showToast } = useShop();

  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!email) {
      setError('Please enter your email address.');
      return;
    }

    setIsLoading(true);
    const res = await sendPasswordReset(email);
    setIsLoading(false);

    if (res.error) {
      setError(res.error);
    } else {
      setSuccess(true);
      showToast('Password reset email sent! Check your inbox.');
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 sm:py-20">
      <div className="bg-neutral-950 border border-neutral-800 p-6 sm:p-8 rounded-none shadow-2xl">
        <button
          onClick={() => navigateTo('login')}
          className="inline-flex items-center gap-2 text-xs font-mono text-neutral-400 hover:text-[#00e65c] transition-colors mb-6 uppercase tracking-wider"
        >
          <ArrowLeft size={14} />
          <span>BACK TO LOGIN</span>
        </button>

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-neutral-900 border border-neutral-800 text-[#00e65c] mb-4">
            <KeyRound size={22} />
          </div>
          <h1 className="font-syne font-extrabold text-2xl sm:text-3xl uppercase tracking-tight text-white">
            RESET <span className="text-[#00e65c]">PASSWORD</span>
          </h1>
          <p className="font-mono text-xs text-neutral-400 mt-2 uppercase tracking-wider">
            Enter your account email to receive a password reset link
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono">
            ⚠️ {error}
          </div>
        )}

        {success ? (
          <div className="p-6 bg-[#00e65c]/10 border border-[#00e65c]/30 text-center space-y-4">
            <div className="inline-flex items-center justify-center w-10 h-10 bg-[#00e65c] text-black rounded-full mx-auto">
              <CheckCircle size={24} />
            </div>
            <h3 className="font-syne font-bold text-lg text-white uppercase">RESET LINK SENT</h3>
            <p className="font-mono text-xs text-neutral-300">
              We've dispatched password reset instructions to <span className="text-[#00e65c] font-bold">{email}</span>. Please check your inbox or spam folder.
            </p>
            <button
              onClick={() => navigateTo('login')}
              className="w-full bg-[#00e65c] text-black font-syne font-extrabold text-xs uppercase tracking-wider py-3 mt-4 hover:bg-[#00ff66] transition-colors"
            >
              RETURN TO LOGIN
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block font-mono text-[11px] text-neutral-300 uppercase tracking-wider mb-1">
                REGISTERED EMAIL ADDRESS *
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="yourname@domain.com"
                  className="w-full bg-neutral-900 border border-neutral-800 focus:border-[#00e65c] text-white text-xs font-mono pl-10 pr-4 py-3 outline-none transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#00e65c] text-black font-syne font-extrabold text-xs uppercase tracking-wider py-3.5 px-4 flex items-center justify-center gap-2 hover:bg-[#00ff66] transition-colors disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>SENDING LINK...</span>
                </>
              ) : (
                <>
                  <span>SEND RESET LINK</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
