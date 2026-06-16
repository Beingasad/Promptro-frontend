import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Heart, Eye, Bookmark, GalleryVerticalEnd, Share2, Check } from 'lucide-react';
import CollectionSelectModal from './CollectionSelectModal';
import AuthModal from './AuthModal';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState, useRef } from 'react';
import type { MouseEvent } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { auth } from '../lib/firebase';
import { readLocalActivity, saveUserActivity, setLikedPrompt, setSavedPrompt, onActivityUpdated, writeLocalActivity } from '../lib/activity';
import { optimizeImageUrl } from '../utils/image';
import { isImageLoaded, markImageLoaded } from '../utils/imageCache';

export interface Prompt {
  id: string;
  title: string;
  image_url: string;
  category: string;
  likes: number;
  views: number;
  model: string;
  aspectRatio?: string;
  aspect_ratio?: string;
  prompt_text?: string;
  tags?: string[];
  created_at?: string;
  updated_at?: string;
  images?: string[];
}

interface ImageCardProps {
  prompt: Prompt;
  aspectRatio?: string;
  priority?: boolean;
}

const formatCount = (value: number) => {
  if (value >= 1000) {
    return `${Number((value / 1000).toFixed(value >= 10000 ? 1 : 1))}K`;
  }

  return `${value}`;
};

export default function ImageCard({ prompt, aspectRatio, priority }: ImageCardProps) {
  const finalAspectRatio = aspectRatio || prompt.aspectRatio || prompt.aspect_ratio;
  let isPortrait = true;
  if (finalAspectRatio && finalAspectRatio.includes('/')) {
    const [w, h] = finalAspectRatio.split('/').map(Number);
    if (!isNaN(w) && !isNaN(h)) {
      isPortrait = w < h;
    }
  }
  const [saved, setSaved] = useState(false);
  const [liked, setLiked] = useState(false);
  const [inCollection, setInCollection] = useState(false);
  const [likes, setLikes] = useState(prompt.likes);
  // Check the global cache so re-mounted cards skip the skeleton entirely
  const optimizedSrc = prompt.image_url ? optimizeImageUrl(prompt.image_url, priority ? 800 : 600) : '';
  const alreadyCached = optimizedSrc ? isImageLoaded(optimizedSrc) : false;
  const [imageLoaded, setImageLoaded] = useState(alreadyCached);
  const [collectionModalOpen, setCollectionModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [showHeart, setShowHeart] = useState(false);
  const [heartKey, setHeartKey] = useState(0);
  const [shared, setShared] = useState(false);
  const lastClickTime = useRef(0);
  const clickTimeout = useRef<any>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === '/';
  const isSavedOrCollections = location.pathname === '/saved' || location.pathname === '/collections';

  // Cleanup pending single-click timeout on unmount
  useEffect(() => {
    return () => {
      if (clickTimeout.current) {
        clearTimeout(clickTimeout.current);
      }
    };
  }, []);

  const handleCollectionClick = async (event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    if (!auth?.currentUser) {
      setAuthModalOpen(true);
      return;
    }

    if (inCollection) {
      const activity = readLocalActivity();
      const updatedCollections = (activity.collections || []).map(col => ({
        ...col,
        prompts: col.prompts.filter(p => p.id !== prompt.id)
      }));
      writeLocalActivity({ ...activity, collections: updatedCollections });
      setInCollection(false);
      try {
        await saveUserActivity(auth?.currentUser);
        alert("Removed from collections successfully");
      } catch (err) {
        console.error("Failed to sync collection removal:", err);
      }
    } else {
      setCollectionModalOpen(true);
    }
  };

  const [inView, setInView] = useState(priority || alreadyCached);
  const containerRef = useRef<HTMLAnchorElement>(null);

  // Progressive lazy-load: load images ~1-2 cards ahead of scroll position
  // Priority images and already-cached images bypass this entirely
  useEffect(() => {
    if (priority || alreadyCached) {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '1000px' }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [priority, alreadyCached]);

  // Instant pre-load check to handle browser-cached images without visual glitch
  useEffect(() => {
    if (inView && prompt.image_url) {
      const img = new Image();
      img.src = optimizedSrc;
      if (img.complete) {
        setImageLoaded(true);
        markImageLoaded(optimizedSrc);
      }
    }
  }, [inView, prompt.image_url, optimizedSrc]);

  useEffect(() => {
    const updateStates = () => {
      const isGuest = !auth?.currentUser;
      const { savedPrompts, likedPrompts, collections } = readLocalActivity();
      setSaved(!isGuest && savedPrompts.some((savedPrompt) => savedPrompt.id === prompt.id));
      setLiked(likedPrompts.includes(prompt.id));
      setLikes(prompt.likes + (likedPrompts.includes(prompt.id) ? 1 : 0));
      setInCollection(!isGuest && (collections || []).some(c => c.prompts.some(p => p.id === prompt.id)));
    };
    updateStates();

    const unsubscribeActivity = onActivityUpdated(updateStates);
    const unsubscribeAuth = auth ? auth.onAuthStateChanged(updateStates) : () => {};

    return () => {
      unsubscribeActivity();
      unsubscribeAuth();
    };
  }, [prompt]);

  const toggleSave = (event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    if (!auth?.currentUser) {
      setAuthModalOpen(true);
      return;
    }

    const nextSaved = !saved;
    setSavedPrompt(prompt, nextSaved);
    setSaved(nextSaved);
    saveUserActivity(auth?.currentUser).catch(() => undefined);

    const cardEl = (event.currentTarget as HTMLElement).closest('.group');
    const rect = cardEl?.getBoundingClientRect();
    if (nextSaved && rect) {
      const animEvent = new CustomEvent('prompt-saved-animation', {
        detail: {
          imageUrl: prompt.image_url,
          startX: rect.left,
          startY: rect.top,
          startWidth: rect.width,
          startHeight: rect.height
        }
      });
      window.dispatchEvent(animEvent);
    }
  };

  const toggleLike = (event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    const nextLiked = !liked;
    setLikedPrompt(prompt.id, nextLiked);
    setLiked(nextLiked);
    setLikes(prompt.likes + (nextLiked ? 1 : 0));

    // Show heart pop animation when liking via button click
    if (nextLiked) {
      setHeartKey((prev) => prev + 1);
      setShowHeart(true);
    }

    saveUserActivity(auth?.currentUser).catch(() => undefined);
    const data = new FormData();
    data.append('liked', String(nextLiked));
    axios.post(`${API_BASE_URL}/api/prompts/${prompt.id}/like`, data, { timeout: 15000 }).then((response) => {
      if (typeof response.data?.likes === 'number') setLikes(response.data.likes);
    }).catch(() => undefined);
  };

  const handleCardClick = (event: MouseEvent) => {
    const now = Date.now();
    const DOUBLE_PRESS_DELAY = 300;

    if (now - lastClickTime.current < DOUBLE_PRESS_DELAY) {
      // It's a double click!
      event.preventDefault();
      if (clickTimeout.current) {
        clearTimeout(clickTimeout.current);
        clickTimeout.current = null;
      }

      // Show heart pop animation
      setHeartKey((prev) => prev + 1);
      setShowHeart(true);

      // Perform like if not already liked (Instagram style: double click only likes, never unlikes)
      if (!liked) {
        const nextLiked = true;
        setLikedPrompt(prompt.id, nextLiked);
        setLiked(nextLiked);
        setLikes(prompt.likes + 1);
        saveUserActivity(auth?.currentUser).catch(() => undefined);
        const data = new FormData();
        data.append('liked', String(nextLiked));
        axios.post(`${API_BASE_URL}/api/prompts/${prompt.id}/like`, data, { timeout: 15000 }).then((response) => {
          if (typeof response.data?.likes === 'number') setLikes(response.data.likes);
        }).catch(() => undefined);
      }
    } else {
      // It's a single click! Delay navigation to check if a double click follows
      lastClickTime.current = now;
      event.preventDefault();

      clickTimeout.current = setTimeout(() => {
        navigate(`/prompt/${prompt.id}`, { state: { isPortrait } });
      }, DOUBLE_PRESS_DELAY);
    }
  };

  const handleShareClick = async (event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    const shareUrl = `${window.location.origin}/prompt/${prompt.id}`;
    const shareText = `Check out this amazing AI prompt: "${prompt.title}" on Promptro! 🎨✨`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: prompt.title,
          text: shareText,
          url: shareUrl,
        });
      } catch (err) {
        console.error("Error sharing:", err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
        setShared(true);
        setTimeout(() => setShared(false), 2000);
      } catch (err) {
        console.error("Failed to copy link:", err);
      }
    }
  };

  const handleCategoryClick = (event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    navigate(`/explore?category=${encodeURIComponent(prompt.category)}`);
  };

  const stopCardNavigation = (event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
  };

  return (
    <>
      <Link 
        ref={containerRef}
        to={`/prompt/${prompt.id}`}
        state={{ isPortrait }}
        onClick={handleCardClick}
        className="relative block w-full rounded-[1.35rem] md:rounded-[1.75rem] overflow-hidden group mb-2.5 md:mb-3.5 bg-[#e8e2f0]/30 dark:bg-white/5 glass-shine hover:shadow-[0_20px_50px_rgba(139,92,246,0.22)] dark:hover:shadow-[0_24px_60px_rgba(0,0,0,0.6)] transition-shadow duration-500"
        style={{
          ...(finalAspectRatio ? { aspectRatio: finalAspectRatio } : {}),
          WebkitMaskImage: '-webkit-radial-gradient(white, black)',
          isolation: 'isolate'
        }}
      >
      {/* Dedicated Image Container */}
      <div 
        className={`${finalAspectRatio ? 'absolute inset-0' : 'relative w-full h-auto'} overflow-hidden`}
        style={{ 
          borderRadius: 'inherit',
          WebkitMaskImage: '-webkit-radial-gradient(white, black)',
          isolation: 'isolate'
        }}
      >
        {/* Background Shimmer (behind image, showing during load) */}
        {!imageLoaded && (
          <div className="absolute inset-0 shimmer-bg w-full h-full" />
        )}

        {inView && (
          <motion.img
            src={prompt.image_url ? optimizedSrc : 'https://images.unsplash.com/photo-1605806616949-1e87b487cb2a?q=80&w=1000&auto=format&fit=crop'}
            alt={prompt.title}
            onLoad={() => {
              setImageLoaded(true);
              markImageLoaded(optimizedSrc);
            }}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.onerror = null; // Prevent infinite loop
              target.src = 'https://images.unsplash.com/photo-1605806616949-1e87b487cb2a?q=80&w=1000&auto=format&fit=crop';
              setImageLoaded(true);
            }}
            initial={{ opacity: alreadyCached ? 1 : 0 }}
            animate={imageLoaded ? { opacity: 1 } : { opacity: alreadyCached ? 1 : 0 }}
            viewport={{ once: true, margin: '120px' }}
            transition={alreadyCached ? { duration: 0 } : { duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            className={`w-full ${finalAspectRatio ? 'h-full object-cover' : 'h-auto'} block transition-transform duration-700 ease-out group-hover:scale-[1.05] origin-top`}
            loading="eager"
            decoding="async"
            {...(priority ? { fetchPriority: 'high' as any } : {})}
          />
        )}
      </div>
      
      <div className="absolute inset-0 bg-gradient-to-t from-black/78 via-black/18 to-transparent opacity-92 transition-opacity duration-300 group-hover:opacity-100 rounded-[1.35rem] md:rounded-[1.75rem]"></div>

      {/* Instagram-style double tap heart popup effect */}
      <AnimatePresence>
        {showHeart && (
          <motion.div
            key={heartKey}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ 
              scale: [0, 1.4, 0.9, 1.1, 1],
              opacity: [0, 1, 1, 0.9, 0],
              rotate: [0, -10, 10, 0]
            }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ 
              duration: 0.8,
              times: [0, 0.2, 0.4, 0.6, 1],
              ease: "easeOut"
            }}
            onAnimationComplete={() => setShowHeart(false)}
            className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
          >
            <Heart 
              className="w-20 h-20 md:w-24 md:h-24 text-red-500 fill-red-500 filter drop-shadow-[0_0_20px_rgba(239,68,68,0.75)] drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]" 
              strokeWidth={1.5}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Category Badge removed from minimal explore/saved modes as per user request */}

      {/* Top Left: Floating Category Pill */}
      <div className={`absolute z-10 transition-transform duration-300 group-hover:-translate-y-0.5 ${
        isHome ? "top-2 left-2 md:top-3 md:left-3" : "hidden md:block md:top-3 md:left-3"
      }`}>
        <button 
          onClick={handleCategoryClick}
          className="rounded-full bg-gradient-to-r from-[#6d4dec]/90 to-[#ff6a3d]/90 px-2.5 py-[3px] text-[9px] font-bold uppercase tracking-wider text-white transition-transform active:scale-95 md:px-3 md:py-[3.5px] md:text-[10px] shadow-sm whitespace-nowrap opacity-90 backdrop-blur-[4px] border border-white/10"
          aria-label={`View category ${prompt.category}`}
        >
          {prompt.category}
        </button>
      </div>

      <div className="absolute bottom-2 left-2 right-2 md:bottom-3 md:left-3 md:right-3">
        {/* Title (ONLY ON ORIGINAL HOME MODE) */}
        {isHome && (
          <h3 className="mb-2 line-clamp-1 px-1.5 text-sm font-bold text-white drop-shadow-lg md:mb-2.5 md:text-base">
            {prompt.title}
          </h3>
        )}

        {/* MINIMAL EXPLORE / SAVED LAYOUT (Now applied to Home page cards too) */}
        <div className={`flex items-center justify-around w-full rounded-full bg-black/20 text-white shadow-[0_16px_38px_rgba(0,0,0,0.26)] backdrop-blur-[28px] ${
          isHome 
            ? "px-3 py-2.5 md:px-5 md:py-3.5" 
            : "px-2.5 py-1.5 md:px-4 md:py-3"
        }`}>
          {!isSavedOrCollections ? (
            <>
              <button
                className="flex items-center gap-1 text-[11px] font-bold tracking-normal transition-transform active:scale-90 md:gap-1.5 md:text-sm"
                onClick={toggleLike}
                aria-label={liked ? 'Unlike prompt' : 'Like prompt'}
              >
                <motion.span
                  key={liked ? 'liked' : 'unliked'}
                  initial={liked ? { scale: 0.8 } : false}
                  animate={liked ? { scale: [0.8, 1.3, 1] } : { scale: 1 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="flex items-center justify-center"
                >
                  <Heart className="w-4 h-4 md:w-5 md:h-5 transition-colors" fill={liked ? '#ff4b72' : 'rgba(255,255,255,0.22)'} stroke={liked ? '#ff4b72' : 'currentColor'} />
                </motion.span>
                <span className="ml-1">{formatCount(likes)}</span>
              </button>
              
              <div className="h-3.5 w-px bg-white/20" />

              <button
                className="flex items-center gap-1 text-[11px] font-bold tracking-normal md:gap-1.5 md:text-sm"
                onClick={stopCardNavigation}
                aria-label={`${formatCount(prompt.views)} views`}
              >
                <Eye className="w-4 h-4 md:w-5 md:h-5" />
                <span className="ml-1">{formatCount(prompt.views)}</span>
              </button>

              <div className="h-3.5 w-px bg-white/20" />
            </>
          ) : (
            <>
              <button
                className="flex items-center gap-1 text-[11px] font-bold tracking-normal transition-transform active:scale-90 md:gap-1.5 md:text-sm"
                onClick={handleShareClick}
                aria-label="Share prompt"
              >
                {shared ? (
                  <Check className="w-4 h-4 text-emerald-400 md:w-5 md:h-5" />
                ) : (
                  <Share2 className="w-4 h-4 text-white md:w-5 md:h-5" />
                )}
              </button>

              <div className="h-3.5 w-px bg-white/20" />
            </>
          )}

          <button
            className="flex items-center gap-1 text-[11px] font-bold tracking-normal transition-transform active:scale-90 md:gap-1.5 md:text-sm"
            onClick={handleCollectionClick}
            aria-label="Add to Collection"
          >
            <GalleryVerticalEnd 
              className="w-4 h-4 md:w-5 md:h-5 text-white"
              fill={inCollection ? 'currentColor' : 'none'}
            />
          </button>
          
          <div className="h-3.5 w-px bg-white/20" />

          <button
            className="flex items-center gap-1 text-[11px] font-bold tracking-normal transition-transform active:scale-90 md:gap-1.5 md:text-sm"
            onClick={toggleSave}
            aria-label={saved ? 'Remove saved prompt' : 'Save prompt'}
          >
            <Bookmark className="w-4 h-4 text-white md:w-5 md:h-5" fill={saved ? 'currentColor' : 'none'} strokeWidth={2.4} />
          </button>
        </div>
      </div>
    </Link>
      <CollectionSelectModal 
        isOpen={collectionModalOpen} 
        onClose={() => setCollectionModalOpen(false)} 
        prompt={prompt} 
      />
      <AuthModal 
        isOpen={authModalOpen} 
        onClose={() => setAuthModalOpen(false)} 
      />
    </>
  );
}

