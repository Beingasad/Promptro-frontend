import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import SEOMeta from '../components/common/SEOMeta';
import PuterAuthModal from '../components/PuterAuthModal';
import { generateStyleMixerPrompt, isPuterSignedIn, signInWithPuter } from '../lib/puter';
import { SparkleIcon } from '../components/icons/SparkleIcon';

// Compact options matching user requirements
const STYLE_OPTIONS: string[] = [
  'Cinematic',
  'Photorealistic',
  'Anime',
  'Cyberpunk',
  'Luxury',
  'Editorial',
  '3D Render',
];

const LIGHTING_OPTIONS: string[] = [
  'Golden Hour',
  'Neon',
  'Studio',
  'Soft Light',
  'Dramatic',
  'Volumetric',
];

const CAMERA_OPTIONS: string[] = [
  '50mm',
  '85mm',
  'Wide Angle',
  '35mm',
  'Macro',
  'Telephoto',
];

const MOOD_OPTIONS: string[] = [
  'Dreamy',
  'Moody',
  'Epic',
  'Dark',
  'Futuristic',
  'Mysterious',
];

const PRESET_EXAMPLES = [
  {
    idea: 'A stylish Indian model standing in a neon-lit Tokyo street',
    style: 'Cinematic',
    lighting: 'Neon',
    camera: '50mm',
    mood: 'Moody',
    prompt:
      'A cinematic, moody portrait of a stylish Indian model standing in a neon-lit Tokyo street at night, wearing a contemporary tailored jacket with subtle reflective accents, wet asphalt mirroring vibrant fuchsia and cobalt neon signage, shallow depth of field shot on a 50mm lens at f/1.4, rich atmospheric haze, hyper-detailed, photorealistic masterpiece.',
  },
  {
    idea: 'A cybernetic samurai warrior meditating under glowing cherry blossoms during twilight rain in Neo-Kyoto',
    style: 'Anime',
    lighting: 'Neon',
    camera: '85mm',
    mood: 'Epic',
    prompt:
      'An epic, anime-styled masterpiece of an introspective cybernetic samurai warrior meditating beneath glowing bioluminescent cherry blossoms in gentle twilight rain, intricate circuitry illuminated beneath weathered matte carbon armor, 85mm lens portrait framing, exquisite water droplets, atmospheric ambient occlusion, cinematic and profound.',
  },
  {
    idea: 'An ultra-luxury modern cliffside architectural villa overlooking a sunset ocean',
    style: 'Photorealistic',
    lighting: 'Golden Hour',
    camera: 'Wide Angle',
    mood: 'Dreamy',
    prompt:
      'A dreamy, photorealistic wide-angle architectural photograph of an ultra-luxury modern cantilevered villa perched on a dramatic ocean cliff, bathed in warm golden hour sunlight, infinity pool reflecting gradient lavender and amber skies, sleek glass facades, natural stone textures, 8k resolution, Architectural Digest feature.',
  },
];

export default function StyleMixer() {
  const location = useLocation();
  const resultRef = useRef<HTMLDivElement | null>(null);

  // User inputs (clean and empty by default)
  const [idea, setIdea] = useState<string>('');
  const [style, setStyle] = useState<string>('');
  const [lighting, setLighting] = useState<string>('');
  const [camera, setCamera] = useState<string>('');
  const [mood, setMood] = useState<string>('');

  // Row expand toggles for "+ More"
  const [expandedRows, setExpandedRows] = useState<{
    style: boolean;
    lighting: boolean;
    camera: boolean;
    mood: boolean;
  }>({
    style: false,
    lighting: false,
    camera: false,
    mood: false,
  });

  const toggleRowMore = (row: 'style' | 'lighting' | 'camera' | 'mood') => {
    setExpandedRows((prev) => ({ ...prev, [row]: !prev[row] }));
  };

  // Generation & Result State
  const [generating, setGenerating] = useState(false);
  const [improving, setImproving] = useState(false);
  const [generatedPrompt, setGeneratedPrompt] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [exampleIndex, setExampleIndex] = useState(0);
  const [showPuterModal, setShowPuterModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<'generate' | 'improve'>('generate');

  // Check URL params for remix or idea queries
  useEffect(() => {
    const navState = location.state as { idea?: string } | null;
    const searchParams = new URLSearchParams(location.search);
    const remixParam = searchParams.get('remix') || searchParams.get('idea');

    if (navState?.idea) {
      setIdea(navState.idea);
    } else if (remixParam) {
      setIdea(decodeURIComponent(remixParam));
    }
  }, [location]);

  const toggleChip = (current: string, val: string, setter: (val: string) => void) => {
    setter(current === val ? '' : val);
  };

  const handleTryExample = () => {
    const nextIdx = (exampleIndex + 1) % PRESET_EXAMPLES.length;
    setExampleIndex(nextIdx);
    const preset = PRESET_EXAMPLES[nextIdx];
    setIdea(preset.idea);
    setStyle(preset.style);
    setLighting(preset.lighting);
    setCamera(preset.camera);
    setMood(preset.mood);
    setGeneratedPrompt(preset.prompt);
    setErrorMsg(null);
  };

  const handleClearAll = () => {
    setIdea('');
    setStyle('');
    setLighting('');
    setCamera('');
    setMood('');
    setGeneratedPrompt('');
    setErrorMsg(null);
  };

  const hasAnyContent = Boolean(idea.trim() || style || lighting || camera || mood || generatedPrompt);

  // Core generator executor
  const executePromptGeneration = async (isRefine = false) => {
    setErrorMsg(null);
    if (isRefine) {
      setImproving(true);
    } else {
      setGenerating(true);
    }

    try {
      const result = await generateStyleMixerPrompt({
        style: style || undefined,
        lighting: lighting || undefined,
        camera: camera || undefined,
        mood: mood || undefined,
        idea: idea.trim(),
        refinePrompt: isRefine && generatedPrompt ? generatedPrompt : undefined,
      });

      setGeneratedPrompt(result);

      setTimeout(() => {
        if (resultRef.current) {
          resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }, 100);
    } catch (err: any) {
      console.warn('Puter AI generation failed, using intelligent creative fallback:', err);
      const parts: string[] = [];
      if (style) parts.push(style.toLowerCase());
      if (mood) parts.push(mood.toLowerCase());

      const subject = idea.trim() ? idea.trim().replace(/\.+$/, '') : 'Indian model in a vibrant futuristic city';
      const lightingText = lighting ? `bathed in dramatic ${lighting.toLowerCase()} lighting` : '';
      const cameraText = camera ? `captured on a ${camera} lens with precise depth of field` : '';

      const stylePrefix = parts.length > 0 ? `A stunning, ${parts.join(', ')} portrayal of ` : 'A stunning, high-detail portrayal of ';
      const fallbackPrompt = `${stylePrefix}${subject}${lightingText ? `, ${lightingText}` : ''}${cameraText ? `, ${cameraText}` : ''}, highly detailed, photorealistic, 8k resolution, cinematic masterpiece.`;
      setGeneratedPrompt(fallbackPrompt);
    } finally {
      setGenerating(false);
      setImproving(false);
    }
  };

  // Flow: User clicks "✨ Generate My Prompt"
  const handleGenerate = async () => {
    if (!idea.trim() && !style && !lighting && !camera && !mood) {
      setErrorMsg('Please describe your idea or pick a style option to generate a prompt.');
      return;
    }

    setErrorMsg(null);
    setPendingAction('generate');

    const signedIn = await isPuterSignedIn();
    if (signedIn) {
      await executePromptGeneration(false);
    } else {
      setShowPuterModal(true);
    }
  };

  // Flow: User clicks "↻ Improve Prompt"
  const handleImprovePrompt = async () => {
    if (!generatedPrompt) return;

    setErrorMsg(null);
    setPendingAction('improve');

    const signedIn = await isPuterSignedIn();
    if (signedIn) {
      await executePromptGeneration(true);
    } else {
      setShowPuterModal(true);
    }
  };

  const handlePuterModalContinue = async () => {
    const alreadySignedIn = await isPuterSignedIn();
    if (alreadySignedIn) {
      setShowPuterModal(false);
      await executePromptGeneration(pendingAction === 'improve');
      return;
    }

    const success = await signInWithPuter();
    setShowPuterModal(false);

    if (success) {
      await executePromptGeneration(pendingAction === 'improve');
    }
  };

  const handlePuterModalCancel = () => {
    setShowPuterModal(false);
  };

  const handleCopyPrompt = async () => {
    if (!generatedPrompt) return;
    try {
      await navigator.clipboard.writeText(generatedPrompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2400);
    } catch (e) {
      console.error('Failed to copy prompt:', e);
    }
  };

  const handleOpenChatGPT = () => {
    if (!generatedPrompt) return;
    const url = `https://chatgpt.com/?q=${encodeURIComponent(generatedPrompt)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Inject WebApplication JSON-LD Schema for rich Google Search ranking
  useEffect(() => {
    const scriptId = 'schema-ai-style-mixer';
    let script = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: 'Promptro AI Style Mixer',
      alternateName: [
        'AI Style Mixer',
        'AI Prompt Generator',
        'AI Prompt Writer',
        'Promptro AI Prompt Mixer',
        'Free AI Image Prompt Generator',
      ],
      url: 'https://promptro.in/style-mixer',
      description: 'Free AI prompt generator and style mixer to create high-impact AI prompts for Midjourney, ChatGPT, Google Gemini, and Flux.',
      applicationCategory: 'MultimediaApplication',
      operatingSystem: 'All',
      browserRequirements: 'Requires JavaScript. Requires HTML5.',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
      featureList: [
        'AI Style Mixer',
        'Free AI Prompt Generator',
        'Instant Prompt Writer',
        'ChatGPT & Google Gemini Compatibility',
        '1-Click Prompt Copy',
      ],
      creator: {
        '@type': 'Organization',
        name: 'Promptro',
        url: 'https://promptro.in',
      },
    };
    script.textContent = JSON.stringify(schema);
    return () => {
      const el = document.getElementById(scriptId);
      if (el) el.remove();
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-none px-1.5 sm:px-3 md:px-4 lg:px-6 py-1 sm:py-1.5 flex flex-col gap-2 sm:gap-2.5 select-none"
    >
      <SEOMeta
        title="AI Style Mixer - Free AI Prompt Generator & Prompt Writer | Promptro"
        description="Generate viral, professional AI image prompts for Midjourney, ChatGPT, Google Gemini & Flux with Promptro's AI Style Mixer. Mix styles, lighting, camera looks & mood free."
        keywords="AI style mixer, AI prompt, AI prompts, AI prompt generator, AI image prompt generator, AI prompt writer, free AI prompt maker, Midjourney prompt generator, ChatGPT image prompts, Google Gemini prompts, prompt engineering tool, Promptro AI mixer, Promptro"
        canonical="https://promptro.in/style-mixer"
        ogType="website"
        breadcrumbs={[
          { name: 'Home', url: 'https://promptro.in' },
          { name: 'AI Style Mixer', url: 'https://promptro.in/style-mixer' },
        ]}
      />

      {/* ========================================================
          1. HEADER SECTION (Clean Heading, Subtitle & Overlapping Artwork)
         ======================================================== */}
      <header className="relative flex flex-row items-center justify-between gap-2 sm:gap-4 w-full pt-0.5 pb-0.5">
        {/* Left Title & Subtitle - Aligned with the right image height */}
        <div className="flex-1 min-w-0 pr-1 sm:pr-2 flex flex-col justify-center">
          <div className="flex items-center">
            <h1 className="text-[21px] sm:text-3xl lg:text-[38px] font-[900] tracking-tight leading-tight">
              <span className="text-[#6d28d9] dark:text-[#a78bfa]">AI Style </span>
              <span className="text-[#ea580c] dark:text-[#f97316]">Mixer</span>
            </h1>
          </div>
          <h2 className="text-[12px] sm:text-sm lg:text-[16px] font-extrabold text-[#1e1735] dark:text-white mt-0.5 lg:mt-1.5 leading-snug">
            Turn your ideas into professional AI image prompts.
          </h2>
          <p className="text-[10px] sm:text-xs lg:text-[13px] font-normal text-[#6f6787] dark:text-[#b4abce] mt-0.5 leading-snug max-w-[210px] sm:max-w-md lg:max-w-lg">
            Describe what you want to create and mix styles to engineer ready-to-use AI prompts.
          </p>
        </div>

        {/* Right Artwork: User's custom AI Mixer Page Image + Downward Curved Arrow */}
        <div className="flex flex-col items-end shrink-0 relative -mb-6 sm:-mb-8 md:-mb-10 lg:-mb-12 z-20 mr-0.5 sm:mr-3">
          <div className="flex items-center gap-1 sm:gap-1.5 text-[9.5px] sm:text-xs lg:text-[13px] font-black italic text-purple-600 dark:text-purple-300 drop-shadow-sm whitespace-nowrap mb-0.5">
            <span>Turn ideas into stunning prompts</span>
            <svg
              className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-600 dark:text-purple-400 shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M4 6c6-1 12 2 13 9" />
              <path d="m13 12 4 4 4-4" />
            </svg>
          </div>

          {/* User's Custom Crafted AI Mixer Page Artwork (Slightly larger on mobile too) */}
          <div className="relative w-40 sm:w-52 md:w-60 lg:w-72 xl:w-80 select-none pointer-events-none transition-transform duration-300 hover:scale-105">
            <img
              src="/Ai mixer page image.png"
              alt="AI Style Mixer Artwork"
              className="w-full h-auto object-contain drop-shadow-[0_12px_26px_rgba(116,55,255,0.25)] dark:drop-shadow-[0_14px_32px_rgba(116,55,255,0.4)]"
            />
          </div>
        </div>
      </header>

      {/* ========================================================
          2. MAIN CARDS (Compact Rectangular Dual Liquid Glass Layout)
         ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5 sm:gap-4 lg:gap-5 items-stretch w-full relative z-10 flex-1">
        
        {/* ======================================================
            LEFT CARD: Input & Style Mixer Options
           ====================================================== */}
        <div className="liquid-glass-card rounded-[1.85rem] p-3.5 sm:p-4 lg:p-5 shadow-2xl backdrop-blur-2xl border border-white/60 dark:border-white/15 h-full flex flex-col justify-between gap-3">
          
          {/* Card Top Header: Title & Quick Actions in One Beautiful Single Line */}
          <div className="flex items-center justify-between gap-1.5 pb-2 sm:pb-2.5 border-b border-white/40 dark:border-white/10 w-full min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
              <svg
                className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-600 dark:text-purple-400 shrink-0"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
              </svg>
              <h3 className="text-[12px] sm:text-sm lg:text-base font-extrabold text-[#1f1738] dark:text-white whitespace-nowrap truncate">
                What do you want to create?
              </h3>
            </div>

            {/* Quick Actions: Clear all & Try example cleanly organized in a single line, compact on mobile */}
            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
              <button
                type="button"
                onClick={handleClearAll}
                disabled={!hasAnyContent}
                className={`inline-flex items-center gap-1 px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded-lg sm:rounded-xl text-[10.5px] sm:text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  hasAnyContent
                    ? 'text-[#7d7494] dark:text-[#a59cb8] hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-500/10'
                    : 'text-[#9c93b3] dark:text-[#7a7293] opacity-35 cursor-not-allowed'
                }`}
                title="Clear all selected styles and prompt"
              >
                <svg
                  className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                  <path d="M3 3v5h5" />
                </svg>
                <span>Clear all</span>
              </button>

              <button
                type="button"
                onClick={handleTryExample}
                className="inline-flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg sm:rounded-xl text-[10.5px] sm:text-xs font-semibold text-purple-700 dark:text-purple-300 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 transition-all cursor-pointer shadow-xs whitespace-nowrap"
                title="Load a creative example prompt and styles"
              >
                <SparkleIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" variant="purple" />
                <span>Try example</span>
              </button>
            </div>
          </div>

          {/* Main Idea Textarea */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-[11px] font-bold text-[#6f6787] dark:text-[#b4abce] px-0.5">
              <span>Your Concept</span>
              <span className="text-[10px] font-medium text-[#8b82a3] dark:text-[#7f7797]">
                {idea.length}/500
              </span>
            </div>
            <textarea
              id="mixer-idea-textarea"
              rows={3}
              value={idea}
              onChange={(e) => setIdea(e.target.value.slice(0, 500))}
              placeholder="Describe your idea in your own words... AI will turn it into a detailed image prompt."
              className="w-full rounded-2xl p-3 text-xs sm:text-sm leading-relaxed outline-none border border-[#e8e2f4] dark:border-white/10 bg-white/80 dark:bg-white/[0.03] text-[#1e1735] dark:text-white placeholder-[#9b94af] dark:placeholder-[#82799c] focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all resize-none shadow-inner min-h-[85px] sm:min-h-[95px]"
            />
          </div>

          {/* Compact Option Rows Below Textarea: STYLE, LIGHTING, CAMERA, MOOD */}
          <div className="flex flex-col gap-2 rounded-2xl bg-white/60 dark:bg-white/[0.02] border border-white/60 dark:border-white/10 p-2.5 sm:p-3 shadow-sm backdrop-blur-md">
            
            {/* ROW 1: STYLE */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2">
              <span className="text-[10.5px] sm:text-[11px] font-extrabold uppercase tracking-wider text-[#6f6787] dark:text-[#b4abce] shrink-0 sm:w-20">
                STYLE
              </span>
              <div className="flex flex-wrap items-center gap-1.5 flex-1">
                {(expandedRows.style ? STYLE_OPTIONS : STYLE_OPTIONS.slice(0, 3)).map((opt) => {
                  const isSelected = style === opt;
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => toggleChip(style, opt, setStyle)}
                      className={`px-2.5 py-1 rounded-xl text-[11px] sm:text-xs font-semibold transition-all duration-200 cursor-pointer ${
                        isSelected
                          ? 'bg-[#f4eeff] dark:bg-[#7c3aed]/35 border-[1.5px] border-[#a855f7] text-[#6b21a8] dark:text-[#f3e8ff] font-bold shadow-sm'
                          : 'bg-white/80 dark:bg-white/[0.04] border border-[#e8e2f4] dark:border-white/10 text-[#362f4b] dark:text-[#ece6f7] hover:border-purple-300 hover:bg-purple-50/50 dark:hover:bg-white/[0.08]'
                      }`}
                    >
                      {opt}
                    </button>
                  );
                })}
                <button
                  type="button"
                  onClick={() => toggleRowMore('style')}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-xl text-[10.5px] sm:text-xs font-bold text-purple-600 dark:text-purple-400 hover:bg-purple-100/60 dark:hover:bg-purple-950/40 border border-dashed border-purple-300 dark:border-purple-700/50 transition-colors cursor-pointer"
                >
                  <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    {expandedRows.style ? (
                      <line x1="5" y1="12" x2="19" y2="12" />
                    ) : (
                      <>
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                      </>
                    )}
                  </svg>
                  <span>{expandedRows.style ? 'Less' : 'More'}</span>
                </button>
              </div>
            </div>

            {/* ROW 2: LIGHTING */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2 pt-1 border-t border-white/40 dark:border-white/5">
              <span className="text-[10.5px] sm:text-[11px] font-extrabold uppercase tracking-wider text-[#6f6787] dark:text-[#b4abce] shrink-0 sm:w-20">
                LIGHTING
              </span>
              <div className="flex flex-wrap items-center gap-1.5 flex-1">
                {(expandedRows.lighting ? LIGHTING_OPTIONS : LIGHTING_OPTIONS.slice(0, 3)).map((opt) => {
                  const isSelected = lighting === opt;
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => toggleChip(lighting, opt, setLighting)}
                      className={`px-2.5 py-1 rounded-xl text-[11px] sm:text-xs font-semibold transition-all duration-200 cursor-pointer ${
                        isSelected
                          ? 'bg-[#f4eeff] dark:bg-[#7c3aed]/35 border-[1.5px] border-[#a855f7] text-[#6b21a8] dark:text-[#f3e8ff] font-bold shadow-sm'
                          : 'bg-white/80 dark:bg-white/[0.04] border border-[#e8e2f4] dark:border-white/10 text-[#362f4b] dark:text-[#ece6f7] hover:border-purple-300 hover:bg-purple-50/50 dark:hover:bg-white/[0.08]'
                      }`}
                    >
                      {opt}
                    </button>
                  );
                })}
                <button
                  type="button"
                  onClick={() => toggleRowMore('lighting')}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-xl text-[10.5px] sm:text-xs font-bold text-purple-600 dark:text-purple-400 hover:bg-purple-100/60 dark:hover:bg-purple-950/40 border border-dashed border-purple-300 dark:border-purple-700/50 transition-colors cursor-pointer"
                >
                  <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    {expandedRows.lighting ? (
                      <line x1="5" y1="12" x2="19" y2="12" />
                    ) : (
                      <>
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                      </>
                    )}
                  </svg>
                  <span>{expandedRows.lighting ? 'Less' : 'More'}</span>
                </button>
              </div>
            </div>

            {/* ROW 3: CAMERA */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2 pt-1 border-t border-white/40 dark:border-white/5">
              <span className="text-[10.5px] sm:text-[11px] font-extrabold uppercase tracking-wider text-[#6f6787] dark:text-[#b4abce] shrink-0 sm:w-20">
                CAMERA
              </span>
              <div className="flex flex-wrap items-center gap-1.5 flex-1">
                {(expandedRows.camera ? CAMERA_OPTIONS : CAMERA_OPTIONS.slice(0, 3)).map((opt) => {
                  const isSelected = camera === opt;
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => toggleChip(camera, opt, setCamera)}
                      className={`px-2.5 py-1 rounded-xl text-[11px] sm:text-xs font-semibold transition-all duration-200 cursor-pointer ${
                        isSelected
                          ? 'bg-[#f4eeff] dark:bg-[#7c3aed]/35 border-[1.5px] border-[#a855f7] text-[#6b21a8] dark:text-[#f3e8ff] font-bold shadow-sm'
                          : 'bg-white/80 dark:bg-white/[0.04] border border-[#e8e2f4] dark:border-white/10 text-[#362f4b] dark:text-[#ece6f7] hover:border-purple-300 hover:bg-purple-50/50 dark:hover:bg-white/[0.08]'
                      }`}
                    >
                      {opt}
                    </button>
                  );
                })}
                <button
                  type="button"
                  onClick={() => toggleRowMore('camera')}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-xl text-[10.5px] sm:text-xs font-bold text-purple-600 dark:text-purple-400 hover:bg-purple-100/60 dark:hover:bg-purple-950/40 border border-dashed border-purple-300 dark:border-purple-700/50 transition-colors cursor-pointer"
                >
                  <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    {expandedRows.camera ? (
                      <line x1="5" y1="12" x2="19" y2="12" />
                    ) : (
                      <>
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                      </>
                    )}
                  </svg>
                  <span>{expandedRows.camera ? 'Less' : 'More'}</span>
                </button>
              </div>
            </div>

            {/* ROW 4: MOOD */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2 pt-1 border-t border-white/40 dark:border-white/5">
              <span className="text-[10.5px] sm:text-[11px] font-extrabold uppercase tracking-wider text-[#6f6787] dark:text-[#b4abce] shrink-0 sm:w-20">
                MOOD
              </span>
              <div className="flex flex-wrap items-center gap-1.5 flex-1">
                {(expandedRows.mood ? MOOD_OPTIONS : MOOD_OPTIONS.slice(0, 3)).map((opt) => {
                  const isSelected = mood === opt;
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => toggleChip(mood, opt, setMood)}
                      className={`px-2.5 py-1 rounded-xl text-[11px] sm:text-xs font-semibold transition-all duration-200 cursor-pointer ${
                        isSelected
                          ? 'bg-[#f4eeff] dark:bg-[#7c3aed]/35 border-[1.5px] border-[#a855f7] text-[#6b21a8] dark:text-[#f3e8ff] font-bold shadow-sm'
                          : 'bg-white/80 dark:bg-white/[0.04] border border-[#e8e2f4] dark:border-white/10 text-[#362f4b] dark:text-[#ece6f7] hover:border-purple-300 hover:bg-purple-50/50 dark:hover:bg-white/[0.08]'
                      }`}
                    >
                      {opt}
                    </button>
                  );
                })}
                <button
                  type="button"
                  onClick={() => toggleRowMore('mood')}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-xl text-[10.5px] sm:text-xs font-bold text-purple-600 dark:text-purple-400 hover:bg-purple-100/60 dark:hover:bg-purple-950/40 border border-dashed border-purple-300 dark:border-purple-700/50 transition-colors cursor-pointer"
                >
                  <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    {expandedRows.mood ? (
                      <line x1="5" y1="12" x2="19" y2="12" />
                    ) : (
                      <>
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                      </>
                    )}
                  </svg>
                  <span>{expandedRows.mood ? 'Less' : 'More'}</span>
                </button>
              </div>
            </div>

          </div>

          {/* Error message if any */}
          {errorMsg && (
            <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-medium">
              {errorMsg}
            </div>
          )}

          {/* Main CTA: "✨ Generate My Prompt" */}
          <div className="flex flex-col items-center gap-1.5 w-full pt-1">
            <button
              type="button"
              onClick={handleGenerate}
              disabled={generating || improving}
              className="cursor-pointer w-full py-3.5 px-5 rounded-full text-sm sm:text-base font-black text-white bg-gradient-to-r from-[#7437ff] via-[#cc3ce2] to-[#f97316] hover:brightness-110 active:scale-[0.99] transition-all duration-300 shadow-[0_6px_22px_rgba(116,55,255,0.3)] flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {generating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Synthesizing Prompt with Puter AI...</span>
                </>
              ) : (
                <>
                  <SparkleIcon className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 drop-shadow-[0_0_8px_rgba(252,211,77,0.85)]" variant="amber" />
                  <span>Generate My Prompt</span>
                </>
              )}
            </button>
            <p className="text-[10.5px] font-medium text-[#7a7192] dark:text-[#a097b8] text-center">
              Powered by AI &bull; Works with your ideas and optional styles
            </p>
          </div>

        </div>

        {/* ======================================================
            RIGHT CARD: Output / Result Card (Clean Result Area, No Duplicated Actions)
           ====================================================== */}
        <div className="liquid-glass-card rounded-[1.85rem] p-3.5 sm:p-4 lg:p-5 shadow-2xl backdrop-blur-2xl border border-white/60 dark:border-white/15 h-full flex flex-col justify-between gap-3">
          
          {/* Card Top Header: Clean, Uncluttered Output Title */}
          <div className="flex items-center justify-between pb-2.5 border-b border-white/40 dark:border-white/10">
            <div className="flex items-center gap-2">
              <svg
                className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
              <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-[#1f1738] dark:text-white">
                YOUR GENERATED PROMPT
              </h3>
            </div>
          </div>

          {/* Prompt Display Area */}
          <div className="flex-1 flex flex-col justify-center min-h-[220px]">
            {generatedPrompt ? (
              <motion.div
                ref={resultRef}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-2xl bg-white/70 dark:bg-white/[0.03] border border-white/60 dark:border-white/10 p-3.5 sm:p-4 shadow-sm backdrop-blur-md flex flex-col gap-3 h-full justify-between"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#1f1738] dark:text-white min-w-0">
                    <SparkleIcon className="w-4 h-4 shrink-0 drop-shadow-[0_0_10px_rgba(168,85,247,0.75)]" variant="purple" />
                    <span className="truncate">Midjourney, ChatGPT & Google Gemini</span>
                  </div>
                  <span className="whitespace-nowrap shrink-0 text-[10px] sm:text-[10.5px] font-bold text-purple-600 dark:text-purple-300 bg-purple-100/80 dark:bg-purple-900/40 px-2.5 py-0.5 rounded-full border border-purple-200 dark:border-purple-800/50">
                    Master Quality
                  </span>
                </div>

                {/* Prompt Text directly in the single card (No extra nested card behind it) */}
                <div className="text-xs sm:text-[13px] leading-relaxed text-[#2a233c] dark:text-[#f3effb] select-all flex-1 min-h-[140px] max-h-[260px] overflow-y-auto py-1 px-1">
                  {generatedPrompt}
                </div>

                {/* Actions: [ Copy Prompt ] [ Open in ChatGPT ] and "Improve Prompt" */}
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/40 dark:border-white/10">
                  <button
                    type="button"
                    onClick={handleCopyPrompt}
                    className="flex-1 min-w-[120px] inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold bg-[#f4eeff] dark:bg-white/10 border border-[#e0d6f2] dark:border-white/15 text-[#6b21a8] dark:text-[#e9d5ff] hover:bg-purple-100/70 transition-all cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <svg
                          className="w-3.5 h-3.5 text-emerald-500 shrink-0"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        <span className="text-emerald-600 dark:text-emerald-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <svg
                          className="w-3.5 h-3.5 shrink-0"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                          <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                        </svg>
                        <span>Copy Prompt</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleOpenChatGPT}
                    className="flex-1 min-w-[130px] inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold bg-white dark:bg-white/10 border border-[#e0d6f2] dark:border-white/15 text-[#3b3252] dark:text-[#ece6f7] hover:bg-purple-50 dark:hover:bg-white/20 transition-all cursor-pointer"
                  >
                    <span>Open in ChatGPT</span>
                    <svg
                      className="w-3.5 h-3.5 shrink-0"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                      <polyline points="15 3 21 3 21 9" />
                      <line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                  </button>

                  <button
                    type="button"
                    onClick={handleImprovePrompt}
                    disabled={improving || generating}
                    className="flex-1 min-w-[130px] inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-500/10 to-amber-500/10 hover:from-purple-500/20 hover:to-amber-500/20 border border-purple-300/40 dark:border-purple-600/30 text-purple-700 dark:text-purple-300 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <svg
                      className={`w-3.5 h-3.5 shrink-0 ${improving ? 'animate-spin' : ''}`}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                      <path d="M3 3v5h5" />
                      <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                      <path d="M16 16h5v5" />
                    </svg>
                    <span>{improving ? 'Improving...' : 'Improve Prompt'}</span>
                  </button>
                </div>
              </motion.div>
            ) : (
              <div className="rounded-2xl bg-white/40 dark:bg-white/[0.02] border border-dashed border-white/60 dark:border-white/10 p-6 sm:p-8 text-center text-xs text-[#82799c] dark:text-[#a097b8] flex flex-col items-center justify-center gap-2 h-full">
                <div className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/40 flex items-center justify-center text-purple-600 dark:text-purple-400 mb-1">
                  <SparkleIcon className="w-5 h-5 shrink-0" variant="purple" />
                </div>
                <span className="text-sm font-extrabold text-[#1f1738] dark:text-white">
                  Generate your AI prompt
                </span>
                <p className="text-[11.5px] max-w-xs leading-relaxed text-[#786e92] dark:text-[#a299ba]">
                  Describe your idea on the left, optionally pick style presets, and click <strong className="text-purple-600 dark:text-purple-400">Generate My Prompt</strong>.
                </p>
              </div>
            )}
          </div>

          {/* Right Card Bottom Tip */}
          <div className="flex items-center justify-center gap-1.5 text-xs text-[#71688b] dark:text-[#a59cb8] pt-2 border-t border-white/40 dark:border-white/10 text-center">
            <svg
              className="w-3.5 h-3.5 text-amber-500 shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
              <path d="M9 18h6" />
              <path d="M10 22h4" />
            </svg>
            <span className="font-medium">
              Click &quot;Improve Prompt&quot; anytime to elevate detail and cinematic lighting
            </span>
          </div>

        </div>

      </div>

      {/* Puter Authentication Confirmation Modal */}
      <PuterAuthModal
        isOpen={showPuterModal}
        onContinue={handlePuterModalContinue}
        onCancel={handlePuterModalCancel}
      />
    </motion.div>
  );
}
