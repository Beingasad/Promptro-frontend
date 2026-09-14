import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Check, SlidersHorizontal, RotateCcw, ChevronDown } from 'lucide-react';
import { SparkleIcon } from './icons/SparkleIcon';
import { generateStyleMixerPrompt, isPuterSignedIn, signInWithPuter } from '../lib/puter';
import PuterAuthModal from './PuterAuthModal';

interface RemixPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  originalPrompt: string;
  category?: string;
  model?: string;
}

const RATIO_OPTIONS = [
  '1:1',
  '9:16',
  '16:9',
  '4:5',
  '3:2',
  '21:9',
];

const QUALITY_OPTIONS = [
  '8K UHD',
  'Masterpiece',
  'Ultra-Realistic',
  'Hyper-Detailed',
  'Raw Photo',
  'Unreal Engine 5',
];

const STYLE_OPTIONS = [
  'Cinematic',
  'Photorealistic',
  'Anime',
  'Cyberpunk',
  'Luxury',
  'Editorial',
  '3D Render',
];

const LIGHTING_OPTIONS = [
  'Golden Hour',
  'Neon',
  'Studio',
  'Soft Light',
  'Dramatic',
  'Volumetric',
];

const CAMERA_OPTIONS = [
  '50mm',
  '85mm',
  'Wide Angle',
  'Macro',
  'Drone Shot',
  'Close Up',
];

const MOOD_OPTIONS = [
  'Dreamy',
  'Moody',
  'Vibrant',
  'Mysterious',
  'Minimal',
  'Epic',
];

export default function RemixPromptModal({
  isOpen,
  onClose,
  originalPrompt,
  category,
  model,
}: RemixPromptModalProps) {
  const [modifications, setModifications] = useState('');
  
  // Prompt state in Box 1 (starts with original, updates with new remixed prompt)
  const [displayedPrompt, setDisplayedPrompt] = useState(originalPrompt);
  const [isRemixed, setIsRemixed] = useState(false);
  
  // Quick Primary Attributes
  const [selectedRatio, setSelectedRatio] = useState<string>('');
  const [selectedQuality, setSelectedQuality] = useState<string>('');
  const [selectedStyle, setSelectedStyle] = useState<string>('');
  
  // Extra / Advanced Attributes
  const [selectedLighting, setSelectedLighting] = useState<string>('');
  const [selectedCamera, setSelectedCamera] = useState<string>('');
  const [selectedMood, setSelectedMood] = useState<string>('');
  
  // Advanced Styles Section Expand Toggle
  const [showAdvancedStyles, setShowAdvancedStyles] = useState(false);

  // Status states
  const [copied, setCopied] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [showPuterModal, setShowPuterModal] = useState(false);

  // Reset/sync state when modal opens or originalPrompt changes
  useEffect(() => {
    if (isOpen) {
      setDisplayedPrompt(originalPrompt);
      setIsRemixed(false);
      setModifications('');
      setSelectedRatio('');
      setSelectedQuality('');
      setSelectedStyle('');
      setSelectedLighting('');
      setSelectedCamera('');
      setSelectedMood('');
    }
  }, [isOpen, originalPrompt]);

  // Row expand toggles for "+ More" / "- Less" within each category
  const [expandedRows, setExpandedRows] = useState<{
    ratio: boolean;
    quality: boolean;
    style: boolean;
    lighting: boolean;
    camera: boolean;
    mood: boolean;
  }>({
    ratio: false,
    quality: false,
    style: false,
    lighting: false,
    camera: false,
    mood: false,
  });

  const toggleRowMore = (row: keyof typeof expandedRows) => {
    setExpandedRows((prev) => ({ ...prev, [row]: !prev[row] }));
  };

  // Prevent background scrolling when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleCopyDisplayed = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(displayedPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const handleRestoreOriginal = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDisplayedPrompt(originalPrompt);
    setIsRemixed(false);
  };

  const handleToggle = (current: string, val: string, setter: (v: string) => void) => {
    setter(current === val ? '' : val);
  };

  const executeGeneration = async () => {
    setGenerating(true);
    try {
      const extraSpecs: string[] = [];
      if (selectedRatio) extraSpecs.push(`Aspect Ratio: ${selectedRatio}`);
      if (selectedQuality) extraSpecs.push(`Quality: ${selectedQuality}`);
      if (modifications.trim()) extraSpecs.push(`Modifications: ${modifications.trim()}`);

      const res = await generateStyleMixerPrompt({
        idea: extraSpecs.length > 0 ? `${originalPrompt}. Special Instructions: ${extraSpecs.join(', ')}` : originalPrompt,
        style: selectedStyle || undefined,
        lighting: selectedLighting || undefined,
        camera: selectedCamera || undefined,
        mood: selectedMood || undefined,
        refinePrompt: originalPrompt,
      });

      let finalPrompt = res.trim();
      if (selectedRatio && !finalPrompt.includes(selectedRatio)) {
        finalPrompt = `${finalPrompt} --ar ${selectedRatio}`;
      }
      if (selectedQuality && !finalPrompt.toLowerCase().includes(selectedQuality.toLowerCase())) {
        finalPrompt = `${finalPrompt}, ${selectedQuality.toLowerCase()}`;
      }

      setDisplayedPrompt(finalPrompt);
      setIsRemixed(true);
    } catch (err) {
      console.warn('Puter AI generation failed, applying creative synthesis fallback:', err);
      // High-quality deterministic fallback synthesis
      const descriptors: string[] = [];
      if (selectedStyle) descriptors.push(selectedStyle.toLowerCase());
      if (selectedMood) descriptors.push(selectedMood.toLowerCase());
      if (selectedQuality) descriptors.push(selectedQuality.toLowerCase());

      const lightingDesc = selectedLighting ? `bathed in ${selectedLighting.toLowerCase()} lighting` : '';
      const cameraDesc = selectedCamera ? `captured on ${selectedCamera} lens` : '';
      const modDesc = modifications.trim() ? `with ${modifications.trim()}` : '';

      let base = originalPrompt.trim().replace(/\.+$/, '');
      if (modDesc) {
        base = `${base}, ${modDesc}`;
      }

      const styleTags = descriptors.length > 0 ? `${descriptors.join(', ')} style` : 'ultra-detailed artistic style';
      let synthesized = `${base}, rendered in a stunning ${styleTags}${lightingDesc ? `, ${lightingDesc}` : ''}${cameraDesc ? `, ${cameraDesc}` : ''}, highly detailed, photorealistic masterpiece.`;

      if (selectedRatio) {
        synthesized += ` --ar ${selectedRatio}`;
      }

      setDisplayedPrompt(synthesized);
      setIsRemixed(true);
    } finally {
      setGenerating(false);
    }
  };

  const handleMixAndGenerate = async () => {
    setGenerating(true);
    const signedIn = await isPuterSignedIn();
    if (signedIn) {
      await executeGeneration();
    } else {
      setShowPuterModal(true);
    }
  };

  const handlePuterModalContinue = async () => {
    const alreadySignedIn = await isPuterSignedIn();
    if (alreadySignedIn) {
      setShowPuterModal(false);
      await executeGeneration();
      return;
    }

    const success = await signInWithPuter();
    setShowPuterModal(false);
    if (success) {
      await executeGeneration();
    } else {
      await executeGeneration();
    }
  };

  const handlePuterModalCancel = () => {
    setShowPuterModal(false);
    executeGeneration();
  };

  const activeAdvancedCount = [selectedLighting, selectedCamera, selectedMood].filter(Boolean).length;

  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[150] flex flex-col justify-end">
        {/* Backdrop Overlay with Rich Blur */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-xl"
          onClick={onClose}
          aria-label="Close modal backdrop"
        />

        {/* Bottom Sheet Modal Container (Ultra-Premium Liquid Glass & Hidden Scrollbars) */}
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 320 }}
          drag="y"
          dragConstraints={{ top: 0 }}
          dragElastic={0.15}
          onDragEnd={(_, info) => {
            if (info.offset.y > 110 || info.velocity.y > 350) {
              onClose();
            }
          }}
          className="relative z-10 w-full max-w-2xl mx-auto rounded-t-[2.25rem] sm:rounded-t-[2.5rem] bg-[#100a20]/95 dark:bg-[#0c0818]/95 border-t border-x border-white/20 dark:border-white/12 p-4 sm:p-6 shadow-[0_-12px_45px_rgba(0,0,0,0.6),inset_0_1.5px_1.5px_0_rgba(255,255,255,0.35)] backdrop-blur-3xl max-h-[85vh] sm:max-h-[88vh] flex flex-col justify-between overflow-hidden"
          style={{ willChange: 'transform' }}
        >
          {/* Ambient Top Glow Effects */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-44 bg-[radial-gradient(ellipse_75%_55%_at_50%_0%,rgba(139,92,246,0.25),transparent_70%),radial-gradient(circle_at_85%_0%,rgba(255,106,61,0.14),transparent_50%)]" />

          {/* Top Drag Handle */}
          <div className="flex justify-center pb-2.5 cursor-grab active:cursor-grabbing relative z-10 select-none">
            <div className="w-12 h-1.5 rounded-full bg-white/30 hover:bg-white/50 transition-colors shadow-sm" />
          </div>

          {/* Modal Header (Clean Icon Without Box) */}
          <div className="flex items-center justify-between gap-3 pb-3.5 border-b border-white/10 dark:border-white/8 shrink-0 relative z-10">
            <div className="flex items-center gap-2.5 min-w-0">
              <SparkleIcon className="w-6 h-6 shrink-0 text-purple-400 drop-shadow-[0_0_10px_rgba(168,85,247,0.7)]" variant="purple" />
              <div className="min-w-0">
                <h3 className="text-base sm:text-lg font-black text-white leading-tight flex items-center gap-2">
                  <span>Remix This Prompt</span>
                </h3>
                <p className="text-[11px] sm:text-xs font-medium text-white/60 truncate">
                  Personalize, tune aspect ratio, quality &amp; blend creative styles
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="liquid-glass-control flex h-8 w-8 items-center justify-center rounded-full text-white/75 hover:text-white transition-all cursor-pointer shrink-0"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Scrollable Modal Body (Completely Hidden Scrollbars + Butter-Smooth Scroll) */}
          <div className="flex-1 overflow-y-auto overscroll-contain hide-scrollbar py-3.5 space-y-4 text-white relative z-10">
            
            {/* BOX 1: Prompt Display (Updates to New Remixed Prompt with Copy & Restore Options) */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs font-bold text-purple-300 px-0.5">
                <span className="flex items-center gap-1.5">
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-purple-500/30 text-[10px] font-black text-purple-200 border border-purple-400/40">1</span>
                  <span className="tracking-wide">
                    {isRemixed ? 'Remixed Prompt' : 'Original Prompt'}
                  </span>
                  {isRemixed && (
                    <span className="px-1.5 py-0.5 rounded-md bg-gradient-to-r from-purple-500/30 to-pink-500/30 border border-purple-400/40 text-[9px] font-black text-purple-200 tracking-wider uppercase">
                      New ✨
                    </span>
                  )}
                </span>
                
                <div className="flex items-center gap-1.5">
                  {/* Restore / Original button (visible when prompt is remixed) */}
                  {isRemixed && (
                    <button
                      type="button"
                      onClick={handleRestoreOriginal}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-[11px] font-semibold text-amber-300 hover:text-white transition-all cursor-pointer shadow-sm active:scale-95"
                      title="Restore original prompt"
                    >
                      <RotateCcw className="w-3 h-3 text-amber-300" />
                      <span>Original</span>
                    </button>
                  )}

                  {/* Copy prompt button */}
                  <button
                    type="button"
                    onClick={handleCopyDisplayed}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-[11px] font-semibold text-purple-200 hover:text-white transition-all cursor-pointer shadow-sm active:scale-95"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400 font-bold">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 text-purple-300" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className={`rounded-2xl bg-white/[0.04] dark:bg-white/[0.03] border p-3.5 text-xs sm:text-[13px] leading-relaxed text-white/90 max-h-[110px] overflow-y-auto overscroll-contain hide-scrollbar select-text font-normal shadow-inner backdrop-blur-sm transition-all duration-300 ${
                isRemixed ? 'border-purple-400/50 shadow-[0_0_15px_rgba(168,85,247,0.15)] bg-purple-950/20' : 'border-white/12 dark:border-white/8'
              }`}>
                {displayedPrompt}
              </div>
            </div>

            {/* BOX 2: Modifications / What changes to make */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs font-bold text-orange-300 px-0.5">
                <span className="flex items-center gap-1.5">
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-orange-500/30 text-[10px] font-black text-orange-200 border border-orange-400/40">2</span>
                  <span className="tracking-wide">What changes do you want to make?</span>
                </span>
                <span className="text-[10.5px] font-semibold px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/50">
                  {modifications.length}/300
                </span>
              </div>

              <div className="relative">
                <textarea
                  value={modifications}
                  onChange={(e) => setModifications(e.target.value.slice(0, 300))}
                  placeholder="Describe your adjustments (e.g., change background to futuristic cyberpunk neon city, make lighting dramatic sunset, add rain reflections on road...)"
                  rows={2}
                  className="w-full rounded-2xl bg-white/[0.06] dark:bg-white/[0.04] border border-white/15 dark:border-white/10 focus:border-purple-400/80 p-3.5 text-xs sm:text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/25 transition-all resize-none hide-scrollbar shadow-inner"
                />
              </div>
            </div>

            {/* BOX 3: Tuning & Style Presets (Ratio, Quality, Main Style, and More Styles) */}
            <div className="flex flex-col gap-3 pt-1">
              <div className="flex items-center justify-between text-xs font-bold text-purple-300 px-0.5">
                <span className="flex items-center gap-1.5">
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-indigo-500/30 text-[10px] font-black text-indigo-200 border border-indigo-400/40">3</span>
                  <span className="flex items-center gap-1.5 tracking-wide">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-purple-400" />
                    <span>Tuning &amp; AI Style Presets</span>
                  </span>
                </span>
              </div>

              {/* Presets Container */}
              <div className="space-y-2.5 text-[11px]">
                
                {/* 1. ASPECT RATIO */}
                <div className="rounded-2xl bg-white/[0.025] border border-white/8 p-3">
                  <div className="flex items-center justify-between gap-1.5 mb-2">
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
                      <span className="text-[10px] uppercase tracking-wider font-extrabold text-white/60">Aspect Ratio</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {(expandedRows.ratio ? RATIO_OPTIONS : RATIO_OPTIONS.slice(0, 3)).map((opt) => {
                      const isSelected = selectedRatio === opt;
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => handleToggle(selectedRatio, opt, setSelectedRatio)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_2px_12px_rgba(6,182,212,0.4)] border border-cyan-300/80 scale-[1.02]'
                              : 'bg-white/[0.05] text-white/80 hover:bg-white/10 hover:text-white border border-white/10 active:scale-95'
                          }`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                    <button
                      type="button"
                      onClick={() => toggleRowMore('ratio')}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[10.5px] sm:text-xs font-bold text-cyan-300 hover:text-white bg-cyan-500/15 hover:bg-cyan-500/25 border border-dashed border-cyan-400/40 transition-colors cursor-pointer active:scale-95"
                    >
                      <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        {expandedRows.ratio ? (
                          <line x1="5" y1="12" x2="19" y2="12" />
                        ) : (
                          <>
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <line x1="5" y1="12" x2="19" y2="12" />
                          </>
                        )}
                      </svg>
                      <span>{expandedRows.ratio ? 'Less' : 'More'}</span>
                    </button>
                  </div>
                </div>

                {/* 2. QUALITY TIER */}
                <div className="rounded-2xl bg-white/[0.025] border border-white/8 p-3">
                  <div className="flex items-center justify-between gap-1.5 mb-2">
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                      <span className="text-[10px] uppercase tracking-wider font-extrabold text-white/60">Quality Preset</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {(expandedRows.quality ? QUALITY_OPTIONS : QUALITY_OPTIONS.slice(0, 3)).map((opt) => {
                      const isSelected = selectedQuality === opt;
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => handleToggle(selectedQuality, opt, setSelectedQuality)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-[0_2px_12px_rgba(16,185,129,0.4)] border border-emerald-300/80 scale-[1.02]'
                              : 'bg-white/[0.05] text-white/80 hover:bg-white/10 hover:text-white border border-white/10 active:scale-95'
                          }`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                    <button
                      type="button"
                      onClick={() => toggleRowMore('quality')}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[10.5px] sm:text-xs font-bold text-emerald-300 hover:text-white bg-emerald-500/15 hover:bg-emerald-500/25 border border-dashed border-emerald-400/40 transition-colors cursor-pointer active:scale-95"
                    >
                      <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        {expandedRows.quality ? (
                          <line x1="5" y1="12" x2="19" y2="12" />
                        ) : (
                          <>
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <line x1="5" y1="12" x2="19" y2="12" />
                          </>
                        )}
                      </svg>
                      <span>{expandedRows.quality ? 'Less' : 'More'}</span>
                    </button>
                  </div>
                </div>

                {/* 3. MAIN VISUAL STYLE */}
                <div className="rounded-2xl bg-white/[0.025] border border-white/8 p-3">
                  <div className="flex items-center justify-between gap-1.5 mb-2">
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.8)]" />
                      <span className="text-[10px] uppercase tracking-wider font-extrabold text-white/60">Main Visual Style</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {(expandedRows.style ? STYLE_OPTIONS : STYLE_OPTIONS.slice(0, 3)).map((opt) => {
                      const isSelected = selectedStyle === opt;
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => handleToggle(selectedStyle, opt, setSelectedStyle)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-[0_2px_12px_rgba(147,51,234,0.4)] border border-purple-300/80 scale-[1.02]'
                              : 'bg-white/[0.05] text-white/80 hover:bg-white/10 hover:text-white border border-white/10 active:scale-95'
                          }`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                    <button
                      type="button"
                      onClick={() => toggleRowMore('style')}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[10.5px] sm:text-xs font-bold text-purple-300 hover:text-white bg-purple-500/15 hover:bg-purple-500/25 border border-dashed border-purple-400/40 transition-colors cursor-pointer active:scale-95"
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

                {/* 4. EXPANDABLE "MORE STYLES & CONTROLS" BUTTON */}
                <button
                  type="button"
                  onClick={() => setShowAdvancedStyles(!showAdvancedStyles)}
                  className="w-full py-2.5 px-3.5 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-purple-400/40 flex items-center justify-between text-xs font-bold text-purple-200 transition-all cursor-pointer group shadow-sm"
                >
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-purple-400 group-hover:rotate-45 transition-transform" />
                    <span>{showAdvancedStyles ? 'Hide More Styles (Lighting, Camera, Mood)' : '+ More Styles (Lighting, Camera, Mood)'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {activeAdvancedCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-purple-500/30 text-purple-200 text-[10px] font-black border border-purple-400/40">
                        {activeAdvancedCount} Selected
                      </span>
                    )}
                    <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showAdvancedStyles ? 'rotate-180 text-purple-300' : 'text-white/40'}`} />
                  </div>
                </button>

                {/* EXPANDABLE SECTIONS (Lighting, Camera, Mood) */}
                <AnimatePresence>
                  {showAdvancedStyles && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                      className="space-y-2.5 overflow-hidden pt-0.5"
                    >
                      {/* Lighting */}
                      <div className="rounded-2xl bg-white/[0.025] border border-white/8 p-3">
                        <div className="flex items-center justify-between gap-1.5 mb-2">
                          <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-pink-400 shadow-[0_0_8px_rgba(244,114,182,0.8)]" />
                            <span className="text-[10px] uppercase tracking-wider font-extrabold text-white/60">Lighting</span>
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5">
                          {(expandedRows.lighting ? LIGHTING_OPTIONS : LIGHTING_OPTIONS.slice(0, 3)).map((opt) => {
                            const isSelected = selectedLighting === opt;
                            return (
                              <button
                                key={opt}
                                type="button"
                                onClick={() => handleToggle(selectedLighting, opt, setSelectedLighting)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                  isSelected
                                    ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-[0_2px_12px_rgba(225,29,72,0.4)] border border-pink-300/80 scale-[1.02]'
                                    : 'bg-white/[0.05] text-white/80 hover:bg-white/10 hover:text-white border border-white/10 active:scale-95'
                                }`}
                              >
                                {opt}
                              </button>
                            );
                          })}
                          <button
                            type="button"
                            onClick={() => toggleRowMore('lighting')}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[10.5px] sm:text-xs font-bold text-pink-300 hover:text-white bg-pink-500/15 hover:bg-pink-500/25 border border-dashed border-pink-400/40 transition-colors cursor-pointer active:scale-95"
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

                      {/* Camera */}
                      <div className="rounded-2xl bg-white/[0.025] border border-white/8 p-3">
                        <div className="flex items-center justify-between gap-1.5 mb-2">
                          <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
                            <span className="text-[10px] uppercase tracking-wider font-extrabold text-white/60">Camera Look</span>
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5">
                          {(expandedRows.camera ? CAMERA_OPTIONS : CAMERA_OPTIONS.slice(0, 3)).map((opt) => {
                            const isSelected = selectedCamera === opt;
                            return (
                              <button
                                key={opt}
                                type="button"
                                onClick={() => handleToggle(selectedCamera, opt, setSelectedCamera)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                  isSelected
                                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-[0_2px_12px_rgba(245,158,11,0.4)] border border-amber-300/80 scale-[1.02]'
                                    : 'bg-white/[0.05] text-white/80 hover:bg-white/10 hover:text-white border border-white/10 active:scale-95'
                                }`}
                              >
                                {opt}
                              </button>
                            );
                          })}
                          <button
                            type="button"
                            onClick={() => toggleRowMore('camera')}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[10.5px] sm:text-xs font-bold text-amber-300 hover:text-white bg-amber-500/15 hover:bg-amber-500/25 border border-dashed border-amber-400/40 transition-colors cursor-pointer active:scale-95"
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

                      {/* Mood */}
                      <div className="rounded-2xl bg-white/[0.025] border border-white/8 p-3">
                        <div className="flex items-center justify-between gap-1.5 mb-2">
                          <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.8)]" />
                            <span className="text-[10px] uppercase tracking-wider font-extrabold text-white/60">Mood</span>
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5">
                          {(expandedRows.mood ? MOOD_OPTIONS : MOOD_OPTIONS.slice(0, 3)).map((opt) => {
                            const isSelected = selectedMood === opt;
                            return (
                              <button
                                key={opt}
                                type="button"
                                onClick={() => handleToggle(selectedMood, opt, setSelectedMood)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                  isSelected
                                    ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-[0_2px_12px_rgba(139,92,246,0.4)] border border-violet-300/80 scale-[1.02]'
                                    : 'bg-white/[0.05] text-white/80 hover:bg-white/10 hover:text-white border border-white/10 active:scale-95'
                                }`}
                              >
                                {opt}
                              </button>
                            );
                          })}
                          <button
                            type="button"
                            onClick={() => toggleRowMore('mood')}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[10.5px] sm:text-xs font-bold text-indigo-300 hover:text-white bg-indigo-500/15 hover:bg-indigo-500/25 border border-dashed border-indigo-400/40 transition-colors cursor-pointer active:scale-95"
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
                    </motion.div>
                  )}
                </AnimatePresence>

              </div>
            </div>

          </div>

          {/* Modal Footer Action Button (Mix & In-Place Generation) */}
          <div className="pt-3.5 border-t border-white/10 dark:border-white/8 shrink-0 relative z-10">
            <button
              type="button"
              onClick={handleMixAndGenerate}
              disabled={generating}
              className="cursor-pointer w-full py-3.5 sm:py-4 px-5 rounded-full text-sm sm:text-base font-black text-white bg-gradient-to-r from-[#7437ff] via-[#cc3ce2] to-[#f97316] hover:brightness-110 active:scale-[0.99] transition-all duration-300 shadow-[0_6px_25px_rgba(116,55,255,0.4)] flex items-center justify-center gap-2 relative overflow-hidden group disabled:opacity-75 disabled:cursor-not-allowed"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 pointer-events-none rounded-full" />
              {generating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span className="relative z-10">Synthesizing New Prompt...</span>
                </>
              ) : (
                <>
                  <SparkleIcon className="w-4.5 h-4.5 relative z-10 text-white" />
                  <span className="relative z-10">{isRemixed ? 'Re-Mix & Update Prompt' : 'Mix & Generate Remixed Prompt'}</span>
                </>
              )}
            </button>
          </div>

        </motion.div>

        {/* Puter Auth Modal if needed */}
        <PuterAuthModal
          isOpen={showPuterModal}
          onContinue={handlePuterModalContinue}
          onCancel={handlePuterModalCancel}
        />
      </div>
    </AnimatePresence>,
    document.body
  );
}
