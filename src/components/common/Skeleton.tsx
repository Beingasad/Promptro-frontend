import { useLocation } from 'react-router-dom';
import { ArrowLeft, Bookmark, Share2, Heart, Eye, Sparkles, GalleryVerticalEnd, Download } from 'lucide-react';

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

      {/* Category Pill Placeholder on Top Left */}
      <div className={`absolute z-10 h-[24px] md:h-[28px] w-24 md:w-32 rounded-full bg-black/20 dark:bg-white/10 border border-white/20 dark:border-white/5 animate-pulse backdrop-blur-md ${
        isHome ? "top-1.5 left-2 md:top-2 md:left-3" : "hidden md:block md:top-2 md:left-3"
      }`} />

      {/* Badge Placeholder on Top Right */}
      {isHome && (
        <div className="absolute top-1.5 right-2 md:top-2 md:right-3 z-10 h-[24px] w-[24px] md:h-[28px] md:w-[28px] rounded-full bg-black/20 dark:bg-white/10 border border-white/20 dark:border-white/5 animate-pulse backdrop-blur-md" />
      )}

      {/* Bottom Content Area */}
      {isHome ? (
        <div className="absolute bottom-0 left-0 right-0 p-2 md:p-3 pb-2 md:pb-3 flex flex-col gap-2">
          {/* Glassmorphic Overlay Background */}
          <div className="absolute inset-x-2 bottom-2 md:inset-x-3 md:bottom-3 h-[calc(100%-16px)] md:h-[calc(100%-24px)] rounded-[1rem] md:rounded-[1.25rem] bg-black/20 dark:bg-black/40 backdrop-blur-md border border-white/10 pointer-events-none" />
          
          {/* Top Row: Title & Author Placeholder */}
          <div className="relative z-10 px-2 md:px-3 pt-2 md:pt-2.5 flex flex-col gap-1.5">
            <div className="h-4 w-3/4 rounded-md bg-white/20 animate-pulse" />
            <div className="flex items-center gap-1.5">
              <div className="h-4 w-4 md:h-5 md:w-5 rounded-full bg-white/20 animate-pulse" />
              <div className="h-3 w-20 rounded-md bg-white/20 animate-pulse" />
            </div>
          </div>
          
          {/* Bottom Row: Actions Placeholder */}
          <div className="relative z-10 px-2 md:px-3 pb-2 md:pb-2.5 flex items-center justify-between mt-1">
            <div className="flex items-center gap-1.5 md:gap-2">
              <div className="h-6 w-12 md:h-7 md:w-14 rounded-full bg-black/40 animate-pulse" />
              <div className="h-6 w-12 md:h-7 md:w-14 rounded-full bg-black/40 animate-pulse" />
            </div>
            <div className="h-6 w-6 md:h-7 md:w-7 rounded-full bg-white/20 animate-pulse" />
          </div>
        </div>
      ) : (
        <div className="absolute bottom-2 left-2 right-2 md:bottom-3 md:left-3 md:right-3 flex flex-col gap-2">
          <div className="flex items-center justify-around w-full rounded-full bg-black/15 text-white/60 shadow-[0_16px_38px_rgba(0,0,0,0.15)] backdrop-blur-[24px] px-2.5 py-1.5 md:px-4 md:py-3">
            <div className="h-4 w-8 bg-white/15 rounded-md animate-pulse" />
            <div className="h-3.5 w-px bg-white/15" />
            <div className="h-4 w-8 bg-white/15 rounded-md animate-pulse" />
            <div className="h-3.5 w-px bg-white/15" />
            <div className="h-4 w-6 bg-white/15 rounded-md animate-pulse" />
            <div className="h-3.5 w-px bg-white/15" />
            <div className="h-4 w-6 bg-white/15 rounded-md animate-pulse" />
          </div>
        </div>
      )}
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

export function DetailSkeleton({ 
  isPortrait = true, 
  hasMultipleImages = false 
}: { 
  isPortrait?: boolean;
  hasMultipleImages?: boolean;
}) {
  const renderSkeletonOverlays = () => (
    <div className="absolute left-3 right-3 top-3 md:left-4 md:right-4 md:top-4 z-10 flex items-start justify-between">
      <div className="flex flex-col items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-[14px] bg-black/15 text-white/40 backdrop-blur-md md:h-10 md:w-10 md:rounded-[18px]">
          <ArrowLeft className="h-4 w-4 md:h-5 md:w-5" />
        </div>
        <div className="flex h-8 w-8 items-center justify-center rounded-[14px] bg-black/15 text-white/40 backdrop-blur-md md:h-10 md:w-10 md:rounded-[18px]">
          <Download className="h-4 w-4 md:h-5 md:w-5" />
        </div>
        {hasMultipleImages && (
          <div className="flex h-8 w-8 items-center justify-center rounded-[14px] bg-black/15 text-white/20 backdrop-blur-md md:h-10 md:w-10 md:rounded-[18px] font-bold text-[10px] md:text-[12px] select-none">
            -/-
          </div>
        )}
      </div>

      <div className="flex flex-col items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-[14px] bg-black/15 text-white/40 backdrop-blur-md md:h-10 md:w-10 md:rounded-[18px]">
          <Share2 className="h-4 w-4 md:h-5 md:w-5" />
        </div>
        <div className="flex h-8 w-8 items-center justify-center rounded-[14px] bg-black/15 text-white/40 backdrop-blur-md md:h-10 md:w-10 md:rounded-[18px]">
          <Bookmark className="h-4 w-4 md:h-5 md:w-5" />
        </div>
        <div className="flex h-8 w-8 items-center justify-center rounded-[14px] bg-black/15 text-white/40 backdrop-blur-md md:h-10 md:w-10 md:rounded-[18px]">
          <GalleryVerticalEnd className="h-4 w-4 md:h-5 md:w-5" />
        </div>
      </div>
    </div>
  );

  const renderSkeletonBottomRow = () => (
    <>
      <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent pointer-events-none" />
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
    </>
  );

  const renderSkeletonTitleAndPrompt = () => (
    <>
      <div className="px-1 shrink-0">
        <div className="h-8 md:h-10 w-4/5 rounded-lg bg-[#e8e2f0]/60 dark:bg-white/10 animate-pulse" />
        <div className="h-8 md:h-10 w-3/5 rounded-lg bg-[#e8e2f0]/60 dark:bg-white/10 animate-pulse mt-2" />
        <div className="h-4 w-1/3 rounded-md bg-[#e8e2f0]/60 dark:bg-white/10 animate-pulse mt-3.5" />
      </div>
      <div className="flex-grow min-h-0 flex flex-col gap-5 overflow-y-auto hide-scrollbar pb-2">
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
        <div className="shrink-0 flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3 px-1">
            <div className="h-6 w-28 rounded-md bg-[#e8e2f0]/60 dark:bg-white/10" />
            <div className="h-8 w-20 rounded-full bg-[#e8e2f0]/60 dark:bg-white/10" />
          </div>
          <div className="w-full h-24 rounded-[1.5rem] bg-[#e8e2f0]/30 dark:bg-white/5 border border-white/60 dark:border-white/5 shadow-[0_12px_30px_rgba(72,56,118,0.04)] relative overflow-hidden">
            <div className="absolute inset-0 shimmer-bg w-full h-full" />
          </div>
        </div>
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
    </>
  );

  return (
    <div className={`mx-auto flex w-full flex-col ${isPortrait ? 'max-w-[1440px] gap-6 md:gap-10' : 'max-w-4xl gap-5'} mt-2 md:mt-4`}>
      {isPortrait ? (
        <div className="flex flex-col md:flex-row gap-5 md:gap-10 lg:gap-12 md:h-[calc(100vh-100px)] md:min-h-[500px]">
          {/* Left Column: Image Box */}
          <div className="w-full md:w-auto md:max-w-[55%] flex-shrink-0 md:h-full min-h-0 min-w-0 flex items-center justify-center md:justify-start">
            <div className="relative w-full aspect-[3/4] md:w-[360px] lg:w-[420px] md:h-full overflow-hidden rounded-[1.75rem] md:rounded-[2rem] bg-[#e8e2f0]/30 dark:bg-white/5 border border-white/60 dark:border-white/5 shadow-[0_22px_56px_rgba(32,26,54,0.08)]">
              <div className="absolute inset-0 shimmer-bg w-full h-full" />
              {renderSkeletonOverlays()}
              {renderSkeletonBottomRow()}
            </div>
          </div>
          {/* Right Column: Title and Prompt Text Box */}
          <div className="w-full md:flex-1 flex flex-col gap-5 md:h-full min-h-0 min-w-0">
            {renderSkeletonTitleAndPrompt()}
          </div>
        </div>
      ) : (
        <>
          {/* Landscape Image Box */}
          <div className="relative w-full aspect-[16/9] overflow-hidden rounded-[1.75rem] md:rounded-[2rem] bg-[#e8e2f0]/30 dark:bg-white/5 border border-white/60 dark:border-white/5 shadow-[0_22px_56px_rgba(32,26,54,0.08)]">
            <div className="absolute inset-0 shimmer-bg w-full h-full" />
            {renderSkeletonOverlays()}
            {renderSkeletonBottomRow()}
          </div>
          {/* Landscape Details below image */}
          <div className="flex flex-col gap-5 mt-2">
            {renderSkeletonTitleAndPrompt()}
          </div>
        </>
      )}
    </div>
  );
}

export function HomeBannersSkeleton() {
  return (
    <div className="hidden lg:grid grid-cols-2 gap-5 lg:flex-[1.8] min-w-0">
      {Array.from({ length: 2 }).map((_, index) => (
        <div
          key={index}
          className="relative overflow-hidden rounded-[1.75rem] p-7 flex items-center justify-between shadow-[0_20px_45px_rgba(72,56,118,0.06)] bg-[#e8e2f0]/30 dark:bg-white/5 border border-white/60 dark:border-white/5 h-[206px]"
        >
          {/* Shimmer overlay */}
          <div className="absolute inset-0 shimmer-bg w-full h-full" />
          
          {/* Left side text skeleton */}
          <div className="relative z-10 flex flex-col gap-2.5 w-[52%]">
            {/* Tag line placeholder */}
            <div className="h-3.5 w-20 bg-[#c5bad6] dark:bg-white/20 rounded-md animate-pulse mb-1" />
            {/* Title placeholder */}
            <div className="h-6.5 w-44 bg-[#b5a8c9] dark:bg-white/25 rounded-lg animate-pulse" />
            {/* Subtitle placeholder */}
            <div className="h-4 w-full bg-[#c5bad6]/70 dark:bg-white/15 rounded-md animate-pulse" />
            {/* Pill Button placeholder */}
            <div className="h-9.5 w-24 bg-[#c5bad6] dark:bg-white/20 rounded-full animate-pulse mt-3" />
          </div>

          {/* Right side collage skeleton */}
          <div className="relative h-[150px] w-40 shrink-0 flex items-center justify-end">
            {/* Front card skeleton */}
            <div className="relative z-20 h-[150px] w-[102px] rounded-2xl bg-[#c5bad6] dark:bg-white/20 animate-pulse shadow-md" />
            {/* Back card skeleton (rotated) */}
            <div className="absolute z-10 -left-6 top-3 h-[136px] w-[98px] rounded-2xl bg-[#c5bad6]/70 dark:bg-white/10 animate-pulse shadow-sm" style={{ transform: 'rotate(-12deg)' }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function MobileHeroCarouselSkeleton() {
  return (
    <div className="lg:hidden w-full h-[120px] relative mt-0 mb-0 -mx-0.5 scale-[1.02] flex items-center">
      {/* Mimic the hero text slide layout */}
      <div className="flex flex-col w-full">
        {/* Skeleton for "Discover, Copy & Create" subtitle */}
        <div className="h-[18px] w-48 rounded-md bg-[#c4b8d9]/40 animate-pulse" />
        {/* Skeleton for "Trending AI Prompts" heading — with shimmer to mimic gradient */}
        <div className="mt-2 h-10 w-[72%] rounded-lg bg-[#c4b8d9]/50 relative overflow-hidden sm:w-72">
          <div className="absolute inset-0 shimmer-bg" />
        </div>
        {/* Skeleton for description lines */}
        <div className="flex flex-col gap-2 mt-3">
          <div className="h-[14px] w-[90%] max-w-[340px] rounded-md bg-[#c4b8d9]/30 animate-pulse" />
          <div className="h-[14px] w-[70%] max-w-[260px] rounded-md bg-[#c4b8d9]/22 animate-pulse" />
        </div>
      </div>
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
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent flex flex-col justify-end p-4 sm:p-8">
            <div className="h-6 w-2/3 bg-white/20 rounded-md animate-pulse mb-2" />
            <div className="h-4 w-1/3 bg-white/10 rounded-md animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function CollectionsSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 px-0 mt-4">
      {/* Dashed Create Board card skeleton */}
      <div className="relative flex aspect-[4/5] flex-col items-center justify-center rounded-[1.5rem] sm:rounded-[2.5rem] border-2 border-dashed border-[#cfc7dd] dark:border-white/10 bg-[#e8e2f0]/20 dark:bg-white/5 shadow-sm">
        <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-white/15 animate-pulse" />
        <div className="h-4 w-20 bg-white/15 rounded-md animate-pulse mt-4" />
      </div>

      {Array.from({ length: 7 }).map((_, i) => (
        <div
          key={i}
          className="relative block aspect-[4/5] overflow-hidden rounded-[1.5rem] sm:rounded-[2.5rem] bg-[#e8e2f0]/30 dark:bg-white/5 border border-white/60 dark:border-white/5 shadow-md"
        >
          {/* Shimmer background */}
          <div className="absolute inset-0 shimmer-bg w-full h-full" />
          
          {/* Overlay with bottom placeholders */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent flex flex-col justify-end p-4 sm:p-8">
            <div className="h-6 w-2/3 bg-white/20 rounded-md animate-pulse mb-2" />
            <div className="h-4 w-1/3 bg-white/10 rounded-md animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}
