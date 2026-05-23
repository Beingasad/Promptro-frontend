import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Compass, Bookmark, LayoutGrid } from 'lucide-react';
import { cn } from '../utils/cn';

export default function BottomNav() {
  const navItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Compass, label: 'Explore', path: '/explore' },
    { icon: Bookmark, label: 'Saved', path: '/saved' },
    { icon: LayoutGrid, label: 'Categories', path: '/categories' },
  ];

  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const checkTheme = () => {
      const isDarkTheme = document.documentElement.getAttribute('data-theme') === 'dark' || 
                          document.body.getAttribute('data-theme') === 'dark';
      setIsDark(isDarkTheme);
    };

    checkTheme();

    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    observer.observe(document.body, { attributes: true, attributeFilter: ['data-theme'] });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="fixed bottom-5 md:bottom-8 left-1/2 -translate-x-1/2 z-50 w-[86%] max-w-[410px] md:max-w-[520px]">
      <div className="glass-nav rounded-full px-3 py-2 md:px-8 md:py-3.5 flex items-center justify-between">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center justify-center gap-1 md:gap-1.5 relative rounded-full min-w-14 md:min-w-20 px-2.5 py-1.5 md:px-4 md:py-2 transition-all duration-300",
                isActive ? "text-primary" : "text-[#6f6684] hover:text-[#171421]"
              )
            }
          >
            {({ isActive }) => (
              <>
                <div className="relative">
                  <span className={cn("absolute left-1/2 top-1/2 -z-10 h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full transition-all duration-300", isActive ? "bg-primary/12 shadow-[0_0_22px_rgba(139,92,246,0.28)]" : "bg-transparent")} />
                  <item.icon className={cn("w-[18px] h-[18px] md:w-5 md:h-5 transition-transform duration-300", isActive && "scale-105 fill-primary/15")} />
                  {isActive && (
                    <div className="absolute inset-0 bg-primary/22 blur-md rounded-full -z-20 scale-150"></div>
                  )}
                </div>
                <span className={cn("text-[10px] md:text-xs font-medium leading-none tracking-normal transition-opacity", !isActive && "opacity-75")}>
                  {item.label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </div>
  );
}
