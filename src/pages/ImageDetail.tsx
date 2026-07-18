import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Bookmark, Copy, Check, Heart, Eye, Flame, Minus, Sparkles, Tag, Share2, GalleryVerticalEnd, Download, Crown, Diamond, Star, ShieldCheck, FileText, Bot } from 'lucide-react';
import { useState, useEffect } from 'react';
import CollectionSelectModal from '../components/CollectionSelectModal';
import AuthModal from '../components/AuthModal';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { motion, AnimatePresence } from 'framer-motion';
import ImageCard, { Prompt } from '../components/ImageCard';
import { auth } from '../lib/firebase';
import { addRecentPrompt, readLocalActivity, saveUserActivity, setSavedPrompt, setLikedPrompt, onActivityUpdated, writeLocalActivity } from '../lib/activity';
import { useSearch } from '../context/SearchContext';
import { useIsMobileDevice } from '../utils/device';
import SEOMeta from '../components/common/SEOMeta';
import JsonLd from '../components/common/JsonLd';
import { DetailSkeleton } from '../components/common/Skeleton';
import ImageGallery from '../components/ImageGallery';
import AnimatedQualityBadge from '../components/AnimatedQualityBadge';

interface PromptDetail extends Prompt {
  prompt_text?: string;
  negative_prompt?: string | null;
  advanced_prompt?: string | null;
  professional_prompt?: string | null;
  tags?: string[];
  trending?: boolean;
  visibility?: string;
  copies?: number;
}



const formatCount = (value: number) => {
  if (!value) return '0';
  if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M';
  if (value >= 1000) return (value / 1000).toFixed(1) + 'K';
  return value.toString();
};

const InlineCategoryQualityPill = ({ prompt }: { prompt: PromptDetail }) => {
  const [frameIndex, setFrameIndex] = useState(0);

  const score = prompt.final_quality_score;
  const getTopPercentile = (s: number) => {
    if (s >= 95) return 1;
    if (s >= 90) return 5;
    if (s >= 80) return 15;
    if (s >= 70) return 30;
    return 50;
  };

  const getTierConfig = (s?: number) => {
    if (!s) return null;
    if (s >= 95) return { bg: 'from-amber-500/80 to-amber-600/80', border: 'border-amber-400/50', Icon: Crown, name: 'Elite' };
    if (s >= 90) return { bg: 'from-blue-500/80 to-blue-600/80', border: 'border-blue-400/50', Icon: Diamond, name: 'Premium' };
    if (s >= 80) return { bg: 'from-purple-500/80 to-purple-600/80', border: 'border-purple-400/50', Icon: Star, name: 'Excellent' };
    if (s >= 70) return { bg: 'from-green-500/80 to-green-600/80', border: 'border-green-400/50', Icon: ShieldCheck, name: 'Verified' };
    return { bg: 'from-white/20 to-white/10', border: 'border-white/30', Icon: FileText, name: 'Standard' };
  };

  const tier = getTierConfig(score);

  const frames = [
    { type: 'category', content: prompt.category, bg: 'from-[#6d4dec] to-[#ff6a3d]', border: 'border-transparent' }
  ];

  if (tier) {
    frames.push(
      { type: 'badge', content: `${score}/100`, bg: tier.bg, border: tier.border },
      { type: 'badge', content: 'AI Rated', bg: tier.bg, border: tier.border },
      { type: 'badge', content: `Top ${getTopPercentile(score!)}%`, bg: tier.bg, border: tier.border }
    );
  }

  useEffect(() => {
    const interval = setInterval(() => {
      setFrameIndex(prev => (prev + 1) % frames.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [frames.length]);

  const currentFrame = frames[frameIndex] || frames[0];
  const isBadge = currentFrame.type === 'badge';

  return (
    <div className={`relative flex h-8 md:h-10 items-center justify-center rounded-full border transition-all duration-500 overflow-hidden min-w-[135px] md:min-w-[155px] bg-gradient-to-r shadow-[0_12px_28px_rgba(0,0,0,0.15)] box-border ${currentFrame.bg} ${currentFrame.border}`}>
       {/* Invisible sizer to ensure the pill is always wide enough for the category text */}
       <span className="invisible whitespace-nowrap text-xs md:text-sm font-bold px-4 pointer-events-none">
         {prompt.category}
       </span>

       {/* Absolute container for the animated content */}
       <div className="absolute inset-0 flex items-center justify-center px-3.5 w-full h-full">
         <AnimatePresence mode="wait">
            {isBadge ? (
               <motion.div 
                  key="badge-layout"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-center justify-between w-full h-full absolute inset-0 px-3.5"
               >
                  <div className="flex items-center gap-1 z-10 pr-2 shrink-0">
                     {tier && <tier.Icon className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />}
                     <span className="text-xs md:text-sm font-bold text-white tracking-wide">{tier?.name}</span>
                  </div>
                  <div className="flex-1 relative flex items-center justify-end h-full">
                     <AnimatePresence mode="wait">
                        <motion.span
                           key={frameIndex}
                           initial={{ y: 15, opacity: 0 }}
                           animate={{ y: 0, opacity: 1 }}
                           exit={{ y: -15, opacity: 0 }}
                           transition={{ duration: 0.3 }}
                           className="whitespace-nowrap text-xs md:text-sm font-bold text-white tracking-normal absolute right-0"
                        >
                           {currentFrame.content}
                        </motion.span>
                     </AnimatePresence>
                  </div>
               </motion.div>
            ) : (
               <motion.div 
                  key="category-layout"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-center justify-center w-full h-full absolute inset-0 px-3.5"
               >
                  <span className="whitespace-nowrap text-xs md:text-sm font-bold tracking-normal text-white">
                     {currentFrame.content}
                  </span>
               </motion.div>
            )}
         </AnimatePresence>
       </div>
    </div>
  );
};

const getModelUrl = (model: string): string => {
  const name = model.toLowerCase();
  
  if (name.includes('chatgpt') || name.includes('dall-e') || name.includes('dalle') || name.includes('gpt')) {
    return 'https://chatgpt.com/';
  }
  if (name.includes('claude')) {
    return 'https://claude.ai/new';
  }
  if (name.includes('gemini')) {
    return 'https://gemini.google.com/app';
  }
  if (name.includes('copilot') || name.includes('bing')) {
    return 'https://copilot.microsoft.com/';
  }
  if (name.includes('meta') || name.includes('llama')) {
    return 'https://www.meta.ai/';
  }
  if (name.includes('midjourney') || name.includes('niji')) {
    return 'https://discord.com/app';
  }
  if (name.includes('leonardo')) {
    return 'https://app.leonardo.ai/';
  }
  if (name.includes('flux')) {
    return 'https://fal.ai/models/fal-ai/flux/dev';
  }
  if (name.includes('stable diffusion') || name.includes('sdxl') || name.includes('sd3')) {
    return 'https://clipdrop.co/stable-diffusion';
  }
  
  return `https://www.google.com/search?q=${encodeURIComponent(model)}`;
};

export default function ImageDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { setSearchQuery } = useSearch();
  const isMobile = useIsMobileDevice();
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [copiedNegative, setCopiedNegative] = useState(false);
  const [prompt, setPrompt] = useState<PromptDetail | null>(null);
  const [related, setRelated] = useState<PromptDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [liked, setLiked] = useState(false);
  const [inCollection, setInCollection] = useState(false);
  const [shared, setShared] = useState(false);
  const [collectionModalOpen, setCollectionModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [showHeart, setShowHeart] = useState(false);
  const [heartKey, setHeartKey] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [activeVersion, setActiveVersion] = useState<'Basic' | 'Advanced' | 'Professional'>('Basic');


  const hasMultipleVersions = Boolean(prompt?.advanced_prompt || prompt?.professional_prompt);
  const activePromptText = activeVersion === 'Advanced' && prompt?.advanced_prompt 
    ? prompt.advanced_prompt 
    : activeVersion === 'Professional' && prompt?.professional_prompt 
    ? prompt.professional_prompt 
    : prompt?.prompt_text || '';

  const handleShare = async () => {
    if (!prompt) return;

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
  
    const handleDownload = async () => {
      if (!prompt) return;
      try {
        const imageUrl = galleryImages[currentImageIndex];
        const cleanTitle = prompt.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const filename = `${cleanTitle}-${currentImageIndex + 1}.png`;
  
        const response = await fetch(imageUrl, { mode: 'cors' });
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
  
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(blobUrl);
      } catch (err) {
        console.warn("Direct blob download failed, opening in new window:", err);
        window.open(galleryImages[currentImageIndex], '_blank');
      }
    };

  const handleTagClick = (tag: string) => {
    setSearchQuery(tag);
    navigate('/explore');
  };

  const handleBack = () => {
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  const [isPortrait, setIsPortrait] = useState(false);

  // Disable browser scroll restoration and force scrollTo(0,0) immediately on route load
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    
    // Scroll immediately to the top of the viewport
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    
    // Re-apply slightly later to handle paint/render layout offsets
    const t1 = setTimeout(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }, 20);
    const t2 = setTimeout(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }, 60);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [id]);

  // Also force scroll to top when detail data renders and replaces the skeleton
  useEffect(() => {
    if (!loading) {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      const timer = setTimeout(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [loading]);

  useEffect(() => {
    const fetchPrompt = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/prompts/${id}`, { timeout: 15000 });
        const apiPrompt = response.data;
        
        // Determine aspect ratio and orientation immediately
        const ratioStr = apiPrompt.aspectRatio || apiPrompt.aspect_ratio;
        let portraitDetected = false;
        let ratioParsed = false;

        if (ratioStr && ratioStr.includes('/')) {
          const [w, h] = ratioStr.split('/').map(Number);
          if (!isNaN(w) && !isNaN(h)) {
            portraitDetected = w < h;
            ratioParsed = true;
          }
        }

        const finalizeLoad = (isPort: boolean) => {
          setIsPortrait(isPort);
          setPrompt(apiPrompt);
          setLoading(false);
        };

        if (ratioParsed) {
          finalizeLoad(portraitDetected);
        } else {
          // If no aspect ratio metadata is in the database, preload the image first
          // to determine natural dimensions before dismissing the skeleton loader.
          const img = new Image();
          img.onload = () => {
            finalizeLoad(img.naturalWidth < img.naturalHeight);
          };
          img.onerror = () => {
            finalizeLoad(false); // Fallback
          };
          img.src = apiPrompt.image_url;
        }

        // Fetch related prompts in parallel
        try {
          const relatedRes = await axios.get(`${API_BASE_URL}/api/prompts`, { params: { limit: 100 }, timeout: 15000 });
          const relatedPrompts = Array.isArray(relatedRes.data) ? relatedRes.data : [];
          const filtered = relatedPrompts.filter(p => p.id !== id);
          
          filtered.forEach((p: any) => {
             let score = 0;
             const pTags = Array.isArray(p.tags) ? p.tags : [];
             const apiTags = Array.isArray(apiPrompt.tags) ? apiPrompt.tags : [];
             const sharedTags = pTags.filter(t => apiTags.includes(t));
             score += sharedTags.length * 4;
             if (p.model === apiPrompt.model) score += 3;
             if (p.category === apiPrompt.category) score += 2;
             const pTitleWords = p.title.toLowerCase().split(/\s+/);
             const apiTitleWords = apiPrompt.title.toLowerCase().split(/\s+/);
             const sharedWords = pTitleWords.filter(w => w.length > 3 && apiTitleWords.includes(w));
             score += sharedWords.length * 1;
             p._relatedScore = score;
          });
          
          filtered.sort((a: any, b: any) => (b._relatedScore || 0) - (a._relatedScore || 0));
          setRelated(filtered.slice(0, 5));
        } catch (relatedErr) {
          console.error("Failed to fetch related prompts:", relatedErr);
        }
      } catch (error) {
        console.error("Error fetching prompt details:", error);
        setPrompt(null);
        setLoading(false);
      }
    };

    if (id) fetchPrompt();
  }, [id]);

  useEffect(() => {
    if (!id) return;
    const updateStates = () => {
      const isGuest = !auth?.currentUser;
      const { savedPrompts, likedPrompts, collections } = readLocalActivity();
      setSaved(!isGuest && savedPrompts.some((item) => item.id === id));
      setLiked(likedPrompts.includes(id));
      setInCollection(!isGuest && (collections || []).some(c => c.prompts.some(p => p.id === id)));
    };
    updateStates();

    const unsubscribeActivity = onActivityUpdated(updateStates);
    const unsubscribeAuth = auth ? auth.onAuthStateChanged(updateStates) : () => {};

    return () => {
      unsubscribeActivity();
      unsubscribeAuth();
    };
  }, [id]);

  useEffect(() => {
    if (!prompt) return;

    addRecentPrompt(prompt);
    saveUserActivity(auth?.currentUser).catch(() => undefined);
  }, [prompt]);

  const copyText = async (text: string, type: 'prompt' | 'negative') => {
    await navigator.clipboard.writeText(text);
    if (type === 'prompt') {
      setCopiedPrompt(true);
      setTimeout(() => setCopiedPrompt(false), 1800);
      if (prompt) {
        setPrompt(prev => prev ? { ...prev, copies: (prev.copies || 0) + 1 } : null);
        axios.post(`${API_BASE_URL}/api/prompts/${prompt.id}/copy`).catch(() => undefined);
      }
      return;
    }

    setCopiedNegative(true);
    setTimeout(() => setCopiedNegative(false), 1800);
  };

  const toggleSave = (event: React.MouseEvent) => {
    if (!prompt) return;

    if (!auth?.currentUser) {
      setAuthModalOpen(true);
      return;
    }

    const nextSaved = !saved;
    setSavedPrompt(prompt, nextSaved);
    setSaved(nextSaved);
    saveUserActivity(auth?.currentUser).catch(() => undefined);

    const btn = event.currentTarget as HTMLElement;
    const rect = btn?.getBoundingClientRect();
    if (nextSaved && rect) {
      const animEvent = new CustomEvent('prompt-saved-animation', {
        detail: {
          imageUrl: prompt.image_url,
          startX: rect.left,
          startY: rect.top,
          startWidth: rect.width || 40,
          startHeight: rect.height || 40
        }
      });
      window.dispatchEvent(animEvent);
    }
  };

  const toggleLike = async () => {
    if (!prompt || !id) return;

    const nextLiked = !liked;
    setLiked(nextLiked);
    setLikedPrompt(id, nextLiked);
    
    // Update local count for immediate feedback
    setPrompt(prev => prev ? { ...prev, likes: prev.likes + (nextLiked ? 1 : -1) } : null);

    if (nextLiked) {
      setHeartKey((prev) => prev + 1);
      setShowHeart(true);
    }

    try {
      const data = new FormData();
      data.append('liked', String(nextLiked));
      await axios.post(`${API_BASE_URL}/api/prompts/${id}/like`, data);
      saveUserActivity(auth?.currentUser).catch(() => undefined);
    } catch (err) {
      console.error('Failed to sync like:', err);
    }
  };

  const handleImageDoubleClick = () => {
    if (!liked) {
      toggleLike();
    } else {
      setHeartKey((prev) => prev + 1);
      setShowHeart(true);
    }
  };

  const renderHeartPopup = () => (
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
  );

  const handleCollectionClick = async () => {
    if (!prompt) return;

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

  const location = useLocation();
  const stateIsPortrait = location.state?.isPortrait;
  const stateHasMultipleImages = location.state?.hasMultipleImages;

  if (loading) {
    return <DetailSkeleton isPortrait={stateIsPortrait ?? true} hasMultipleImages={stateHasMultipleImages ?? false} />;
  }


  if (!prompt) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center text-center">
        <h2 className="text-xl font-bold text-[#171421]">Prompt not found.</h2>
      </div>
    );
  }

  const promptText = activePromptText;
  const negativePrompt = prompt.negative_prompt || '';
  const rawImages = prompt.images && prompt.images.length > 0 ? prompt.images : [prompt.image_url];
  const galleryImages = Array.from(new Set(rawImages)).filter(Boolean);

  const renderOverlays = () => (
    <>
      <div className="absolute left-3 right-3 top-3 md:left-4 md:right-4 md:top-4 z-10 flex items-start justify-between">
        <div className="flex flex-col items-center gap-2">
          <button
            onClick={handleBack}
            className="flex h-8 w-8 items-center justify-center rounded-[14px] bg-black/30 text-white shadow-[0_14px_34px_rgba(0,0,0,0.26)] backdrop-blur-3xl transition-transform active:scale-95 hover:bg-black/45 md:h-10 md:w-10 md:rounded-[18px]"
            aria-label="Go back"
          >
            <ArrowLeft className="h-4 w-4 md:h-5 md:w-5" />
          </button>
          <button
            onClick={handleDownload}
            className="flex h-8 w-8 items-center justify-center rounded-[14px] bg-black/30 text-white shadow-[0_14px_34px_rgba(0,0,0,0.26)] backdrop-blur-3xl transition-transform active:scale-95 hover:bg-black/45 md:h-10 md:w-10 md:rounded-[18px]"
            aria-label="Download image"
          >
            <Download className="h-4 w-4 md:h-5 md:w-5 text-white" />
          </button>
          {galleryImages.length > 1 && (
            <div className="flex h-8 w-8 items-center justify-center rounded-[14px] bg-black/30 text-white font-bold text-[10px] shadow-[0_14px_34px_rgba(0,0,0,0.26)] backdrop-blur-3xl select-none md:h-10 md:w-10 md:rounded-[18px] md:text-[12px] pointer-events-none">
              {currentImageIndex + 1}/{galleryImages.length}
            </div>
          )}
        </div>
        <div className="flex flex-col items-center gap-2">
          <button
            onClick={handleShare}
            className="flex h-8 w-8 items-center justify-center rounded-[14px] bg-black/30 text-white shadow-[0_14px_34px_rgba(0,0,0,0.26)] backdrop-blur-3xl transition-transform active:scale-95 hover:bg-black/45 md:h-10 md:w-10 md:rounded-[18px]"
            aria-label="Share prompt"
          >
            {shared ? <Check className="h-4 w-4 md:h-5 md:w-5 text-emerald-400" /> : <Share2 className="h-4 w-4 md:h-5 md:w-5" />}
          </button>
          <button
            onClick={toggleSave}
            className="flex h-8 w-8 items-center justify-center rounded-[14px] bg-black/30 text-white shadow-[0_14px_34px_rgba(0,0,0,0.26)] backdrop-blur-3xl transition-transform active:scale-95 hover:bg-black/45 md:h-10 md:w-10 md:rounded-[18px]"
            aria-label={saved ? 'Remove saved prompt' : 'Save prompt'}
          >
            <Bookmark className="h-4 w-4 md:h-5 md:w-5" fill={saved ? 'currentColor' : 'none'} />
          </button>
          <button
            onClick={handleCollectionClick}
            className="flex h-8 w-8 items-center justify-center rounded-[14px] bg-black/30 text-white shadow-[0_14px_34px_rgba(0,0,0,0.26)] backdrop-blur-3xl transition-transform active:scale-95 hover:bg-black/45 md:h-10 md:w-10 md:rounded-[18px]"
            aria-label="Add to Collection"
          >
            <GalleryVerticalEnd 
              className="h-4 w-4 md:h-5 md:w-5 text-white"
              fill={inCollection ? 'currentColor' : 'none'}
            />
          </button>
        </div>
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/72 via-transparent to-transparent pointer-events-none" />
      <div className="absolute bottom-3 left-3 right-3 md:bottom-4 md:left-4 md:right-4 flex flex-wrap items-center justify-between gap-2 md:gap-3">
        <div className="flex h-8 items-center gap-2 md:gap-3 rounded-full bg-white/18 px-3 text-white shadow-[0_14px_34px_rgba(0,0,0,0.24)] backdrop-blur-2xl md:h-10">
          <button 
            onClick={toggleLike}
            className="flex items-center gap-1.5 text-xs md:text-sm font-bold transition-transform active:scale-95 hover:text-white/80"
          >
            <motion.span
              key={liked ? 'liked' : 'unliked'}
              initial={liked ? { scale: 0.8 } : false}
              animate={liked ? { scale: [0.8, 1.3, 1] } : { scale: 1 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="flex items-center justify-center"
            >
              <Heart className="h-4 w-4 md:h-5 md:w-5 transition-colors" fill={liked ? '#ff4b72' : 'none'} stroke={liked ? '#ff4b72' : 'currentColor'} />
            </motion.span>
            {formatCount(prompt.likes)}
          </button>
          <span className="h-3 md:h-3.5 w-px bg-white/22" />
          <div className="flex items-center gap-1.5 text-xs md:text-sm font-bold">
            <Eye className="h-4 w-4 md:h-5 md:w-5" />
            {formatCount(prompt.views)}
          </div>
        </div>
        <div className="relative flex shrink-0">
          <InlineCategoryQualityPill prompt={prompt} />
        </div>
      </div>
    </>
  );

  const handleModelClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!prompt) return;
    
    navigator.clipboard.writeText(promptText).then(() => {
      const toast = document.createElement('div');
      toast.className = 'fixed top-20 left-1/2 -translate-x-1/2 bg-[#171421] text-white px-4 py-2 rounded-full font-bold text-sm shadow-xl z-50 flex items-center gap-2 animate-in fade-in slide-in-from-top-5';
      toast.innerHTML = `<svg class="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg> Prompt copied to clipboard!`;
      document.body.appendChild(toast);
      setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.3s ease';
        setTimeout(() => document.body.removeChild(toast), 300);
      }, 3000);
      
      setPrompt(prev => prev ? { ...prev, copies: (prev.copies || 0) + 1 } : null);
      axios.post(`${API_BASE_URL}/api/prompts/${prompt.id}/copy`).catch(() => undefined);
      
      window.open(getModelUrl(prompt.model), '_blank');
    });
  };

  const renderPromptDetails = () => (
    <>
      {hasMultipleVersions && (
        <div className="flex p-1.5 gap-1.5 w-full bg-white/40 dark:bg-white/5 backdrop-blur-md rounded-full border border-white/20 mb-2">
          {['Basic', 'Advanced', 'Professional'].map((ver) => {
            const isAvailable = ver === 'Basic' || (ver === 'Advanced' && prompt?.advanced_prompt) || (ver === 'Professional' && prompt?.professional_prompt);
            if (!isAvailable) return null;
            return (
              <button
                key={ver}
                onClick={() => setActiveVersion(ver as any)}
                className={`flex-1 py-1.5 md:py-2 px-3 text-xs md:text-sm font-bold rounded-full transition-all ${
                  activeVersion === ver 
                    ? 'bg-white text-primary shadow-sm dark:bg-white/20 dark:text-white' 
                    : 'text-[#4a445f] hover:bg-white/40 dark:text-[#c4bed6] dark:hover:bg-white/10'
                }`}
              >
                {ver}
              </button>
            )
          })}
        </div>
      )}
      <section className="shrink-0 flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3 px-1">
          <div className="flex items-center gap-3">
            <Sparkles className="h-6 w-6 text-primary" />
            <h2 className="text-lg font-bold text-[#3a344c] dark:text-[#e4dcf5]">Prompt</h2>
          </div>
          <button
            onClick={() => copyText(promptText, 'prompt')}
            className="flex md:hidden relative items-center gap-2 rounded-full bg-white/40 dark:bg-white/10 border border-white/50 dark:border-white/10 backdrop-blur-md px-4 py-2 text-sm font-medium text-primary shadow-sm transition-all hover:bg-white/70 dark:hover:bg-white/25 active:scale-95 overflow-hidden"
          >
            <AnimatePresence mode="wait">
              {copiedPrompt ? (
                <motion.div key="copied" initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -10, opacity: 0 }} className="flex items-center gap-2">
                  <Check className="h-5 w-5" />
                  <span>Copied</span>
                </motion.div>
              ) : (
                <motion.div key="copy" initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -10, opacity: 0 }} className="flex items-center gap-2">
                  <Copy className="h-5 w-5" />
                  <span className="whitespace-nowrap">Copy Prompt &bull; {formatCount(prompt.copies || 0)} Copies</span>
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </div>
        <motion.div
          animate={copiedPrompt ? {
            scaleX: [1, 1.05, 0.95, 1.02, 0.98, 1],
            scaleY: [1, 0.95, 1.05, 0.98, 1.02, 1],
          } : {}}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative overflow-hidden rounded-[1.5rem] bg-white/40 dark:bg-white/5 border border-white/40 dark:border-white/10 backdrop-blur-md p-5 md:p-6 text-[15px] font-medium leading-relaxed text-[#4a445f] dark:text-[#c4bed6] whitespace-pre-wrap transition-all duration-300"
        >
          {promptText}
        </motion.div>
      </section>

      {negativePrompt && (
        <section className="shrink-0 flex flex-col gap-3 mt-4">
          <div className="flex items-center justify-between gap-3 px-1">
            <div className="flex items-center gap-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#f05aa8]/12 text-[#f05aa8]">
                <Minus className="h-5 w-5" />
              </span>
              <h2 className="text-lg font-bold text-[#3a344c] dark:text-[#e4dcf5]">Negative Prompt</h2>
            </div>
            <button
              onClick={() => copyText(negativePrompt, 'negative')}
              className="flex items-center gap-2 rounded-full bg-white/40 dark:bg-white/10 border border-white/50 dark:border-white/10 backdrop-blur-md px-4 py-2 text-sm font-medium text-primary shadow-sm transition-all hover:bg-white/70 dark:hover:bg-white/25 active:scale-95"
            >
              {copiedNegative ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
              {copiedNegative ? 'Copied' : 'Copy'}
            </button>
          </div>
          <motion.div
            animate={copiedNegative ? {
              scaleX: [1, 1.05, 0.95, 1.02, 0.98, 1],
              scaleY: [1, 0.95, 1.05, 0.98, 1.02, 1],
            } : {}}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="relative overflow-hidden rounded-[1.5rem] bg-white/40 dark:bg-white/5 border border-white/40 dark:border-white/10 backdrop-blur-md p-5 md:p-6 text-[15px] font-medium leading-relaxed text-[#4a445f] dark:text-[#c4bed6] whitespace-pre-wrap transition-all duration-300"
          >
            {negativePrompt}
          </motion.div>
        </section>
      )}

      {prompt.tags && prompt.tags.length > 0 && (
        <section className="shrink-0 flex flex-col gap-2 mt-5 pt-4">
          <div className="flex items-center gap-2 px-1">
            <Tag className="h-4 w-4 text-primary opacity-70" />
            <h2 className="text-[11px] font-bold text-[#5f5774] dark:text-[#c4bed6] uppercase tracking-widest opacity-80">Tags</h2>
          </div>
          <div className="w-full flex flex-wrap items-center gap-x-3 gap-y-1.5 px-1 mt-1">
            {[...prompt.tags]
              .sort((a, b) => a.length - b.length)
              .map((tag, idx) => (
                <button
                  key={idx}
                  onClick={() => handleTagClick(tag)}
                  className="text-[10px] font-bold text-[#756d8d] dark:text-[#afa6c8] hover:text-primary dark:hover:text-primary transition-colors uppercase tracking-widest opacity-60 hover:opacity-100 cursor-pointer"
                >
                  #{tag.trim()}
                </button>
              ))}
          </div>
        </section>
      )}
    </>
  );


  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`mx-auto flex w-full flex-col ${isPortrait ? 'max-w-[1440px] gap-6 md:gap-10' : 'max-w-4xl gap-5'}`}
    >
      <SEOMeta
        title={`${prompt.title} Prompt | Promptro`}
        description={`Copy and explore ${prompt.title} ${prompt.category} AI image prompt. Generated with ${prompt.model}.`}
        keywords={`${prompt.title}, ${prompt.category} prompt, AI image prompt, ${prompt.model} prompt, Promptro`}
        ogImage={prompt.image_url}
        ogType="article"
        author="Mohammad Asad Ansari"
        breadcrumbs={[
          { name: 'Home', url: 'https://promptro.in' },
          { name: prompt.category, url: `https://promptro.in/explore?category=${encodeURIComponent(prompt.category)}` },
          { name: prompt.title, url: `https://promptro.in/prompt/${prompt.id}` },
        ]}
      />
      <JsonLd
        id={`img-obj-${prompt.id}`}
        schema={{
          '@context': 'https://schema.org',
          '@type': 'CreativeWork',
          name: prompt.title,
          description: `${prompt.title} AI image prompt for ${prompt.category} style. Generated with ${prompt.model}.`,
          image: prompt.image_url,
          url: `https://promptro.in/prompt/${prompt.id}`,
          genre: prompt.category,
          keywords: Array.isArray(prompt.tags) ? prompt.tags.join(', ') : '',
          datePublished: prompt.created_at || new Date().toISOString().split('T')[0],
          dateModified: prompt.updated_at || prompt.created_at || new Date().toISOString().split('T')[0],
          author: {
            '@type': 'Person',
            name: 'Mohammad Asad Ansari',
            jobTitle: 'Founder & Developer',
            url: 'https://promptro.in/about',
          },
          publisher: {
            '@type': 'Organization',
            name: 'Promptro',
            url: 'https://promptro.in',
            logo: {
              '@type': 'ImageObject',
              url: 'https://promptro.in/brand/logo.png',
            },
          },
          inLanguage: 'en',
          isAccessibleForFree: true,
          license: 'https://promptro.in/terms',
        }}
      />
      {isPortrait ? (
        <div className="flex flex-col md:flex-row gap-5 md:gap-10 lg:gap-12 md:h-[calc(100vh-100px)] md:min-h-[500px]">
          {/* Left Column: Image */}
          <div className="w-full md:w-auto md:max-w-[55%] flex-shrink-0 md:h-full min-h-0 min-w-0 flex items-center justify-center md:justify-start">
            <section className="relative w-full overflow-hidden rounded-[1.75rem] bg-transparent shadow-[0_22px_56px_rgba(32,26,54,0.18)] md:rounded-[2rem] md:w-fit md:h-fit max-w-full md:max-h-full">
              <ImageGallery
                images={galleryImages}
                title={prompt.title}
                aspectRatio={prompt.aspectRatio || prompt.aspect_ratio}
                onDoubleClick={handleImageDoubleClick}
                isPortrait={true}
                onIndexChange={setCurrentImageIndex}
                showNumbering={false}
              />
              {renderHeartPopup()}
              {renderOverlays()}
            </section>
          </div>

          {/* Right Column: Details */}
          <div className="w-full md:flex-1 flex flex-col gap-5 md:h-full min-h-0 min-w-0">
            <section className="px-1 shrink-0 flex flex-col gap-1">
              <h1 className="text-2xl font-bold leading-tight tracking-tight text-[#171421] dark:text-white md:text-4xl lg:text-5xl line-clamp-3">
                {prompt.title}
              </h1>
              <div className="flex items-center justify-between gap-3 mt-1.5">
                <p className="text-sm font-medium text-[#756d8d] dark:text-[#a59eb8]">
                  Generated with{' '}
                  <button
                    onClick={handleModelClick}
                    className="text-primary hover:underline font-bold"
                  >
                    {prompt.model}
                  </button>
                </p>

                <button
                  onClick={() => copyText(promptText, 'prompt')}
                  className="hidden md:flex relative items-center gap-2 rounded-full bg-white/40 dark:bg-white/10 border border-white/50 dark:border-white/10 backdrop-blur-md px-4 py-2 text-sm font-medium text-primary shadow-sm transition-all hover:bg-white/70 dark:hover:bg-white/25 active:scale-95 shrink-0 overflow-hidden"
                >
                  <AnimatePresence mode="wait">
                    {copiedPrompt ? (
                      <motion.div key="copied" initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -10, opacity: 0 }} className="flex items-center gap-2">
                        <Check className="h-5 w-5" />
                        <span>Copied</span>
                      </motion.div>
                    ) : (
                      <motion.div key="copy" initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -10, opacity: 0 }} className="flex items-center gap-2">
                        <Copy className="h-5 w-5" />
                        <span className="whitespace-nowrap">Copy Prompt &bull; {formatCount(prompt.copies || 0)} Copies</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </button>
              </div>
            </section>

            <div className="flex-1 min-h-0 flex flex-col gap-2 overflow-y-auto hide-scrollbar pb-2 rounded-t-[1.5rem] md:rounded-t-[2rem]">
              {renderPromptDetails()}
            </div>
          </div>
        </div>
      ) : (
        <>
          <section className="relative overflow-hidden rounded-[1.75rem] bg-transparent shadow-[0_22px_56px_rgba(32,26,54,0.18)] md:rounded-[2rem]">
            <ImageGallery
              images={galleryImages}
              title={prompt.title}
              aspectRatio={prompt.aspectRatio || prompt.aspect_ratio}
              onDoubleClick={handleImageDoubleClick}
              isPortrait={false}
              onIndexChange={setCurrentImageIndex}
              showNumbering={false}
            />
            {renderHeartPopup()}
            {renderOverlays()}
          </section>

          <section className="px-1 mt-2 flex flex-col gap-1">
            <h1 className="text-2xl font-bold tracking-tight text-[#171421] dark:text-white md:text-4xl">
              {prompt.title}
            </h1>
            <div className="flex items-center justify-between gap-3 mt-1">
              <p className="text-sm font-medium text-[#756d8d] dark:text-[#a59eb8]">
                Generated with{' '}
                <button
                  onClick={handleModelClick}
                  className="text-primary hover:underline font-bold"
                >
                  {prompt.model}
                </button>
              </p>

              <button
                onClick={() => copyText(promptText, 'prompt')}
                className="hidden md:flex relative items-center gap-2 rounded-full bg-white/40 dark:bg-white/10 border border-white/50 dark:border-white/10 backdrop-blur-md px-4 py-2 text-sm font-medium text-primary shadow-sm transition-all hover:bg-white/70 dark:hover:bg-white/25 active:scale-95 shrink-0 overflow-hidden"
              >
                <AnimatePresence mode="wait">
                  {copiedPrompt ? (
                    <motion.div key="copied" initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -10, opacity: 0 }} className="flex items-center gap-2">
                      <Check className="h-5 w-5" />
                      <span>Copied</span>
                    </motion.div>
                  ) : (
                    <motion.div key="copy" initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -10, opacity: 0 }} className="flex items-center gap-2">
                      <Copy className="h-5 w-5" />
                      <span className="whitespace-nowrap">Copy Prompt &bull; {formatCount(prompt.copies || 0)} Copies</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            </div>
          </section>

          <div className="flex flex-col gap-2 mt-2">
            {renderPromptDetails()}
          </div>
        </>
      )}
      <section className="pb-4 md:mt-8">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 md:gap-3 min-w-0">
            <span className="flex h-8 w-8 md:h-10 md:w-10 shrink-0 items-center justify-center rounded-full bg-white dark:bg-white/10 shadow-[0_12px_30px_rgba(255,106,61,0.16)]">
              <Flame className="h-4.5 w-4.5 md:h-5 md:w-5 text-[#ff6a3d]" fill="currentColor" />
            </span>
            <h2 className="text-lg md:text-2xl lg:text-[32px] font-bold leading-none text-[#171421] dark:text-white truncate">More Like This</h2>
          </div>
          <button 
            onClick={() => navigate(`/explore?category=${encodeURIComponent(prompt.category)}`)}
            className="rounded-full px-3 py-1.5 md:py-2 text-xs md:text-sm font-bold text-primary hover:bg-primary/10 transition-colors shrink-0 whitespace-nowrap"
          >
            View all
          </button>
        </div>
        <div className={isMobile && window.innerWidth >= 768 ? "grid grid-cols-2 gap-3" : "grid grid-cols-2 gap-3 md:grid-cols-4"}>
          {related.slice(0, 4).map((item) => (
            <ImageCard key={item.id} prompt={item} />
          ))}
        </div>
      </section>
      <CollectionSelectModal 
        isOpen={collectionModalOpen} 
        onClose={() => setCollectionModalOpen(false)} 
        prompt={prompt} 
      />
      <AuthModal 
        isOpen={authModalOpen} 
        onClose={() => setAuthModalOpen(false)} 
      />
    </motion.div>
  );
}

