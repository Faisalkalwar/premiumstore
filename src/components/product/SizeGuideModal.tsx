import React, { useState } from 'react';
import { X, Ruler, Check } from 'lucide-react';

interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  category?: string;
}

export const SizeGuideModal: React.FC<SizeGuideModalProps> = ({
  isOpen,
  onClose,
  category = 'shirts',
}) => {
  const [unit, setUnit] = useState<'cm' | 'in'>('in');

  if (!isOpen) return null;

  const isTops = category.includes('shirt') || category.includes('hoodie') || category.includes('tee');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div
        className="relative w-full max-w-2xl bg-[#0d0d0d] border border-neutral-800 rounded-none shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* CLOSE BUTTON */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-white bg-neutral-900 border border-neutral-800 transition-colors"
          aria-label="Close size guide"
        >
          <X size={18} />
        </button>

        {/* HEADER */}
        <div className="flex items-center gap-3 mb-6 border-b border-neutral-800 pb-4">
          <div className="p-2.5 bg-[#00e65c]/10 border border-[#00e65c]/30 text-[#00e65c]">
            <Ruler size={22} />
          </div>
          <div>
            <h3 className="font-syne font-extrabold text-xl text-white uppercase tracking-wider">
              SIZE GUIDE & FIT ADVICE
            </h3>
            <p className="text-xs text-neutral-400 font-mono">
              PREMIUM STORE STREETWEAR OVERSIZED SPECIFICATIONS
            </p>
          </div>
        </div>

        {/* UNIT TOGGLE */}
        <div className="flex items-center justify-between mb-6 bg-neutral-900/90 p-2 border border-neutral-800">
          <span className="text-xs font-mono text-neutral-300 uppercase tracking-wider">
            MEASUREMENT UNIT:
          </span>
          <div className="flex items-center gap-1 bg-black p-1 border border-neutral-800">
            <button
              onClick={() => setUnit('in')}
              className={`px-3 py-1 text-xs font-mono font-bold transition-colors ${
                unit === 'in'
                  ? 'bg-[#00e65c] text-black'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              INCHES (IN)
            </button>
            <button
              onClick={() => setUnit('cm')}
              className={`px-3 py-1 text-xs font-mono font-bold transition-colors ${
                unit === 'cm'
                  ? 'bg-[#00e65c] text-black'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              CENTIMETERS (CM)
            </button>
          </div>
        </div>

        {/* SIZE CHART TABLE */}
        <div className="overflow-x-auto mb-6">
          <table className="w-full text-left text-xs font-mono border-collapse">
            <thead>
              <tr className="bg-neutral-900 text-[#00e65c] border-b border-neutral-800">
                <th className="p-3 font-bold uppercase">SIZE</th>
                <th className="p-3 font-bold uppercase">CHEST</th>
                <th className="p-3 font-bold uppercase">LENGTH</th>
                <th className="p-3 font-bold uppercase">{isTops ? 'SHOULDER' : 'WAIST'}</th>
                <th className="p-3 font-bold uppercase">{isTops ? 'SLEEVE' : 'HIP'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/80 text-neutral-300">
              <tr>
                <td className="p-3 font-bold text-white bg-neutral-900/40">S</td>
                <td className="p-3">{unit === 'in' ? '44 - 46"' : '112 - 117 cm'}</td>
                <td className="p-3">{unit === 'in' ? '28.5"' : '72 cm'}</td>
                <td className="p-3">{unit === 'in' ? '21.5"' : '54.5 cm'}</td>
                <td className="p-3">{unit === 'in' ? '9.0"' : '23 cm'}</td>
              </tr>
              <tr>
                <td className="p-3 font-bold text-white bg-neutral-900/40">M</td>
                <td className="p-3">{unit === 'in' ? '46 - 48"' : '117 - 122 cm'}</td>
                <td className="p-3">{unit === 'in' ? '29.5"' : '75 cm'}</td>
                <td className="p-3">{unit === 'in' ? '22.5"' : '57 cm'}</td>
                <td className="p-3">{unit === 'in' ? '9.5"' : '24 cm'}</td>
              </tr>
              <tr className="bg-[#00e65c]/5">
                <td className="p-3 font-bold text-[#00e65c] bg-neutral-900/60">
                  L (POPULAR)
                </td>
                <td className="p-3 font-bold text-white">
                  {unit === 'in' ? '48 - 50"' : '122 - 127 cm'}
                </td>
                <td className="p-3 font-bold text-white">
                  {unit === 'in' ? '30.5"' : '77.5 cm'}
                </td>
                <td className="p-3 font-bold text-white">
                  {unit === 'in' ? '23.5"' : '59.5 cm'}
                </td>
                <td className="p-3 font-bold text-white">
                  {unit === 'in' ? '10.0"' : '25 cm'}
                </td>
              </tr>
              <tr>
                <td className="p-3 font-bold text-white bg-neutral-900/40">XL</td>
                <td className="p-3">{unit === 'in' ? '50 - 52"' : '127 - 132 cm'}</td>
                <td className="p-3">{unit === 'in' ? '31.5"' : '80 cm'}</td>
                <td className="p-3">{unit === 'in' ? '24.5"' : '62 cm'}</td>
                <td className="p-3">{unit === 'in' ? '10.5"' : '26.5 cm'}</td>
              </tr>
              <tr>
                <td className="p-3 font-bold text-white bg-neutral-900/40">XXL</td>
                <td className="p-3">{unit === 'in' ? '52 - 54"' : '132 - 137 cm'}</td>
                <td className="p-3">{unit === 'in' ? '32.5"' : '82.5 cm'}</td>
                <td className="p-3">{unit === 'in' ? '25.5"' : '64.5 cm'}</td>
                <td className="p-3">{unit === 'in' ? '11.0"' : '28 cm'}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* FIT ADVICE */}
        <div className="bg-neutral-900 border border-neutral-800 p-4 space-y-2 mb-6">
          <h4 className="text-xs font-syne font-bold text-[#00e65c] uppercase flex items-center gap-2">
            <Check size={14} /> HOW THIS ITEM FITS
          </h4>
          <p className="text-xs text-neutral-300 leading-relaxed font-sans">
            Designed for an authentic streetwear boxy silhouette with dropped shoulders and a wider chest cut.
            Take your normal size for an oversized aesthetic, or size down if you prefer a standard tailored fit.
          </p>
        </div>

        <button
          onClick={onClose}
          className="w-full bg-[#00e65c] text-black hover:bg-[#00ff66] font-syne font-bold py-3 text-xs uppercase tracking-wider transition-colors"
        >
          GOT IT, CLOSE SIZE GUIDE
        </button>
      </div>
    </div>
  );
};
