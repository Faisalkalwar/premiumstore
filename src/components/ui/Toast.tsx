import React from 'react';
import { useShop } from '../../context/ShopContext';
import { CheckCircle2 } from 'lucide-react';

export const Toast: React.FC = () => {
  const { toastMessage } = useShop();

  if (!toastMessage) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-bounce sm:animate-none">
      <div className="bg-[#111111] border border-[#00e65c]/40 text-white px-4 py-3 rounded-lg shadow-2xl flex items-center gap-3 backdrop-blur-md max-w-sm">
        <CheckCircle2 size={18} className="text-[#00e65c] shrink-0" />
        <span className="text-xs sm:text-sm font-medium tracking-wide">
          {toastMessage}
        </span>
      </div>
    </div>
  );
};
