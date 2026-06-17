import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { optimizeImageUrl } from '../utils/image';
import { isImageLoaded, markImageLoaded } from '../utils/imageCache';
import { cn } from '../utils/cn';

interface ImageGalleryProps {
  images: string[];
  title: string;
  aspectRatio?: string;
  onDoubleClick?: () => void;
  isPortrait?: boolean;
  onIndexChange?: (index: number) => void;
  showNumbering?: boolean;
}

export default function ImageGallery({
  images = [],
  title,
  aspectRatio,
  onDoubleClick,
  isPortrait = true,
  onIndexChange,
  showNumbering = true
}: ImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoplay, setIsAutoplay] = useState(images.length > 1);
  const [loadedImages, setLoadedImages] = useState<Record<number, boolean>>({});
  const [showSwipeIndicator, setShowSwipeIndicator] = useState(false);
  const lastTap = useRef(0);
  const dragStartOffset = useRef(0);
  const delayTimerRef = useRef<any>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);


  // Auto-play logic: runs exactly once
  useEffect(() => {
    if (!isAutoplay || images.length <= 1) return;

    const timer = setTimeout(() => {
      const nextIndex = currentIndex + 1;
      if (nextIndex >= images.length) {
        setIsAutoplay(false); // Stop autoplay permanently
        setCurrentIndex(0); // Wrap back to first slide
        
        // Wait 2 seconds after wrapping to index 0 before showing swipe indicator
        delayTimerRef.current = setTimeout(() => {
          setShowSwipeIndicator(true);
        }, 2000);
      } else {
        setCurrentIndex(nextIndex);
      }
    }, 2000);

    return () => {
      clearTimeout(timer);
    };
  }, [currentIndex, isAutoplay, images.length]);

  // Clean up timers on component unmount
  useEffect(() => {
    return () => {
      if (delayTimerRef.current) {
        clearTimeout(delayTimerRef.current);
      }
    };
  }, []);

  // Swipe indicator duration manager
  useEffect(() => {
    if (showSwipeIndicator) {
      const timer = setTimeout(() => {
        setShowSwipeIndicator(false);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [showSwipeIndicator]);

  useEffect(() => {
    if (onIndexChange) {
      onIndexChange(currentIndex);
    }
  }, [currentIndex, onIndexChange]);

  const stopAutoplay = () => {
    if (isAutoplay) {
      setIsAutoplay(false);
    }
    if (delayTimerRef.current) {
      clearTimeout(delayTimerRef.current);
    }
    setShowSwipeIndicator(false);
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    stopAutoplay();
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    stopAutoplay();
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  const handleDotClick = (index: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    stopAutoplay();
    setCurrentIndex(index);
  };

  const handleDragStart = (e: any, info: any) => {
    stopAutoplay();
    dragStartOffset.current = info.point.x;
  };

  const handleDragEnd = (event: any, info: any) => {
    const swipeThreshold = 40;
    const dragDistance = info.offset.x;

    if (dragDistance < -swipeThreshold) {
      // Swiped Left -> Next Image
      if (currentIndex < images.length - 1) {
        setCurrentIndex(currentIndex + 1);
      }
    } else if (dragDistance > swipeThreshold) {
      // Swiped Right -> Prev Image
      if (currentIndex > 0) {
        setCurrentIndex(currentIndex - 1);
      }
    }
  };

  // Double Click / Double Tap gesture to like
  const handleImageClick = (e: React.MouseEvent) => {
    const now = Date.now();
    const DOUBLE_PRESS_DELAY = 300;
    
    stopAutoplay();

    if (now - lastTap.current < DOUBLE_PRESS_DELAY) {
      if (onDoubleClick) {
        onDoubleClick();
      }
    }
    lastTap.current = now;
  };

  const handleImageLoad = (idx: number, src: string) => {
    setLoadedImages((prev) => ({ ...prev, [idx]: true }));
    markImageLoaded(src);
  };

  // Determine CSS aspect ratio format
  let computedAspectRatio: string | undefined = undefined;
  if (aspectRatio) {
    if (aspectRatio.includes('/')) {
      computedAspectRatio = aspectRatio;
    } else if (aspectRatio.includes(':')) {
      computedAspectRatio = aspectRatio.replace(':', ' / ');
    }
  }

  // Pre-calculate image URLs using optimizeImageUrl
  const optimizedImages = images.map((img) => 
    optimizeImageUrl(img, isPortrait ? 1200 : 1800)
  );

  return (
    <div 
      ref={containerRef}
      className={cn(
        "relative w-full h-full select-none overflow-hidden bg-[#1c182d]/5 dark:bg-black/10 rounded-[inherit]",
        isPortrait ? "md:max-h-[calc(100vh-100px)]" : "max-h-[80vh]"
      )}
      style={computedAspectRatio ? { aspectRatio: computedAspectRatio } : {}}
    >
      {/* Slider Container */}
      <motion.div
        className="flex w-full h-full touch-pan-y"
        animate={
          showSwipeIndicator 
            ? { x: [0, -containerWidth * 0.08, containerWidth * 0.03, 0, 0, -containerWidth * 0.08, containerWidth * 0.03, 0] } 
            : { x: -currentIndex * containerWidth }
        }
        transition={
          showSwipeIndicator
            ? { duration: 3.8, times: [0, 0.15, 0.3, 0.4, 0.6, 0.75, 0.9, 1.0], ease: "easeInOut" }
            : { type: "tween", ease: "easeOut", duration: 0.35 }
        }
        drag="x"
        dragConstraints={{
          left: currentIndex === images.length - 1 
            ? -currentIndex * containerWidth 
            : -(currentIndex + 1) * containerWidth,
          right: currentIndex === 0 
            ? 0 
            : -(currentIndex - 1) * containerWidth
        }}
        dragElastic={{
          left: currentIndex === images.length - 1 ? 0 : 0.2,
          right: currentIndex === 0 ? 0 : 0.2
        }}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        style={{ cursor: "grab" }}
        whileTap={{ cursor: "grabbing" }}
      >

        {optimizedImages.map((src, idx) => {
          const isCached = isImageLoaded(src);
          const isLoaded = loadedImages[idx] || isCached;

          return (
            <div 
              key={idx} 
              className="w-full h-full shrink-0 relative flex items-center justify-center overflow-hidden"
            >
              {/* Shimmer background displayed while loading */}
              {!isLoaded && (
                <div className="absolute inset-0 shimmer-bg w-full h-full" />
              )}
              
              <img
                src={src}
                alt={`${title} - Gallery Image ${idx + 1}`}
                onLoad={() => handleImageLoad(idx, src)}
                onClick={handleImageClick}
                draggable={false}
                className={cn(
                  "w-full h-full object-cover transition-opacity duration-300",
                  isLoaded ? "opacity-100" : "opacity-0",
                  // In portrait split view, allow fitting
                  isPortrait ? "md:object-contain md:max-h-[calc(100vh-100px)]" : "object-cover"
                )}
                loading={idx === 0 ? "eager" : "lazy"}
                decoding="async"
              />
            </div>
          );
        })}
      </motion.div>

      {/* Navigation Arrows (visible on hover on desktop, hidden on mobile) */}
      {images.length > 1 && (
        <AnimatePresence>
          {currentIndex > 0 && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={handlePrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 hidden md:flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/30 text-white shadow-lg backdrop-blur-md transition-all hover:bg-black/50 hover:scale-105 active:scale-95 z-20 group"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-5 w-5 transition-transform group-hover:-translate-x-0.5" />
            </motion.button>
          )}
          {currentIndex < images.length - 1 && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 hidden md:flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/30 text-white shadow-lg backdrop-blur-md transition-all hover:bg-black/50 hover:scale-105 active:scale-95 z-20 group"
              aria-label="Next image"
            >
              <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
            </motion.button>
          )}
        </AnimatePresence>
      )}

      {/* Instagram-style bottom middle pagination indicator */}
      {showNumbering && images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 pill-glass flex h-11 px-5 items-center justify-center rounded-full text-[#171421] dark:text-[#f7f2ff] font-bold text-[13px] tracking-normal select-none pointer-events-none">
          {currentIndex + 1} / {images.length}
        </div>
      )}

      {/* Swipe Indicator for Mobile screens (shown for 3s after autoplay completes) */}
      <AnimatePresence>
        {showSwipeIndicator && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, x: "-50%", y: "-50%" }}
            animate={{ opacity: 1, scale: 1, x: "-50%", y: "-50%" }}
            exit={{ opacity: 0, scale: 0.9, x: "-50%", y: "-50%" }}
            transition={{ duration: 0.3 }}
            className="absolute top-1/2 left-1/2 z-30 bg-white/18 text-white backdrop-blur-2xl border border-white/10 px-4 py-2 rounded-full text-[11px] font-black uppercase tracking-wider shadow-[0_14px_34px_rgba(0,0,0,0.24)] whitespace-nowrap md:hidden pointer-events-none"
          >
            <span>Swipe to explore</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
