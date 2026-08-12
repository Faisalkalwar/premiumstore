import { LookbookItem } from '../types';

export const LOOKBOOK_ITEMS: LookbookItem[] = [
  {
    id: 'lb-01',
    title: 'METROPOLIS GRAFFITI DROP',
    tagline: 'AUTUMN / WINTER EDITORIAL SESSIONS',
    season: 'VOL. 04 / 2026',
    image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1200&auto=format&fit=crop',
    hotspots: [
      {
        id: 'hs-01',
        productId: 'prod-shirt-01',
        topPercent: 42,
        leftPercent: 48,
      },
      {
        id: 'hs-02',
        productId: 'prod-cap-01',
        topPercent: 18,
        leftPercent: 50,
      },
      {
        id: 'hs-03',
        productId: 'prod-jeans-01',
        topPercent: 78,
        leftPercent: 52,
      },
    ],
  },
  {
    id: 'lb-02',
    title: 'RAW DENIM & UTILITY CUTS',
    tagline: 'INDUSTRIAL STREETWEAR ARCHIVE',
    season: 'VOL. 03 / 2026',
    image: 'https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?q=80&w=1200&auto=format&fit=crop',
    hotspots: [
      {
        id: 'hs-04',
        productId: 'prod-jeans-02',
        topPercent: 70,
        leftPercent: 46,
      },
      {
        id: 'hs-05',
        productId: 'prod-shirt-02',
        topPercent: 38,
        leftPercent: 48,
      },
    ],
  },
  {
    id: 'lb-03',
    title: 'THE NIGHT SHIFT SERIES',
    tagline: 'DARK MODE STREETWEAR GRAILS',
    season: 'VOL. 02 / 2026',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1200&auto=format&fit=crop',
    hotspots: [
      {
        id: 'hs-06',
        productId: 'prod-new-01',
        topPercent: 35,
        leftPercent: 52,
      },
      {
        id: 'hs-07',
        productId: 'prod-cap-02',
        topPercent: 15,
        leftPercent: 50,
      },
    ],
  },
];
