import { useEffect } from 'react';

interface SEOMetaProps {
  title: string;
  description: string;
  keywords?: string;
  canonical?: string;
  robots?: string;
  ogImage?: string;
  ogType?: string;
}

export default function SEOMeta({
  title,
  description,
  keywords,
  canonical,
  robots,
  ogImage,
  ogType = 'website',
}: SEOMetaProps) {
  useEffect(() => {
    // 1. Update Title
    document.title = title;

    // Helper to get or create element
    const getOrCreateMeta = (attrName: string, attrVal: string, isProperty = false) => {
      const selector = isProperty
        ? `meta[property="${attrVal}"]`
        : `meta[name="${attrVal}"]`;
      let element = document.head.querySelector(selector) as HTMLMetaElement | null;
      if (!element) {
        element = document.createElement('meta');
        if (isProperty) {
          element.setAttribute('property', attrVal);
        } else {
          element.setAttribute('name', attrVal);
        }
        document.head.appendChild(element);
      }
      return element;
    };

    // 2. Description
    const metaDesc = getOrCreateMeta('name', 'description');
    metaDesc.content = description;

    // 3. Keywords
    if (keywords) {
      const metaKey = getOrCreateMeta('name', 'keywords');
      metaKey.content = keywords;
    } else {
      // Remove or keep generic if not specified, but let's remove so we don't have stale keywords
      const metaKey = document.head.querySelector('meta[name="keywords"]') as HTMLMetaElement | null;
      if (metaKey && !keywords) {
        // We can either set it empty or delete it. Let's set it to home default or keep it.
        // Let's set to empty or generic list if not provided
        metaKey.content = "AI prompts, ChatGPT prompts, image prompts, cinematic prompts, portrait prompts, Promptro";
      }
    }

    // 4. Robots
    const metaRobots = getOrCreateMeta('name', 'robots');
    metaRobots.content = robots || 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';

    // 5. OpenGraph Tags
    const ogTitle = getOrCreateMeta('property', 'og:title', true);
    ogTitle.content = title;

    const ogDesc = getOrCreateMeta('property', 'og:description', true);
    ogDesc.content = description;

    const currentPath = window.location.pathname;
    const finalCanonical = canonical || `https://promptro.in${currentPath === '/' ? '' : currentPath}`;

    const ogUrl = getOrCreateMeta('property', 'og:url', true);
    ogUrl.content = finalCanonical;

    const ogTypeMeta = getOrCreateMeta('property', 'og:type', true);
    ogTypeMeta.content = ogType;

    const defaultOgImage = 'https://promptro.in/brand/logo.png';
    const ogImg = getOrCreateMeta('property', 'og:image', true);
    ogImg.content = ogImage || defaultOgImage;

    // 6. Twitter Card Tags
    const twTitle = getOrCreateMeta('name', 'twitter:title');
    twTitle.content = title;

    const twDesc = getOrCreateMeta('name', 'twitter:description');
    twDesc.content = description;

    const twImg = getOrCreateMeta('name', 'twitter:image');
    twImg.content = ogImage || defaultOgImage;

    // 7. Canonical Tag
    let canonicalLink = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', finalCanonical);

  }, [title, description, keywords, canonical, robots, ogImage, ogType]);

  return null;
}
