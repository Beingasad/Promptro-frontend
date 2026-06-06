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
              "flex flex-col items-center justify-center gap-1 md:gap-1.5 relative rounded-[1.25rem] min-w-[62px] md:min-w-22 px-2.5 py-2 md:px-3.5 md:py-2.5 transition-all duration-300",
              isActive ? "text-primary" : "text-[#6f6684] hover:text-[#171421] dark:hover:text-white"
            )
          }
        >
          {({ isActive }) => (
            <>
              {/* Colorless Water Drop Background covering icon & text */}
              <span className={cn(
                "absolute inset-0 -z-10 rounded-[1.25rem] transition-all duration-300",
                isActive 
                  ? "bg-white/40 dark:bg-white/8 border border-white/45 dark:border-white/12 backdrop-blur-md shadow-[inset_0_2px_4px_rgba(255,255,255,0.45),0_8px_18px_rgba(0,0,0,0.06)] dark:shadow-[inset_0_1px_2px_rgba(255,255,255,0.12),0_8px_20px_rgba(0,0,0,0.28)]" 
                  : "bg-transparent border-transparent"
              )} />
              
              <item.icon className={cn("w-[18px] h-[18px] md:w-5 md:h-5 transition-transform duration-300", isActive && "scale-105 fill-primary/10")} />
              
              <span className={cn("text-[10px] md:text-xs font-semibold leading-none tracking-normal transition-opacity", !isActive && "opacity-75")}>
                {item.label}
              </span>
            </>
          )}
        </NavLink>
      ))}
    </div>
  );
}
