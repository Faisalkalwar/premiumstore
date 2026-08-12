import React from 'react';

interface LogoProps {
  className?: string;
  lightMode?: boolean;
  heightClass?: string;
}

export const Logo: React.FC<LogoProps> = ({ className = '', heightClass = 'h-8 sm:h-10 lg:h-11' }) => {
  return (
    <div className={`inline-flex items-center select-none ${className}`}>
      <img
        src="/images/premium-store-logo.png"
        alt="PREMIUM STORE"
        className={`${heightClass} w-auto max-w-[240px] sm:max-w-[280px] object-contain transition-transform duration-300 hover:scale-105 shrink-0`}
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).src = '/logo.png';
        }}
      />
    </div>
  );
};



