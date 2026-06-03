import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Bookmark, Copy, Check, Heart, Eye, Flame, Minus, Sparkles, Tag, Share2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { motion } from 'framer-motion';
import ImageCard, { Prompt } from '../components/ImageCard';
import { auth } from '../lib/firebase';
import { addRecentPrompt, readLocalActivity, saveUserActivity, setSavedPrompt, setLikedPrompt } from '../lib/activity';
import { useSearch } from '../context/SearchContext';
import { useIsMobileDevice } from '../utils/device';
import SEOMeta from '../components/common/SEOMeta';
import AuthorCard from '../components/common/AuthorCard';
import JsonLd from '../components/common/JsonLd';

interface PromptDetail extends Prompt {
  prompt_text?: string;
  negative_prompt?: string | null;
  tags?: string[];
  trending?: boolean;
  visibility?: string;
}



const formatCount = (value: number) => {
  if (value >= 1000) return `${Number((value / 1000).toFixed(1))}K`;
  return `${value}`;
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
  const [shared, setShared] = useState(false);

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

  useEffect(() => {
    const fetchPrompt = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/prompts/${id}`, { timeout: 15000 });
        const apiPrompt = response.data;
        setPrompt(apiPrompt);
        
        // Also fetch related prompts
        const relatedRes = await axios.get(`${API_BASE_URL}/api/prompts`, { params: { category: apiPrompt.category, limit: 5 }, timeout: 15000 });
        const relatedPrompts = Array.isArray(relatedRes.data) ? relatedRes.data : [];
        setRelated(relatedPrompts.filter(p => p.id !== id));
      } catch (error) {
        console.error("Error fetching prompt details:", error);
        setPrompt(null);
      } finally {
        setLoading(false);
      }
    };

    const { savedPrompts, likedPrompts } = readLocalActivity();
    setSaved(savedPrompts.some((item) => item.id === id));
    setLiked(likedPrompts.includes(id || ''));
    if (id) fetchPrompt();
  }, [id]);

  useEffect(() => {
    if (!prompt) return;

    addRecentPrompt(prompt);
    saveUserActivity(auth?.currentUser).catch(() => undefined);
    
    const ratioStr = prompt.aspectRatio || prompt.aspect_ratio;
    if (ratioStr && ratioStr.includes('/')) {
      const [w, h] = ratioStr.split('/').map(Number);
      if (!isNaN(w) && !isNaN(h)) {
        setIsPortrait(w < h);
        return;
      }
    }

    const img = new Image();
    img.onload = () => setIsPortrait(img.naturalWidth < img.naturalHeight);
    img.src = prompt.image_url;
  }, [prompt]);

  const copyText = async (text: string, type: 'prompt' | 'negative') => {
    await navigator.clipboard.writeText(text);
    if (type === 'prompt') {
      setCopiedPrompt(true);
      setTimeout(() => setCopiedPrompt(false), 1800);
      return;
    }

    setCopiedNegative(true);
    setTimeout(() => setCopiedNegative(false), 1800);
  };

  const toggleSave = () => {
    if (!prompt) return;

    const nextSaved = !saved;
    setSavedPrompt(prompt, nextSaved);
    setSaved(nextSaved);
    saveUserActivity(auth?.currentUser).catch(() => undefined);
  };

  const toggleLike = async () => {
    if (!prompt || !id) return;

    const nextLiked = !liked;
    setLiked(nextLiked);
    setLikedPrompt(id, nextLiked);
    
    // Update local count for immediate feedback
    setPrompt(prev => prev ? { ...prev, likes: prev.likes + (nextLiked ? 1 : -1) } : null);

    try {
      const data = new FormData();
      data.append('liked', String(nextLiked));
      await axios.post(`${API_BASE_URL}/api/prompts/${id}/like`, data);
      saveUserActivity(auth?.currentUser).catch(() => undefined);
    } catch (err) {
      console.error('Failed to sync like:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!prompt) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center text-center">
        <h2 className="text-xl font-bold text-[#171421]">Prompt not found.</h2>
      </div>
    );
  }

  const promptText = prompt.prompt_text || '';
  const negativePrompt = prompt.negative_prompt || '';

  const renderOverlays = () => (
    <>
      <div className="absolute left-3 right-3 top-3 md:left-4 md:right-4 md:top-4 z-10 flex items-center justify-between">
        <button
          onClick={handleBack}
          className="flex h-8 w-8 items-center justify-center rounded-[14px] bg-black/30 text-white shadow-[0_14px_34px_rgba(0,0,0,0.26)] backdrop-blur-3xl transition-transform active:scale-95 hover:bg-black/45 md:h-10 md:w-10 md:rounded-[18px]"
          aria-label="Go back"
        >
          <ArrowLeft className="h-4 w-4 md:h-5 md:w-5" />
        </button>
        <div className="flex items-center gap-1.5">
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
        </div>
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/72 via-transparent to-transparent pointer-events-none" />
      <div className="absolute bottom-3 left-3 right-3 md:bottom-4 md:left-4 md:right-4 flex flex-wrap items-center justify-between gap-2 md:gap-3">
        <div className="flex h-8 items-center gap-2 md:gap-3 rounded-full bg-white/18 px-3 text-white shadow-[0_14px_34px_rgba(0,0,0,0.24)] backdrop-blur-2xl md:h-10">
          <button 
            onClick={toggleLike}
            className="flex items-center gap-1.5 text-xs md:text-sm font-bold transition-transform active:scale-95 hover:text-white/80"
          >
            <Heart className={`h-4 w-4 md:h-5 md:w-5 transition-colors ${liked ? 'fill-current text-white' : 'text-white'}`} />
            {formatCount(prompt.likes)}
          </button>
          <span className="h-3 md:h-3.5 w-px bg-white/22" />
          <div className="flex items-center gap-1.5 text-xs md:text-sm font-bold">
            <Eye className="h-4 w-4 md:h-5 md:w-5" />
            {formatCount(prompt.views)}
          </div>
        </div>
        <span className="flex h-8 shrink-0 items-center justify-center whitespace-nowrap rounded-full bg-gradient-to-r from-[#6d4dec] to-[#ff6a3d] px-3 text-xs md:text-sm font-bold tracking-normal text-white shadow-[0_12px_28px_rgba(109,77,236,0.26)] md:h-10">
          {prompt.category}
        </span>
      </div>
    </>
  );

  const renderPromptDetails = () => (
    <>
      <section className="shrink-0 flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3 px-1">
          <div className="flex items-center gap-3">
            <Sparkles className="h-6 w-6 text-primary" />
            <h2 className="text-lg font-bold text-[#3a344c] dark:text-[#e4dcf5]">Prompt</h2>
          </div>
          <button
            onClick={() => copyText(promptText, 'prompt')}
            className="flex items-center gap-2 rounded-full bg-white/70 dark:bg-white/10 px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-white dark:hover:bg-white/20"
          >
            {copiedPrompt ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
            {copiedPrompt ? 'Copied' : 'Copy'}
          </button>
        </div>
        <div className="rounded-[1.5rem] bg-white/60 dark:bg-white/5 p-5 md:p-6 text-[15px] font-medium leading-relaxed text-[#4a445f] dark:text-[#c4bed6] whitespace-pre-wrap">
          {promptText}
        </div>
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
              className="flex items-center gap-2 rounded-full bg-white/70 dark:bg-white/10 px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-white dark:hover:bg-white/20"
            >
              {copiedNegative ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
              {copiedNegative ? 'Copied' : 'Copy'}
            </button>
          </div>
          <div className="rounded-[1.5rem] bg-white/60 dark:bg-white/5 p-5 md:p-6 text-[15px] font-medium leading-relaxed text-[#4a445f] dark:text-[#c4bed6] whitespace-pre-wrap">
            {negativePrompt}
          </div>
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
              <img
                src={prompt.image_url}
                alt={prompt.title}
                className="w-full h-auto md:w-auto md:max-w-full md:max-h-[calc(100vh-100px)] md:object-contain block mx-auto"
              />
              {renderOverlays()}
            </section>
          </div>

          {/* Right Column: Details */}
          <div className="w-full md:flex-1 flex flex-col gap-5 md:h-full min-h-0 min-w-0">
            <section className="px-1 shrink-0">
              <h1 className="text-2xl font-bold leading-tight tracking-tight text-[#171421] dark:text-white md:text-4xl lg:text-5xl line-clamp-3">
                {prompt.title}
              </h1>
              <p className="mt-3 text-sm font-medium text-[#756d8d] dark:text-[#a59eb8]">
                Generated with <span className="text-primary">{prompt.model}</span>
              </p>
            </section>

            <div className="flex-1 min-h-0 flex flex-col gap-2 overflow-y-auto hide-scrollbar pb-2">
              {renderPromptDetails()}
            </div>
          </div>
        </div>
      ) : (
        <>
          <section className="relative overflow-hidden rounded-[1.75rem] bg-transparent shadow-[0_22px_56px_rgba(32,26,54,0.18)] md:rounded-[2rem]">
            <img
              src={prompt.image_url}
              alt={prompt.title}
              className="w-full h-auto block"
            />
            {renderOverlays()}
          </section>

          <section className="px-1 mt-2">
            <h1 className="text-2xl font-bold tracking-tight text-[#171421] dark:text-white md:text-4xl">
              {prompt.title}
            </h1>
            <p className="mt-2 text-sm font-medium text-[#756d8d] dark:text-[#a59eb8]">
              Generated with <span className="text-primary">{prompt.model}</span>
            </p>
          </section>

          <div className="flex flex-col gap-2 mt-2">
            {renderPromptDetails()}
          </div>
        </>
      )}

      <section className="pb-4 md:mt-8">
        {/* Author Attribution */}
        <div className="mb-6">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#8d86a0]/60 mb-2">Curated by</p>
          <AuthorCard variant="compact" />
        </div>

        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white dark:bg-white/10 shadow-[0_12px_30px_rgba(255,106,61,0.16)]">
              <Flame className="h-5 w-5 text-[#ff6a3d]" fill="currentColor" />
            </span>
            <h2 className="text-[32px] font-bold leading-none text-[#171421] dark:text-white">More Like This</h2>
          </div>
          <button 
            onClick={() => navigate(`/explore?category=${encodeURIComponent(prompt.category)}`)}
            className="rounded-full px-3 py-2 text-sm font-medium text-primary hover:bg-primary/10 transition-colors"
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
    </motion.div>
  );
}

