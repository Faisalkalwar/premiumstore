import React, { useState } from 'react';
import { Mail, ArrowRight, ShieldCheck, Crown } from 'lucide-react';
import { useShop } from '../../context/ShopContext';

export const NewsletterSection: React.FC = () => {
  const { showToast, cmsContent } = useShop();
  const cms = cmsContent?.newsletterSection;
  const [email, setEmail] = useState('');

  if (cms?.enabled === false) return null;

  const badge = cms?.badge || 'STREETWEAR CLUB VIP ACCESS';
  const title = cms?.title || 'GET 15% OFF YOUR FIRST DROP';
  const subtitle = cms?.subtitle || 'Subscribe to receive secret password drops, early access to limited streetwear capsules, and private promo codes directly to your inbox.';
  const placeholder = cms?.placeholder || 'ENTER YOUR EMAIL ADDRESS';
  const buttonText = cms?.buttonText || 'CLAIM 15% OFF';
  const discountCode = cms?.discountCode || 'PREMIUM15';
  const footerNotice = cms?.footerNotice || 'NO SPAM. UNSUBSCRIBE ANYTIME WITH ONE CLICK.';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      showToast(`Welcome to the Streetwear Club! Check your inbox for code: ${discountCode}`);
      setEmail('');
    }
  };

  return (
    <section className="py-16 sm:py-24 bg-[#0a0a0a] text-white border-b border-neutral-900 relative overflow-hidden">
      {/* GLOW DECORATION */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#00e65c]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10 text-center">
        <div className="inline-flex items-center gap-2 bg-neutral-900 border border-neutral-800 text-[#00e65c] text-xs font-mono px-3.5 py-1.5 uppercase tracking-widest mb-4">
          <Crown size={14} />
          <span>{badge}</span>
        </div>

        <h2 className="font-syne font-extrabold text-3xl sm:text-5xl lg:text-6xl uppercase tracking-tight text-white mb-4">
          {title}
        </h2>

        <p className="text-xs sm:text-sm font-mono text-neutral-400 max-w-xl mx-auto mb-8 leading-relaxed">
          {subtitle}
        </p>

        {/* EMAIL FORM */}
        <form onSubmit={handleSubmit} className="max-w-md mx-auto flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Mail size={16} className="absolute left-3.5 top-3.5 text-neutral-500" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={placeholder}
              className="w-full bg-neutral-900 border border-neutral-800 text-white font-mono text-xs pl-10 pr-4 py-3.5 focus:outline-none focus:border-[#00e65c] uppercase placeholder:text-neutral-600"
            />
          </div>

          <button
            type="submit"
            className="bg-[#00e65c] text-black hover:bg-[#00ff66] font-syne font-extrabold text-xs px-6 py-3.5 uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg shrink-0"
          >
            <span>{buttonText}</span>
            <ArrowRight size={16} />
          </button>
        </form>

        <div className="mt-6 flex items-center justify-center gap-2 text-[11px] font-mono text-neutral-500">
          <ShieldCheck size={14} className="text-[#00e65c]" />
          <span>{footerNotice}</span>
        </div>
      </div>
    </section>
  );
};
