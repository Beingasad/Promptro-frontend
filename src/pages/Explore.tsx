import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { Compass } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLocation, useNavigationType } from 'react-router-dom';
import { useCategories } from '../context/CategoryContext';
import { useSearch } from '../context/SearchContext';
import MasonryGrid from '../components/MasonryGrid';
import type { Prompt } from '../components/ImageCard';
import SEOMeta from '../components/common/SEOMeta';
import { GridSkeleton } from '../components/common/Skeleton';
import { optimizeImageUrl } from '../utils/image';
import { preloadImages } from '../utils/imageCache';

const sortOptions = ['All', 'Popular', 'New Updates', 'Trending', 'Most viewed'] as const;
type SortOption = typeof sortOptions[number];

export default function Explore() {
  const { categories: globalCategories } = useCategories();
  const categoryNames = globalCategories.map(c => c.name?.trim()).filter(Boolean);
  const filterCategories = ['All', ...categoryNames];
  const location = useLocation();
  const navigationType = useNavigationType();
  const { searchQuery } = useSearch();
  const selectedCategory = new URLSearchParams(location.search).get('category');
  const selectedFilter = new URLSearchParams(location.search).get('filter') as SortOption | null;

  // Cache prompts in localStorage for instant load and scroll restoration
  const [prompts, setPrompts] = useState<Prompt[]>(() => {
    try {
      const cached = localStorage.getItem('promptro_explore_prompts');
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });

  const [activeCategory, setActiveCategory] = useState(() => {
    const cat = selectedCategory?.trim().toLowerCase();
    if (!cat) return 'All';
    const match = filterCategories.find(c => c.trim().toLowerCase() === cat);
    return match || 'All';
  });
  const [sortBy, setSortBy] = useState<SortOption>(() => (
    selectedFilter && sortOptions.includes(selectedFilter) ? selectedFilter : 'All'
  ));

  const [loading, setLoading] = useState(() => {
    const isInitial = typeof window !== 'undefined' && (window as any).__promptroAppLoaded === false;
    if (isInitial) {
      return true;
    }
    try {
      const cached = localStorage.getItem('promptro_explore_prompts');
      return !cached;
    } catch {
      return true;
    }
  });

  // Save scroll position continuously when user scrolls (to avoid browser back/page-transition zeroing window.scrollY)
  useEffect(() => {
    const handleScroll = () => {
      const currentScroll = window.scrollY || window.pageYOffset || document.documentElement.scrollTop;
      if (currentScroll > 0) {
        sessionStorage.setItem('promptro_explore_scroll_y', currentScroll.toString());
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
        const savedScrollY = sessionStorage.getItem('promptro_explore_scroll_y');
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
      // Clear saved scroll position if it's a new navigation to explore page
      sessionStorage.removeItem('promptro_explore_scroll_y');
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
          localStorage.setItem('promptro_explore_prompts', JSON.stringify(enrichedApiPrompts));
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

    // Auto-refresh every 5 minutes to show new admin updates without thrashing
    const interval = setInterval(fetchPrompts, 300000);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('online', fetchPrompts);
    };
  }, []);

  useEffect(() => {
    const filter = new URLSearchParams(location.search).get('filter') as SortOption | null;
    const category = new URLSearchParams(location.search).get('category')?.trim();
    if (category) {
      const match = filterCategories.find(c => c.trim().toLowerCase() === category.toLowerCase());
      setActiveCategory(match || 'All');
    } else {
      setActiveCategory('All');
    }
    if (filter && sortOptions.includes(filter)) {
      setSortBy(filter);
    } else {
      setSortBy('All');
    }
  }, [location.search, globalCategories]);

  const visiblePrompts = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    const filteredPrompts = prompts.filter((prompt) => {
      const promptCategory = prompt.category?.trim().toLowerCase();
      const activeCat = activeCategory.trim().toLowerCase();
      const matchesCategory = activeCat === 'all' || promptCategory === activeCat;
      
      // Handle "New Updates" specific logic (last 48 hours)
      if (sortBy === 'New Updates') {
        const promptDate = new Date(prompt.created_at);
        const now = new Date();
        const diffInHours = (now.getTime() - promptDate.getTime()) / (1000 * 60 * 60);
        if (diffInHours > 48) return false;
      }

      const tagsString = Array.isArray(prompt.tags) ? prompt.tags.join(' ') : '';
      const promptText = prompt.prompt_text || '';
      const searchableText = `${prompt.title} ${prompt.category} ${prompt.model} ${tagsString} ${promptText}`.toLowerCase();
      const matchesQuery = !normalizedQuery || searchableText.includes(normalizedQuery);
      return matchesCategory && matchesQuery;
    });

    if (sortBy === 'Trending' || sortBy === 'Popular') {
      return [...filteredPrompts].sort((a, b) => (b.likes + b.views) - (a.likes + a.views));
    }

    if (sortBy === 'Most viewed') {
      return [...filteredPrompts].sort((a, b) => b.views - a.views);
    }

    if (sortBy === 'New Updates') {
        return [...filteredPrompts].sort((a, b) => 
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
    }

    return filteredPrompts;
  }, [activeCategory, prompts, searchQuery, sortBy]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="w-full"
    >
      <SEOMeta
        title="Explore Studio - Discover AI Prompts | Promptro"
        description="Explore high-quality AI prompts, cinematic prompts, portrait prompts, and creative templates in the Explore Studio."
        keywords="AI prompts, explore AI prompts, Midjourney prompts, ChatGPT prompts, Promptro"
      />
      <header className="mb-6 md:mb-10 text-left flex flex-col items-start">
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-primary dark:text-[#a78bfa] mb-1"
        >
          <Compass className="h-3.5 w-3.5" />
          PROMPT LIBRARY
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-[#171421] dark:text-white mb-2"
        >
          Explore <span className="text-primary">Studio</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-[#0A0910] dark:text-white text-sm sm:text-base font-semibold max-w-lg"
        >
          Explore high-quality prompts and templates curated by the community.
        </motion.p>
      </header>



      {loading ? (
        <GridSkeleton isHome={false} />
      ) : visiblePrompts.length ? (
        <MasonryGrid prompts={visiblePrompts} isTwoColumns={true} />
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center rounded-[1.25rem] border border-white/70 bg-white/64 dark:bg-[#14111f]/45 dark:border-white/10 shadow-[0_16px_38px_rgba(72,56,118,0.1)]">
          <p className="text-lg font-bold text-[#171421] dark:text-white">No prompts found</p>
          <p className="mt-2 text-sm font-semibold text-[#0A0910] dark:text-white">Try adjusting your filters or search query.</p>
        </div>
      )}
    </motion.div>
  );
}
