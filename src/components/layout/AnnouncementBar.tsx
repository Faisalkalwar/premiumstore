import React, { useState, useEffect } from 'react';
import { Sparkles, Truck, Tag, Flame, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useShop } from '../../context/ShopContext';

export const AnnouncementBar: React.FC = () => {
  const { cmsContent } = useShop();
  const annBar = cmsContent?.announcementBar;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const announcements = annBar?.announcements && annBar.announcements.length > 0
    ? annBar.announcements
    : [
        {
          id: '1',
          text: 'NEW DROP LIVE: METROPOLIS \'26 URBAN STREETWEAR COLLECTION',
          linkText: 'EXPLORE DROP',
          icon: 'sparkles' as const,
        },
        {
          id: '2',
          text: 'FREE EXPRESS SHIPPING ON ALL ORDERS OVER $75',
          linkText: 'DETAILS',
          icon: 'truck' as const,
        },
        {
          id: '3',
          text: 'GET 15% OFF YOUR FIRST ORDER — USE CODE: PREMIUM15',
          linkText: 'COPY CODE',
          icon: 'tag' as const,
        },
      ];

  useEffect(() => {
    if (announcements.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % announcements.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [announcements.length]);

  if (!isVisible || annBar?.enabled === false) return null;

  const current = announcements[currentIndex] || announcements[0];

  const renderIcon = (iconName?: string) => {
    switch (iconName) {
      case 'truck':
        return <Truck size={14} className="text-[#00e65c] shrink-0" />;
      case 'tag':
        return <Tag size={14} className="text-[#00e65c] shrink-0" />;
      case 'flame':
        return <Flame size={14} className="text-[#00e65c] shrink-0" />;
      case 'sparkles':
      default:
        return <Sparkles size={14} className="text-[#00e65c] shrink-0" />;
    }
  };

  return (
    <div className="bg-[#0a0a0a] border-b border-neutral-800/80 text-xs text-neutral-300 py-2 px-4 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left spacer for symmetry on desktop */}
        <div className="hidden lg:flex items-center gap-2 text-neutral-400 font-mono text-[11px]">
          <span className="w-2 h-2 rounded-full bg-[#00e65c] animate-pulse" />
          WORLDWIDE EXPRESS DELIVERY
        </div>

        {/* Center rotating announcement */}
        <div className="flex-1 flex items-center justify-center gap-2 text-center font-medium">
          {announcements.length > 1 && (
            <button
              onClick={() => setCurrentIndex((prev) => (prev - 1 + announcements.length) % announcements.length)}
              className="text-neutral-500 hover:text-white transition-colors p-0.5"
              aria-label="Previous announcement"
            >
              <ChevronLeft size={14} />
            </button>
          )}

          <div className="flex items-center gap-2 min-h-[20px]">
            {renderIcon(current.icon)}
            <span className="tracking-wide text-[11px] sm:text-xs font-mono uppercase">
              {current.text}
            </span>
            {current.linkText && (
              <span className="hidden sm:inline-block font-bold font-mono text-[#00e65c] underline underline-offset-2 ml-1 cursor-pointer hover:text-white transition-colors">
                {current.linkText}
              </span>
            )}
          </div>

          {announcements.length > 1 && (
            <button
              onClick={() => setCurrentIndex((prev) => (prev + 1) % announcements.length)}
              className="text-neutral-500 hover:text-white transition-colors p-0.5"
              aria-label="Next announcement"
            >
              <ChevronRight size={14} />
            </button>
          )}
        </div>

        {/* Right currency / dismissal */}
        <div className="flex items-center gap-3 shrink-0">
          <span className="hidden sm:block text-[11px] font-mono text-neutral-400">
            USD ($)
          </span>
          <button
            onClick={() => setIsVisible(false)}
            className="text-neutral-500 hover:text-neutral-300 transition-colors"
            title="Dismiss"
            aria-label="Close announcement bar"
          >
            <X size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};
