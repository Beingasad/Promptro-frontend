/**
 * Utility for automatic browser-side image compression.
 * Resolves large file upload failures by keeping images in the optimal 300-500KB range
 * with high visual quality (~85%) while maintaining aspect ratio and modern formats.
 */

export async function compressImage(file: File): Promise<File> {
  const sizeKB = file.size / 1024;

  // Rule 6: Reject only extremely large images (>10MB)
  if (file.size > 10 * 1024 * 1024) {
    throw new Error('Image is too large. Please upload an image smaller than 10MB.');
  }

  // Rule 1: Any image >500KB: compress to 300–500KB before upload
  if (file.size <= 500 * 1024) {
    return file; // No compression needed
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;

      img.onload = async () => {
        try {
          let width = img.width;
          let height = img.height;

          // Rule 2: Keep aspect ratio same
          // Proportionally cap dimensions if they are extremely large
          const MAX_DIMENSION = 2048;
          if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
            if (width > height) {
              height = Math.round((height * MAX_DIMENSION) / width);
              width = MAX_DIMENSION;
            } else {
              width = Math.round((width * MAX_DIMENSION) / height);
              height = MAX_DIMENSION;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(file); // Fallback
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);

          // Rule 4: Convert PNG to WebP/JPEG if needed
          let format = 'image/webp';
          let quality = 0.85; // Rule 3: Keep visual quality ~85%

          let compressedBlob: Blob | null = await new Promise((res) => {
            canvas.toBlob((b) => res(b), format, quality);
          });

          // Fallback if browser doesn't support WebP properly
          if (!compressedBlob || compressedBlob.size === 0) {
            format = 'image/jpeg';
            compressedBlob = await new Promise((res) => {
              canvas.toBlob((b) => res(b), format, quality);
            });
          }

          // Smart iterative adjustments to stay within 300-500KB if possible
          let iterations = 0;
          
          // Case A: Size is > 500KB, compress more
          while (compressedBlob && compressedBlob.size > 500 * 1024 && iterations < 3) {
            iterations++;
            quality -= 0.1; // Decrease quality slightly
            if (quality < 0.6) {
              // Scale down dimensions if we are running out of quality leeway
              width = Math.round(width * 0.8);
              height = Math.round(height * 0.8);
              canvas.width = width;
              canvas.height = height;
              ctx.drawImage(img, 0, 0, width, height);
              quality = 0.8; // Reset quality slightly higher for scaled image
            }
            compressedBlob = await new Promise((res) => {
              canvas.toBlob((b) => res(b), format, quality);
            });
          }

          // Case B: Size is < 300KB, increase quality to maximize fidelity (stay in 300-500KB)
          if (compressedBlob && compressedBlob.size < 300 * 1024) {
            let targetQuality = 0.92;
            let betterBlob = await new Promise<Blob | null>((res) => {
              canvas.toBlob((b) => res(b), format, targetQuality);
            });
            if (betterBlob && betterBlob.size >= 300 * 1024 && betterBlob.size <= 500 * 1024) {
              compressedBlob = betterBlob;
            } else if (betterBlob && betterBlob.size < 300 * 1024) {
              // Try max quality
              let maxBlob = await new Promise<Blob | null>((res) => {
                canvas.toBlob((b) => res(b), format, 0.98);
              });
              if (maxBlob && maxBlob.size <= 500 * 1024) {
                compressedBlob = maxBlob;
              }
            }
          }

          if (compressedBlob) {
            const extension = format === 'image/webp' ? '.webp' : '.jpg';
            const originalName = file.name;
            const baseName = originalName.substring(0, originalName.lastIndexOf('.')) || originalName;
            const newName = `${baseName}${extension}`;

            const compressedFile = new File([compressedBlob], newName, {
              type: format,
              lastModified: Date.now()
            });
            
            console.log(`Compressed ${originalName} (${sizeKB.toFixed(1)}KB) -> ${newName} (${(compressedFile.size / 1024).toFixed(1)}KB)`);
            resolve(compressedFile);
          } else {
            resolve(file); // Fallback
          }
        } catch (e) {
          console.error('Image compression failed, using original file:', e);
          resolve(file); // Fallback
        }
      };

      img.onerror = () => {
        resolve(file); // Fallback
      };
    };

    reader.onerror = () => {
      resolve(file); // Fallback
    };
  });
}
