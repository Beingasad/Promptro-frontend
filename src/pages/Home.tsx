import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation, useNavigationType } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import MasonryGrid from '../components/MasonryGrid';
import { Prompt } from '../components/ImageCard';
import { motion } from 'framer-motion';
import { Flame, ChevronRight, Star } from 'lucide-react';
import { useSearch } from '../context/SearchContext';
import HomeBanners from '../components/HomeBanners';
import MobileHeroCarousel from '../components/MobileHeroCarousel';
import { useCategories } from '../context/CategoryContext';
import SEOMeta from '../components/common/SEOMeta';
import { GridSkeleton } from '../components/common/Skeleton';
import { optimizeImageUrl } from '../utils/image';
import { preloadImages } from '../utils/imageCache';

export default function Home() {
  const navigate = useNavigate();
  const location = useLocation();
  const navigationType = useNavigationType();
  const { searchQuery, setSearchQuery } = useSearch();
  const { categories: globalCategories } = useCategories();
  const categoryNames = globalCategories.map(c => c.name);
  const filterCategories = ['All', ...categoryNames];

  const selectedCategory = new URLSearchParams(location.search).get('category');
  const [activeCategory, setActiveCategory] = useState(() => (
    selectedCategory && filterCategories.includes(selectedCategory) ? selectedCategory : 'All'
  ));
  
  // Cache prompts in localStorage for instant load and scroll restoration
  const [prompts, setPrompts] = useState<Prompt[]>(() => {
    try {
      const cached = localStorage.getItem('promptro_home_prompts');
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });
  const [loading, setLoading] = useState(() => {
    const isInitial = typeof window !== 'undefined' && (window as any).__promptroAppLoaded === false;
    if (isInitial) {
      return true;
    }
    try {
      const cached = localStorage.getItem('promptro_home_prompts');
      return !cached;
    } catch {
      return true;
    }
  });

  // Sync category state from URL query parameter
  useEffect(() => {
    const category = new URLSearchParams(location.search).get('category');
    if (category && filterCategories.includes(category)) {
      setActiveCategory(category);
    } else {
      setActiveCategory('All');
    }
  }, [location.search, globalCategories]);

  useEffect(() => {
    setSearchQuery('');
  }, [setSearchQuery]);

  // Save scroll position continuously when user scrolls (to avoid browser back/page-transition zeroing window.scrollY)
  useEffect(() => {
    const handleScroll = () => {
      const currentScroll = window.scrollY || window.pageYOffset || document.documentElement.scrollTop;
      if (currentScroll > 0) {
        sessionStorage.setItem('promptro_home_scroll_y', currentScroll.toString());
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Restore scroll position when navigation type is POP
  useEffect(() => {
    if (navigationType === 'POP') {
      if (!loading && prompts.length > 0) {
        const savedScrollY = sessionStorage.getItem('promptro_home_scroll_y');
        if (savedScrollY) {
          const scrollY = parseInt(savedScrollY, 10);
          if (!isNaN(scrollY) && scrollY > 0) {
            // Scroll immediately
            window.scrollTo(0, scrollY);
            
            // Re-apply after a short delay to account for React grid rendering / layout calculation
            const timer = setTimeout(() => {
              window.scrollTo(0, scrollY);
            }, 80);
            return () => clearTimeout(timer);
          }
        }
      }
    } else {
      // Clear saved scroll position if it's a new navigation to home page
      sessionStorage.removeItem('promptro_home_scroll_y');
    }
  }, [loading, prompts, navigationType]);

  useEffect(() => {
    const fetchPrompts = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/prompts`, { timeout: 15000 });
        const apiPrompts = Array.isArray(response.data) ? response.data : [];
        const enrichedApiPrompts = apiPrompts.map((prompt: Prompt) => ({
          ...prompt,
          aspectRatio: prompt.aspect_ratio || prompt.aspectRatio,
        }));

        setPrompts(enrichedApiPrompts);

        // Eagerly preload the first 15 thumbnail images
        const thumbUrls = enrichedApiPrompts
          .slice(0, 15)
          .map((p: Prompt) => optimizeImageUrl(p.image_url, 1200))
          .filter(Boolean);
        preloadImages(thumbUrls);

        try {
          localStorage.setItem('promptro_home_prompts', JSON.stringify(enrichedApiPrompts));
        } catch (e) {
          console.warn('localStorage error:', e);
        }
      } catch (error) {
        console.error("Error fetching prompts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPrompts();
    
    // Auto-retry fetching when the network comes online
    window.addEventListener('online', fetchPrompts);
    
    // Auto-refresh every 5 minutes to show new admin uploads without thrashing
    const interval = setInterval(fetchPrompts, 300000);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('online', fetchPrompts);
    };
  }, []);

  const visiblePrompts = prompts.filter((prompt) => {
    const matchesCategory = activeCategory === 'All' || prompt.category === activeCategory;
    const normalizedQuery = searchQuery.trim().toLowerCase();
    const tagsString = Array.isArray(prompt.tags) ? prompt.tags.join(' ') : '';
    const promptText = prompt.prompt_text || '';
    const searchableText = `${prompt.title} ${prompt.category} ${prompt.model} ${tagsString} ${promptText}`.toLowerCase();
    const matchesSearch = !normalizedQuery || searchableText.includes(normalizedQuery);
    return matchesCategory && matchesSearch;
  });

  const editorsPick = useMemo(() => {
    if (prompts.length === 0) return null;
    return [...prompts].sort((a, b) => ((b.saves || 0) + (b.copies || 0)) - ((a.saves || 0) + (a.copies || 0)))[0];
  }, [prompts]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.55 }}
      className="w-full flex flex-col gap-5 md:gap-9"
    >
      <SEOMeta
        title="Promptro | AI Image Prompts Library"
        description="Discover trending AI image prompts, cinematic prompts, creative templates and inspiration on Promptro."
        keywords="AI image prompts, trending AI prompts, Midjourney prompts, DALL-E prompts, cinematic prompts, creative AI templates, Promptro"
        canonical="https://promptro.in"
      />

      <section className="mt-5 px-2 sm:px-4 md:px-6 pt-0 md:mt-[10px] md:pt-2 flex flex-col lg:flex-row lg:items-center lg:gap-8 justify-between relative min-h-0 lg:min-h-0">
        {/* Desktop View (Always visible on lg) */}
        <div className="hidden lg:block lg:max-w-[40%]">
          {loading ? (
            <>
              {/* Skeleton for subtitle */}
              <div className="h-5 w-48 rounded-md bg-[#e8e2f0]/50 animate-pulse md:h-6 md:w-56" />
              {/* Skeleton for main heading */}
              <div className="mt-3 h-11 w-80 rounded-lg bg-gradient-to-r from-[#e8e2f0]/60 to-[#e8e2f0]/30 animate-pulse md:h-14 md:w-96" />
              {/* Skeleton for description line 1 */}
              <div className="mt-5 h-4 w-full max-w-lg rounded-md bg-[#e8e2f0]/40 animate-pulse md:h-5" />
              {/* Skeleton for description line 2 */}
              <div className="mt-2.5 h-4 w-4/5 max-w-lg rounded-md bg-[#e8e2f0]/30 animate-pulse md:h-5" />
            </>
          ) : (
            <>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05, duration: 0.45 }}
                className="text-[15px] font-medium leading-6 text-[#6f6684] md:text-lg"
              >
                Discover, Copy & Create
              </motion.p>
              <motion.h1
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.12, duration: 0.55 }}
                className="mt-2 max-w-5xl whitespace-nowrap text-[8.5vw] sm:text-[44px] md:text-5xl font-bold leading-tight tracking-normal"
              >
                <span className="bg-gradient-to-r from-[#7437ff] via-[#dd4bd2] to-[#ff642d] bg-clip-text text-transparent drop-shadow-[0_18px_34px_rgba(109,77,236,0.12)]">
                  Trending AI Prompts
                </span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.18, duration: 0.55 }}
                className="mt-3 max-w-lg text-[16px] font-medium leading-[1.62] text-[#6f6684] md:mt-5 md:text-lg md:leading-8"
              >
                Explore thousands of cinematic, aesthetic and creative AI prompts to create stunning images instantly.
              </motion.p>
            </>
          )}
        </div>

        {/* Mobile Unified Carousel */}
        <MobileHeroCarousel prompts={prompts} promptsLoading={loading} />

        <HomeBanners prompts={prompts} promptsLoading={loading} />
      </section>

      <div className="w-full">
        {loading ? (
          <>
            {/* Skeleton for Trending Now header */}
            <div className="mb-3 flex items-center justify-between gap-3 px-0 sm:px-2">
              <div className="flex min-w-0 items-center gap-2 md:gap-3">
                <div className="w-[clamp(22px,6.2vw,28px)] h-[clamp(22px,6.2vw,28px)] md:w-8 md:h-8 bg-[#e8e2f0]/40 animate-pulse rounded-md shrink-0" />
                <div className="h-7 w-40 rounded-lg bg-[#e8e2f0]/50 animate-pulse md:h-8 md:w-48" />
              </div>
              <div className="h-8 w-20 rounded-full bg-[#e8e2f0]/40 animate-pulse md:w-24" />
            </div>
            <GridSkeleton isHome={true} />
          </>
        ) : (
          <>
            {editorsPick && !searchQuery && activeCategory === 'All' && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => navigate(`/prompt/${editorsPick.id}`)}
                className="cursor-pointer mb-8 group relative flex flex-col md:flex-row w-full items-center justify-between p-6 md:p-10 rounded-[2rem] overflow-hidden shadow-[0_20px_45px_rgba(72,56,118,0.08)] backdrop-blur-2xl transition-all hover:shadow-2xl hover:shadow-primary/15 bg-gradient-to-br from-[#1c1a26] to-[#12101b] border border-[#70639d]/22 dark:border-black/40"
              >
                {/* Background image with overlay */}
                <div className="absolute inset-0 z-0 opacity-30">
                  <img src={editorsPick.image_url || undefined} alt="" className="w-full h-full object-cover blur-md scale-110" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-[#1c1a26] via-[#1c1a26]/90 to-[#1c1a26]/40" />
                </div>
                
                <div className="relative z-10 flex flex-col gap-3 max-w-xl w-full">
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-[#ffd700] fill-[#ffd700]" />
                    <span className="text-[12px] font-black uppercase tracking-[0.18em] text-[#ffd700] block">
                      Editor's Pick
                    </span>
                  </div>
                  <h3 className="text-[28px] md:text-[36px] font-[900] text-white leading-[1.2] tracking-tight group-hover:text-primary transition-colors duration-300">
                    {editorsPick.title}
                  </h3>
                  <p className="text-[14px] md:text-[16px] font-medium text-white/70 line-clamp-2 md:line-clamp-3 leading-relaxed">
                    {editorsPick.prompt_text}
                  </p>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/prompt/${editorsPick.id}`);
                    }}
                    className="mt-4 flex items-center gap-2 text-[13px] md:text-[14px] font-black text-[#1c1a26] bg-white px-6 py-3 rounded-full w-fit hover:scale-[1.03] transition-transform duration-300 hover:shadow-[0_8px_20px_rgba(255,255,255,0.3)] active:scale-95"
                  >
                    View Prompt
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="relative z-10 mt-8 md:mt-0 md:ml-8 shrink-0 self-center md:self-auto w-full md:w-auto flex justify-center">
                  <div className="w-[180px] md:w-[220px] aspect-[4/5] rounded-2xl overflow-hidden border-4 border-white/10 shadow-[0_16px_36px_rgba(0,0,0,0.5)] transform rotate-3 group-hover:rotate-6 group-hover:scale-105 transition-all duration-500">
                    <img src={editorsPick.image_url || undefined} alt={editorsPick.title} className="w-full h-full object-cover transform scale-105 group-hover:scale-110 transition-transform duration-700" loading="lazy" />
                  </div>
                </div>
              </motion.div>
            )}

            <div className="mb-3 flex items-center justify-between gap-3 px-0 sm:px-2">
              <div className="flex w-[calc((100%-0.625rem)/2)] min-w-0 items-center gap-2 text-[#171421] md:gap-3 lg:w-[calc((100%-1.75rem)/3)]">
                <Flame className="w-[clamp(22px,6.2vw,28px)] h-[clamp(22px,6.2vw,28px)] md:w-8 md:h-8 text-[#ff6a3d] shrink-0" fill="currentColor" />
                <h2 className="whitespace-nowrap text-[clamp(22px,6.2vw,28px)] font-bold leading-none md:text-[32px]">
                  {searchQuery ? 'Search Results' : 'Trending Now'}
                </h2>
              </div>
              <button 
                onClick={() => navigate('/explore')}
                className="flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full px-2 py-2 text-sm font-medium text-primary transition-colors hover:bg-white/70 md:px-3 md:text-base"
              >
                View all
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
            {visiblePrompts.length > 0 ? (
              <MasonryGrid prompts={visiblePrompts} />
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <p className="text-lg font-bold text-[#171421]">
                  {searchQuery ? `No prompts found for "${searchQuery}"` : "No prompts found yet"}
                </p>
                <p className="mt-2 text-sm text-[#6f6684]">
                  {searchQuery ? "Try searching for something else or browse categories." : "Check back later for new content!"}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
}

