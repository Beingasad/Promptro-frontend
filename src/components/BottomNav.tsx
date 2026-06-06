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
              "flex flex-col items-center justify-center gap-0.5 relative rounded-full w-14 h-14 md:w-18 md:h-18 transition-all duration-300",
              isActive ? "text-primary" : "text-[#6f6684] hover:text-[#171421] dark:hover:text-white"
            )
          }
        >
          {({ isActive }) => (
            <>
              {/* Colorless Liquid Glass Water Drop Background (Round Circle) */}
              <span className={cn(
                "absolute inset-0 -z-10 rounded-full transition-all duration-300",
                isActive 
                  ? "bg-white/[0.03] dark:bg-white/[0.01] border border-white/20 dark:border-white/10 backdrop-blur-[6px] shadow-[inset_0_3px_5px_rgba(255,255,255,0.35),inset_0_-2px_4px_rgba(0,0,0,0.08),0_6px_14px_rgba(0,0,0,0.06)] dark:shadow-[inset_0_2px_4px_rgba(255,255,255,0.15),inset_0_-3px_5px_rgba(0,0,0,0.4),0_8px_18px_rgba(0,0,0,0.3)]" 
                  : "bg-transparent border-transparent"
              )} />
              
              <item.icon className={cn("w-[18px] h-[18px] md:w-5 md:h-5 transition-transform duration-300", isActive && "scale-105 fill-primary/10")} />
              
              <span className={cn("text-[9px] md:text-xs font-semibold leading-none tracking-normal transition-opacity", !isActive && "opacity-75")}>
                {item.label}
              </span>
            </>
          )}
        </NavLink>
      ))}
    </div>
  );
}
