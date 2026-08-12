import React from 'react';

interface ProductSkeletonProps {
  count?: number;
}

export const ProductSkeleton: React.FC<ProductSkeletonProps> = ({ count = 8 }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="bg-[#0d0d0d] border border-neutral-800/80 p-0 flex flex-col h-full animate-pulse"
        >
          {/* Image Placeholder */}
          <div className="aspect-[3/4] w-full bg-neutral-800/60 relative">
            <div className="absolute top-3 left-3 w-16 h-4 bg-neutral-700/50" />
            <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-neutral-700/50" />
          </div>

          {/* Details Placeholder */}
          <div className="p-4 flex flex-col justify-between flex-1 space-y-3">
            <div className="space-y-1.5">
              <div className="h-3 w-1/3 bg-neutral-800/60 rounded" />
              <div className="h-4 w-4/5 bg-neutral-700/60 rounded" />
            </div>
            <div className="flex items-center justify-between pt-2">
              <div className="h-4 w-1/4 bg-neutral-700/60 rounded" />
              <div className="h-3 w-1/3 bg-neutral-800/60 rounded" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
