import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { Compass, Search, SlidersHorizontal, ArrowUpRight, TrendingUp, Sparkles, Filter, Flame } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { useCategories } from '../context/CategoryContext';
import { useSearch } from '../context/SearchContext';
import MasonryGrid from '../components/MasonryGrid';
import type { Prompt } from '../components/ImageCard';



const sortOptions = ['Popular', 'New Updates', 'Trending', 'Most viewed'] as const;
type SortOption = typeof sortOptions[number];


export default function Explore() {
  const { categories: globalCategories } = useCategories();
  const categoryNames = globalCategories.map(c => c.name);
  const filterCategories = ['All', ...categoryNames];
  const location = useLocation();
  const { searchQuery, setSearchQuery } = useSearch();
  const selectedCategory = new URLSearchParams(location.search).get('category');
  const selectedFilter = new URLSearchParams(location.search).get('filter') as SortOption | null;
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [activeCategory, setActiveCategory] = useState(() => (
    selectedCategory && filterCategories.includes(selectedCategory) ? selectedCategory : 'All'
  ));
  const [sortBy, setSortBy] = useState<SortOption>(() => (
    selectedFilter && sortOptions.includes(selectedFilter) ? selectedFilter : 'Popular'
  ));
  const [loading, setLoading] = useState(true);

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
      } catch (error) {
        console.error("Error fetching prompts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPrompts();
    
    // Auto-refresh every 30 seconds to show new admin updates automatically
    const interval = setInterval(fetchPrompts, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const filter = new URLSearchParams(location.search).get('filter') as SortOption | null;
    const category = new URLSearchParams(location.search).get('category');
    if (category && filterCategories.includes(category)) {
      setActiveCategory(category);
    } 
    if (filter && sortOptions.includes(filter)) {
      setSortBy(filter);
    }
  }, [location.search, globalCategories]);

  const visiblePrompts = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    const filteredPrompts = prompts.filter((prompt) => {
      const matchesCategory = activeCategory === 'All' || prompt.category === activeCategory;
      
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
      <section className="mb-2 flex items-end justify-between gap-4">
        <div>
          <p className="flex items-center gap-2 text-sm font-medium uppercase text-primary">
            <Compass className="h-4 w-4" />
            Prompt library
          </p>
          <h1 className="mt-1 text-[34px] font-bold leading-none text-[#171421] md:text-5xl">Explore Studio</h1>
        </div>
        <div className="hidden items-center gap-2 rounded-full bg-white/72 px-3 py-2 text-sm font-bold text-[#ff6a3d] shadow-[0_14px_32px_rgba(72,56,118,0.1)] sm:flex">
          <Flame className="h-4 w-4" fill="currentColor" />
          Trending
        </div>
      </section>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar py-1">
          <span className="flex h-8 w-8 md:h-9 md:w-9 shrink-0 items-center justify-center rounded-full bg-white/72 text-primary shadow-[0_10px_22px_rgba(72,56,118,0.08)] dark:bg-[#1c1a26]/80 dark:border-white/10">
            <SlidersHorizontal className="h-4 w-4 md:h-4.5 md:w-4.5" />
          </span>
          {sortOptions.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setSortBy(option)}
              className={`h-8 md:h-9 shrink-0 rounded-full px-3.5 md:px-4.5 text-[11px] md:text-[12px] font-extrabold transition-all duration-300 ${
                sortBy === option
                  ? 'bg-gradient-to-r from-primary to-[#ff6a3d] text-white border-transparent shadow-none scale-[1.03]'
                  : 'bg-white/84 text-[#4a3e63] border border-[#dcd5ed] hover:bg-white hover:border-primary/50 dark:bg-[#1a1726]/70 dark:border-white/12 dark:text-white/85 dark:hover:bg-[#1a1726]/90 dark:hover:border-primary/50'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div className="-mx-4 mb-5 overflow-x-auto px-4 py-1.5 hide-scrollbar sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div className="flex min-w-max gap-2">
          {filterCategories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setActiveCategory(category)}
              className={`rounded-full border px-3.5 py-1 md:px-4.5 md:py-1.5 text-[11px] md:text-[12px] font-extrabold transition-all duration-300 ${
                activeCategory === category
                  ? 'bg-gradient-to-r from-primary to-[#ff6a3d] text-white border-transparent shadow-none scale-[1.03]'
                  : 'bg-white/84 text-[#4a3e63] border border-[#dcd5ed] hover:bg-white hover:border-primary/50 dark:bg-[#1a1726]/70 dark:border-white/12 dark:text-white/85 dark:hover:bg-[#1a1726]/90 dark:hover:border-primary/50'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-11 w-11 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : visiblePrompts.length ? (
        <MasonryGrid prompts={visiblePrompts} isTwoColumns={true} />
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center rounded-[1.25rem] border border-white/70 bg-white/64 shadow-[0_16px_38px_rgba(72,56,118,0.1)]">
          <p className="text-lg font-bold text-[#171421]">No prompts found</p>
          <p className="mt-2 text-sm text-[#6f6684]">Try adjusting your filters or search query.</p>
        </div>
      )}
    </motion.div>
  );
}
