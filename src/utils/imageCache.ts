/**
 * Global in-memory image cache.
 *
 * Tracks URLs that have been fully loaded so ImageCard components
 * can skip the skeleton shimmer and opacity animation when re-mounted
 * (e.g. after navigating back from a detail page).
 *
 * Also provides helpers to eagerly preload the first batch of
 * thumbnail URLs so they are ready before IntersectionObserver fires.
 */

const loadedImages = new Set<string>();

/** Mark a URL as fully loaded. */
export function markImageLoaded(url: string): void {
  if (url) loadedImages.add(url);
}

/** Check whether a URL has already been loaded in this session. */
export function isImageLoaded(url: string): boolean {
  return loadedImages.has(url);
}

/**
 * Preload a single image URL.
 * Resolves when the image is decoded and ready to paint.
 * Rejects silently on network error (fire-and-forget usage is fine).
 */
export function preloadImage(url: string): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    if (!url) {
      resolve();
      return;
    }
    // Already loaded in this session — nothing to do
    if (loadedImages.has(url)) {
      resolve();
      return;
    }
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => {
      loadedImages.add(url);
      resolve();
    };
    img.onerror = () => reject();
    img.src = url;
  });
}

/**
 * Fire-and-forget preload of multiple image URLs in parallel.
 * Failures are silently ignored — these are best-effort preloads.
 */
export function preloadImages(urls: string[]): void {
  urls.forEach((url) => {
    preloadImage(url).catch(() => {
      /* swallow — best-effort */
    });
  });
}
