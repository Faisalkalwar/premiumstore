import React, { useState, useEffect } from 'react';
import {
  Save,
  Megaphone,
  Image as ImageIcon,
  Grid,
  Zap,
  Award,
  Crown,
  Tag,
  Camera,
  Instagram,
  Mail,
  Plus,
  Trash2,
  MoveUp,
  MoveDown,
  Sparkles,
  Layout,
  Layers,
  Check
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { AdminLayout } from './AdminLayout';
import { ImageUploader } from './ImageUploader';
import { HomepageCMSContent, DEFAULT_HOMEPAGE_CMS } from '../../types';

export const AdminContentView: React.FC = () => {
  const { showToast, cmsContent, saveCMSContent } = useShop();

  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<
    'hero' | 'categories' | 'products' | 'campaigns' | 'social' | 'newsletter'
  >('hero');

  const [formData, setFormData] = useState<HomepageCMSContent>(DEFAULT_HOMEPAGE_CMS);

  useEffect(() => {
    if (cmsContent) {
      setFormData(JSON.parse(JSON.stringify(cmsContent)));
    }
  }, [cmsContent]);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      const ok = await saveCMSContent(formData);
      if (ok) {
        showToast('Homepage CMS content saved & published to Firestore!');
      } else {
        showToast('Error publishing CMS content.');
      }
    } catch (err) {
      console.error('Error saving CMS content:', err);
      showToast('Error saving CMS content.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout activeSection="Storefront Content & CMS">
      <form onSubmit={handleSave} className="space-y-8 max-w-5xl">
        {/* TOP HEADER & PUBLISH BAR */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-800">
          <div>
            <div className="flex items-center gap-2 text-[#00e65c] font-mono text-xs uppercase mb-1">
              <Sparkles size={14} />
              ADMIN HOMEPAGE CONTENT MANAGEMENT SYSTEM (CMS)
            </div>
            <h1 className="font-syne font-black text-2xl md:text-3xl uppercase tracking-tight text-white">
              HOMEPAGE CONTENT MANAGER
            </h1>
            <p className="font-mono text-xs text-neutral-400 mt-1">
              Edit all 13 homepage sections, upload hero banners to Firebase Storage, and publish live without code edits.
            </p>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="bg-[#00e65c] text-black font-syne font-extrabold text-xs uppercase px-8 py-4 hover:bg-[#00ff66] transition-all flex items-center gap-2 self-start sm:self-auto shadow-lg hover:scale-105"
          >
            <Save size={16} />
            <span>{saving ? 'PUBLISHING...' : 'PUBLISH HOMEPAGE CHANGES'}</span>
          </button>
        </div>

        {/* CMS SECTION TABS */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-neutral-800 font-mono text-xs">
          {[
            { id: 'hero', label: '1-5. HERO & TICKER', icon: Megaphone },
            { id: 'categories', label: '6. FEATURED CATEGORIES', icon: Grid },
            { id: 'products', label: '7-8. ARRIVALS & BESTSELLERS', icon: Zap },
            { id: 'campaigns', label: '9-10. COLLECTION & BANNERS', icon: Crown },
            { id: 'social', label: '11-12. LOOKBOOK & INSTAGRAM', icon: Camera },
            { id: 'newsletter', label: '13. NEWSLETTER SECTION', icon: Mail },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2.5 font-bold uppercase transition-all whitespace-nowrap flex items-center gap-2 border ${
                  isActive
                    ? 'bg-[#00e65c] text-black border-[#00e65c]'
                    : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-white'
                }`}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: HERO & TICKER */}
        {activeTab === 'hero' && (
          <div className="space-y-8">
            {/* 1. ANNOUNCEMENT BAR */}
            <div className="bg-neutral-900 border border-neutral-800 p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                <div className="flex items-center gap-2 text-[#00e65c]">
                  <Megaphone size={18} />
                  <h3 className="font-syne font-bold text-sm uppercase text-white">
                    1. ANNOUNCEMENT TICKER BAR
                  </h3>
                </div>
                <label className="flex items-center gap-2 cursor-pointer font-mono text-xs text-neutral-300">
                  <input
                    type="checkbox"
                    checked={formData.announcementBar.enabled}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        announcementBar: { ...formData.announcementBar, enabled: e.target.checked },
                      })
                    }
                    className="accent-[#00e65c] w-4 h-4"
                  />
                  <span>ENABLE TICKER</span>
                </label>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-neutral-400 font-bold uppercase">
                    ANNOUNCEMENT ITEMS ({formData.announcementBar.announcements.length})
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        announcementBar: {
                          ...formData.announcementBar,
                          announcements: [
                            ...formData.announcementBar.announcements,
                            {
                              id: `ann-${Date.now()}`,
                              text: 'NEW ANNOUNCEMENT ITEM',
                              linkText: 'SHOP NOW',
                              icon: 'sparkles',
                            },
                          ],
                        },
                      })
                    }
                    className="bg-neutral-800 hover:bg-neutral-700 text-[#00e65c] font-mono text-xs px-3 py-1.5 flex items-center gap-1 border border-neutral-700"
                  >
                    <Plus size={14} />
                    <span>ADD ANNOUNCEMENT</span>
                  </button>
                </div>

                {formData.announcementBar.announcements.map((ann, idx) => (
                  <div
                    key={ann.id || idx}
                    className="bg-neutral-950 border border-neutral-800 p-4 space-y-3 font-mono text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[#00e65c] font-bold">ITEM #{idx + 1}</span>
                      <button
                        type="button"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            announcementBar: {
                              ...formData.announcementBar,
                              announcements: formData.announcementBar.announcements.filter(
                                (_, i) => i !== idx
                              ),
                            },
                          })
                        }
                        className="text-neutral-500 hover:text-red-400 p-1"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                      <div className="md:col-span-6">
                        <label className="block text-[10px] text-neutral-500 uppercase mb-1">TEXT</label>
                        <input
                          type="text"
                          value={ann.text}
                          onChange={(e) => {
                            const newAnn = [...formData.announcementBar.announcements];
                            newAnn[idx].text = e.target.value;
                            setFormData({
                              ...formData,
                              announcementBar: { ...formData.announcementBar, announcements: newAnn },
                            });
                          }}
                          className="w-full bg-neutral-900 border border-neutral-800 text-white p-2 focus:outline-none focus:border-[#00e65c]"
                        />
                      </div>

                      <div className="md:col-span-3">
                        <label className="block text-[10px] text-neutral-500 uppercase mb-1">LINK TEXT</label>
                        <input
                          type="text"
                          value={ann.linkText || ''}
                          onChange={(e) => {
                            const newAnn = [...formData.announcementBar.announcements];
                            newAnn[idx].linkText = e.target.value;
                            setFormData({
                              ...formData,
                              announcementBar: { ...formData.announcementBar, announcements: newAnn },
                            });
                          }}
                          className="w-full bg-neutral-900 border border-neutral-800 text-white p-2 focus:outline-none focus:border-[#00e65c]"
                        />
                      </div>

                      <div className="md:col-span-3">
                        <label className="block text-[10px] text-neutral-500 uppercase mb-1">ICON</label>
                        <select
                          value={ann.icon || 'sparkles'}
                          onChange={(e) => {
                            const newAnn = [...formData.announcementBar.announcements];
                            newAnn[idx].icon = e.target.value as any;
                            setFormData({
                              ...formData,
                              announcementBar: { ...formData.announcementBar, announcements: newAnn },
                            });
                          }}
                          className="w-full bg-neutral-900 border border-neutral-800 text-white p-2 focus:outline-none focus:border-[#00e65c]"
                        >
                          <option value="sparkles">Sparkles</option>
                          <option value="truck">Truck Delivery</option>
                          <option value="tag">Discount Tag</option>
                          <option value="flame">Flame Hot</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 2-5. HERO BANNER, TITLE, SUBTITLE & BUTTONS */}
            <div className="bg-neutral-900 border border-neutral-800 p-6 space-y-6">
              <div className="flex items-center gap-2 text-[#00e65c] border-b border-neutral-800 pb-3">
                <ImageIcon size={18} />
                <h3 className="font-syne font-bold text-sm uppercase text-white">
                  2-5. HERO BANNER, TITLE, SUBTITLE & CTA BUTTONS
                </h3>
              </div>

              <div className="space-y-6">
                {/* Hero Image Uploader */}
                <ImageUploader
                  label="HERO BACKGROUND IMAGE (FIREBASE STORAGE / URL)"
                  value={formData.heroBanner.backgroundImage}
                  onChange={(url) =>
                    setFormData({
                      ...formData,
                      heroBanner: { ...formData.heroBanner, backgroundImage: url },
                    })
                  }
                  folderName="hero_banners"
                  helpText="Upload a high-resolution 2000x1000 editorial photo. Files are uploaded directly to Firebase Storage."
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
                  <div>
                    <label className="block text-neutral-400 mb-1">SEASON BADGE TEXT</label>
                    <input
                      type="text"
                      value={formData.heroBanner.seasonBadge}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          heroBanner: { ...formData.heroBanner, seasonBadge: e.target.value },
                        })
                      }
                      className="w-full bg-neutral-950 border border-neutral-800 text-white p-3 focus:outline-none focus:border-[#00e65c]"
                    />
                  </div>

                  <div>
                    <label className="block text-neutral-400 mb-1">MAIN TITLE LINE 1</label>
                    <input
                      type="text"
                      value={formData.heroBanner.mainTitleLine1}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          heroBanner: { ...formData.heroBanner, mainTitleLine1: e.target.value },
                        })
                      }
                      className="w-full bg-neutral-950 border border-neutral-800 text-white p-3 focus:outline-none focus:border-[#00e65c]"
                    />
                  </div>

                  <div>
                    <label className="block text-neutral-400 mb-1">MAIN TITLE HIGHLIGHT (GRAFFITI GLOW)</label>
                    <input
                      type="text"
                      value={formData.heroBanner.mainTitleHighlight}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          heroBanner: { ...formData.heroBanner, mainTitleHighlight: e.target.value },
                        })
                      }
                      className="w-full bg-neutral-950 border border-neutral-800 text-[#00e65c] p-3 font-bold focus:outline-none focus:border-[#00e65c]"
                    />
                  </div>

                  <div>
                    <label className="block text-neutral-400 mb-1">SUBTITLE UPPER TEXT</label>
                    <input
                      type="text"
                      value={formData.heroBanner.subtitleUpper}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          heroBanner: { ...formData.heroBanner, subtitleUpper: e.target.value },
                        })
                      }
                      className="w-full bg-neutral-950 border border-neutral-800 text-white p-3 focus:outline-none focus:border-[#00e65c]"
                    />
                  </div>

                  <div>
                    <label className="block text-neutral-400 mb-1">SUBTITLE HIGHLIGHT TEXT</label>
                    <input
                      type="text"
                      value={formData.heroBanner.subtitleHighlight}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          heroBanner: { ...formData.heroBanner, subtitleHighlight: e.target.value },
                        })
                      }
                      className="w-full bg-neutral-950 border border-neutral-800 text-[#00e65c] p-3 font-bold focus:outline-none focus:border-[#00e65c]"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-neutral-400 mb-1">CAMPAIGN DESCRIPTION PARAGRAPH</label>
                    <textarea
                      rows={3}
                      value={formData.heroBanner.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          heroBanner: { ...formData.heroBanner, description: e.target.value },
                        })
                      }
                      className="w-full bg-neutral-950 border border-neutral-800 text-white p-3 focus:outline-none focus:border-[#00e65c]"
                    />
                  </div>

                  <div>
                    <label className="block text-neutral-400 mb-1">PRIMARY CTA BUTTON TEXT</label>
                    <input
                      type="text"
                      value={formData.heroBanner.primaryButtonText}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          heroBanner: { ...formData.heroBanner, primaryButtonText: e.target.value },
                        })
                      }
                      className="w-full bg-neutral-950 border border-neutral-800 text-white p-3 focus:outline-none focus:border-[#00e65c]"
                    />
                  </div>

                  <div>
                    <label className="block text-neutral-400 mb-1">PRIMARY CTA TARGET LINK</label>
                    <input
                      type="text"
                      value={formData.heroBanner.primaryButtonLink}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          heroBanner: { ...formData.heroBanner, primaryButtonLink: e.target.value },
                        })
                      }
                      className="w-full bg-neutral-950 border border-neutral-800 text-white p-3 focus:outline-none focus:border-[#00e65c]"
                    />
                  </div>

                  <div>
                    <label className="block text-neutral-400 mb-1">SECONDARY CTA BUTTON TEXT</label>
                    <input
                      type="text"
                      value={formData.heroBanner.secondaryButtonText}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          heroBanner: { ...formData.heroBanner, secondaryButtonText: e.target.value },
                        })
                      }
                      className="w-full bg-neutral-950 border border-neutral-800 text-white p-3 focus:outline-none focus:border-[#00e65c]"
                    />
                  </div>

                  <div>
                    <label className="block text-neutral-400 mb-1">SECONDARY CTA TARGET LINK</label>
                    <input
                      type="text"
                      value={formData.heroBanner.secondaryButtonLink}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          heroBanner: { ...formData.heroBanner, secondaryButtonLink: e.target.value },
                        })
                      }
                      className="w-full bg-neutral-950 border border-neutral-800 text-white p-3 focus:outline-none focus:border-[#00e65c]"
                    />
                  </div>
                </div>

                {/* Feature highlights list */}
                <div className="font-mono text-xs space-y-3 pt-4 border-t border-neutral-800">
                  <div className="flex items-center justify-between">
                    <label className="text-neutral-400 font-bold uppercase">HERO FEATURE HIGHLIGHT PILLS</label>
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          heroBanner: {
                            ...formData.heroBanner,
                            featureHighlights: [...formData.heroBanner.featureHighlights, 'NEW FEATURE HIGHLIGHT'],
                          },
                        })
                      }
                      className="bg-neutral-800 text-[#00e65c] px-3 py-1 text-[11px] border border-neutral-700 flex items-center gap-1"
                    >
                      <Plus size={12} />
                      <span>ADD HIGHLIGHT</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {formData.heroBanner.featureHighlights.map((feat, idx) => (
                      <div key={idx} className="flex items-center gap-2 bg-neutral-950 p-2 border border-neutral-800">
                        <input
                          type="text"
                          value={feat}
                          onChange={(e) => {
                            const newFeats = [...formData.heroBanner.featureHighlights];
                            newFeats[idx] = e.target.value;
                            setFormData({
                              ...formData,
                              heroBanner: { ...formData.heroBanner, featureHighlights: newFeats },
                            });
                          }}
                          className="w-full bg-transparent text-white focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const newFeats = formData.heroBanner.featureHighlights.filter((_, i) => i !== idx);
                            setFormData({
                              ...formData,
                              heroBanner: { ...formData.heroBanner, featureHighlights: newFeats },
                            });
                          }}
                          className="text-neutral-500 hover:text-red-400 p-1"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: FEATURED CATEGORIES */}
        {activeTab === 'categories' && (
          <div className="bg-neutral-900 border border-neutral-800 p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2 text-[#00e65c]">
                <Grid size={18} />
                <h3 className="font-syne font-bold text-sm uppercase text-white">
                  6. FEATURED CATEGORIES SECTION
                </h3>
              </div>
              <label className="flex items-center gap-2 cursor-pointer font-mono text-xs text-neutral-300">
                <input
                  type="checkbox"
                  checked={formData.featuredCategories.enabled}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      featuredCategories: {
                        ...formData.featuredCategories,
                        enabled: e.target.checked,
                      },
                    })
                  }
                  className="accent-[#00e65c] w-4 h-4"
                />
                <span>ENABLE SECTION</span>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
              <div>
                <label className="block text-neutral-400 mb-1">SECTION TAGLINE</label>
                <input
                  type="text"
                  value={formData.featuredCategories.tagline}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      featuredCategories: {
                        ...formData.featuredCategories,
                        tagline: e.target.value,
                      },
                    })
                  }
                  className="w-full bg-neutral-950 border border-neutral-800 text-white p-3 focus:outline-none focus:border-[#00e65c]"
                />
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">SECTION HEADING TITLE</label>
                <input
                  type="text"
                  value={formData.featuredCategories.title}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      featuredCategories: {
                        ...formData.featuredCategories,
                        title: e.target.value,
                      },
                    })
                  }
                  className="w-full bg-neutral-950 border border-neutral-800 text-white p-3 focus:outline-none focus:border-[#00e65c]"
                />
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">SECTION SUBTITLE</label>
                <input
                  type="text"
                  value={formData.featuredCategories.subtitle}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      featuredCategories: {
                        ...formData.featuredCategories,
                        subtitle: e.target.value,
                      },
                    })
                  }
                  className="w-full bg-neutral-950 border border-neutral-800 text-white p-3 focus:outline-none focus:border-[#00e65c]"
                />
              </div>
            </div>

            {/* Category Cards List */}
            <div className="space-y-4 pt-4 border-t border-neutral-800 font-mono text-xs">
              <div className="flex items-center justify-between">
                <span className="text-neutral-400 font-bold uppercase">
                  CATEGORY CARDS ({formData.featuredCategories.categories.length})
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      featuredCategories: {
                        ...formData.featuredCategories,
                        categories: [
                          ...formData.featuredCategories.categories,
                          {
                            id: `cat-${Date.now()}`,
                            name: 'NEW CATEGORY',
                            tagline: 'Premium Streetwear Essentials',
                            image:
                              'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=800&auto=format&fit=crop',
                            itemCount: 12,
                            linkCategory: 'shirts',
                          },
                        ],
                      },
                    })
                  }
                  className="bg-neutral-800 text-[#00e65c] px-3 py-1.5 border border-neutral-700 flex items-center gap-1"
                >
                  <Plus size={14} />
                  <span>ADD CATEGORY CARD</span>
                </button>
              </div>

              <div className="space-y-6">
                {formData.featuredCategories.categories.map((cat, idx) => (
                  <div key={cat.id || idx} className="bg-neutral-950 border border-neutral-800 p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[#00e65c] font-bold">CATEGORY CARD #{idx + 1}</span>
                      <button
                        type="button"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            featuredCategories: {
                              ...formData.featuredCategories,
                              categories: formData.featuredCategories.categories.filter((_, i) => i !== idx),
                            },
                          })
                        }
                        className="text-neutral-500 hover:text-red-400 p-1"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-[10px] text-neutral-500 uppercase mb-1">CATEGORY NAME</label>
                        <input
                          type="text"
                          value={cat.name}
                          onChange={(e) => {
                            const newCats = [...formData.featuredCategories.categories];
                            newCats[idx].name = e.target.value;
                            setFormData({
                              ...formData,
                              featuredCategories: { ...formData.featuredCategories, categories: newCats },
                            });
                          }}
                          className="w-full bg-neutral-900 border border-neutral-800 text-white p-2 focus:outline-none focus:border-[#00e65c]"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] text-neutral-500 uppercase mb-1">TAGLINE / SPEC</label>
                        <input
                          type="text"
                          value={cat.tagline}
                          onChange={(e) => {
                            const newCats = [...formData.featuredCategories.categories];
                            newCats[idx].tagline = e.target.value;
                            setFormData({
                              ...formData,
                              featuredCategories: { ...formData.featuredCategories, categories: newCats },
                            });
                          }}
                          className="w-full bg-neutral-900 border border-neutral-800 text-white p-2 focus:outline-none focus:border-[#00e65c]"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] text-neutral-500 uppercase mb-1">LINK FILTER SLUG</label>
                        <input
                          type="text"
                          value={cat.linkCategory || ''}
                          onChange={(e) => {
                            const newCats = [...formData.featuredCategories.categories];
                            newCats[idx].linkCategory = e.target.value;
                            setFormData({
                              ...formData,
                              featuredCategories: { ...formData.featuredCategories, categories: newCats },
                            });
                          }}
                          placeholder="shirts, hoodies, etc."
                          className="w-full bg-neutral-900 border border-neutral-800 text-white p-2 focus:outline-none focus:border-[#00e65c]"
                        />
                      </div>
                    </div>

                    <ImageUploader
                      label="CATEGORY CARD COVER PHOTO (FIREBASE STORAGE / URL)"
                      value={cat.image}
                      onChange={(url) => {
                        const newCats = [...formData.featuredCategories.categories];
                        newCats[idx].image = url;
                        setFormData({
                          ...formData,
                          featuredCategories: { ...formData.featuredCategories, categories: newCats },
                        });
                      }}
                      folderName="categories"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: NEW ARRIVALS & BEST SELLERS */}
        {activeTab === 'products' && (
          <div className="space-y-8">
            {/* 7. NEW ARRIVALS */}
            <div className="bg-neutral-900 border border-neutral-800 p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                <div className="flex items-center gap-2 text-[#00e65c]">
                  <Zap size={18} />
                  <h3 className="font-syne font-bold text-sm uppercase text-white">
                    7. NEW ARRIVALS SECTION
                  </h3>
                </div>
                <label className="flex items-center gap-2 cursor-pointer font-mono text-xs text-neutral-300">
                  <input
                    type="checkbox"
                    checked={formData.newArrivals.enabled}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        newArrivals: { ...formData.newArrivals, enabled: e.target.checked },
                      })
                    }
                    className="accent-[#00e65c] w-4 h-4"
                  />
                  <span>ENABLE SECTION</span>
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 font-mono text-xs">
                <div>
                  <label className="block text-neutral-400 mb-1">SECTION TAGLINE</label>
                  <input
                    type="text"
                    value={formData.newArrivals.tagline}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        newArrivals: { ...formData.newArrivals, tagline: e.target.value },
                      })
                    }
                    className="w-full bg-neutral-950 border border-neutral-800 text-white p-3 focus:outline-none focus:border-[#00e65c]"
                  />
                </div>

                <div>
                  <label className="block text-neutral-400 mb-1">HEADING TITLE</label>
                  <input
                    type="text"
                    value={formData.newArrivals.title}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        newArrivals: { ...formData.newArrivals, title: e.target.value },
                      })
                    }
                    className="w-full bg-neutral-950 border border-neutral-800 text-white p-3 focus:outline-none focus:border-[#00e65c]"
                  />
                </div>

                <div>
                  <label className="block text-neutral-400 mb-1">DISPLAY PRODUCT COUNT</label>
                  <input
                    type="number"
                    min={2}
                    max={12}
                    value={formData.newArrivals.displayCount}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        newArrivals: {
                          ...formData.newArrivals,
                          displayCount: parseInt(e.target.value) || 4,
                        },
                      })
                    }
                    className="w-full bg-neutral-950 border border-neutral-800 text-white p-3 focus:outline-none focus:border-[#00e65c]"
                  />
                </div>

                <div>
                  <label className="block text-neutral-400 mb-1">BUTTON LABEL</label>
                  <input
                    type="text"
                    value={formData.newArrivals.buttonText}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        newArrivals: { ...formData.newArrivals, buttonText: e.target.value },
                      })
                    }
                    className="w-full bg-neutral-950 border border-neutral-800 text-white p-3 focus:outline-none focus:border-[#00e65c]"
                  />
                </div>
              </div>
            </div>

            {/* 8. BEST SELLERS */}
            <div className="bg-neutral-900 border border-neutral-800 p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                <div className="flex items-center gap-2 text-[#00e65c]">
                  <Award size={18} />
                  <h3 className="font-syne font-bold text-sm uppercase text-white">
                    8. BEST SELLERS SECTION
                  </h3>
                </div>
                <label className="flex items-center gap-2 cursor-pointer font-mono text-xs text-neutral-300">
                  <input
                    type="checkbox"
                    checked={formData.bestSellers.enabled}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        bestSellers: { ...formData.bestSellers, enabled: e.target.checked },
                      })
                    }
                    className="accent-[#00e65c] w-4 h-4"
                  />
                  <span>ENABLE SECTION</span>
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 font-mono text-xs">
                <div>
                  <label className="block text-neutral-400 mb-1">SECTION TAGLINE</label>
                  <input
                    type="text"
                    value={formData.bestSellers.tagline}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        bestSellers: { ...formData.bestSellers, tagline: e.target.value },
                      })
                    }
                    className="w-full bg-neutral-950 border border-neutral-800 text-white p-3 focus:outline-none focus:border-[#00e65c]"
                  />
                </div>

                <div>
                  <label className="block text-neutral-400 mb-1">HEADING TITLE</label>
                  <input
                    type="text"
                    value={formData.bestSellers.title}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        bestSellers: { ...formData.bestSellers, title: e.target.value },
                      })
                    }
                    className="w-full bg-neutral-950 border border-neutral-800 text-white p-3 focus:outline-none focus:border-[#00e65c]"
                  />
                </div>

                <div>
                  <label className="block text-neutral-400 mb-1">DISPLAY PRODUCT COUNT</label>
                  <input
                    type="number"
                    min={2}
                    max={12}
                    value={formData.bestSellers.displayCount}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        bestSellers: {
                          ...formData.bestSellers,
                          displayCount: parseInt(e.target.value) || 4,
                        },
                      })
                    }
                    className="w-full bg-neutral-950 border border-neutral-800 text-white p-3 focus:outline-none focus:border-[#00e65c]"
                  />
                </div>

                <div>
                  <label className="block text-neutral-400 mb-1">BUTTON LABEL</label>
                  <input
                    type="text"
                    value={formData.bestSellers.buttonText}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        bestSellers: { ...formData.bestSellers, buttonText: e.target.value },
                      })
                    }
                    className="w-full bg-neutral-950 border border-neutral-800 text-white p-3 focus:outline-none focus:border-[#00e65c]"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: FEATURED COLLECTION & PROMOTIONAL BANNERS */}
        {activeTab === 'campaigns' && (
          <div className="space-y-8">
            {/* 9. FEATURED COLLECTION */}
            <div className="bg-neutral-900 border border-neutral-800 p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                <div className="flex items-center gap-2 text-[#00e65c]">
                  <Crown size={18} />
                  <h3 className="font-syne font-bold text-sm uppercase text-white">
                    9. FEATURED COLLECTION CAPSULE
                  </h3>
                </div>
                <label className="flex items-center gap-2 cursor-pointer font-mono text-xs text-neutral-300">
                  <input
                    type="checkbox"
                    checked={formData.featuredCollection.enabled}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        featuredCollection: {
                          ...formData.featuredCollection,
                          enabled: e.target.checked,
                        },
                      })
                    }
                    className="accent-[#00e65c] w-4 h-4"
                  />
                  <span>ENABLE CAPSULE</span>
                </label>
              </div>

              <ImageUploader
                label="CAPSULE EDITORIAL IMAGE (FIREBASE STORAGE / URL)"
                value={formData.featuredCollection.image}
                onChange={(url) =>
                  setFormData({
                    ...formData,
                    featuredCollection: { ...formData.featuredCollection, image: url },
                  })
                }
                folderName="featured_capsule"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
                <div>
                  <label className="block text-neutral-400 mb-1">BADGE LABEL</label>
                  <input
                    type="text"
                    value={formData.featuredCollection.badge}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        featuredCollection: { ...formData.featuredCollection, badge: e.target.value },
                      })
                    }
                    className="w-full bg-neutral-950 border border-neutral-800 text-white p-3 focus:outline-none focus:border-[#00e65c]"
                  />
                </div>

                <div>
                  <label className="block text-neutral-[#00e65c] font-bold mb-1">GRAFFITI TITLE</label>
                  <input
                    type="text"
                    value={formData.featuredCollection.title}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        featuredCollection: { ...formData.featuredCollection, title: e.target.value },
                      })
                    }
                    className="w-full bg-neutral-950 border border-neutral-800 text-[#00e65c] font-bold p-3 focus:outline-none focus:border-[#00e65c]"
                  />
                </div>

                <div>
                  <label className="block text-neutral-400 mb-1">SUBTITLE / SLOGAN</label>
                  <input
                    type="text"
                    value={formData.featuredCollection.subtitle}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        featuredCollection: { ...formData.featuredCollection, subtitle: e.target.value },
                      })
                    }
                    className="w-full bg-neutral-950 border border-neutral-800 text-white p-3 focus:outline-none focus:border-[#00e65c]"
                  />
                </div>

                <div>
                  <label className="block text-neutral-400 mb-1">ARCHIVE HEADER TITLE</label>
                  <input
                    type="text"
                    value={formData.featuredCollection.archiveTitle}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        featuredCollection: { ...formData.featuredCollection, archiveTitle: e.target.value },
                      })
                    }
                    className="w-full bg-neutral-950 border border-neutral-800 text-white p-3 focus:outline-none focus:border-[#00e65c]"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-neutral-400 mb-1">DESCRIPTION PARAGRAPH</label>
                  <textarea
                    rows={3}
                    value={formData.featuredCollection.description}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        featuredCollection: { ...formData.featuredCollection, description: e.target.value },
                      })
                    }
                    className="w-full bg-neutral-950 border border-neutral-800 text-white p-3 focus:outline-none focus:border-[#00e65c]"
                  />
                </div>

                <div>
                  <label className="block text-neutral-400 mb-1">FABRIC WEIGHT SPEC</label>
                  <input
                    type="text"
                    value={formData.featuredCollection.fabricWeight}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        featuredCollection: { ...formData.featuredCollection, fabricWeight: e.target.value },
                      })
                    }
                    className="w-full bg-neutral-950 border border-neutral-800 text-white p-3 focus:outline-none focus:border-[#00e65c]"
                  />
                </div>

                <div>
                  <label className="block text-neutral-400 mb-1">FIT PROFILE SPEC</label>
                  <input
                    type="text"
                    value={formData.featuredCollection.fitProfile}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        featuredCollection: { ...formData.featuredCollection, fitProfile: e.target.value },
                      })
                    }
                    className="w-full bg-neutral-950 border border-neutral-800 text-white p-3 focus:outline-none focus:border-[#00e65c]"
                  />
                </div>

                <div>
                  <label className="block text-neutral-400 mb-1">COLORWAYS SPEC</label>
                  <input
                    type="text"
                    value={formData.featuredCollection.colorways}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        featuredCollection: { ...formData.featuredCollection, colorways: e.target.value },
                      })
                    }
                    className="w-full bg-neutral-950 border border-neutral-800 text-[#00e65c] p-3 focus:outline-none focus:border-[#00e65c]"
                  />
                </div>

                <div>
                  <label className="block text-neutral-400 mb-1">BUTTON TEXT</label>
                  <input
                    type="text"
                    value={formData.featuredCollection.buttonText}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        featuredCollection: { ...formData.featuredCollection, buttonText: e.target.value },
                      })
                    }
                    className="w-full bg-neutral-950 border border-neutral-800 text-white p-3 focus:outline-none focus:border-[#00e65c]"
                  />
                </div>
              </div>
            </div>

            {/* 10. PROMOTIONAL BANNERS */}
            <div className="bg-neutral-900 border border-neutral-800 p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                <div className="flex items-center gap-2 text-[#00e65c]">
                  <Tag size={18} />
                  <h3 className="font-syne font-bold text-sm uppercase text-white">
                    10. PROMOTIONAL CAMPAIGN BANNER
                  </h3>
                </div>
                <label className="flex items-center gap-2 cursor-pointer font-mono text-xs text-neutral-300">
                  <input
                    type="checkbox"
                    checked={formData.promotionalBanner.enabled}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        promotionalBanner: {
                          ...formData.promotionalBanner,
                          enabled: e.target.checked,
                        },
                      })
                    }
                    className="accent-[#00e65c] w-4 h-4"
                  />
                  <span>ENABLE PROMO BANNER</span>
                </label>
              </div>

              <ImageUploader
                label="CAMPAIGN BACKGROUND IMAGE (FIREBASE STORAGE / URL)"
                value={formData.promotionalBanner.image}
                onChange={(url) =>
                  setFormData({
                    ...formData,
                    promotionalBanner: { ...formData.promotionalBanner, image: url },
                  })
                }
                folderName="promotions"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
                <div>
                  <label className="block text-neutral-400 mb-1">PROMO BADGE</label>
                  <input
                    type="text"
                    value={formData.promotionalBanner.badge}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        promotionalBanner: { ...formData.promotionalBanner, badge: e.target.value },
                      })
                    }
                    className="w-full bg-neutral-950 border border-neutral-800 text-white p-3 focus:outline-none focus:border-[#00e65c]"
                  />
                </div>

                <div>
                  <label className="block text-neutral-400 mb-1">CAMPAIGN TITLE</label>
                  <input
                    type="text"
                    value={formData.promotionalBanner.title}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        promotionalBanner: { ...formData.promotionalBanner, title: e.target.value },
                      })
                    }
                    className="w-full bg-neutral-950 border border-neutral-800 text-white p-3 focus:outline-none focus:border-[#00e65c]"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-neutral-400 mb-1">SUBTITLE / PROMO DETAILS</label>
                  <input
                    type="text"
                    value={formData.promotionalBanner.subtitle}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        promotionalBanner: { ...formData.promotionalBanner, subtitle: e.target.value },
                      })
                    }
                    className="w-full bg-neutral-950 border border-neutral-800 text-white p-3 focus:outline-none focus:border-[#00e65c]"
                  />
                </div>

                <div>
                  <label className="block text-neutral-400 mb-1">EXPIRY / URGENCY NOTICE</label>
                  <input
                    type="text"
                    value={formData.promotionalBanner.expiryText || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        promotionalBanner: { ...formData.promotionalBanner, expiryText: e.target.value },
                      })
                    }
                    className="w-full bg-neutral-950 border border-neutral-800 text-[#00e65c] p-3 focus:outline-none focus:border-[#00e65c]"
                  />
                </div>

                <div>
                  <label className="block text-neutral-400 mb-1">BUTTON TEXT</label>
                  <input
                    type="text"
                    value={formData.promotionalBanner.buttonText}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        promotionalBanner: { ...formData.promotionalBanner, buttonText: e.target.value },
                      })
                    }
                    className="w-full bg-neutral-950 border border-neutral-800 text-white p-3 focus:outline-none focus:border-[#00e65c]"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: LOOKBOOK & INSTAGRAM */}
        {activeTab === 'social' && (
          <div className="space-y-8">
            {/* 11. LOOKBOOK */}
            <div className="bg-neutral-900 border border-neutral-800 p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                <div className="flex items-center gap-2 text-[#00e65c]">
                  <Camera size={18} />
                  <h3 className="font-syne font-bold text-sm uppercase text-white">
                    11. EDITORIAL LOOKBOOK SECTION
                  </h3>
                </div>
                <label className="flex items-center gap-2 cursor-pointer font-mono text-xs text-neutral-300">
                  <input
                    type="checkbox"
                    checked={formData.lookbook.enabled}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        lookbook: { ...formData.lookbook, enabled: e.target.checked },
                      })
                    }
                    className="accent-[#00e65c] w-4 h-4"
                  />
                  <span>ENABLE LOOKBOOK</span>
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
                <div>
                  <label className="block text-neutral-400 mb-1">SECTION TAGLINE</label>
                  <input
                    type="text"
                    value={formData.lookbook.tagline}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        lookbook: { ...formData.lookbook, tagline: e.target.value },
                      })
                    }
                    className="w-full bg-neutral-950 border border-neutral-800 text-white p-3 focus:outline-none focus:border-[#00e65c]"
                  />
                </div>

                <div>
                  <label className="block text-neutral-400 mb-1">HEADING TITLE</label>
                  <input
                    type="text"
                    value={formData.lookbook.title}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        lookbook: { ...formData.lookbook, title: e.target.value },
                      })
                    }
                    className="w-full bg-neutral-950 border border-neutral-800 text-white p-3 focus:outline-none focus:border-[#00e65c]"
                  />
                </div>
              </div>

              {/* Lookbook items manager */}
              <div className="space-y-4 pt-4 border-t border-neutral-800 font-mono text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-neutral-400 font-bold uppercase">
                    EDITORIAL LOOKS ({formData.lookbook.looks.length})
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        lookbook: {
                          ...formData.lookbook,
                          looks: [
                            ...formData.lookbook.looks,
                            {
                              id: `look-${Date.now()}`,
                              season: "METROPOLIS '26",
                              title: 'NEW LOOKBOOK FIT',
                              subtitle: 'Heavyweight streetwear jacket paired with relaxed denim.',
                              image:
                                'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1200&auto=format&fit=crop',
                              hotspots: [{ id: `hs-${Date.now()}`, productId: 'p1', topPercent: 40, leftPercent: 50 }],
                            },
                          ],
                        },
                      })
                    }
                    className="bg-neutral-800 text-[#00e65c] px-3 py-1.5 border border-neutral-700 flex items-center gap-1"
                  >
                    <Plus size={14} />
                    <span>ADD LOOK</span>
                  </button>
                </div>

                {formData.lookbook.looks.map((look, idx) => (
                  <div key={look.id || idx} className="bg-neutral-950 border border-neutral-800 p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[#00e65c] font-bold">LOOK #{idx + 1}</span>
                      <button
                        type="button"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            lookbook: {
                              ...formData.lookbook,
                              looks: formData.lookbook.looks.filter((_, i) => i !== idx),
                            },
                          })
                        }
                        className="text-neutral-500 hover:text-red-400 p-1"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[10px] text-neutral-500 uppercase mb-1">SEASON BADGE</label>
                        <input
                          type="text"
                          value={look.season}
                          onChange={(e) => {
                            const newLooks = [...formData.lookbook.looks];
                            newLooks[idx].season = e.target.value;
                            setFormData({
                              ...formData,
                              lookbook: { ...formData.lookbook, looks: newLooks },
                            });
                          }}
                          className="w-full bg-neutral-900 border border-neutral-800 text-white p-2 focus:outline-none focus:border-[#00e65c]"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] text-neutral-500 uppercase mb-1">LOOK TITLE</label>
                        <input
                          type="text"
                          value={look.title}
                          onChange={(e) => {
                            const newLooks = [...formData.lookbook.looks];
                            newLooks[idx].title = e.target.value;
                            setFormData({
                              ...formData,
                              lookbook: { ...formData.lookbook, looks: newLooks },
                            });
                          }}
                          className="w-full bg-neutral-900 border border-neutral-800 text-white p-2 focus:outline-none focus:border-[#00e65c]"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] text-neutral-500 uppercase mb-1">SUBTITLE</label>
                        <input
                          type="text"
                          value={look.subtitle}
                          onChange={(e) => {
                            const newLooks = [...formData.lookbook.looks];
                            newLooks[idx].subtitle = e.target.value;
                            setFormData({
                              ...formData,
                              lookbook: { ...formData.lookbook, looks: newLooks },
                            });
                          }}
                          className="w-full bg-neutral-900 border border-neutral-800 text-white p-2 focus:outline-none focus:border-[#00e65c]"
                        />
                      </div>
                    </div>

                    <ImageUploader
                      label="LOOKBOOK HIGH-RES PHOTO (FIREBASE STORAGE / URL)"
                      value={look.image}
                      onChange={(url) => {
                        const newLooks = [...formData.lookbook.looks];
                        newLooks[idx].image = url;
                        setFormData({
                          ...formData,
                          lookbook: { ...formData.lookbook, looks: newLooks },
                        });
                      }}
                      folderName="lookbook"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* 12. INSTAGRAM */}
            <div className="bg-neutral-900 border border-neutral-800 p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                <div className="flex items-center gap-2 text-[#00e65c]">
                  <Instagram size={18} />
                  <h3 className="font-syne font-bold text-sm uppercase text-white">
                    12. INSTAGRAM / COMMUNITY SOCIAL SECTION
                  </h3>
                </div>
                <label className="flex items-center gap-2 cursor-pointer font-mono text-xs text-neutral-300">
                  <input
                    type="checkbox"
                    checked={formData.instagramSection.enabled}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        instagramSection: {
                          ...formData.instagramSection,
                          enabled: e.target.checked,
                        },
                      })
                    }
                    className="accent-[#00e65c] w-4 h-4"
                  />
                  <span>ENABLE SECTION</span>
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
                <div>
                  <label className="block text-neutral-400 mb-1">OFFICIAL IG HANDLE</label>
                  <input
                    type="text"
                    value={formData.instagramSection.handle}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        instagramSection: { ...formData.instagramSection, handle: e.target.value },
                      })
                    }
                    className="w-full bg-neutral-950 border border-neutral-800 text-[#00e65c] font-bold p-3 focus:outline-none focus:border-[#00e65c]"
                  />
                </div>

                <div>
                  <label className="block text-neutral-400 mb-1">HEADING TITLE</label>
                  <input
                    type="text"
                    value={formData.instagramSection.title}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        instagramSection: { ...formData.instagramSection, title: e.target.value },
                      })
                    }
                    className="w-full bg-neutral-950 border border-neutral-800 text-white p-3 focus:outline-none focus:border-[#00e65c]"
                  />
                </div>

                <div>
                  <label className="block text-neutral-400 mb-1">COMMUNITY HASHTAG</label>
                  <input
                    type="text"
                    value={formData.instagramSection.hashtag}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        instagramSection: { ...formData.instagramSection, hashtag: e.target.value },
                      })
                    }
                    className="w-full bg-neutral-950 border border-neutral-800 text-white p-3 focus:outline-none focus:border-[#00e65c]"
                  />
                </div>
              </div>

              {/* Instagram Posts Grid Manager */}
              <div className="space-y-4 pt-4 border-t border-neutral-800 font-mono text-xs">
                <span className="text-neutral-400 font-bold uppercase">
                  INSTAGRAM GRID POSTS ({formData.instagramSection.posts.length})
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {formData.instagramSection.posts.map((post, idx) => (
                    <div key={post.id || idx} className="bg-neutral-950 border border-neutral-800 p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[#00e65c] font-bold">GRID ITEM #{idx + 1}</span>
                      </div>

                      <ImageUploader
                        label="FIT PHOTO (FIREBASE STORAGE / URL)"
                        value={post.image}
                        onChange={(url) => {
                          const newPosts = [...formData.instagramSection.posts];
                          newPosts[idx].image = url;
                          setFormData({
                            ...formData,
                            instagramSection: { ...formData.instagramSection, posts: newPosts },
                          });
                        }}
                        folderName="instagram"
                      />

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] text-neutral-500 uppercase mb-1">TAGGED ITEM</label>
                          <input
                            type="text"
                            value={post.tag}
                            onChange={(e) => {
                              const newPosts = [...formData.instagramSection.posts];
                              newPosts[idx].tag = e.target.value;
                              setFormData({
                                ...formData,
                                instagramSection: { ...formData.instagramSection, posts: newPosts },
                              });
                            }}
                            className="w-full bg-neutral-900 border border-neutral-800 text-white p-2 focus:outline-none focus:border-[#00e65c]"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] text-neutral-500 uppercase mb-1">LIKES COUNT</label>
                          <input
                            type="text"
                            value={post.likes}
                            onChange={(e) => {
                              const newPosts = [...formData.instagramSection.posts];
                              newPosts[idx].likes = e.target.value;
                              setFormData({
                                ...formData,
                                instagramSection: { ...formData.instagramSection, posts: newPosts },
                              });
                            }}
                            className="w-full bg-neutral-900 border border-neutral-800 text-white p-2 focus:outline-none focus:border-[#00e65c]"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: NEWSLETTER SECTION */}
        {activeTab === 'newsletter' && (
          <div className="bg-neutral-900 border border-neutral-800 p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2 text-[#00e65c]">
                <Mail size={18} />
                <h3 className="font-syne font-bold text-sm uppercase text-white">
                  13. NEWSLETTER VIP CLUB SECTION
                </h3>
              </div>
              <label className="flex items-center gap-2 cursor-pointer font-mono text-xs text-neutral-300">
                <input
                  type="checkbox"
                  checked={formData.newsletterSection.enabled}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      newsletterSection: {
                        ...formData.newsletterSection,
                        enabled: e.target.checked,
                      },
                    })
                  }
                  className="accent-[#00e65c] w-4 h-4"
                />
                <span>ENABLE NEWSLETTER</span>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
              <div>
                <label className="block text-neutral-400 mb-1">BADGE LABEL</label>
                <input
                  type="text"
                  value={formData.newsletterSection.badge}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      newsletterSection: { ...formData.newsletterSection, badge: e.target.value },
                    })
                  }
                  className="w-full bg-neutral-950 border border-neutral-800 text-white p-3 focus:outline-none focus:border-[#00e65c]"
                />
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">MAIN HEADING TITLE</label>
                <input
                  type="text"
                  value={formData.newsletterSection.title}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      newsletterSection: { ...formData.newsletterSection, title: e.target.value },
                    })
                  }
                  className="w-full bg-neutral-950 border border-neutral-800 text-white p-3 focus:outline-none focus:border-[#00e65c]"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-neutral-400 mb-1">SUBTITLE / VALUE PROPOSITION</label>
                <textarea
                  rows={2}
                  value={formData.newsletterSection.subtitle}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      newsletterSection: { ...formData.newsletterSection, subtitle: e.target.value },
                    })
                  }
                  className="w-full bg-neutral-950 border border-neutral-800 text-white p-3 focus:outline-none focus:border-[#00e65c]"
                />
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">INPUT PLACEHOLDER</label>
                <input
                  type="text"
                  value={formData.newsletterSection.placeholder}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      newsletterSection: { ...formData.newsletterSection, placeholder: e.target.value },
                    })
                  }
                  className="w-full bg-neutral-950 border border-neutral-800 text-white p-3 focus:outline-none focus:border-[#00e65c]"
                />
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">BUTTON TEXT</label>
                <input
                  type="text"
                  value={formData.newsletterSection.buttonText}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      newsletterSection: { ...formData.newsletterSection, buttonText: e.target.value },
                    })
                  }
                  className="w-full bg-neutral-950 border border-neutral-800 text-white p-3 focus:outline-none focus:border-[#00e65c]"
                />
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">DISCOUNT PROMO CODE</label>
                <input
                  type="text"
                  value={formData.newsletterSection.discountCode}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      newsletterSection: { ...formData.newsletterSection, discountCode: e.target.value },
                    })
                  }
                  className="w-full bg-neutral-950 border border-neutral-800 text-[#00e65c] font-bold p-3 focus:outline-none focus:border-[#00e65c]"
                />
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">FOOTER NOTICE</label>
                <input
                  type="text"
                  value={formData.newsletterSection.footerNotice}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      newsletterSection: { ...formData.newsletterSection, footerNotice: e.target.value },
                    })
                  }
                  className="w-full bg-neutral-950 border border-neutral-800 text-white p-3 focus:outline-none focus:border-[#00e65c]"
                />
              </div>
            </div>
          </div>
        )}

        {/* BOTTOM SAVE BUTTON */}
        <div className="pt-6 border-t border-neutral-800 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="bg-[#00e65c] text-black font-syne font-extrabold text-xs uppercase px-10 py-4 hover:bg-[#00ff66] transition-all flex items-center gap-2 shadow-xl hover:scale-105"
          >
            <Save size={18} />
            <span>{saving ? 'PUBLISHING...' : 'PUBLISH ALL HOMEPAGE CHANGES'}</span>
          </button>
        </div>
      </form>
    </AdminLayout>
  );
};
