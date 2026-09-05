import { useEffect, useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { ChevronRight, Sparkles, Flame, Zap, Star, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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
  prompt1?: any;
  prompt2?: any;
  prompts_list?: any[];
  is_premium?: boolean;
  is_pink?: boolean;
}

const getButtonTheme = (banner: any) => {
  if (banner.is_premium) {
    return "liquid-glass-control liquid-glass-sheen text-white bg-gradient-to-r from-[#d4af37]/85 to-[#ff8c00]/85 border-white/25 shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_8px_20px_rgba(218,165,32,0.25)] hover:from-[#d4af37] hover:to-[#ff8c00]";
  }
  if (banner.is_pink) {
    return "liquid-glass-control liquid-glass-sheen text-white bg-gradient-to-r from-[#be185d]/85 to-[#ec4899]/85 border-white/25 shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_8px_20px_rgba(236,72,153,0.25)] hover:from-[#be185d] hover:to-[#ec4899]";
  }
  return "liquid-glass-control liquid-glass-sheen text-white bg-gradient-to-r from-[#7437ff]/85 via-[#dd4bd2]/85 to-[#ff642d]/85 border-white/25 shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_8px_20px_rgba(116,55,255,0.25)] hover:from-[#7437ff] hover:via-[#dd4bd2] hover:to-[#ff642d]";
};

const getDarkGradient = (lightGrad: string = '') => {
  if (lightGrad.includes('dark:')) return '';
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
  const navigate = useNavigate();
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
    const editorsPick = [...prompts].sort((a, b) => ((b.saves || 0) + (b.copies || 0)) - ((a.saves || 0) + (a.copies || 0)));

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

    if (editorsPick.length >= 2) {
      result.push({
        id: 'editors-pick',
        type: 'banner',
        title: 'Editor\'s Pick',
        subtitle: editorsPick[0].prompt_text || '',
        tag_text: 'Editor\'s Pick',
        tag_icon: 'star',
        button_text: 'View Prompts',
        button_link: `/prompt/${editorsPick[0].id}`,
        image_url: editorsPick[0].image_url,
        secondary_image: editorsPick[1].image_url,
        bg_gradient: 'from-[#fffcf5] to-[#fff3d6] dark:from-[#2e2200] dark:to-[#140f00] border-2 border-[#ffe699] dark:border-[#664d00]',
        prompt1: editorsPick[0],
        prompt2: editorsPick[1],
        prompts_list: editorsPick.slice(0, 6),
        is_premium: true,
      } as Banner);
    }

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
      let prompts_list: any[] = [];
      let is_pink = false;
      let bg_gradient = banner.bg_gradient;

      if (tag.includes('NEW') && latest.length >= 2) {
        img = img || latest[0].image_url;
        secImg = latest[1].image_url;
        link = `/prompt/${latest[0].id}`;
        title = 'Newly Added Prompts';
        subtitle = `New: ${latest[0].title}`;
        prompt1 = latest[0];
        prompt2 = latest[1];
        prompts_list = latest.slice(0, 6);
      } else if ((tag.includes('TRENDING') || tag.includes('LOVED')) && loved.length >= 2) {
        img = img || loved[0].image_url;
        secImg = loved[1].image_url;
        link = `/prompt/${loved[0].id}`;
        title = 'Most Loved Prompts';
        subtitle = banner.subtitle;
        prompt1 = loved[0];
        prompt2 = loved[1];
        prompts_list = loved.slice(0, 6);
        is_pink = true;
        bg_gradient = 'from-[#fff5f8] to-[#ffe5f0] dark:from-[#2e101f] dark:to-[#14050d] border-2 border-[#ffcce0] dark:border-[#66203d] shadow-[0_15px_40px_rgba(255,105,180,0.15)] dark:shadow-[0_15px_40px_rgba(255,105,180,0.1)]';
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
        prompt2,
        prompts_list,
        is_pink,
        bg_gradient
      });
    });

    return result;
  }, [banners, prompts, loading]);

  useEffect(() => {
    if (selectedBannerForModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedBannerForModal]);

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
    <div className="lg:hidden w-full h-[130px] md:h-[220px] relative mt-0 mb-0 -mx-0.5 md:mx-0 scale-[1.02] md:scale-100">
      {/* Hidden preloader to prevent flashing during swipes */}
      <div className="absolute inset-0 opacity-0 pointer-events-none overflow-hidden z-[-1]" aria-hidden="true">
        {processedBanners.map((b: any, i: number) => (
          <div key={`preload-${i}`}>
            {b.image_url && <img src={b.image_url} alt="" loading="eager" decoding="sync" />}
            {b.secondary_image && <img src={b.secondary_image} alt="" loading="eager" decoding="sync" />}
          </div>
        ))}
      </div>
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
              onClick={() => {
                if (current.prompt1 && current.prompt2) {
                  setSelectedBannerForModal(current);
                } else if (current.button_link) {
                  navigate(current.button_link);
                }
              }}
              className={cn(
                "cursor-pointer group relative flex w-full items-center justify-between py-3 px-4 md:py-6 md:px-8 rounded-[1.35rem] md:rounded-[2rem] shadow-[0_15px_35px_rgba(72,56,118,0.06)] backdrop-blur-3xl overflow-hidden bg-gradient-to-br min-h-[130px] md:min-h-[220px] border-none transition-all duration-500 hover:scale-[1.01] hover:shadow-xl hover:shadow-primary/10 animate-gradient-slow",
                `${current.bg_gradient} ${getDarkGradient(current.bg_gradient)}`
              )}
            >
              {/* Glassmorphic overlays */}
              <div className="absolute inset-0 bg-white/5 dark:bg-black/15 pointer-events-none" />
              
              {/* Ambient lights */}
              <div className="absolute -top-[30%] -left-[10%] w-28 h-28 bg-gradient-to-br from-primary/30 to-secondary/30 rounded-full blur-2xl pointer-events-none dark:from-primary/20" />
              <div className="absolute -bottom-[30%] right-[20%] w-32 h-32 bg-gradient-to-br from-[#ff6a3d]/20 to-[#dd4bd2]/20 rounded-full blur-3xl pointer-events-none" />

              <div className="flex-1 min-w-0 pr-4 relative z-10">
                <span className={cn(
                  "flex items-center gap-1.5 text-[9.5px] md:text-[13px] font-black uppercase tracking-[0.18em] mb-1 md:mb-2",
                  current.is_premium ? "text-[#b8860b] dark:text-[#ffd700]" : 
                  current.is_pink ? "text-[#ff69b4] dark:text-[#ffb6c1]" : 
                  "text-primary dark:text-[#a78bfa]"
                )}>
                  {current.tag_icon && getIcon(current.tag_icon)}
                  {current.tag_text}
                </span>
                <h3 className="text-[15px] md:text-[28px] font-[900] text-[#171421] dark:text-white leading-tight whitespace-nowrap group-hover:text-primary transition-colors duration-300">
                  {current.title}
                </h3>
                <p className="text-[10px] md:text-[15px] font-semibold text-[#6f6684] dark:text-[#afa6c8] line-clamp-2 md:line-clamp-3 leading-normal opacity-90 mt-0.5 md:mt-2.5 md:max-w-[85%]">
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
                    className={cn(
                      "cursor-pointer mt-2 md:mt-4 flex items-center text-[11px] md:text-[13px] font-black px-4 py-1.5 md:px-6 md:py-2.5 rounded-full w-fit transition-all duration-300 hover:scale-[1.05] active:scale-95 outline-none animate-shimmer-button",
                      getButtonTheme(current)
                    )}
                  >
                    <span>{(current.button_text || 'View Now').replace(/[>→\-\s]+$/, '')}</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (current.button_link) navigate(current.button_link);
                    }}
                    className={cn(
                      "cursor-pointer mt-2 md:mt-4 flex items-center text-[11px] md:text-[13px] font-black px-4 py-1.5 md:px-6 md:py-2.5 rounded-full w-fit transition-all duration-300 hover:scale-[1.05] active:scale-95 animate-shimmer-button",
                      getButtonTheme(current)
                    )}
                  >
                    <span>{(current.button_text || 'View Now').replace(/[>→\-\s]+$/, '')}</span>
                  </button>
                )}
              </div>

              {current.image_url && (
                <div className="relative h-[104px] w-[92px] md:h-[180px] md:w-[150px] shrink-0 flex items-center justify-end z-10">
                  {/* Decorative Glow */}
                  <div className="absolute inset-0 bg-primary/20 rounded-full blur-lg md:blur-2xl scale-75 group-hover:scale-110 transition-transform duration-700" />
                  
                  {/* Secondary Image (Back) */}
                  {current.secondary_image && (
                    <div className="absolute z-10 -left-3 md:-left-6 top-2 md:top-4 h-[86px] w-[62px] md:h-[140px] md:w-[100px] rounded-xl md:rounded-2xl overflow-hidden border-2 border-white dark:border-white/30 shadow-[0_8px_16px_rgba(0,0,0,0.12)] md:shadow-[0_12px_24px_rgba(0,0,0,0.15)] transform -rotate-12 transition-all duration-500 group-hover:scale-105 group-hover:-translate-x-0.5 group-hover:-rotate-18">
                      <img 
                        src={current.secondary_image} 
                        alt="" 
                        className="h-full w-full object-cover"
                        loading="eager"
                        decoding="async"
                        width={58}
                        height={82}
                      />
                    </div>
                  )}

                  {/* Main Image (Front) */}
                  <div className="relative z-20 h-[96px] w-[68px] md:h-[160px] md:w-[110px] rounded-xl md:rounded-2xl overflow-hidden border-2 border-white dark:border-white/30 shadow-[0_10px_24px_rgba(0,0,0,0.2)] md:shadow-[0_16px_32px_rgba(0,0,0,0.25)] transform rotate-6 transition-all duration-500 group-hover:rotate-10 group-hover:scale-105">
                    <img 
                      src={current.image_url} 
                      alt={current.title} 
                      className="h-full w-full object-cover transform scale-105 group-hover:scale-110 transition-transform duration-700"
                      loading="eager"
                      decoding="async"
                      width={62}
                      height={90}
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
                className="fixed inset-0 bg-black/5 dark:bg-black/40 backdrop-blur-[4px] cursor-default w-full h-full border-none outline-none animate-fade-in"
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
                className="relative w-full max-w-[22rem] overflow-hidden rounded-[28px] liquid-glass-modal p-5 text-left text-[#171421] dark:text-white border border-black/10 dark:border-white/12"
              >
                {/* Ambient glow inside modal */}
                <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-[radial-gradient(circle_at_30%_0%,rgba(139,92,246,0.16),transparent_50%),radial-gradient(circle_at_80%_0%,rgba(255,106,61,0.12),transparent_50%)]" />

                <div className="relative z-10 flex items-center justify-between mb-4 pb-2.5 border-b border-white/15">
                  <div className="min-w-0 pr-2">
                    <h3 className="text-sm font-black uppercase tracking-wider text-white truncate max-w-[14rem] drop-shadow-[0_1px_1.5px_rgba(0,0,0,0.45)]">{selectedBannerForModal.title}</h3>
                    <p className="text-[10px] text-[#E2E8F0] font-medium mt-0.5 drop-shadow-[0_1px_1px_rgba(0,0,0,0.35)]">Select a prompt to view details</p>
                  </div>
                  <button 
                    onClick={() => setSelectedBannerForModal(null)}
                    className="liquid-glass-control flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white hover:opacity-80 transition-all cursor-pointer drop-shadow-[0_1px_1.5px_rgba(0,0,0,0.45)]"
                    aria-label="Close modal"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="relative z-10 grid grid-cols-2 gap-3 max-h-[55vh] overflow-y-auto pr-0.5 pb-2 hide-scrollbar">
                  {(selectedBannerForModal.prompts_list?.length > 0 ? selectedBannerForModal.prompts_list : [selectedBannerForModal.prompt1, selectedBannerForModal.prompt2].filter(Boolean)).map((prompt: any, index: number) => (
                    <button
                      key={prompt.id}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setSelectedBannerForModal(null);
                        navigate(`/prompt/${prompt.id}`);
                      }}
                      className="cursor-pointer group flex flex-col gap-2 p-2 rounded-[18px] liquid-glass-control border border-white/20 hover:border-white/35 text-left transition-all duration-200 outline-none active:scale-[0.98] hover:shadow-[0_0_12px_rgba(255,255,255,0.15)]"
                    >
                      <div className="aspect-[4/5] w-full rounded-[12px] overflow-hidden shadow-sm bg-black/5 dark:bg-black/25">
                        <img 
                          src={prompt.image_url} 
                          alt={prompt.title} 
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          loading="eager"
                          decoding="async"
                          width={150}
                          height={187}
                        />
                      </div>
                      <div className="px-0.5 w-full">
                        <span className="text-[11px] font-extrabold uppercase text-white/85 tracking-wider block drop-shadow-[0_1px_1px_rgba(0,0,0,0.35)]">Option {index + 1}</span>
                        <h4 className="text-sm font-semibold text-white group-hover:text-white truncate mt-0.5 drop-shadow-[0_1px_1.5px_rgba(0,0,0,0.45)]">
                          {prompt.title}
                        </h4>
                      </div>
                    </button>
                  ))}
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
