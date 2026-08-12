import React from 'react';
import { Instagram, Heart, MessageCircle, ExternalLink } from 'lucide-react';
import { useShop } from '../../context/ShopContext';

export const InstagramSection: React.FC = () => {
  const { cmsContent } = useShop();
  const cms = cmsContent?.instagramSection;

  if (cms?.enabled === false) return null;

  const handle = cms?.handle || '@premiumstore._pk';
  const title = cms?.title || 'STREETWEAR COMMUNITY';
  const hashtag = cms?.hashtag || '#WEARTHEBESTFORLESS';

  const posts = cms?.posts && cms.posts.length > 0
    ? cms.posts
    : [
        {
          id: 'ig-1',
          image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800&auto=format&fit=crop',
          likes: '2.4k',
          comments: 184,
          tag: 'Graffiti Tee',
        },
        {
          id: 'ig-2',
          image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?q=80&w=800&auto=format&fit=crop',
          likes: '3.1k',
          comments: 242,
          tag: 'P-Store Trucker',
        },
        {
          id: 'ig-3',
          image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=800&auto=format&fit=crop',
          likes: '4.8k',
          comments: 310,
          tag: 'Baggy Denim',
        },
        {
          id: 'ig-4',
          image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=800&auto=format&fit=crop',
          likes: '1.9k',
          comments: 145,
          tag: 'Metropolis Hoodie',
        },
      ];

  return (
    <section className="py-16 sm:py-24 bg-black text-white border-b border-neutral-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* HEADER */}
        <div className="text-center max-w-xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 text-xs font-mono text-[#00e65c] uppercase tracking-widest mb-2">
            <Instagram size={16} />
            <span>{handle}</span>
          </div>
          <h2 className="font-syne font-extrabold text-3xl sm:text-5xl uppercase tracking-tight text-white mb-2">
            {title}
          </h2>
          <p className="text-xs font-mono text-neutral-400">
            Tag us in your fits <span className="text-white font-bold">{hashtag}</span> to be featured on our official grid.
          </p>
        </div>

        {/* INSTAGRAM GRID */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {posts.map((post) => (
            <a
              key={post.id}
              href={post.linkUrl || 'https://www.instagram.com/premiumstore._pk/'}
              target="_blank"
              rel="noreferrer"
              className="group relative aspect-square bg-neutral-900 overflow-hidden border border-neutral-800"
            >
              <img
                src={post.image}
                alt="Instagram Streetwear Fit"
                className="w-full h-full object-cover object-center filter grayscale group-hover:grayscale-0 transition-all duration-500 group-hover:scale-105"
                loading="lazy"
              />

              {/* OVERLAY */}
              <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center p-4 text-center">
                <span className="bg-[#00e65c] text-black font-syne font-extrabold text-[10px] uppercase px-2 py-0.5 mb-3">
                  SHOP FIT: {post.tag}
                </span>

                <div className="flex items-center gap-4 text-sm font-syne font-bold text-white mb-2">
                  <span className="flex items-center gap-1">
                    <Heart size={16} className="fill-white text-white" />
                    {post.likes}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageCircle size={16} />
                    {post.comments}
                  </span>
                </div>

                <div className="text-xs font-mono text-[#00e65c] flex items-center gap-1 underline">
                  <span>View Post</span>
                  <ExternalLink size={12} />
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};
