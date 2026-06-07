import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Compass, Bookmark, GalleryVerticalEnd, LayoutGrid } from 'lucide-react';
import { cn } from '../utils/cn';

export default function BottomNav() {
  const location = useLocation();
  const [showIndicator, setShowIndicator] = useState(false);

  useEffect(() => {
    if (location.pathname === '/collections') {
      localStorage.setItem('promptro_collections_seen', 'true');
      setShowIndicator(false);
    } else {
      const hasSeen = localStorage.getItem('promptro_collections_seen');
      if (!hasSeen) {
        setShowIndicator(true);
      }
    }
  }, [location.pathname]);

  const navItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Compass, label: 'Explore', path: '/explore' },
    { icon: GalleryVerticalEnd, label: 'Collections', path: '/collections' },
    { icon: Bookmark, label: 'Saved', path: '/saved' },
    { icon: LayoutGrid, label: 'Categories', path: '/categories' },
  ];

  return (
    <div className="bottom-nav-glass rounded-full px-3 py-2 md:px-8 md:py-3.5 flex items-center justify-between shadow-[0_18px_46px_rgba(72,56,118,0.16)] w-[86%] max-w-[410px] md:max-w-[520px]">
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          end={item.path === '/'}
          id={item.path === '/saved' ? 'bottom-nav-saved' : undefined}
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
              <div className="relative" id={item.path === '/saved' ? 'bottom-nav-saved-icon' : undefined}>
                <span className={cn("absolute left-1/2 top-1/2 -z-10 h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full transition-all duration-300", isActive ? "bg-primary/12 shadow-[0_0_22px_rgba(139,92,246,0.28)]" : "bg-transparent")} />
                
                {/* Premium breathing aura behind the Collections icon when unseen and inactive */}
                {item.path === '/collections' && showIndicator && !isActive && (
                  <span className="absolute inset-0 bg-primary/25 blur-md rounded-full -z-20 scale-[1.7] animate-pulse duration-[1500ms]" />
                )}

                <item.icon className={cn("w-[18px] h-[18px] md:w-5 md:h-5 transition-transform duration-300", isActive && "scale-105 fill-primary/15")} />
                
                {isActive && (
                  <div className="absolute inset-0 bg-primary/22 blur-md rounded-full -z-20 scale-150"></div>
                )}

                {/* Premium indicator dot on top right of the Collections icon when unseen */}
                {item.path === '/collections' && showIndicator && (
                  <span className="absolute -top-1.5 -right-1.5 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ff6a3d] opacity-80" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-gradient-to-br from-primary to-[#ff6a3d] shadow-[0_0_8px_rgba(109,77,236,0.8)]" />
                  </span>
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
  );
}
