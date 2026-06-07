import { useLocation } from 'react-router-dom';
import { ArrowLeft, Bookmark, Share2, Heart, Eye, Sparkles, GalleryVerticalEnd } from 'lucide-react';

interface CardSkeletonProps {
  isHome?: boolean;
  aspectRatioClass?: string;
}

export function CardSkeleton({ isHome: propIsHome, aspectRatioClass }: CardSkeletonProps) {
  const location = useLocation();
  const isHome = propIsHome !== undefined ? propIsHome : location.pathname === '/';
  
  // Default to a portrait-ish aspect ratio if not specified
  const finalAspectClass = aspectRatioClass || 'aspect-[3/4]';

  return (
    <div 
      className={`relative block w-full rounded-[1.35rem] md:rounded-[1.75rem] overflow-hidden group mb-2.5 md:mb-3.5 bg-[#e8e2f0]/30 dark:bg-white/5 border border-white/60 dark:border-white/5 shadow-[0_18px_42px_rgba(32,26,54,0.08)] ${finalAspectClass}`}
    >
      {/* Shimmer Background */}
      <div className="absolute inset-0 shimmer-bg w-full h-full" />

      {/* Shadow overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent pointer-events-none" />

      {/* Floating Save & Collection Buttons (Only for Home layout) */}
      {isHome && (
        <div className="absolute top-3 right-3 flex gap-1.5">
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl md:rounded-2xl bg-black/10 backdrop-blur-md flex items-center justify-center text-white/30">
            <GalleryVerticalEnd className="w-4 h-4 md:w-5 md:h-5 opacity-30" />
          </div>
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl md:rounded-2xl bg-black/10 backdrop-blur-md flex items-center justify-center text-white/30">
            <Bookmark className="w-4 h-4 md:w-5 md:h-5 opacity-30" />
          </div>
        </div>
      )}

      {/* Bottom Content Area */}
      <div className="absolute bottom-2 left-2 right-2 md:bottom-3 md:left-3 md:right-3 flex flex-col gap-2">
        {/* Title Placeholder (Only for Home layout) */}
        {isHome && (
          <div className="h-4 w-3/5 rounded-md bg-white/20 backdrop-blur-sm ml-1 px-1.5 animate-pulse" />
        )}

        {isHome ? (
          /* HOME CARDS LAYOUT */
          <div className="flex min-h-10 items-center justify-between w-full rounded-[1.2rem] bg-black/15 px-2 py-2 text-white/60 shadow-[0_16px_38px_rgba(0,0,0,0.15)] backdrop-blur-[24px] md:min-h-12 md:rounded-[1.35rem] md:px-4 md:py-2.5">
            {/* Category badge skeleton */}
            <div className="h-5 w-16 md:h-6 md:w-20 rounded-full bg-white/15 animate-pulse" />
            
            {/* Likes and Views Skeleton */}
            <div className="flex items-center gap-2 md:gap-3.5 pr-1 md:pr-1.5">
              <div className="h-4 w-10 bg-white/15 rounded-md animate-pulse" />
              <div className="h-3.5 w-px bg-white/15" />
              <div className="h-4 w-10 bg-white/15 rounded-md animate-pulse" />
            </div>
          </div>
        ) : (
          /* MINIMAL EXPLORE / SAVED LAYOUT */
          <div className="flex items-center justify-around w-full rounded-full bg-black/15 px-2.5 py-1.5 text-white/60 shadow-[0_16px_38px_rgba(0,0,0,0.15)] backdrop-blur-[24px] md:min-h-12 md:px-4 md:py-2.5">
            <div className="h-4 w-8 bg-white/15 rounded-md animate-pulse" />
            <div className="h-3 w-px bg-white/15" />
            <div className="h-4 w-8 bg-white/15 rounded-md animate-pulse" />
            <div className="h-3 w-px bg-white/15" />
            <div className="h-4 w-6 bg-white/15 rounded-md animate-pulse" />
          </div>
        )}
      </div>
    </div>
  );
}

interface GridSkeletonProps {
  isHome?: boolean;
  count?: number;
}

export function GridSkeleton({ isHome, count = 12 }: GridSkeletonProps) {
  // Predefined aspect ratios to simulate a realistic masonry layout
  const mockAspectRatios = [
    'aspect-[4/5]',
    'aspect-[3/4]',
    'aspect-[1/1]',
    'aspect-[16/9]',
    'aspect-[3/4]',
    'aspect-[4/5]',
    'aspect-[1/1]',
    'aspect-[16/9]',
    'aspect-[4/5]',
    'aspect-[3/4]',
    'aspect-[1/1]',
    'aspect-[16/9]',
  ];

  const gridColumns = isHome 
    ? 'columns-1 sm:columns-2 md:columns-4' 
    : 'columns-2 md:columns-4';

  return (
    <div className={`w-full gap-2.5 md:gap-3.5 space-y-2.5 md:space-y-3.5 ${gridColumns}`}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="break-inside-avoid">
          <CardSkeleton 
            isHome={isHome} 
            aspectRatioClass={mockAspectRatios[index % mockAspectRatios.length]} 
          />
        </div>
      ))}
    </div>
  );
}

export function DetailSkeleton() {
  return (
    <div className="mx-auto flex w-full flex-col max-w-[1440px] gap-6 md:gap-10 mt-2 md:mt-4">
      {/* Layout mimics isPortrait split layout */}
      <div className="flex flex-col md:flex-row gap-5 md:gap-10 lg:gap-12 md:h-[calc(100vh-100px)] md:min-h-[500px]">
        {/* Left Column: Image Box */}
        <div className="w-full md:w-auto md:max-w-[55%] flex-shrink-0 md:h-full min-h-0 min-w-0 flex items-center justify-center md:justify-start">
          <div className="relative w-full aspect-[3/4] md:w-[360px] lg:w-[420px] md:h-full overflow-hidden rounded-[1.75rem] md:rounded-[2rem] bg-[#e8e2f0]/30 dark:bg-white/5 border border-white/60 dark:border-white/5 shadow-[0_22px_56px_rgba(32,26,54,0.08)]">
            {/* Large Image Area Shimmer */}
            <div className="absolute inset-0 shimmer-bg w-full h-full" />
            
            {/* Header Overlays */}
            <div className="absolute left-3 right-3 top-3 md:left-4 md:right-4 md:top-4 z-10 flex items-center justify-between">
              <div className="flex h-8 w-8 items-center justify-center rounded-[14px] bg-black/15 text-white/40 backdrop-blur-md md:h-10 md:w-10 md:rounded-[18px]">
                <ArrowLeft className="h-4 w-4 md:h-5 md:w-5" />
              </div>
              <div className="flex items-center gap-1.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-[14px] bg-black/15 text-white/40 backdrop-blur-md md:h-10 md:w-10 md:rounded-[18px]">
                  <Share2 className="h-4 w-4 md:h-5 md:w-5" />
                </div>
                <div className="flex h-8 w-8 items-center justify-center rounded-[14px] bg-black/15 text-white/40 backdrop-blur-md md:h-10 md:w-10 md:rounded-[18px]">
                  <Bookmark className="h-4 w-4 md:h-5 md:w-5" />
                </div>
              </div>
            </div>

            {/* Bottom Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent pointer-events-none" />

            {/* Bottom Info Row */}
            <div className="absolute bottom-3 left-3 right-3 md:bottom-4 md:left-4 md:right-4 flex flex-wrap items-center justify-between gap-2">
              <div className="flex h-8 items-center gap-3 rounded-full bg-white/15 px-3 text-white shadow-[0_14px_34px_rgba(0,0,0,0.15)] backdrop-blur-xl md:h-10">
                <div className="flex items-center gap-1 text-xs md:text-sm font-bold text-white/60">
                  <Heart className="h-4 w-4 md:h-5 md:w-5" />
                  <div className="h-3 w-6 bg-white/20 rounded-md animate-pulse ml-1" />
                </div>
                <span className="h-3 md:h-3.5 w-px bg-white/20" />
                <div className="flex items-center gap-1 text-xs md:text-sm font-bold text-white/60">
                  <Eye className="h-4 w-4 md:h-5 md:w-5" />
                  <div className="h-3 w-6 bg-white/20 rounded-md animate-pulse ml-1" />
                </div>
              </div>
              <div className="h-8 w-24 rounded-full bg-white/20 backdrop-blur-xl md:h-10 animate-pulse" />
            </div>
          </div>
        </div>

        {/* Right Column: Title and Prompt Text Box */}
        <div className="w-full md:flex-1 flex flex-col gap-5 md:h-full min-h-0 min-w-0">
          <div className="px-1 shrink-0">
            {/* Title Line 1 & 2 */}
            <div className="h-8 md:h-10 w-4/5 rounded-lg bg-[#e8e2f0]/60 dark:bg-white/10 animate-pulse" />
            <div className="h-8 md:h-10 w-3/5 rounded-lg bg-[#e8e2f0]/60 dark:bg-white/10 animate-pulse mt-2" />
            
            {/* Meta Model Tag */}
            <div className="h-4 w-1/3 rounded-md bg-[#e8e2f0]/60 dark:bg-white/10 animate-pulse mt-3.5" />
          </div>

          <div className="flex-1 min-h-0 flex flex-col gap-5 overflow-y-auto hide-scrollbar pb-2">
            {/* Prompt Section */}
            <div className="shrink-0 flex flex-col gap-3">
              <div className="flex items-center justify-between gap-3 px-1">
                <div className="flex items-center gap-3 text-[#3a344c] dark:text-[#e4dcf5] opacity-50">
                  <Sparkles className="h-6 w-6" />
                  <div className="h-5 w-20 rounded-md bg-[#e8e2f0]/60 dark:bg-white/10" />
                </div>
                <div className="h-8 w-20 rounded-full bg-[#e8e2f0]/60 dark:bg-white/10" />
              </div>
              <div className="w-full h-36 rounded-[1.5rem] bg-[#e8e2f0]/30 dark:bg-white/5 border border-white/60 dark:border-white/5 shadow-[0_12px_30px_rgba(72,56,118,0.04)] relative overflow-hidden">
                <div className="absolute inset-0 shimmer-bg w-full h-full" />
              </div>
            </div>

            {/* Negative Prompt Section */}
            <div className="shrink-0 flex flex-col gap-3">
              <div className="flex items-center justify-between gap-3 px-1">
                <div className="h-6 w-28 rounded-md bg-[#e8e2f0]/60 dark:bg-white/10" />
                <div className="h-8 w-20 rounded-full bg-[#e8e2f0]/60 dark:bg-white/10" />
              </div>
              <div className="w-full h-24 rounded-[1.5rem] bg-[#e8e2f0]/30 dark:bg-white/5 border border-white/60 dark:border-white/5 shadow-[0_12px_30px_rgba(72,56,118,0.04)] relative overflow-hidden">
                <div className="absolute inset-0 shimmer-bg w-full h-full" />
              </div>
            </div>

            {/* Tags section */}
            <div className="shrink-0 flex flex-col gap-2.5 mt-2">
              <div className="h-4.5 w-16 bg-[#e8e2f0]/60 dark:bg-white/10 rounded-md animate-pulse px-1" />
              <div className="flex flex-wrap gap-2 px-1 mt-1">
                <div className="h-5 w-16 rounded-full bg-[#e8e2f0]/50 dark:bg-white/10 animate-pulse" />
                <div className="h-5 w-12 rounded-full bg-[#e8e2f0]/50 dark:bg-white/10 animate-pulse" />
                <div className="h-5 w-20 rounded-full bg-[#e8e2f0]/50 dark:bg-white/10 animate-pulse" />
                <div className="h-5 w-14 rounded-full bg-[#e8e2f0]/50 dark:bg-white/10 animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function HomeBannersSkeleton() {
  return (
    <div className="hidden lg:grid grid-cols-2 gap-4 lg:flex-[1.8] min-w-0">
      {Array.from({ length: 2 }).map((_, index) => (
        <div
          key={index}
          className="relative overflow-hidden rounded-[2.5rem] p-7 flex items-center justify-between shadow-[0_20px_45px_rgba(72,56,118,0.06)] bg-[#e8e2f0]/30 dark:bg-white/5 border border-white/60 dark:border-white/5 h-[178px]"
        >
          {/* Shimmer overlay */}
          <div className="absolute inset-0 shimmer-bg w-full h-full" />
          
          {/* Left side text skeleton */}
          <div className="relative z-10 flex flex-col gap-2.5 w-[52%]">
            {/* Tag pill */}
            <div className="h-6 w-24 bg-white/20 rounded-full animate-pulse" />
            {/* Title */}
            <div className="h-6 w-40 bg-white/20 rounded-md animate-pulse mt-1" />
            {/* Subtitle */}
            <div className="h-4 w-full bg-white/10 rounded-md animate-pulse" />
            {/* Button */}
            <div className="h-4 w-20 bg-white/25 rounded-md animate-pulse mt-2" />
          </div>

          {/* Right side collage skeleton */}
          <div className="relative h-32 w-36 shrink-0 flex items-center justify-end">
            <div className="relative z-20 h-32 w-22 rounded-2xl bg-white/15 animate-pulse shadow-md" />
            <div className="absolute z-10 -left-8 top-6 h-28 w-20 rounded-2xl bg-white/10 animate-pulse shadow-sm" style={{ transform: 'rotate(-12deg)' }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function MobileHeroCarouselSkeleton() {
  return (
    <div className="lg:hidden w-full h-[120px] relative mt-2 mb-1 -mx-0.5 scale-[1.02] rounded-2xl bg-[#e8e2f0]/30 dark:bg-white/5 border border-white/60 dark:border-white/5 shadow-[0_15px_35px_rgba(72,56,118,0.06)] overflow-hidden flex items-center justify-between p-5">
      {/* Shimmer background */}
      <div className="absolute inset-0 shimmer-bg w-full h-full" />
      
      {/* Left side text skeleton */}
      <div className="flex-1 min-w-0 pr-4 relative z-10 flex flex-col gap-1.5">
        <div className="h-4 w-20 bg-white/20 rounded-full animate-pulse" />
        <div className="h-5 w-32 bg-white/20 rounded-md animate-pulse" />
        <div className="h-4 w-44 bg-white/10 rounded-md animate-pulse" />
      </div>

      {/* Right side image placeholder skeleton */}
      <div className="w-16 h-24 rounded-2xl bg-white/15 animate-pulse shadow-md shrink-0 relative z-10" />
    </div>
  );
}

export function CategoriesSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 px-0 mt-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="relative block aspect-[4/5] overflow-hidden rounded-[1.5rem] sm:rounded-[2.5rem] bg-[#e8e2f0]/30 dark:bg-white/5 border border-white/60 dark:border-white/5 shadow-md"
        >
          {/* Shimmer background */}
          <div className="absolute inset-0 shimmer-bg w-full h-full" />
          
          {/* Overlay with bottom placeholders */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex flex-col justify-end p-4 sm:p-8">
            <div className="h-6 w-2/3 bg-white/20 rounded-md animate-pulse mb-2" />
            <div className="h-4 w-1/3 bg-white/10 rounded-md animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}
