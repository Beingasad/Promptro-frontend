import { useEffect, useState, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Compass, Bookmark, GalleryVerticalEnd, LayoutGrid } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../utils/cn';

export default function BottomNav() {
  const [isVisible, setIsVisible] = useState(true);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      // Only hide on scroll for desktop/tablet views (window width >= 768px)
      if (window.innerWidth < 768) {
        setIsVisible(true);
        return;
      }

      setIsVisible(false);

      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      scrollTimeoutRef.current = setTimeout(() => {
        setIsVisible(true);
      }, 250); // Show again 250ms after scroll stops
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  const navItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Compass, label: 'Explore', path: '/explore' },
    { icon: GalleryVerticalEnd, label: 'Collections', path: '/collections' },
    { icon: Bookmark, label: 'Saved', path: '/saved' },
    { icon: LayoutGrid, label: 'Categories', path: '/categories' },
  ];

  const renderNavIcon = (item: typeof navItems[0], isActive: boolean) => {
    if (!isActive) {
      return (
        <item.icon className="w-[18px] h-[18px] md:w-5 md:h-5 transition-all duration-200 fill-none stroke-current drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]" />
      );
    }

    const iconClasses = "w-[18px] h-[18px] md:w-5 md:h-5 scale-105 transition-all duration-200";

    switch (item.path) {
      case '/':
        // Home: House body filled in purple, gate completely open at the bottom (no purple line below gate)
        return (
          <svg viewBox="0 0 24 24" className={iconClasses}>
            <path
              d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2h-4v-7a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v7H5a2 2 0 0 1-2-2v-9z"
              className="fill-primary"
            />
          </svg>
        );

      case '/explore':
        // Explore: Circle filled in purple, needle arrow cut out transparent
        return (
          <svg viewBox="0 0 24 24" className={iconClasses}>
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.24 5.76-1.804 5.411a2 2 0 0 1-1.265 1.265L7.76 16.24l1.804-5.411a2 2 0 0 1 1.265-1.265z"
              className="fill-primary"
            />
          </svg>
        );

      case '/collections':
        // Collections: Box filled purple, lines above box also stroke purple
        return (
          <svg viewBox="0 0 24 24" className={iconClasses} fill="none">
            <path d="M7 2h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="stroke-primary text-primary" />
            <path d="M5 6h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="stroke-primary text-primary" />
            <rect width="18" height="12" x="3" y="10" rx="2" className="fill-primary" />
          </svg>
        );

      case '/saved':
        // Saved: Bookmark filled purple
        return (
          <svg viewBox="0 0 24 24" className={iconClasses}>
            <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" className="fill-primary" />
          </svg>
        );

      case '/categories':
        // Categories: 4 squares filled purple
        return (
          <svg viewBox="0 0 24 24" className={iconClasses}>
            <rect width="7" height="7" x="3" y="3" rx="1" className="fill-primary" />
            <rect width="7" height="7" x="14" y="3" rx="1" className="fill-primary" />
            <rect width="7" height="7" x="14" y="14" rx="1" className="fill-primary" />
            <rect width="7" height="7" x="3" y="14" rx="1" className="fill-primary" />
          </svg>
        );

      default:
        return (
          <item.icon className={cn(iconClasses, "fill-primary stroke-transparent text-primary dark:text-[#c4b5fd]")} />
        );
    }
  };

  return (
    <div className={cn(
      "bottom-nav-glass rounded-full px-3 py-2 md:px-8 md:py-3.5 flex items-center justify-between w-[86%] max-w-[410px] md:max-w-[520px] select-none",
      !isVisible && "nav-hidden"
    )}>
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          end={item.path === '/'}
          id={item.path === '/collections' ? 'bottom-nav-collections' : item.path === '/saved' ? 'bottom-nav-saved' : undefined}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className={({ isActive }) =>
            cn(
              "flex flex-col items-center justify-center gap-1 md:gap-1.5 relative rounded-full min-w-14 md:min-w-20 px-2.5 py-1.5 md:px-4 md:py-2 transition-all duration-200",
              isActive ? "text-primary dark:text-[#c4b5fd]" : "text-white/90 hover:text-white hover:bg-white/14"
            )
          }
        >
          {({ isActive }) => (
            <motion.div
              className="flex flex-col items-center justify-center gap-1 md:gap-1.5 w-full h-full relative"
              whileTap={{ scale: 0.93 }}
              transition={{ type: "spring", stiffness: 420, damping: 28 }}
            >
              <div className="relative z-10" id={item.path === '/saved' ? 'bottom-nav-saved-icon' : undefined}>
                {renderNavIcon(item, isActive)}
              </div>

              <span className={cn(
                "text-[10px] md:text-xs leading-none tracking-tight transition-opacity duration-200 z-10",
                isActive ? "font-semibold text-primary dark:text-[#c4b5fd] opacity-100" : "font-medium text-white/90 opacity-90 drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]"
              )}>
                {item.label}
              </span>
            </motion.div>
          )}
        </NavLink>
      ))}
    </div>
  );
}
