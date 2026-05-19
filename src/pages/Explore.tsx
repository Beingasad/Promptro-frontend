import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { Compass } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { useCategories } from '../context/CategoryContext';
import { useSearch } from '../context/SearchContext';
import MasonryGrid from '../components/MasonryGrid';
import type { Prompt } from '../components/ImageCard';



const sortOptions = ['All', 'Popular', 'New Updates', 'Trending', 'Most viewed'] as const;
type SortOption = typeof sortOptions[number];


export default function Explore() {
  const { categories: globalCategories } = useCategories();
  const categoryNames = globalCategories.map(c => c.name);
  const filterCategories = ['All', ...categoryNames];
  const location = useLocation();
  const { searchQuery } = useSearch();
  const selectedCategory = new URLSearchParams(location.search).get('category');
  const selectedFilter = new URLSearchParams(location.search).get('filter') as SortOption | null;
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [activeCategory, setActiveCategory] = useState(() => (
    selectedCategory && filterCategories.includes(selectedCategory) ? selectedCategory : 'All'
  ));
  const [sortBy, setSortBy] = useState<SortOption>(() => (
    selectedFilter && sortOptions.includes(selectedFilter) ? selectedFilter : 'All'
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
      <section className="mb-2">
        <p className="flex items-center gap-2 text-sm font-medium uppercase text-primary">
          <Compass className="h-4 w-4" />
          Prompt library
        </p>
        <h1 className="mt-1 text-[34px] font-bold leading-none text-[#171421] md:text-5xl">Explore Studio</h1>
      </section>



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
