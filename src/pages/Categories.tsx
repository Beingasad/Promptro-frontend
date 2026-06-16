import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Grid, LayoutGrid } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { useCategories } from '../context/CategoryContext';
import SEOMeta from '../components/common/SEOMeta';
import { CategoriesSkeleton } from '../components/common/Skeleton';

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=900&auto=format&fit=crop';

export default function Categories() {
  const { categories } = useCategories();
  const [prompts, setPrompts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchPrompts = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/prompts`);
        if (isMounted) {
          setPrompts(Array.isArray(response.data) ? response.data : []);
        }
      } catch (err) {
        console.error('Failed to fetch prompts for categories page', err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    fetchPrompts();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen pb-32 sm:pb-20 px-4 sm:px-6">
      <SEOMeta
        title="Prompt Categories - Browse AI Prompts | Promptro"
        description="Browse thousands of AI image prompts categorized by style, including cinematic, 3D CGI, portrait, nature, and more."
        keywords="AI prompt categories, prompt styles, Midjourney styles, ChatGPT templates, cinematic prompts, Promptro"
      />
      <div className="max-w-7xl mx-auto">
        <header className="mb-6 md:mb-10 text-left flex flex-col items-start">
          <motion.span
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-primary dark:text-[#a78bfa] mb-1"
          >
            <LayoutGrid className="h-3.5 w-3.5" />
            PROMPT CATEGORIES
          </motion.span>
          <motion.h1 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-[#171421] dark:text-white mb-2"
          >
            Explore <span className="text-primary">Categories</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-[#756d8d] dark:text-[#afa6c8] text-sm sm:text-base font-medium max-w-lg"
          >
            Browse high-quality prompts curated by the community.
          </motion.p>
        </header>

        {loading || categories.length === 0 ? (
          <CategoriesSkeleton />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 px-0">
            {categories.map((cat, i) => {
              const latestPrompt = prompts.find(p => p.category === cat.name);
              const coverImage = latestPrompt ? latestPrompt.image_url : (cat.image_url || DEFAULT_IMAGE);

              return (
                <motion.div
                  key={cat.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link 
                    to={`/explore?category=${cat.name}`}
                    className="group relative block aspect-[4/5] overflow-hidden rounded-[1.5rem] sm:rounded-[2.5rem] bg-[#f8f7fc] dark:bg-white/5"
                  >
                    <img 
                      src={coverImage} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-4 sm:p-8">
                       <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-lg sm:text-2xl font-bold text-white mb-0.5 sm:mb-1">{cat.name}</h3>
                            <p className="text-white/60 text-[10px] sm:text-sm font-medium">Browse Prompts</p>
                          </div>
                          <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white opacity-0 group-hover:opacity-100 -translate-y-4 group-hover:translate-y-0 transition-all shrink-0">
                            <ArrowUpRight className="w-4 h-4 sm:w-6 sm:h-6" />
                          </div>
                       </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

