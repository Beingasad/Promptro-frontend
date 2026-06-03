import { useEffect } from 'react';

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface SEOMetaProps {
  title: string;
  description: string;
  keywords?: string;
  canonical?: string;
  robots?: string;
  ogImage?: string;
  ogType?: string;
  /** Author name for article pages */
  author?: string;
  /** Published date (ISO string) for articles */
  publishedTime?: string;
  /** Modified date (ISO string) for articles */
  modifiedTime?: string;
  /** Breadcrumb items for breadcrumb JSON-LD */
  breadcrumbs?: BreadcrumbItem[];
  /** Suppress default Organization schema (for pages that inject their own) */
  noOrganizationSchema?: boolean;
}

const SITE_NAME = 'Promptro';
const SITE_URL = 'https://promptro.in';
const DEFAULT_OG_IMAGE = 'https://promptro.in/brand/logo.png';
const DEFAULT_AUTHOR = 'Mohammad Asad Ansari';
const DEFAULT_TWITTER_HANDLE = '@promptro_in';

/** Inject or create a <meta> element by selector */
const setMeta = (selector: string, content: string) => {
  let el = document.head.querySelector(selector) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    const [attr, val] = selector.replace('[', '').replace(']', '').split('=');
    el.setAttribute(attr.replace(/^meta\[/, ''), val.replace(/"/g, ''));
    document.head.appendChild(el);
  }
  el.content = content;
};

/** Inject or update canonical <link> */
const setCanonical = (href: string) => {
  let el = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement('link');
    el.rel = 'canonical';
    document.head.appendChild(el);
  }
  el.href = href;
};

/** Inject a JSON-LD script by id */
const setJsonLd = (id: string, schema: object) => {
  let el = document.head.querySelector(`script#${id}`);
  if (!el) {
    el = document.createElement('script');
    el.id = id;
    el.setAttribute('type', 'application/ld+json');
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(schema, null, 0);
};

/** Remove a JSON-LD script by id */
const removeJsonLd = (id: string) => {
  const el = document.head.querySelector(`script#${id}`);
  if (el) el.remove();
};

export default function SEOMeta({
  title,
  description,
  keywords,
  canonical,
  robots,
  ogImage,
  ogType = 'website',
  author,
  publishedTime,
  modifiedTime,
  breadcrumbs,
  noOrganizationSchema = false,
}: SEOMetaProps) {
  useEffect(() => {
    // 1. Title
    document.title = title;

    // 2. Basic meta
    setMeta('meta[name="description"]', description);
    setMeta(
      'meta[name="keywords"]',
      keywords ?? 'AI prompts, ChatGPT prompts, image prompts, cinematic prompts, portrait prompts, Promptro'
    );
    setMeta('meta[name="robots"]', robots ?? 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
    setMeta('meta[name="author"]', author ?? DEFAULT_AUTHOR);

    // 3. Canonical
    const currentPath = window.location.pathname;
    const finalCanonical = canonical ?? `${SITE_URL}${currentPath === '/' ? '' : currentPath}`;
    setCanonical(finalCanonical);

    // 4. Open Graph
    setMeta('meta[property="og:title"]', title);
    setMeta('meta[property="og:description"]', description);
    setMeta('meta[property="og:url"]', finalCanonical);
    setMeta('meta[property="og:type"]', ogType);
    setMeta('meta[property="og:image"]', ogImage ?? DEFAULT_OG_IMAGE);
    setMeta('meta[property="og:site_name"]', SITE_NAME);
    setMeta('meta[property="og:locale"]', 'en_IN');

    // 5. Article-specific OG tags
    if (publishedTime) {
      setMeta('meta[property="article:published_time"]', publishedTime);
    }
    if (modifiedTime) {
      setMeta('meta[property="article:modified_time"]', modifiedTime);
    }
    if (author && ogType === 'article') {
      setMeta('meta[property="article:author"]', author);
    }

    // 6. Twitter Card
    setMeta('meta[name="twitter:card"]', 'summary_large_image');
    setMeta('meta[name="twitter:title"]', title);
    setMeta('meta[name="twitter:description"]', description);
    setMeta('meta[name="twitter:image"]', ogImage ?? DEFAULT_OG_IMAGE);
    setMeta('meta[name="twitter:site"]', DEFAULT_TWITTER_HANDLE);

    // 7. Breadcrumb JSON-LD
    if (breadcrumbs && breadcrumbs.length > 0) {
      const breadcrumbSchema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: breadcrumbs.map((item, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: item.name,
          item: item.url,
        })),
      };
      setJsonLd('seo-breadcrumb', breadcrumbSchema);
    } else {
      removeJsonLd('seo-breadcrumb');
    }

    // 8. Organization JSON-LD (injected on every page unless suppressed)
    if (!noOrganizationSchema) {
      const orgSchema = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'Promptro',
        url: SITE_URL,
        logo: `${SITE_URL}/brand/logo.png`,
        sameAs: [
          'https://instagram.com/promptro.in',
          'https://twitter.com/promptro_in',
        ],
        founder: {
          '@type': 'Person',
          name: 'Mohammad Asad Ansari',
          url: `${SITE_URL}/about`,
          jobTitle: 'Founder',
          worksFor: {
            '@type': 'Organization',
            name: 'Promptro',
          },
        },
        contactPoint: {
          '@type': 'ContactPoint',
          url: 'https://promptro.in/contact',
          contactType: 'customer support',
        },
      };
      setJsonLd('seo-organization', orgSchema);
    }
    // 9. WebSite JSON-LD (homepage only — improves AEO, sitelinks searchbox, AI engine entity recognition)
    const isHomepage = (canonical ?? window.location.href) === SITE_URL || (canonical ?? window.location.href) === `${SITE_URL}/`;
    if (isHomepage) {
      const websiteSchema = {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'Promptro',
        url: SITE_URL,
        description: 'Discover trending AI image prompts, cinematic prompts, creative templates and inspiration on Promptro.',
        inLanguage: 'en-IN',
        publisher: {
          '@type': 'Organization',
          name: 'Promptro',
          url: SITE_URL,
          logo: `${SITE_URL}/brand/logo.png`,
          founder: {
            '@type': 'Person',
            name: 'Mohammad Asad Ansari',
            jobTitle: 'Founder & Developer',
          },
        },
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${SITE_URL}/explore?q={search_term_string}`,
          },
          'query-input': 'required name=search_term_string',
        },
      };
      setJsonLd('seo-website', websiteSchema);
    } else {
      removeJsonLd('seo-website');
    }
  }, [title, description, keywords, canonical, robots, ogImage, ogType, author, publishedTime, modifiedTime, breadcrumbs, noOrganizationSchema]);

  return null;
}
