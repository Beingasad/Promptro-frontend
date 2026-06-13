import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { ChevronRight, Sparkles, Flame, Zap, Star } from 'lucide-react';
import { cn } from '../utils/cn';
import { MobileHeroCarouselSkeleton } from './common/Skeleton';
import { Prompt } from './ImageCard';

interface Banner {
  id: number | string;
  type: 'text' | 'banner';
  tag_text?: string;
  tag_icon?: string | null;
  title: string;
  subtitle: string;
  button_text?: string;
  button_link?: string;
  image_url?: string | null;
  secondary_image?: string | null;
  bg_gradient?: string;
}

const getDarkGradient = (lightGrad: string = '') => {
  if (lightGrad.includes('e0e7ff')) return 'dark:from-[#1e1b4b] dark:to-[#312e81]';
  if (lightGrad.includes('ffedd5')) return 'dark:from-[#431407] dark:to-[#500724]';
  if (lightGrad.includes('dcfce7')) return 'dark:from-[#064e3b] dark:to-[#1e3a8a]';
  if (lightGrad.includes('primary/10')) return 'dark:from-primary/20 dark:to-secondary/20';
  if (lightGrad.includes('1e1b4b')) return lightGrad; // Already dark
  return 'dark:from-[#1c1a26] dark:to-[#12101b]';
};

const getIcon = (iconName: string | null | undefined) => {
  switch (iconName?.toLowerCase()) {
    case 'sparkles': return <Sparkles className="w-3.5 h-3.5" />;
    case 'flame': return <Flame className="w-3.5 h-3.5" />;
    case 'zap': return <Zap className="w-3.5 h-3.5" />;
    case 'star': return <Star className="w-3.5 h-3.5" />;
    default: return null;
  }
};

interface MobileHeroCarouselProps {
  prompts: Prompt[];
  promptsLoading: boolean;
}

export default function MobileHeroCarousel({ prompts, promptsLoading }: MobileHeroCarouselProps) {
  const [banners, setBanners] = useState<Banner[]>(() => {
    try {
      const cached = localStorage.getItem('promptro_mobile_banners');
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });
  const [currentIndex, setCurrentIndex] = useState(0);
  const [bannersLoading, setBannersLoading] = useState(() => {
    try {
      const cached = localStorage.getItem('promptro_mobile_banners');
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
          localStorage.setItem('promptro_mobile_banners', JSON.stringify(res.data));
        } catch (e) {
          console.warn('localStorage error:', e);
        }
      } catch (error) {
        console.error('Failed to fetch mobile banners:', error);
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

    const latest = [...prompts].sort((a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime());
    const loved = [...prompts].sort((a, b) => ((b.likes || 0) + (b.views || 0)) - ((a.likes || 0) + (a.views || 0)));

    const result: Banner[] = [
      // Slide 0: Main Hero Text
      {
        id: 'hero-text',
        type: 'text',
        title: 'Trending AI Prompts',
        subtitle: 'Explore thousands of cinematic, aesthetic and creative AI prompts to create stunning images instantly.',
        tag_text: 'Discover, Copy & Create'
      }
    ];

    // Slide 1 & 2 from API
    banners.slice(0, 2).forEach((banner: any) => {
      const tag = (banner.tag_text || '').toUpperCase();
      let img = banner.image_url;
      let secImg = banner.secondary_image;
      let link = banner.button_link;
      let title = banner.title;
      let subtitle = banner.subtitle;

      if (tag.includes('NEW') && latest.length >= 2) {
        img = img || latest[0].image_url;
        secImg = latest[1].image_url;
        link = `/prompt/${latest[0].id}`;
        title = latest[0].title;
        subtitle = `Explore our latest ${latest[0].category} prompt design.`;
      } else if ((tag.includes('TRENDING') || tag.includes('LOVED')) && loved.length >= 2) {
        img = img || loved[0].image_url;
        secImg = loved[1].image_url;
        link = `/prompt/${loved[0].id}`;
        title = loved[0].title;
        subtitle = `Most loved prompt in ${loved[0].category} category.`;
      }

      result.push({
        ...banner,
        type: 'banner',
        title,
        subtitle,
        image_url: img,
        secondary_image: secImg,
        button_link: link
      });
    });

    return result;
  }, [banners, prompts, loading]);

  useEffect(() => {
    if (processedBanners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % processedBanners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [processedBanners.length]);

  if (loading || processedBanners.length === 0) {
    return <MobileHeroCarouselSkeleton />;
  }

  const current = processedBanners[currentIndex];

  return (
    <div className="lg:hidden w-full h-[120px] relative mt-0 mb-0 -mx-0.5 scale-[1.02]">
      <AnimatePresence>
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0 w-full h-full flex items-center"
          style={{ willChange: 'transform, opacity' }}
        >
          {current.type === 'text' ? (
            <div className="flex flex-col w-full relative">
              {/* Decorative Orb behind text */}
              <div className="absolute -top-10 -left-6 w-32 h-32 bg-primary/10 rounded-full blur-[40px] pointer-events-none dark:bg-primary/15" />
              <p className="text-[15px] font-medium leading-6 text-[#6f6684] dark:text-[#afa6c8]">{current.tag_text}</p>
              <h1 className="mt-1 text-[8.5vw] sm:text-[44px] font-[900] leading-tight">
                <span className="bg-gradient-to-r from-[#7437ff] via-[#dd4bd2] to-[#ff642d] bg-clip-text text-transparent drop-shadow-[0_4px_12px_rgba(116,55,255,0.15)]">
                  {current.title}
                </span>
              </h1>
              <p className="mt-2 text-[14px] font-semibold text-[#6f6684] dark:text-[#afa6c8] line-clamp-2 leading-relaxed opacity-90">
                {current.subtitle}
              </p>
            </div>
          ) : (
            <a 
              href={current.button_link || '#'}
              className={cn(
                "group relative flex w-full items-center justify-between py-3 px-4 rounded-[1.35rem] shadow-[0_15px_35px_rgba(72,56,118,0.06)] backdrop-blur-3xl overflow-hidden bg-gradient-to-br min-h-[120px] border border-[#70639d]/22 dark:border-black/40 transition-all duration-500 hover:scale-[1.01] hover:shadow-xl hover:shadow-primary/10 animate-gradient-slow",
                `${current.bg_gradient} ${getDarkGradient(current.bg_gradient)}`
              )}
            >
              {/* Glassmorphic overlays */}
              <div className="absolute inset-0 bg-white/5 dark:bg-black/15 pointer-events-none" />
              
              {/* Ambient lights */}
              <div className="absolute -top-[30%] -left-[10%] w-28 h-28 bg-gradient-to-br from-primary/30 to-secondary/30 rounded-full blur-2xl pointer-events-none dark:from-primary/20" />
              <div className="absolute -bottom-[30%] right-[20%] w-32 h-32 bg-gradient-to-br from-[#ff6a3d]/20 to-[#dd4bd2]/20 rounded-full blur-3xl pointer-events-none" />

              <div className="flex-1 min-w-0 pr-3 relative z-10">
                <div className="flex items-center gap-1.5 mb-1.5 px-2.5 py-1 rounded-full bg-white/70 dark:bg-white/10 w-fit backdrop-blur-md shadow-[0_2px_8px_rgba(0,0,0,0.02)] border border-white/40 dark:border-white/5">
                  <span className="text-[9px] font-black uppercase tracking-widest text-primary">{current.tag_text}</span>
                </div>
                <h3 className="text-[17px] font-[900] text-[#171421] dark:text-white leading-tight truncate group-hover:text-primary transition-colors duration-300">
                  {current.title}
                </h3>
                <p className="text-[12px] font-semibold text-[#6f6684] dark:text-[#afa6c8] truncate opacity-90 mt-1">
                  {current.subtitle}
                </p>
                <div className="mt-2.5 flex items-center text-[11px] font-black text-white bg-gradient-to-r from-[#7437ff] via-[#dd4bd2] to-[#ff642d] px-4 py-1.5 rounded-full w-fit shadow-[0_3px_10px_rgba(116,55,255,0.3)] transition-all duration-300 group-hover:scale-[1.05] group-hover:shadow-[0_4px_15px_rgba(116,55,255,0.45)] active:scale-95 animate-shimmer-button">
                  <span>{(current.button_text || 'View Now').replace(/[>→\-\s]+$/, '')}</span>
                </div>
              </div>

              {current.image_url && (
                <div className="relative w-22 h-[110px] shrink-0 flex items-center justify-center z-10">
                  <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl scale-75 group-hover:scale-110 transition-transform duration-700" />
                  
                  <div className="w-[78px] h-[106px] rounded-[1.25rem] overflow-hidden border-2 border-white dark:border-white/15 shadow-[0_12px_28px_rgba(0,0,0,0.18)] rotate-3 group-hover:rotate-0 group-hover:scale-105 transition-all duration-500">
                    <img src={current.image_url} alt="" className="w-full h-full object-cover transform scale-105 group-hover:scale-110 transition-transform duration-700" />
                  </div>
                </div>
              )}
            </a>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

