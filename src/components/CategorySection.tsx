import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useCategories } from '../context/CategoryContext';

interface CategorySectionProps {
  activeCategory?: string;
  onCategoryChange?: (category: string) => void;
}

export default function CategorySection({ activeCategory = 'All', onCategoryChange }: CategorySectionProps) {
  const { categories: globalCategories, loading } = useCategories();
  const categoryNames = globalCategories.map(c => c.name);
  const categories = ['All', ...categoryNames];
  const [active, setActive] = useState(activeCategory);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const activeButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    setActive(activeCategory);
  }, [activeCategory]);

  useEffect(() => {
    let frame = 0;

    const keepActiveCategoryVisible = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        if (!scrollerRef.current || !activeButtonRef.current) return;

        if (active === 'All') {
          scrollerRef.current.scrollTo({ left: 0, behavior: 'smooth' });
          return;
        }

        activeButtonRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center',
        });
      });
    };

    window.addEventListener('scroll', keepActiveCategoryVisible, { passive: true });

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', keepActiveCategoryVisible);
    };
  }, [active]);

  return (
    <div ref={scrollerRef} className="liquid-glass-search liquid-glass-sheen flex h-11 w-full items-center overflow-x-auto hide-scrollbar rounded-full px-1.5 md:h-14 md:px-2">
      <div className="flex w-max items-center gap-2.5 pr-1.5 md:pr-2">
        {categories.map((category) => (
          <button
            key={category}
            ref={active === category ? activeButtonRef : null}
            onClick={() => {
              setActive(category);
              onCategoryChange?.(category);
            }}
            className={`relative h-8 px-4 rounded-full whitespace-nowrap text-[13px] font-medium tracking-normal transition-all duration-300 md:h-10 md:px-5 md:text-sm ${
              active === category 
                ? 'text-white shadow-[0_16px_34px_rgba(139,92,246,0.28)]' 
                : 'liquid-glass-filter-btn text-white hover:text-white'
            }`}
          >
            {active === category && (
              <motion.span
                layoutId="active-category-pill"
                className="absolute inset-0 rounded-full bg-gradient-to-r from-[#8b5cf6] to-[#ff6a3d]"
                transition={{ type: 'spring', stiffness: 450, damping: 34 }}
              />
            )}
            <span className="relative z-10">{category}</span>
          </button>
        ))}
        {loading && globalCategories.length === 0 && (
          <>
            <div className="relative overflow-hidden shimmer-bg h-8 w-16 rounded-full opacity-60 md:h-10 md:w-20" />
            <div className="relative overflow-hidden shimmer-bg h-8 w-24 rounded-full opacity-60 md:h-10 md:w-28" />
            <div className="relative overflow-hidden shimmer-bg h-8 w-20 rounded-full opacity-60 md:h-10 md:w-24" />
            <div className="relative overflow-hidden shimmer-bg h-8 w-28 rounded-full opacity-60 md:h-10 md:w-32" />
            <div className="relative overflow-hidden shimmer-bg h-8 w-16 rounded-full opacity-60 md:h-10 md:w-20" />
            <div className="relative overflow-hidden shimmer-bg h-8 w-22 rounded-full opacity-60 md:h-10 md:w-26" />
          </>
        )}
      </div>
    </div>
  );
}
