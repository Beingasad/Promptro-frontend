import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { ChevronRight, Sparkles, Flame, Zap, Star } from 'lucide-react';
import { cn } from '../utils/cn';
import { HomeBannersSkeleton } from './common/Skeleton';
import { Prompt } from './ImageCard';

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

interface HomeBannersProps {
  prompts: Prompt[];
  promptsLoading: boolean;
}

export default function HomeBanners({ prompts, promptsLoading }: HomeBannersProps) {
  const [banners, setBanners] = useState<Banner[]>(() => {
    try {
      const cached = localStorage.getItem('promptro_home_banners');
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });
  const [bannersLoading, setBannersLoading] = useState(() => {
    try {
      const cached = localStorage.getItem('promptro_home_banners');
      return !cached;
    } catch {
      return true;
    }
  });

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        if (banners.length === 0) {
          setBannersLoading(true);
        }
        const res = await axios.get(`${API_BASE_URL}/api/banners?active_only=true`);
        setBanners(res.data);
        try {
          localStorage.setItem('promptro_home_banners', JSON.stringify(res.data));
        } catch (e) {
          console.warn('localStorage error:', e);
        }
      } catch (error) {
        console.error('Failed to fetch data for banners:', error);
      } finally {
        setBannersLoading(false);
      }
    };
    fetchBanners();
    window.addEventListener('online', fetchBanners);
    return () => {
      window.removeEventListener('online', fetchBanners);
    };
  }, []);

  const loading = bannersLoading || promptsLoading;

  const processedBanners = useMemo(() => {
    if (loading || banners.length === 0 || prompts.length === 0) return [];

    return banners.map((banner: Banner) => {
      const tag = banner.tag_text.toUpperCase();
      
      // Logic for Latest Prompt (NEW UPDATE)
      if (tag.includes('NEW') && prompts.length >= 2) {
        const latest = [...prompts].sort((a, b) => 
          new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime()
        );
        return {
          ...banner,
          title: 'Newly Added Prompts',
          subtitle: `New: ${latest[0].title}`,
          image_url: banner.image_url || latest[0].image_url,
          secondary_image: latest[1].image_url,
          button_link: `/prompt/${latest[0].id}`
        };
      }
      
      // Logic for Most Loved Prompt (TRENDING/LOVED)
      if ((tag.includes('TRENDING') || tag.includes('LOVED')) && prompts.length >= 2) {
        const loved = [...prompts].sort((a, b) => 
          ((b.likes || 0) + (b.views || 0)) - ((a.likes || 0) + (a.views || 0))
        );
        return {
          ...banner,
          title: 'Most Loved Prompts',
          subtitle: banner.subtitle,
          image_url: banner.image_url || loved[0].image_url,
          secondary_image: loved[1].image_url,
          button_link: `/prompt/${loved[0].id}`
        };
      }

      return banner;
    });
  }, [banners, prompts, loading]);

  if (loading || processedBanners.length === 0) {
    return <HomeBannersSkeleton />;
  }

  return (
    <div className="hidden lg:grid grid-cols-2 gap-5 lg:flex-[1.8] min-w-0">
      {processedBanners.slice(0, 2).map((banner: any, index) => (
        <motion.a
          key={banner.id}
          href={banner.button_link}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 + index * 0.1, duration: 0.5 }}
          className={cn(
            "group relative flex items-center justify-between p-7 rounded-[1.75rem] overflow-hidden shadow-[0_20px_45px_rgba(72,56,118,0.08)] backdrop-blur-2xl transition-all hover:shadow-2xl hover:shadow-primary/15 bg-gradient-to-br border border-[#70639d]/22 dark:border-black/40 animate-gradient-slow",
            banner.bg_gradient,
            getDarkGradient(banner.bg_gradient)
          )}
        >
          {/* Glassmorphic overlays */}
          <div className="absolute inset-0 bg-white/5 dark:bg-black/15 pointer-events-none" />
          
          {/* Ambient lights */}
          <div className="absolute -top-[30%] -left-[10%] w-36 h-36 bg-gradient-to-br from-primary/30 to-secondary/30 rounded-full blur-2xl pointer-events-none dark:from-primary/20" />
          <div className="absolute -bottom-[30%] right-[30%] w-40 h-40 bg-gradient-to-br from-[#ff6a3d]/20 to-[#dd4bd2]/20 rounded-full blur-3xl pointer-events-none" />

          {/* Content side */}
          <div className="relative z-10 flex flex-col gap-2.5 max-w-[48%]">
            <span className="text-[11px] font-black uppercase tracking-[0.18em] text-primary dark:text-[#a78bfa] block mb-1">
              {banner.tag_text}
            </span>
            <h3 className="text-[20px] sm:text-[22px] font-[900] text-[#171421] dark:text-white leading-[1.1] tracking-tight group-hover:text-primary transition-colors duration-300">
              {banner.title}
            </h3>
            <p className="text-[12px] font-semibold text-[#6f6684] dark:text-[#afa6c8] line-clamp-2 leading-relaxed opacity-90 max-w-[195px] xl:max-w-[220px]">
              {banner.subtitle}
            </p>
            <div className="group/btn mt-3 flex items-center gap-1.5 text-[12px] font-black text-primary dark:text-white bg-primary/8 dark:bg-white/8 border border-primary/15 dark:border-white/10 px-5 py-2.5 rounded-full w-fit transition-all duration-300 hover:bg-gradient-to-r hover:from-[#7437ff] hover:via-[#dd4bd2] hover:to-[#ff642d] hover:text-white hover:border-transparent hover:scale-[1.05] hover:shadow-[0_8px_20px_rgba(116,55,255,0.3)] active:scale-95">
              <span>{(banner.button_text || 'View Now').replace(/[>→\-\s]+$/, '')}</span>
              <ChevronRight className="w-3.5 h-3.5 opacity-80 group-hover/btn:translate-x-0.5 transition-transform duration-300" />
            </div>
          </div>

          {/* Visual Side (Double Image Collage) */}
          <div className="relative h-[150px] w-40 shrink-0 flex items-center justify-end z-10">
            
            {/* Secondary Image (Back) */}
            {banner.secondary_image && (
              <div className="absolute z-10 -left-6 top-3 h-[132px] w-[90px] rounded-2xl overflow-hidden border border-white/60 dark:border-white/10 shadow-[0_12px_24px_rgba(0,0,0,0.12)] opacity-100 group-hover:scale-105 group-hover:-translate-x-1 group-hover:-rotate-18 transform -rotate-12 transition-all duration-500">
                <img 
                  src={banner.secondary_image} 
                  alt="" 
                  className="h-full w-full object-cover"
                />
              </div>
            )}

            {/* Main Image (Front) */}
            {banner.image_url && (
              <div className="relative z-20 h-[150px] w-[102px] rounded-2xl overflow-hidden border-2 border-white dark:border-white/15 shadow-[0_16px_36px_rgba(0,0,0,0.22)] transform rotate-3 group-hover:rotate-6 group-hover:scale-105 transition-all duration-500">
                <img 
                  src={banner.image_url} 
                  alt="" 
                  className="h-full w-full object-cover transform scale-105 group-hover:scale-110 transition-transform duration-700"
                />
              </div>
            )}
          </div>
        </motion.a>
      ))}
    </div>
  );
}

