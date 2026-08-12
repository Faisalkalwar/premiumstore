import React from 'react';
import { MapPin, Mail, MessageSquare, Instagram, Phone, Clock, Send, Sparkles } from 'lucide-react';
import { Logo } from '../layout/Logo';

export const ContactView: React.FC = () => {
  return (
    <div className="bg-black text-white min-h-screen py-12 sm:py-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        
        {/* HEADER HERO */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 text-xs font-mono text-[#00e65c] uppercase tracking-widest bg-[#00e65c]/10 border border-[#00e65c]/30 px-3 py-1">
            <Sparkles size={14} />
            <span>GET IN TOUCH WITH THE CREW</span>
          </div>
          
          <div className="flex justify-center my-3">
            <Logo heightClass="h-12 sm:h-16" />
          </div>

          <p className="font-syne font-extrabold text-lg sm:text-xl text-[#00e65c] uppercase tracking-wider">
            "WEAR THE BEST. FOR LESS."
          </p>
          
          <p className="text-xs font-mono text-neutral-400 max-w-md mx-auto leading-relaxed">
            Have questions regarding drops, sizing, custom orders, or shipping status? Reach out to our customer care team directly via WhatsApp, email, or social media.
          </p>
        </div>

        {/* MAIN QUICK ACTION BUTTONS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {/* WHATSAPP ACTION BUTTON */}
          <a
            href="https://wa.me/923237506649"
            target="_blank"
            rel="noreferrer"
            className="group bg-[#0d0d0d] border border-neutral-800 hover:border-[#00e65c] p-6 flex flex-col items-center text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(0,230,92,0.15)]"
          >
            <div className="w-14 h-14 bg-[#00e65c]/10 border border-[#00e65c]/40 text-[#00e65c] rounded-full flex items-center justify-center mb-4 group-hover:bg-[#00e65c] group-hover:text-black transition-colors">
              <MessageSquare size={24} />
            </div>
            <h3 className="font-syne font-extrabold text-base uppercase text-white mb-1">
              CONTACT ON WHATSAPP
            </h3>
            <p className="text-xs font-mono text-[#00e65c] mb-4">
              +92 323 7506649
            </p>
            <span className="mt-auto w-full bg-[#00e65c] text-black font-syne font-extrabold text-xs py-3 uppercase tracking-wider group-hover:bg-[#00ff66] transition-colors flex items-center justify-center gap-2">
              <span>CHAT NOW</span>
              <Send size={14} />
            </span>
          </a>

          {/* EMAIL ACTION BUTTON */}
          <a
            href="mailto:thepremiumstoree@gmail.com"
            className="group bg-[#0d0d0d] border border-neutral-800 hover:border-[#00e65c] p-6 flex flex-col items-center text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(0,230,92,0.15)]"
          >
            <div className="w-14 h-14 bg-neutral-900 border border-neutral-700 text-white rounded-full flex items-center justify-center mb-4 group-hover:border-[#00e65c] group-hover:text-[#00e65c] transition-colors">
              <Mail size={24} />
            </div>
            <h3 className="font-syne font-extrabold text-base uppercase text-white mb-1">
              EMAIL US
            </h3>
            <p className="text-xs font-mono text-neutral-300 mb-4 break-all">
              thepremiumstoree@gmail.com
            </p>
            <span className="mt-auto w-full bg-neutral-800 text-white group-hover:bg-[#00e65c] group-hover:text-black font-syne font-extrabold text-xs py-3 uppercase tracking-wider transition-colors flex items-center justify-center gap-2">
              <span>SEND EMAIL</span>
              <Send size={14} />
            </span>
          </a>

          {/* INSTAGRAM ACTION BUTTON */}
          <a
            href="https://www.instagram.com/premiumstore._pk/"
            target="_blank"
            rel="noreferrer"
            className="group bg-[#0d0d0d] border border-neutral-800 hover:border-[#00e65c] p-6 flex flex-col items-center text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(0,230,92,0.15)]"
          >
            <div className="w-14 h-14 bg-neutral-900 border border-neutral-700 text-white rounded-full flex items-center justify-center mb-4 group-hover:border-[#00e65c] group-hover:text-[#00e65c] transition-colors">
              <Instagram size={24} />
            </div>
            <h3 className="font-syne font-extrabold text-base uppercase text-white mb-1">
              FOLLOW ON INSTAGRAM
            </h3>
            <p className="text-xs font-mono text-neutral-300 mb-4">
              @premiumstore._pk
            </p>
            <span className="mt-auto w-full bg-neutral-800 text-white group-hover:bg-[#00e65c] group-hover:text-black font-syne font-extrabold text-xs py-3 uppercase tracking-wider transition-colors flex items-center justify-center gap-2">
              <span>VIEW PROFILE</span>
              <Send size={14} />
            </span>
          </a>
        </div>

        {/* DETAILED BUSINESS INFORMATION BOX */}
        <div className="bg-[#0a0a0a] border border-neutral-800 p-8 sm:p-10 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* LEFT: STORE ADDRESS & LOCATION */}
          <div className="space-y-6">
            <h2 className="font-syne font-extrabold text-xl uppercase text-white flex items-center gap-3 border-b border-neutral-800 pb-4">
              <MapPin size={22} className="text-[#00e65c]" />
              <span>STORE LOCATION</span>
            </h2>

            <div className="space-y-3 font-mono text-xs text-neutral-300 leading-relaxed">
              <p className="font-syne font-extrabold text-base text-white uppercase">
                PREMIUM STORE FLAGSHIP
              </p>
              <p>Unique Shopping Mall,</p>
              <p>Main Autobhan Road,</p>
              <p>Hyderabad, Sindh, Pakistan</p>
            </div>

            <div className="pt-2 flex items-center gap-3 text-xs font-mono text-neutral-400">
              <Clock size={16} className="text-[#00e65c]" />
              <span>Open Daily: 12:00 PM – 11:00 PM PST</span>
            </div>
          </div>

          {/* RIGHT: OFFICIAL CONTACT CHANNELS */}
          <div className="space-y-6">
            <h2 className="font-syne font-extrabold text-xl uppercase text-white flex items-center gap-3 border-b border-neutral-800 pb-4">
              <Phone size={22} className="text-[#00e65c]" />
              <span>OFFICIAL CONTACTS</span>
            </h2>

            <ul className="space-y-4 font-mono text-xs">
              <li className="flex items-center justify-between p-3 bg-neutral-900/80 border border-neutral-800">
                <span className="text-neutral-400">STORE NAME</span>
                <span className="font-syne font-extrabold text-white">PREMIUM STORE</span>
              </li>
              <li className="flex items-center justify-between p-3 bg-neutral-900/80 border border-neutral-800">
                <span className="text-neutral-400">WHATSAPP</span>
                <a
                  href="https://wa.me/923237506649"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#00e65c] font-bold hover:underline"
                >
                  +92 323 7506649
                </a>
              </li>
              <li className="flex items-center justify-between p-3 bg-neutral-900/80 border border-neutral-800">
                <span className="text-neutral-400">EMAIL</span>
                <a
                  href="mailto:thepremiumstoree@gmail.com"
                  className="text-white hover:text-[#00e65c] transition-colors"
                >
                  thepremiumstoree@gmail.com
                </a>
              </li>
              <li className="flex items-center justify-between p-3 bg-neutral-900/80 border border-neutral-800">
                <span className="text-neutral-400">INSTAGRAM</span>
                <a
                  href="https://www.instagram.com/premiumstore._pk/"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#00e65c] font-bold hover:underline"
                >
                  @premiumstore._pk
                </a>
              </li>
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
};
