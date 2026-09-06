import { useState } from 'react';
import { Search, SlidersHorizontal, LayoutGrid } from 'lucide-react';
import { useSearch } from '../context/SearchContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCategories } from '../context/CategoryContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function SearchPill() {
  const [isFocused, setIsFocused] = useState(false);
  const { searchQuery, setSearchQuery } = useSearch();
  const location = useLocation();
  const navigate = useNavigate();
  const { categories: globalCategories } = useCategories();

  const isExplore = location.pathname === '/explore';
  const isHome = location.pathname === '/';
  const [activeDropdown, setActiveDropdown] = useState<'sort' | 'category' | null>(null);

  const categories = ['All', ...globalCategories.map((c) => c.name?.trim()).filter(Boolean)];
  const sortOptions = ['All', 'Popular', 'New Updates', 'Trending', 'Most viewed'] as const;

  const rawCategoryParam = new URLSearchParams(location.search).get('category')?.trim() || '';
  const matchedCurrentCategory = categories.find(c => c.toLowerCase() === rawCategoryParam.toLowerCase());
  const currentCategory = matchedCurrentCategory || (rawCategoryParam ? rawCategoryParam : 'All');
  const currentSort = new URLSearchParams(location.search).get('filter') || 'All';

  const handleSelectSort = (option: string) => {
    const params = new URLSearchParams(location.search);
    if (option === 'All') {
      params.delete('filter');
    } else {
      params.set('filter', option);
    }
    navigate(`/explore?${params.toString()}`);
    setActiveDropdown(null);
  };

  const handleSelectCategory = (category: string) => {
    const params = new URLSearchParams(location.search);
    if (category === 'All') {
      params.delete('category');
    } else {
      params.set('category', category.trim());
    }
    const path = isHome ? '/' : '/explore';
    navigate(`${path}?${params.toString()}`);
    setActiveDropdown(null);
  };

  return (
    <div className="relative w-full">
      {activeDropdown && (
        <div
          className="fixed inset-0 z-40 bg-transparent"
          onClick={() => setActiveDropdown(null)}
        />
      )}

      <div className={`relative flex items-center transition-all duration-300 ${isFocused ? 'scale-[1.01]' : 'scale-100'}`}>
        <div className={`absolute inset-0 rounded-full bg-gradient-to-r from-primary/24 via-fuchsia-300/22 to-secondary/22 blur-2xl transition-opacity duration-300 ${
          isHome ? 'opacity-45 md:hidden' : (isFocused ? 'opacity-100' : 'opacity-45')
        }`} />
        <div className="liquid-glass-search liquid-glass-sheen relative flex h-12 w-full items-center justify-between overflow-hidden rounded-full md:h-14">
          <div className="flex flex-grow items-center h-full min-w-0">
            <div className="pl-4 pr-2.5 text-[#6f6684] dark:text-[#a59cb8] md:pl-5 shrink-0">
              <Search className="h-5 w-5" />
            </div>
            <input
              type="text"
              placeholder="Search prompts, styles, themes..."
              className="h-full w-full border-none bg-transparent pr-4 text-sm font-medium tracking-normal text-[#171421] placeholder-[#786f91] outline-none dark:text-[#f7f2ff] dark:placeholder-[#9e94b8] md:text-base"
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {(isExplore || isHome) && (
            <div className="flex items-center gap-1.5 pr-2 md:pr-3 shrink-0 relative z-50">
              {/* Category Dropdown Trigger */}
              <button
                type="button"
                onClick={() => setActiveDropdown(prev => prev === 'category' ? null : 'category')}
                title="Select Category"
                className={`flex h-8 w-8 md:h-10 md:w-10 items-center justify-center rounded-full transition-all duration-300 cursor-pointer ${
                  activeDropdown === 'category' || currentCategory.toLowerCase() !== 'all'
                    ? 'bg-gradient-to-r from-primary to-[#ff6a3d] text-white'
                    : 'bg-white/60 text-[#5f5774] hover:bg-white/90 dark:bg-white/[0.04] dark:text-[#c6bddb] dark:hover:bg-white/[0.08]'
                }`}
              >
                <LayoutGrid className="h-4 w-4 md:h-4.5 md:w-4.5" />
              </button>

              {/* Sort Dropdown Trigger */}
              {isExplore && (
                <button
                  type="button"
                  onClick={() => setActiveDropdown(prev => prev === 'sort' ? null : 'sort')}
                  title="Sort Options"
                  className={`flex h-8 w-8 md:h-10 md:w-10 items-center justify-center rounded-full transition-all duration-300 cursor-pointer ${
                    activeDropdown === 'sort' || currentSort.toLowerCase() !== 'all'
                      ? 'bg-gradient-to-r from-primary to-[#ff6a3d] text-white'
                      : 'bg-white/60 text-[#5f5774] hover:bg-white/90 dark:bg-white/[0.04] dark:text-[#c6bddb] dark:hover:bg-white/[0.08]'
                  }`}
                >
                  <SlidersHorizontal className="h-4 w-4 md:h-4.5 md:w-4.5" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {/* Category Dropdown Menu */}
        {(isExplore || isHome) && activeDropdown === 'category' && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className={`absolute top-full mt-2.5 z-50 w-52 max-h-[300px] overflow-y-auto hide-scrollbar rounded-[1.45rem] liquid-glass-dropdown p-2.5 ${
              isHome ? 'right-2' : 'right-12'
            }`}
          >
            <p className="px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-widest text-white/90">Categories</p>
            <div className="mt-1.5 flex flex-col gap-0.5">
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => handleSelectCategory(category)}
                  className={`w-full rounded-xl px-3 py-2 text-left text-xs font-bold transition-all duration-200 cursor-pointer ${
                    currentCategory.toLowerCase() === category.toLowerCase()
                      ? 'bg-gradient-to-r from-primary to-[#ff6a3d] text-white shadow-sm'
                      : 'text-white hover:bg-white/15'
                  }`}
                >
                  <span>{category}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Sort Dropdown Menu */}
        {isExplore && activeDropdown === 'sort' && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="absolute right-2 top-full mt-2.5 z-50 w-52 rounded-[1.45rem] liquid-glass-dropdown p-2.5"
          >
            <p className="px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-widest text-white/90">Sort By</p>
            <div className="mt-1.5 flex flex-col gap-0.5">
              {sortOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => handleSelectSort(option)}
                  className={`w-full rounded-xl px-3 py-2 text-left text-xs font-bold transition-all duration-200 cursor-pointer ${
                    currentSort === option
                      ? 'bg-gradient-to-r from-primary to-[#ff6a3d] text-white shadow-sm'
                      : 'text-white hover:bg-white/15'
                  }`}
                >
                  <span>{option}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
