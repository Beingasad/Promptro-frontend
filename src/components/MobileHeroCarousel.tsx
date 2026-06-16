import { useEffect, useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { ChevronRight, Sparkles, Flame, Zap, Star, X } from 'lucide-react';
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
  const [selectedBannerForModal, setSelectedBannerForModal] = useState<any | null>(null);
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
      let prompt1: any = null;
      let prompt2: any = null;

      if (tag.includes('NEW') && latest.length >= 2) {
        img = img || latest[0].image_url;
        secImg = latest[1].image_url;
        link = `/prompt/${latest[0].id}`;
        title = 'Newly Added Prompts';
        subtitle = `New: ${latest[0].title}`;
        prompt1 = latest[0];
        prompt2 = latest[1];
      } else if ((tag.includes('TRENDING') || tag.includes('LOVED')) && loved.length >= 2) {
        img = img || loved[0].image_url;
        secImg = loved[1].image_url;
        link = `/prompt/${loved[0].id}`;
        title = 'Most Loved Prompts';
        subtitle = banner.subtitle;
        prompt1 = loved[0];
        prompt2 = loved[1];
      }

      result.push({
        ...banner,
        type: 'banner',
        title,
        subtitle,
        image_url: img,
        secondary_image: secImg,
        button_link: link,
        prompt1,
        prompt2
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
            <div 
              className={cn(
                "group relative flex w-full items-center justify-between py-3 px-4 rounded-[1.35rem] shadow-[0_15px_35px_rgba(72,56,118,0.06)] backdrop-blur-3xl overflow-hidden bg-gradient-to-br min-h-[120px] border-none transition-all duration-500 hover:scale-[1.01] hover:shadow-xl hover:shadow-primary/10 animate-gradient-slow",
                `${current.bg_gradient} ${getDarkGradient(current.bg_gradient)}`
              )}
            >
              {/* Glassmorphic overlays */}
              <div className="absolute inset-0 bg-white/5 dark:bg-black/15 pointer-events-none" />
              
              {/* Ambient lights */}
              <div className="absolute -top-[30%] -left-[10%] w-28 h-28 bg-gradient-to-br from-primary/30 to-secondary/30 rounded-full blur-2xl pointer-events-none dark:from-primary/20" />
              <div className="absolute -bottom-[30%] right-[20%] w-32 h-32 bg-gradient-to-br from-[#ff6a3d]/20 to-[#dd4bd2]/20 rounded-full blur-3xl pointer-events-none" />

              <div className="flex-1 min-w-0 pr-4 relative z-10">
                <span className="text-[9.5px] font-black uppercase tracking-[0.18em] text-primary dark:text-[#a78bfa] block mb-1">
                  {current.tag_text}
                </span>
                <h3 className="text-[14px] font-[900] text-[#171421] dark:text-white leading-tight whitespace-nowrap group-hover:text-primary transition-colors duration-300">
                  {current.title}
                </h3>
                <p className="text-[10px] font-semibold text-[#6f6684] dark:text-[#afa6c8] line-clamp-2 leading-normal opacity-90 mt-0.5">
                  {current.subtitle}
                </p>
                {current.prompt1 && current.prompt2 ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setSelectedBannerForModal(current);
                    }}
                    className="cursor-pointer mt-2 flex items-center text-[11px] font-black text-white bg-gradient-to-r from-[#7437ff] via-[#dd4bd2] to-[#ff642d] px-4 py-1.5 rounded-full w-fit shadow-[0_3px_10px_rgba(116,55,255,0.3)] transition-all duration-300 hover:scale-[1.05] hover:shadow-[0_4px_15px_rgba(116,55,255,0.45)] active:scale-95 outline-none animate-shimmer-button"
                  >
                    <span>{(current.button_text || 'View Now').replace(/[>→\-\s]+$/, '')}</span>
                  </button>
                ) : (
                  <a
                    href={current.button_link || '#'}
                    onClick={(e) => e.stopPropagation()}
                    className="cursor-pointer mt-2 flex items-center text-[11px] font-black text-white bg-gradient-to-r from-[#7437ff] via-[#dd4bd2] to-[#ff642d] px-4 py-1.5 rounded-full w-fit shadow-[0_3px_10px_rgba(116,55,255,0.3)] transition-all duration-300 hover:scale-[1.05] hover:shadow-[0_4px_15px_rgba(116,55,255,0.45)] active:scale-95 animate-shimmer-button"
                  >
                    <span>{(current.button_text || 'View Now').replace(/[>→\-\s]+$/, '')}</span>
                  </a>
                )}
              </div>

              {current.image_url && (
                <div className="relative h-[96px] w-[86px] shrink-0 flex items-center justify-end z-10">
                  {/* Decorative Glow */}
                  <div className="absolute inset-0 bg-primary/20 rounded-full blur-lg scale-75 group-hover:scale-110 transition-transform duration-700" />
                  
                  {/* Secondary Image (Back) */}
                  {current.secondary_image && (
                    <div className="absolute z-10 -left-3 top-2 h-[82px] w-[58px] rounded-xl overflow-hidden border-2 border-white dark:border-white/15 shadow-[0_8px_16px_rgba(0,0,0,0.12)] transform -rotate-12 transition-all duration-500 group-hover:scale-105 group-hover:-translate-x-0.5 group-hover:-rotate-18">
                      <img 
                        src={current.secondary_image} 
                        alt="" 
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}

                  {/* Main Image (Front) */}
                  <div className="relative z-20 h-[90px] w-[62px] rounded-xl overflow-hidden border-2 border-white dark:border-white/15 shadow-[0_10px_24px_rgba(0,0,0,0.2)] transform rotate-6 transition-all duration-500 group-hover:rotate-10 group-hover:scale-105">
                    <img 
                      src={current.image_url} 
                      alt="" 
                      className="h-full w-full object-cover transform scale-105 group-hover:scale-110 transition-transform duration-700"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Double Image Selector Modal */}
      {createPortal(
        <AnimatePresence>
          {selectedBannerForModal && (
            <div className="fixed inset-0 z-[250] flex items-center justify-center p-4">
              {/* Backdrop */}
              <motion.button
                type="button"
                className="fixed inset-0 bg-black/5 backdrop-blur-[3px] cursor-default w-full h-full border-none outline-none animate-fade-in"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedBannerForModal(null)}
                aria-label="Close modal"
              />

              {/* Modal Container */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.94, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.94, y: 15 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                onClick={(e) => e.stopPropagation()}
                className="relative w-full max-w-[22rem] overflow-hidden rounded-[2rem] border border-white/50 dark:border-white/10 bg-white/88 dark:bg-[#171421]/92 shadow-[0_22px_54px_rgba(72,56,118,0.18)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_24px_48px_rgba(0,0,0,0.35)] backdrop-blur-xl p-5 text-left"
              >
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#e9e2f3] dark:border-white/5">
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-wider text-[#171421] dark:text-white truncate max-w-[14rem]">{selectedBannerForModal.title}</h3>
                    <p className="text-[10px] text-[#756d8d] dark:text-[#afa6c8] font-medium mt-0.5">Select a prompt to view details</p>
                  </div>
                  <button 
                    onClick={() => setSelectedBannerForModal(null)}
                    className="flex h-7 w-7 items-center justify-center rounded-full border border-[#e9e2f3] dark:border-white/10 bg-white/80 dark:bg-white/5 text-[#756d8d] dark:text-[#afa6c8] hover:scale-105 transition-transform cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* Prompt 1 */}
                  {selectedBannerForModal.prompt1 && (
                    <a 
                      href={`/prompt/${selectedBannerForModal.prompt1.id}`}
                      onClick={() => setSelectedBannerForModal(null)}
                      className="group flex flex-col gap-2 p-2 rounded-xl border border-white/10 dark:border-white/5 bg-white/5 dark:bg-white/3 hover:bg-primary/5 hover:border-primary/20 transition-all duration-300"
                    >
                      <div className="aspect-[4/5] w-full rounded-lg overflow-hidden shadow-md bg-[#e8e2f0]/20">
                        <img 
                          src={selectedBannerForModal.prompt1.image_url} 
                          alt={selectedBannerForModal.prompt1.title} 
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                      <div className="px-0.5 text-left">
                        <span className="text-[8px] font-black uppercase text-primary tracking-wider block">Option 1</span>
                        <h4 className="text-xs font-bold text-[#171421] dark:text-white truncate mt-0.5 group-hover:text-primary transition-colors">
                          {selectedBannerForModal.prompt1.title}
                        </h4>
                      </div>
                    </a>
                  )}

                  {/* Prompt 2 */}
                  {selectedBannerForModal.prompt2 && (
                    <a 
                      href={`/prompt/${selectedBannerForModal.prompt2.id}`}
                      onClick={() => setSelectedBannerForModal(null)}
                      className="group flex flex-col gap-2 p-2 rounded-xl border border-white/10 dark:border-white/5 bg-white/5 dark:bg-white/3 hover:bg-primary/5 hover:border-primary/20 transition-all duration-300"
                    >
                      <div className="aspect-[4/5] w-full rounded-lg overflow-hidden shadow-md bg-[#e8e2f0]/20">
                        <img 
                          src={selectedBannerForModal.prompt2.image_url} 
                          alt={selectedBannerForModal.prompt2.title} 
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                      <div className="px-0.5 text-left">
                        <span className="text-[8px] font-black uppercase text-primary tracking-wider block">Option 2</span>
                        <h4 className="text-xs font-bold text-[#171421] dark:text-white truncate mt-0.5 group-hover:text-primary transition-colors">
                          {selectedBannerForModal.prompt2.title}
                        </h4>
                      </div>
                    </a>
                  )}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}
