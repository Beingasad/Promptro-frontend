import { useEffect, useId } from 'react';

interface JsonLdProps {
  schema: Record<string, unknown> | Record<string, unknown>[];
  /** Optional unique key to allow multiple schemas on one page */
  id?: string;
}

/**
 * JsonLd — Injects JSON-LD structured data into <head>.
 * Invisible to users; read by Google, Bing, Perplexity, ChatGPT Search, Gemini.
 * Use for: Organization, Article, FAQ, BreadcrumbList, ImageObject schemas.
 */
export default function JsonLd({ schema, id }: JsonLdProps) {
  const autoId = useId();
  const scriptId = `jsonld-${id ?? autoId.replace(/:/g, '')}`;

  useEffect(() => {
    // Remove any existing script with this ID to prevent duplicates on re-render
    const existing = document.head.querySelector(`script#${scriptId}`);
    if (existing) existing.remove();

    const script = document.createElement('script');
    script.id = scriptId;
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(schema, null, 0);
    document.head.appendChild(script);

    return () => {
      const el = document.head.querySelector(`script#${scriptId}`);
      if (el) el.remove();
    };
  }, [schema, scriptId]);

  return null;
}
