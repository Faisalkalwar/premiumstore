import React from 'react';
import { MessageSquare } from 'lucide-react';

export const WhatsAppFloatingButton: React.FC = () => {
  return (
    <a
      href="https://wa.me/923237506649"
      target="_blank"
      rel="noreferrer"
      aria-label="Contact PREMIUM STORE on WhatsApp +92 323 7506649"
      className="fixed bottom-6 right-6 z-40 bg-[#00e65c] text-black hover:bg-[#00ff66] p-3.5 sm:px-4 sm:py-3 rounded-full sm:rounded-none font-syne font-extrabold text-xs uppercase tracking-wider flex items-center gap-2 shadow-[0_10px_25px_rgba(0,230,92,0.4)] transition-all duration-300 hover:scale-105 active:scale-95 group border border-black"
    >
      <MessageSquare size={20} className="shrink-0" />
      <span className="hidden sm:inline">WHATSAPP: +92 323 7506649</span>
    </a>
  );
};
