import { useEffect, useRef } from 'react';
import ImageCard, { Prompt } from './ImageCard';
import { useIsMobileDevice } from '../utils/device';
import { optimizeImageUrl } from '../utils/image';
import { preloadImages } from '../utils/imageCache';

interface MasonryGridProps {
  prompts: Prompt[];
  isTwoColumns?: boolean;
}

/** Number of leading cards that receive eager / priority loading. */
const PRIORITY_COUNT = 15;

export default function MasonryGrid({ prompts, isTwoColumns }: MasonryGridProps) {
  const isMobile = useIsMobileDevice();
  const preloadedRef = useRef(false);

  // Eagerly preload the first N thumbnail URLs so they're ready before
  // IntersectionObserver fires and before the browser's own lazy-load kicks in.
  useEffect(() => {
    if (preloadedRef.current || prompts.length === 0) return;
    preloadedRef.current = true;

    const urls = prompts
      .slice(0, PRIORITY_COUNT)
      .map((p) => optimizeImageUrl(p.image_url, 800))
      .filter(Boolean);

    preloadImages(urls);
  }, [prompts]);

  // If mobile device in desktop mode/landscape (innerWidth >= 768), force 2 columns
  const gridColumns = (isMobile && window.innerWidth >= 768)
    ? 'columns-2'
    : isTwoColumns 
      ? 'columns-2 md:columns-4' 
      : 'columns-1 sm:columns-2 md:columns-4';

  return (
    <div className={`w-full gap-2.5 md:gap-3.5 space-y-2.5 md:space-y-3.5 ${gridColumns}`}>
      {prompts.map((prompt, index) => (
        <div
          key={prompt.id}
          className="break-inside-avoid"
          style={{
            animationDelay: `${index * 55}ms`,
          }}
        >
          <ImageCard prompt={prompt} priority={index < PRIORITY_COUNT} />
        </div>
      ))}
    </div>
  );
}
