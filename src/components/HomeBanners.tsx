import { useEffect, useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { ChevronRight, Sparkles, Flame, Zap, Star, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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
  secondary_image?: string | null;
  bg_gradient: string;
  is_active: boolean;
  prompt1?: any;
  prompt2?: any;
  prompts_list?: any[];
  is_premium?: boolean;
  is_pink?: boolean;
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
  if (lightGrad.includes('dark:')) return '';
  if (lightGrad.includes('e0e7ff')) return 'dark:from-[#1e1b4b] dark:to-[#312e81]';
  if (lightGrad.includes('ffedd5')) return 'dark:from-[#431407] dark:to-[#500724]';
  if (lightGrad.includes('dcfce7')) return 'dark:from-[#064e3b] dark:to-[#1e3a8a]';
  if (lightGrad.includes('primary/10')) return 'dark:from-primary/20 dark:to-secondary/20';
  if (lightGrad.includes('1e1b4b')) return lightGrad; // Already dark
  return 'dark:from-[#1c1a26] dark:to-[#12101b]';
};

const getButtonTheme = (banner: any) => {
  if (banner.is_premium) {
    return "liquid-glass-control liquid-glass-sheen text-white bg-gradient-to-r from-[#d4af37]/85 to-[#ff8c00]/85 border-white/25 shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_8px_20px_rgba(218,165,32,0.25)] hover:from-[#d4af37] hover:to-[#ff8c00]";
  }
  if (banner.is_pink) {
    return "liquid-glass-control liquid-glass-sheen text-white bg-gradient-to-r from-[#be185d]/85 to-[#ec4899]/85 border-white/25 shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_8px_20px_rgba(236,72,153,0.25)] hover:from-[#be185d] hover:to-[#ec4899]";
  }
  return "liquid-glass-control liquid-glass-sheen text-white bg-gradient-to-r from-[#7437ff]/85 via-[#dd4bd2]/85 to-[#ff642d]/85 border-white/25 shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_8px_20px_rgba(116,55,255,0.25)] hover:from-[#7437ff] hover:via-[#dd4bd2] hover:to-[#ff642d]";
};

interface HomeBannersProps {
  prompts: Prompt[];
  promptsLoading: boolean;
}

export default function HomeBanners({ prompts, promptsLoading }: HomeBannersProps) {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedBannerForModal, setSelectedBannerForModal] = useState<any | null>(null);
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

    const editorsPick = [...prompts].sort((a, b) => ((b.saves || 0) + (b.copies || 0)) - ((a.saves || 0) + (a.copies || 0)));
    
    const mapped = banners.map((banner: Banner) => {
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
          button_link: `/prompt/${latest[0].id}`,
          prompt1: latest[0],
          prompt2: latest[1],
          prompts_list: latest.slice(0, 6),
          bg_gradient: 'from-[#f5faff] to-[#e6f2ff] dark:from-[#051124] dark:to-[#020812] !border-2 !border-[#99caff] dark:!border-[#1e407a] shadow-[0_15px_40px_rgba(72,168,255,0.15)] dark:shadow-[0_15px_40px_rgba(72,168,255,0.1)]'
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
          button_link: `/prompt/${loved[0].id}`,
          prompt1: loved[0],
          prompt2: loved[1],
          prompts_list: loved.slice(0, 6),
          is_pink: true,
          bg_gradient: 'from-[#fff5f8] to-[#ffe5f0] dark:from-[#2e101f] dark:to-[#14050d] border-2 border-[#ffcce0] dark:border-[#66203d] shadow-[0_15px_40px_rgba(255,105,180,0.15)] dark:shadow-[0_15px_40px_rgba(255,105,180,0.1)]'
        };
      }

      return banner;
    });

    if (editorsPick.length >= 2) {
      mapped.unshift({
        id: 'editors-pick' as any,
        tag_text: 'Editor\'s Pick',
        tag_icon: 'star',
        title: 'Editor\'s Pick',
        subtitle: editorsPick[0].prompt_text || '',
        button_text: 'View Prompts',
        button_link: `/prompt/${editorsPick[0].id}`,
        image_url: editorsPick[0].image_url,
        secondary_image: editorsPick[1].image_url,
        bg_gradient: 'from-[#fffcf5] to-[#fff3d6] dark:from-[#2e2200] dark:to-[#140f00] border-2 border-[#ffe699] dark:border-[#664d00]',
        prompt1: editorsPick[0],
        prompt2: editorsPick[1],
        prompts_list: editorsPick.slice(0, 6),
        is_active: true,
        is_premium: true
      });
    }

    return mapped;
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
    if (processedBanners.length <= 2) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % processedBanners.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [processedBanners.length]);

  const visibleBanners = useMemo(() => {
    if (processedBanners.length <= 2) return processedBanners;
    return [
      processedBanners[currentIndex],
      processedBanners[(currentIndex + 1) % processedBanners.length]
    ];
  }, [processedBanners, currentIndex]);

  if (loading || processedBanners.length === 0) {
    return <HomeBannersSkeleton />;
  }

  return (
    <div className="hidden lg:grid lg:grid-cols-2 gap-5 lg:flex-[1.8] min-w-0">
      {visibleBanners.map((banner: any, index: number) => (
        <div
          key={`${banner.id}-${currentIndex}`} // Force re-render just to be safe, though not strictly needed
          className={cn(
            "group relative flex items-center justify-between p-7 rounded-[1.75rem] overflow-hidden shadow-[0_20px_45px_rgba(72,56,118,0.08)] backdrop-blur-2xl transition-all hover:shadow-2xl hover:shadow-primary/15 bg-gradient-to-br border border-[#70639d]/22 dark:border-black/40 animate-gradient-slow",
            banner.bg_gradient,
            getDarkGradient(banner.bg_gradient)
          )}
        >
          {/* Glassmorphic overlays */}
          <div className="absolute inset-0 bg-white/5 dark:bg-black/15 pointer-events-none" />
          
          {/* Clickable Overlay */}
          <div 
            className="absolute inset-0 z-10 cursor-pointer"
            onClick={() => {
              if (banner.prompt1 && banner.prompt2) {
                setSelectedBannerForModal(banner);
              } else if (banner.button_link) {
                navigate(banner.button_link);
              }
            }}
          />

          {/* Ambient lights */}
          <div className="absolute -top-[30%] -left-[10%] w-36 h-36 bg-gradient-to-br from-primary/30 to-secondary/30 rounded-full blur-2xl pointer-events-none dark:from-primary/20" />
          <div className="absolute -bottom-[30%] right-[30%] w-40 h-40 bg-gradient-to-br from-[#ff6a3d]/20 to-[#dd4bd2]/20 rounded-full blur-3xl pointer-events-none" />

          {/* Content side */}
          <div className="relative z-10 flex flex-col gap-2.5 max-w-[48%]">
            <span className={cn(
              "flex items-center gap-1.5 text-[11px] font-black uppercase tracking-[0.18em] mb-1",
              banner.is_premium ? "text-[#b8860b] dark:text-[#ffd700]" : 
              banner.is_pink ? "text-[#ff69b4] dark:text-[#ffb6c1]" : 
              "text-primary dark:text-[#a78bfa]"
            )}>
              {banner.tag_icon && getIcon(banner.tag_icon)}
              {banner.tag_text}
            </span>
            <h3 className="text-[20px] sm:text-[22px] font-[900] text-[#171421] dark:text-white leading-[1.1] tracking-tight group-hover:text-primary transition-colors duration-300">
              {banner.title}
            </h3>
            <p className="text-[12px] font-semibold text-[#6f6684] dark:text-[#afa6c8] line-clamp-2 leading-relaxed opacity-90 max-w-[195px] xl:max-w-[220px]">
              {banner.subtitle}
            </p>
            {banner.prompt1 && banner.prompt2 ? (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setSelectedBannerForModal(banner);
                }}
                className={cn(
                  "cursor-pointer group/btn mt-3 flex items-center gap-1.5 text-[12px] font-black px-5 py-2.5 rounded-full w-fit transition-all duration-300 hover:scale-[1.05] active:scale-95 outline-none z-20 border",
                  getButtonTheme(banner)
                )}
              >
                <span>{(banner.button_text || 'View Now').replace(/[>→\-\s]+$/, '')}</span>
                <ChevronRight className="w-3.5 h-3.5 opacity-80 group-hover/btn:translate-x-0.5 transition-transform duration-300" />
              </button>
            ) : (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (banner.button_link) navigate(banner.button_link);
                }}
                className={cn(
                  "cursor-pointer group/btn mt-3 flex items-center gap-1.5 text-[12px] font-black px-5 py-2.5 rounded-full w-fit transition-all duration-300 hover:scale-[1.05] active:scale-95 outline-none z-20 border",
                  getButtonTheme(banner)
                )}
              >
                <span>{(banner.button_text || 'View Now').replace(/[>→\-\s]+$/, '')}</span>
                <ChevronRight className="w-3.5 h-3.5 opacity-80 group-hover/btn:translate-x-0.5 transition-transform duration-300" />
              </button>
            )}
          </div>

          {/* Visual Side (Double Image Collage) */}
          <div className="relative h-[150px] w-40 shrink-0 flex items-center justify-end z-10">
            
            {/* Secondary Image (Back) */}
            {banner.secondary_image && (
              <div className="absolute z-10 -left-6 top-3 h-[136px] w-[98px] rounded-2xl overflow-hidden border-2 border-white dark:border-white/30 shadow-[0_12px_24px_rgba(0,0,0,0.12)] opacity-100 group-hover:scale-105 group-hover:-translate-x-1 group-hover:-rotate-18 transform -rotate-12 transition-all duration-500">
                <img 
                  src={banner.secondary_image} 
                  alt="" 
                  className="h-full w-full object-cover"
                  loading="eager"
                  decoding="async"
                  width={98}
                  height={136}
                />
              </div>
            )}

            {/* Main Image (Front) */}
            {banner.image_url && (
              <div className="relative z-20 h-[150px] w-[102px] rounded-2xl overflow-hidden border-2 border-white dark:border-white/30 shadow-[0_16px_36px_rgba(0,0,0,0.22)] transform rotate-6 group-hover:rotate-10 group-hover:scale-105 transition-all duration-500">
                <img 
                  src={banner.image_url} 
                  alt={banner.title} 
                  className="h-full w-full object-cover transform scale-105 group-hover:scale-110 transition-transform duration-700"
                  loading="eager"
                  decoding="async"
                  width={102}
                  height={150}
                />
              </div>
            )}
          </div>
        </div>
      ))}

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
                className="relative w-full max-w-[28rem] overflow-hidden rounded-[28px] liquid-glass-modal p-5 text-left text-[#171421] dark:text-white border border-black/10 dark:border-white/12"
              >
                {/* Ambient glow inside modal */}
                <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-[radial-gradient(circle_at_30%_0%,rgba(139,92,246,0.16),transparent_50%),radial-gradient(circle_at_80%_0%,rgba(255,106,61,0.12),transparent_50%)]" />

                <div className="relative z-10 flex items-center justify-between mb-4 pb-2.5 border-b border-black/10 dark:border-white/12">
                  <div className="min-w-0 pr-2">
                    <h3 className="text-sm font-black uppercase tracking-wider text-[#171421] dark:text-white truncate max-w-[20rem]">{selectedBannerForModal.title}</h3>
                    <p className="text-[10px] text-[#554c6e] dark:text-[#E2E8F0] font-medium mt-0.5">Select a prompt to view details</p>
                  </div>
                  <button 
                    onClick={() => setSelectedBannerForModal(null)}
                    className="liquid-glass-control flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#171421] dark:text-white hover:opacity-80 transition-all cursor-pointer"
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
                      className="cursor-pointer group flex flex-col gap-2 p-2 rounded-[18px] liquid-glass-control border border-black/10 dark:border-white/12 hover:border-black/20 dark:hover:border-white/25 text-left transition-all duration-200 outline-none active:scale-[0.98] hover:shadow-[0_0_12px_rgba(255,255,255,0.15)]"
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
                        <span className="text-[11px] font-extrabold uppercase text-primary dark:text-[#c4b5fd] tracking-wider block">Option {index + 1}</span>
                        <h4 className="text-sm font-semibold text-[#171421] dark:text-white truncate mt-0.5 group-hover:text-primary transition-colors">
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
