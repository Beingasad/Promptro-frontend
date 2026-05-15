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
        const response = await axios.get(`${API_BASE_URL}/api/prompts?t=${Date.now()}`, { timeout: 900 });
        const apiPrompts = Array.isArray(response.data) ? response.data : [];
        const enrichedApiPrompts = apiPrompts.map((prompt: Prompt) => ({
          ...prompt,
          aspectRatio: prompt.aspect_ratio || prompt.aspectRatio,
        }));

        setPrompts(enrichedApiPrompts);
      } catch {
        setPrompts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPrompts();
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
      <section className="mb-5 flex items-end justify-between gap-4">
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
        <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar pb-1">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/72 text-primary shadow-[0_12px_28px_rgba(72,56,118,0.1)] dark:bg-[#1c1a26]/80 dark:border-white/10">
            <SlidersHorizontal className="h-5 w-5" />
          </span>
          {sortOptions.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setSortBy(option)}
              className={`h-11 shrink-0 rounded-full px-5 text-[13px] font-bold transition-all ${
                sortBy === option
                  ? 'bg-primary text-white shadow-[0_14px_30px_rgba(139,92,246,0.24)]'
                  : 'bg-white/64 text-[#5f5774] border border-white/70 hover:bg-white dark:bg-[#1c1a26]/40 dark:border-white/10 dark:text-white/70'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div className="-mx-4 mb-5 overflow-x-auto px-4 hide-scrollbar sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div className="flex min-w-max gap-2">
          {filterCategories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setActiveCategory(category)}
              className={`rounded-full border px-4 py-2 text-sm font-bold transition-all ${
                activeCategory === category
                  ? 'border-primary bg-primary text-white shadow-[0_14px_30px_rgba(139,92,246,0.24)]'
                  : 'border-white/70 bg-white/64 text-[#5f5774] hover:bg-white dark:bg-[#1c1a26]/40 dark:border-white/10 dark:text-white/70'
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
        <MasonryGrid prompts={visiblePrompts} />
      ) : (
        <div className="rounded-[1.25rem] border border-white/70 bg-white/64 p-5 text-sm font-medium text-[#6f6684] shadow-[0_16px_38px_rgba(72,56,118,0.1)]">
          No prompts found in this category.
        </div>
      )}
    </motion.div>
  );
}
