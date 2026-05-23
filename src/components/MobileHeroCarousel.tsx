import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { ChevronRight } from 'lucide-react';
import { cn } from '../utils/cn';

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

export default function MobileHeroCarousel() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bannersRes, promptsRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/banners?active_only=true`),
          axios.get(`${API_BASE_URL}/api/prompts`)
        ]);

        const allPrompts = promptsRes.data;
        const activeBanners = bannersRes.data;

        const latest = [...allPrompts].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        const loved = [...allPrompts].sort((a, b) => (b.likes + b.views) - (a.likes + a.views));

        const processedBanners: Banner[] = [
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
        activeBanners.slice(0, 2).forEach((banner: any, index: number) => {
          const tag = banner.tag_text.toUpperCase();
          let img = banner.image_url;
          let link = banner.button_link;

          if (tag.includes('NEW') && latest.length > 0) {
            img = img || latest[0].image_url;
            link = '/explore?filter=New Updates';
          } else if ((tag.includes('TRENDING') || tag.includes('LOVED')) && loved.length > 0) {
            img = img || loved[0].image_url;
            link = '/explore?filter=Trending';
          }

          processedBanners.push({
            ...banner,
            type: 'banner',
            image_url: img,
            button_link: link
          });
        });

        setBanners(processedBanners);
      } catch (error) {
        console.error('Failed to fetch mobile banners:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [banners.length]);

  if (loading || banners.length === 0) return null;

  const current = banners[currentIndex];

  return (
    <div className="lg:hidden w-full h-[120px] relative mt-2 mb-1 -mx-0.5 scale-[1.02]">
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
            <div className="flex flex-col w-full">
              <p className="text-[15px] font-medium leading-6 text-[#6f6684] dark:text-[#afa6c8]">{current.tag_text}</p>
              <h1 className="mt-1 text-[8.5vw] sm:text-[44px] font-[900] leading-tight">
                <span className="bg-gradient-to-r from-[#7437ff] via-[#dd4bd2] to-[#ff642d] bg-clip-text text-transparent">
                  {current.title}
                </span>
              </h1>
              <p className="mt-2 text-[14px] font-semibold text-[#6f6684] dark:text-[#afa6c8] line-clamp-2 leading-relaxed opacity-90">
                {current.subtitle}
              </p>
            </div>
          ) : (
            <a 
              href={current.button_link}
              className={cn(
                "relative flex w-full items-center justify-between p-5 rounded-2xl shadow-[0_15px_35px_rgba(0,0,0,0.05)] backdrop-blur-md overflow-hidden bg-gradient-to-br min-h-[120px] border-none",
                current.bg_gradient,
                getDarkGradient(current.bg_gradient)
              )}
            >
              <div className="flex-1 min-w-0 pr-4">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <span className="text-[14px]">{current.tag_icon || '✨'}</span>
                  <span className="text-[9px] font-black uppercase tracking-widest text-primary/80 dark:text-primary">{current.tag_text}</span>
                </div>
                <h3 className="text-[17px] font-[900] text-[#171421] dark:text-white leading-tight truncate">
                  {current.title}
                </h3>
                <p className="text-[12px] font-semibold text-[#6f6684] dark:text-[#afa6c8] truncate opacity-90 mt-1">
                  {current.subtitle}
                </p>
                <div className="mt-2.5 flex items-center gap-1 text-[12px] font-black text-primary">
                  {current.button_text} <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>

              {current.image_url && (
                <div className="w-16 h-24 rounded-2xl overflow-hidden shadow-xl shrink-0 border-none">
                  <img src={current.image_url} alt="" className="w-full h-full object-cover" />
                </div>
              )}
            </a>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

