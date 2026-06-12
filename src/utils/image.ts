/**
 * Utility to optimize image URLs on the fly for responsive sizing and WebP support.
 * - Unsplash: Appends format (auto=format), requested width (w=xxx), and optimized quality (q=80).
 * - Cloudinary: Inserts formatting and quality compression (f_auto,q_auto) along with width transformations.
 */

export function optimizeImageUrl(url: string, targetWidth: number = 600): string {
  if (!url) return url;

  // Unsplash Optimization
  if (url.includes('images.unsplash.com')) {
    try {
      const urlObj = new URL(url);
      urlObj.searchParams.set('auto', 'format'); // Dynamically serve WebP or modern formats
      urlObj.searchParams.set('w', targetWidth.toString()); // Request exact responsive width
      if (!urlObj.searchParams.has('q')) {
        urlObj.searchParams.set('q', '80'); // Visual fidelity at optimal file size
      }
      return urlObj.toString();
    } catch (e) {
      return url;
    }
  }

  // Cloudinary Optimization
  if (url.includes('res.cloudinary.com')) {
    const uploadIndex = url.indexOf('/upload/');
    if (uploadIndex !== -1) {
      const prefix = url.substring(0, uploadIndex + 8);
      const suffix = url.substring(uploadIndex + 8);
      
      // If suffix matches a version prefix or direct subpath (e.g. "v1570979139/sample.jpg")
      const versionRegex = /^v\d+/;
      if (versionRegex.test(suffix) || suffix.includes('/v')) {
        return `${prefix}f_auto,q_auto,w_${targetWidth}/${suffix}`;
      }
    }
  }

  return url;
}
