import { useState, useEffect } from 'react';
import { useNavigate, useLocation, useNavigationType } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import MasonryGrid from '../components/MasonryGrid';
import { Prompt } from '../components/ImageCard';
import { motion } from 'framer-motion';
import { Flame, ChevronRight } from 'lucide-react';
import { useSearch } from '../context/SearchContext';
import HomeBanners from '../components/HomeBanners';
import MobileHeroCarousel from '../components/MobileHeroCarousel';
import { useCategories } from '../context/CategoryContext';
import SEOMeta from '../components/common/SEOMeta';

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
  
  // Cache prompts in sessionStorage for instant load and scroll restoration
  const [prompts, setPrompts] = useState<Prompt[]>(() => {
    try {
      const cached = sessionStorage.getItem('promptro_home_prompts');
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });
  const [loading, setLoading] = useState(() => {
    try {
      const cached = sessionStorage.getItem('promptro_home_prompts');
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
        const response = await axios.get(`${API_BASE_URL}/api/prompts?t=${Date.now()}`, { timeout: 15000 });
        const apiPrompts = Array.isArray(response.data) ? response.data : [];
        const enrichedApiPrompts = apiPrompts.map((prompt: Prompt) => ({
          ...prompt,
          aspectRatio: prompt.aspect_ratio || prompt.aspectRatio,
        }));

        setPrompts(enrichedApiPrompts);
        try {
          sessionStorage.setItem('promptro_home_prompts', JSON.stringify(enrichedApiPrompts));
        } catch (e) {
          console.warn('sessionStorage error:', e);
        }
      } catch (error) {
        console.error("Error fetching prompts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPrompts();
    
    // Auto-refresh every 30 seconds to show new admin uploads automatically
    const interval = setInterval(fetchPrompts, 30000);
    return () => clearInterval(interval);
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

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full flex flex-col gap-4 md:gap-9"
    >
      <SEOMeta
        title="Promptro | AI Image Prompts Library"
        description="Discover trending AI image prompts, cinematic prompts, creative templates and inspiration on Promptro."
        keywords="AI image prompts, trending AI prompts, Midjourney prompts, DALL-E prompts, cinematic prompts, creative AI templates, Promptro"
        canonical="https://promptro.in"
      />

      <section className="mt-3 px-2 sm:px-4 md:px-6 pt-1 md:mt-2 md:pt-2 flex flex-col lg:flex-row lg:items-center lg:gap-8 justify-between relative min-h-[140px] sm:min-h-[160px] lg:min-h-0">
        {/* Desktop View (Always visible on lg) */}
        <div className="hidden lg:block lg:max-w-[40%]">
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
        </div>

        {/* Mobile Unified Carousel */}
        <MobileHeroCarousel />

        <HomeBanners />
      </section>

      <div className="w-full">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            <div className="mb-3 flex items-center justify-between gap-3 px-0 sm:px-2">
              <div className="flex w-[calc((100%-0.625rem)/2)] min-w-0 items-center gap-2 text-[#171421] md:gap-3 lg:w-[calc((100%-1.75rem)/3)]">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/82 shadow-[0_14px_34px_rgba(255,106,61,0.18)] md:h-11 md:w-11">
                  <Flame className="h-5 w-5 text-[#ff6a3d] md:h-6 md:w-6" fill="currentColor" />
                </div>
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

