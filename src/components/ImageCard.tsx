import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Heart, Eye, Bookmark } from 'lucide-react';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import type { MouseEvent } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { auth } from '../lib/firebase';
import { readLocalActivity, saveUserActivity, setLikedPrompt, setSavedPrompt } from '../lib/activity';

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
}

interface ImageCardProps {
  prompt: Prompt;
  aspectRatio?: string;
}

const formatCount = (value: number) => {
  if (value >= 1000) {
    return `${Number((value / 1000).toFixed(value >= 10000 ? 1 : 1))}K`;
  }

  return `${value}`;
};

export default function ImageCard({ prompt, aspectRatio }: ImageCardProps) {
  const finalAspectRatio = aspectRatio || prompt.aspectRatio || prompt.aspect_ratio;
  const [saved, setSaved] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(prompt.likes);
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === '/';

  useEffect(() => {
    const { savedPrompts, likedPrompts } = readLocalActivity();

    setSaved(savedPrompts.some((savedPrompt) => savedPrompt.id === prompt.id));
    setLiked(likedPrompts.includes(prompt.id));
    setLikes(prompt.likes + (likedPrompts.includes(prompt.id) ? 1 : 0));
  }, [prompt]);

  const toggleSave = (event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    const nextSaved = !saved;
    setSavedPrompt(prompt, nextSaved);
    setSaved(nextSaved);
    saveUserActivity(auth?.currentUser).catch(() => undefined);
  };

  const toggleLike = (event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    const nextLiked = !liked;
    setLikedPrompt(prompt.id, nextLiked);
    setLiked(nextLiked);
    setLikes(prompt.likes + (nextLiked ? 1 : 0));
    saveUserActivity(auth?.currentUser).catch(() => undefined);
    const data = new FormData();
    data.append('liked', String(nextLiked));
    axios.post(`${API_BASE_URL}/api/prompts/${prompt.id}/like`, data, { timeout: 15000 }).then((response) => {
      if (typeof response.data?.likes === 'number') setLikes(response.data.likes);
    }).catch(() => undefined);
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
    <Link 
      to={`/prompt/${prompt.id}`}
      className="relative block w-full rounded-[1.35rem] md:rounded-[1.75rem] overflow-hidden group mb-2.5 md:mb-3.5 bg-white shadow-[0_18px_42px_rgba(32,26,54,0.13)] ring-1 ring-black/5"
      style={finalAspectRatio ? { aspectRatio: finalAspectRatio } : {}}
    >
      <motion.img
        src={prompt.image_url || 'https://images.unsplash.com/photo-1605806616949-1e87b487cb2a?q=80&w=1000&auto=format&fit=crop'}
        alt={prompt.title}
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.onerror = null; // Prevent infinite loop
          target.src = 'https://images.unsplash.com/photo-1605806616949-1e87b487cb2a?q=80&w=1000&auto=format&fit=crop';
        }}
        initial={{ opacity: 0, scale: 1.04 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: '120px' }}
        transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        className={`w-full ${finalAspectRatio ? 'h-full object-cover' : 'h-auto'} block transition-transform duration-700 ease-out group-hover:scale-[1.055]`}
        loading="lazy"
      />
      
      <div className="absolute inset-0 bg-gradient-to-t from-black/78 via-black/18 to-transparent opacity-92 transition-opacity duration-300 group-hover:opacity-100"></div>

      {/* Top Right: Category Badge (ONLY ON MINIMAL EXPLORE/SAVED MODE) */}
      {!isHome && (
        <div className="absolute top-3 right-3 z-10 transition-transform duration-300 group-hover:-translate-y-0.5 max-w-[90%] whitespace-nowrap">
          <span className="inline-block rounded-full bg-gradient-to-r from-[#8b5cf6] to-[#ff6a3d] px-2.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-white drop-shadow-md whitespace-nowrap truncate max-w-full md:px-3.5 md:py-1 md:text-[10px] shadow-[0_8px_16px_rgba(139,92,246,0.26)]">
            {prompt.category}
          </span>
        </div>
      )}

      {/* Top Right: Bookmark Button (ONLY ON ORIGINAL HOME MODE) */}
      {isHome && (
        <div className="absolute top-3 right-3 transition-transform duration-300 group-hover:-translate-y-0.5">
          <button 
            className="w-8 h-8 md:w-10 md:h-10 rounded-xl md:rounded-2xl bg-white/26 backdrop-blur-2xl border border-white/30 flex items-center justify-center hover:bg-white/38 text-white shadow-[0_14px_30px_rgba(0,0,0,0.22)] transition-colors"
            onClick={toggleSave}
            aria-label={saved ? 'Remove saved prompt' : 'Save prompt'}
          >
            <Bookmark className="w-4 h-4 md:w-5 md:h-5" fill={saved ? 'currentColor' : 'none'} strokeWidth={2.4} />
          </button>
        </div>
      )}

      <div className="absolute bottom-2 left-2 right-2 md:bottom-3 md:left-3 md:right-3">
        {/* Title (ONLY ON ORIGINAL HOME MODE) */}
        {isHome && (
          <h3 className="mb-2 line-clamp-1 px-1.5 text-sm font-bold text-white drop-shadow-lg md:mb-2.5 md:text-base">
            {prompt.title}
          </h3>
        )}

        {isHome ? (
          /* ORIGINAL HOME LAYOUT */
          <div className="flex min-h-10 items-center justify-between w-full rounded-[1.2rem] border border-white/24 bg-white/22 px-2 py-2 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_16px_38px_rgba(0,0,0,0.26)] backdrop-blur-[28px] md:min-h-12 md:rounded-[1.35rem] md:px-4 md:py-2.5">
            <button
              className="rounded-full bg-gradient-to-r from-[#8b5cf6] to-[#ff6a3d] px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-white shadow-[0_10px_24px_rgba(139,92,246,0.25)] transition-transform active:scale-95 md:px-4 md:py-1.5 md:text-xs"
              onClick={handleCategoryClick}
              aria-label={`View category ${prompt.category}`}
            >
              {prompt.category}
            </button>
            <div className="flex items-center gap-2 md:gap-3.5">
              <button
                className="flex items-center gap-1 text-[11px] font-bold tracking-normal transition-transform active:scale-90 md:gap-1.5 md:text-sm"
                onClick={toggleLike}
                aria-label={liked ? 'Unlike prompt' : 'Like prompt'}
              >
                <Heart className="w-3.5 h-3.5 text-white md:w-4.5 md:h-4.5" fill={liked ? 'currentColor' : 'rgba(255,255,255,0.22)'} />
                <span className="ml-1">{formatCount(likes)}</span>
              </button>
              
              <div className="h-3 w-px bg-white/20" />

              <button
                className="flex items-center gap-1 text-[11px] font-bold tracking-normal md:gap-1.5 md:text-sm"
                onClick={stopCardNavigation}
                aria-label={`${formatCount(prompt.views)} views`}
              >
                <Eye className="w-3.5 h-3.5 md:w-4.5 md:h-4.5" />
                <span className="ml-1">{formatCount(prompt.views)}</span>
              </button>
            </div>
          </div>
        ) : (
          /* NEW MINIMAL EXPLORE / SAVED LAYOUT */
          <div className="flex items-center justify-around w-full rounded-full border border-white/24 bg-white/22 px-2.5 py-1 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_16px_38px_rgba(0,0,0,0.26)] backdrop-blur-[28px] md:px-4 md:py-1.5">
            <button
              className="flex items-center gap-1 text-[10px] font-extrabold tracking-normal transition-transform active:scale-90 md:gap-1.5 md:text-xs"
              onClick={toggleLike}
              aria-label={liked ? 'Unlike prompt' : 'Like prompt'}
            >
              <Heart className="w-3 h-3 text-white md:w-3.5 md:h-3.5" fill={liked ? 'currentColor' : 'rgba(255,255,255,0.22)'} />
              <span className="ml-0.5">{formatCount(likes)}</span>
            </button>
            
            <div className="h-2.5 w-px bg-white/20" />

            <button
              className="flex items-center gap-1 text-[10px] font-extrabold tracking-normal md:gap-1.5 md:text-xs"
              onClick={stopCardNavigation}
              aria-label={`${formatCount(prompt.views)} views`}
            >
              <Eye className="w-3 h-3 md:w-3.5 md:h-3.5" />
              <span className="ml-0.5">{formatCount(prompt.views)}</span>
            </button>

            <div className="h-2.5 w-px bg-white/20" />

            <button
              className="flex items-center gap-1 text-[10px] font-extrabold tracking-normal transition-transform active:scale-90 md:gap-1.5 md:text-xs"
              onClick={toggleSave}
              aria-label={saved ? 'Remove saved prompt' : 'Save prompt'}
            >
              <Bookmark className="w-3 h-3 text-white md:w-3.5 md:h-3.5" fill={saved ? 'currentColor' : 'none'} strokeWidth={2.4} />
            </button>
          </div>
        )}
      </div>
    </Link>
  );
}
