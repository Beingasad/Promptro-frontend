import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { ExternalLink, Sparkles, Flame, Zap, Star, Layout } from 'lucide-react';
import { cn } from '../utils/cn';
import { HomeBannersSkeleton } from './common/Skeleton';

interface Banner {
  id: number;
  tag_text: string;
  tag_icon: string | null;
  title: string;
  subtitle: string;
  button_text: string;
  button_link: string;
  image_url: string | null;
  bg_gradient: string;
  is_active: boolean;
}

const getIcon = (iconName: string | null) => {
  switch (iconName?.toLowerCase()) {
    case 'sparkles': return <Sparkles className="w-3.5 h-3.5" />;
    case 'flame': return <Flame className="w-3.5 h-3.5" />;
    case 'zap': return <Zap className="w-3.5 h-3.5" />;
    case 'star': return <Star className="w-3.5 h-3.5" />;
    default: return null;
  }
};

const getDarkGradient = (lightGrad: string = '') => {
  if (lightGrad.includes('e0e7ff')) return 'dark:from-[#1e1b4b] dark:to-[#312e81]';
  if (lightGrad.includes('ffedd5')) return 'dark:from-[#431407] dark:to-[#500724]';
  if (lightGrad.includes('dcfce7')) return 'dark:from-[#064e3b] dark:to-[#1e3a8a]';
  if (lightGrad.includes('primary/10')) return 'dark:from-primary/20 dark:to-secondary/20';
  if (lightGrad.includes('1e1b4b')) return lightGrad; // Already dark
  return 'dark:from-[#1c1a26] dark:to-[#12101b]';
};

export default function HomeBanners() {
  const [banners, setBanners] = useState<Banner[]>(() => {
    try {
      const cached = sessionStorage.getItem('promptro_home_banners');
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });
  const [loading, setLoading] = useState(() => {
    const isInitial = typeof window !== 'undefined' && (window as any).__promptroAppLoaded === false;
    if (isInitial) {
      return true;
    }
    try {
      const cached = sessionStorage.getItem('promptro_home_banners');
      return !cached;
    } catch {
      return true;
    }
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bannersRes, promptsRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/banners?active_only=true`),
          axios.get(`${API_BASE_URL}/api/prompts`)
        ]);

        const allPrompts = promptsRes.data;
        const activeBanners = bannersRes.data;

        // Sort prompts to find Latest and Most Loved
        const latestPrompt = [...allPrompts].sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )[0];

        const mostLovedPrompt = [...allPrompts].sort((a, b) => 
          (b.likes + b.views) - (a.likes + a.views)
        )[0];

        // Process banners to make them dynamic if needed
        const processedBanners = activeBanners.map((banner: Banner) => {
          const tag = banner.tag_text.toUpperCase();
          
          // Logic for Latest Prompt (NEW UPDATE)
          if (tag.includes('NEW') && allPrompts.length >= 2) {
            const latest = [...allPrompts].sort((a, b) => 
              new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            );
            return {
              ...banner,
              image_url: banner.image_url || latest[0].image_url,
              secondary_image: latest[1].image_url,
              button_link: `/explore?filter=New Updates`
            };
          }
          
          // Logic for Most Loved Prompt (TRENDING/LOVED)
          if ((tag.includes('TRENDING') || tag.includes('LOVED')) && allPrompts.length >= 2) {
            const loved = [...allPrompts].sort((a, b) => 
              (b.likes + b.views) - (a.likes + a.views)
            );
            return {
              ...banner,
              image_url: banner.image_url || loved[0].image_url,
              secondary_image: loved[1].image_url,
              button_link: `/explore?filter=Trending`
            };
          }

          return banner;
        });

        setBanners(processedBanners);
        try {
          sessionStorage.setItem('promptro_home_banners', JSON.stringify(processedBanners));
        } catch (e) {
          console.warn('sessionStorage error:', e);
        }
      } catch (error) {
        console.error('Failed to fetch data for banners:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading || banners.length === 0) {
    return <HomeBannersSkeleton />;
  }

  return (
    <div className="hidden lg:grid grid-cols-2 gap-4 lg:flex-[1.8] min-w-0">
      {banners.slice(0, 2).map((banner: any, index) => (
        <motion.a
          key={banner.id}
          href={banner.button_link}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 + index * 0.1, duration: 0.5 }}
          className={cn(
            "group relative overflow-hidden rounded-[2.5rem] p-7 flex items-center justify-between shadow-[0_20px_45px_rgba(72,56,118,0.08)] backdrop-blur-2xl transition-all hover:scale-[1.02] hover:shadow-2xl hover:shadow-primary/15 bg-gradient-to-br glass-shine hover-glass-glow border border-[#70639d]/22 dark:border-white/10",
            banner.bg_gradient,
            getDarkGradient(banner.bg_gradient)
          )}
        >
          {/* Content side */}
          <div className="relative z-10 flex flex-col gap-2 max-w-[52%]">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/60 dark:bg-white/10 w-fit backdrop-blur-md shadow-sm">
              <span className="text-primary">{banner.tag_icon ? banner.tag_icon : <Sparkles className="w-3.5 h-3.5" />}</span>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-primary/90">{banner.tag_text}</span>
            </div>
            <h3 className="text-[20px] sm:text-[22px] font-[900] text-[#171421] dark:text-white leading-[1.1] tracking-tight group-hover:text-primary transition-colors duration-300">
              {banner.title}
            </h3>
            <p className="text-[12px] font-semibold text-[#6f6684] dark:text-[#afa6c8] line-clamp-2 leading-relaxed opacity-90">
              {banner.subtitle}
            </p>
            <div className="mt-3 flex items-center gap-2 text-[13px] font-black text-primary group-hover:gap-3 transition-all duration-300">
              <span className="relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-primary after:transition-all group-hover:after:w-full">
                {banner.button_text}
              </span>
              <ExternalLink className="w-4 h-4" />
            </div>
          </div>

          {/* Visual Side (Double Image Collage) */}
          <div className="relative h-32 w-36 shrink-0 flex items-center justify-end">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 bg-primary/25 rounded-full blur-[40px] group-hover:blur-[60px] group-hover:scale-150 transition-all duration-1000" />
            
            {/* Main Image (Front) */}
            {banner.image_url && (
              <motion.div 
                whileHover={{ y: -8, rotate: 3, scale: 1.08 }}
                className="relative z-20 h-32 w-22 rounded-2xl overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.25)] group-hover:border-primary/20 transition-colors duration-500"
              >
                <img 
                  src={banner.image_url} 
                  alt="" 
                  className="h-full w-full object-cover transform scale-105 group-hover:scale-110 transition-transform duration-700"
                />
              </motion.div>
            )}
            
            {/* Secondary Image (Back) */}
            {banner.secondary_image && (
              <motion.div 
                initial={{ x: 30, opacity: 0, rotate: -12 }}
                animate={{ x: 0, opacity: 1, rotate: -12 }}
                whileHover={{ y: 8, rotate: -18, scale: 1.1 }}
                className="absolute z-10 -left-8 top-6 h-28 w-20 rounded-2xl overflow-hidden shadow-[0_20px_40px_rgba(0,0,0,0.2)] opacity-85 group-hover:opacity-100 transition-all duration-500"
              >
                <img 
                  src={banner.secondary_image} 
                  alt="" 
                  className="h-full w-full object-cover transform scale-110 group-hover:scale-125 transition-transform duration-1000"
                />
              </motion.div>
            )}
          </div>
        </motion.a>
      ))}
    </div>
  );
}

