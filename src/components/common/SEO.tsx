import React, { useEffect } from 'react';

export interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'product' | 'article';
  productData?: {
    name: string;
    description: string;
    image: string;
    price: number;
    currency?: string;
    sku?: string;
    inStock?: boolean;
    category?: string;
  };
  categoryData?: {
    name: string;
    description?: string;
  };
}

export const SEO: React.FC<SEOProps> = ({
  title,
  description = 'PREMIUM STORE — Heavyweight streetwear, acid wash tees, oversized hoodies, and urban grails.',
  keywords = 'streetwear, urban fashion, heavyweight tees, oversized hoodie, denim, graffiti apparel, premium store',
  image = 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1200&auto=format&fit=crop',
  url,
  type = 'website',
  productData,
  categoryData,
}) => {
  const siteName = 'PREMIUM STORE';
  const fullTitle = title ? `${title} — ${siteName}` : `${siteName} — Streetwear & Urban Fashion`;
  const currentUrl = url || window.location.href;

  useEffect(() => {
    // 1. Set Title
    document.title = fullTitle;

    // 2. Helper function to set or update meta tag
    const setMetaTag = (attrName: 'name' | 'property', attrValue: string, content: string) => {
      let element = document.querySelector(`meta[${attrName}="${attrValue}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attrName, attrValue);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // Standard meta tags
    setMetaTag('name', 'description', description);
    setMetaTag('name', 'keywords', keywords);

    // Open Graph meta tags
    setMetaTag('property', 'og:title', fullTitle);
    setMetaTag('property', 'og:description', description);
    setMetaTag('property', 'og:image', image);
    setMetaTag('property', 'og:url', currentUrl);
    setMetaTag('property', 'og:type', type);
    setMetaTag('property', 'og:site_name', siteName);

    // Twitter card tags
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', fullTitle);
    setMetaTag('name', 'twitter:description', description);
    setMetaTag('name', 'twitter:image', image);

    // 3. Canonical URL
    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', currentUrl);

    // 4. Structured Data (JSON-LD)
    const jsonLdId = 'structured-data-jsonld';
    let scriptTag = document.getElementById(jsonLdId) as HTMLScriptElement;
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.id = jsonLdId;
      scriptTag.type = 'application/ld+json';
      document.head.appendChild(scriptTag);
    }

    let schema: any;

    if (productData) {
      schema = {
        '@context': 'https://schema.org/',
        '@type': 'Product',
        name: productData.name,
        image: [productData.image],
        description: productData.description,
        sku: productData.sku || productData.name.toLowerCase().replace(/\s+/g, '-'),
        brand: {
          '@type': 'Brand',
          name: siteName,
        },
        offers: {
          '@type': 'Offer',
          url: currentUrl,
          priceCurrency: productData.currency || 'USD',
          price: productData.price,
          itemCondition: 'https://schema.org/NewCondition',
          availability: productData.inStock !== false ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
        },
      };
    } else if (categoryData) {
      schema = {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: categoryData.name,
        description: categoryData.description || `Browse our ${categoryData.name} collection at ${siteName}.`,
        url: currentUrl,
      };
    } else {
      schema = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: siteName,
        url: currentUrl,
        logo: image,
        sameAs: [
          'https://instagram.com/premiumstore_official',
          'https://twitter.com/premiumstore',
        ],
      };
    }

    scriptTag.text = JSON.stringify(schema);
  }, [fullTitle, description, keywords, image, currentUrl, type, productData, categoryData]);

  return null;
};
