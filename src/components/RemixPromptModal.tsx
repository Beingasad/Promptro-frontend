import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { X, Copy, Check, SlidersHorizontal, ChevronRight, Wand2 } from 'lucide-react';
import { SparkleIcon } from './icons/SparkleIcon';

interface RemixPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  originalPrompt: string;
  category?: string;
  model?: string;
}

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
  const navigate = useNavigate();
  const [modifications, setModifications] = useState('');
  const [selectedStyle, setSelectedStyle] = useState<string>('');
  const [selectedLighting, setSelectedLighting] = useState<string>('');
  const [selectedCamera, setSelectedCamera] = useState<string>('');
  const [selectedMood, setSelectedMood] = useState<string>('');
  const [copiedOriginal, setCopiedOriginal] = useState(false);

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

  const handleCopyOriginal = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(originalPrompt);
    setCopiedOriginal(true);
    setTimeout(() => setCopiedOriginal(false), 1800);
  };

  const handleToggle = (current: string, val: string, setter: (v: string) => void) => {
    setter(current === val ? '' : val);
  };

  const handleProceedToMixer = () => {
    // Construct refined idea prompt blending original + custom modifications
    let combinedIdea = originalPrompt.trim();
    if (modifications.trim()) {
      combinedIdea = `${combinedIdea}. Modifications & Changes: ${modifications.trim()}`;
    }

    onClose();
    navigate('/style-mixer', {
      state: {
        idea: combinedIdea,
        style: selectedStyle,
        lighting: selectedLighting,
        camera: selectedCamera,
        mood: selectedMood,
        autoGenerate: true,
      },
    });
  };

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

          {/* Modal Header */}
          <div className="flex items-center justify-between gap-3 pb-3.5 border-b border-white/10 dark:border-white/8 shrink-0 relative z-10">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500/25 via-purple-500/10 to-orange-500/20 border border-white/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)]">
                <SparkleIcon className="w-5 h-5 shrink-0" variant="purple" />
              </div>
              <div className="min-w-0">
                <h3 className="text-base sm:text-lg font-black text-white leading-tight flex items-center gap-2">
                  <span>Remix This Prompt</span>
                </h3>
                <p className="text-[11px] sm:text-xs font-medium text-white/60 truncate">
                  Personalize and blend new creative styles into this prompt
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
            
            {/* BOX 1: Original Prompt Display */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs font-bold text-purple-300 px-0.5">
                <span className="flex items-center gap-1.5">
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-purple-500/30 text-[10px] font-black text-purple-200 border border-purple-400/40">1</span>
                  <span className="tracking-wide">Original Prompt</span>
                </span>
                <button
                  type="button"
                  onClick={handleCopyOriginal}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-[11px] font-semibold text-purple-200 hover:text-white transition-all cursor-pointer shadow-sm active:scale-95"
                >
                  {copiedOriginal ? (
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

              <div className="rounded-2xl bg-white/[0.04] dark:bg-white/[0.03] border border-white/12 dark:border-white/8 p-3.5 text-xs sm:text-[13px] leading-relaxed text-white/90 max-h-[110px] overflow-y-auto overscroll-contain hide-scrollbar select-text font-normal shadow-inner backdrop-blur-sm">
                {originalPrompt}
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
                  rows={3}
                  className="w-full rounded-2xl bg-white/[0.06] dark:bg-white/[0.04] border border-white/15 dark:border-white/10 focus:border-purple-400/80 p-3.5 text-xs sm:text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/25 transition-all resize-none hide-scrollbar shadow-inner"
                />
              </div>
            </div>

            {/* BOX 3: Style Mixer Options (Presets) */}
            <div className="flex flex-col gap-3 pt-1">
              <div className="flex items-center justify-between text-xs font-bold text-purple-300 px-0.5">
                <span className="flex items-center gap-1.5">
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-indigo-500/30 text-[10px] font-black text-indigo-200 border border-indigo-400/40">3</span>
                  <span className="flex items-center gap-1.5 tracking-wide">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-purple-400" />
                    <span>Add AI Style Presets (Optional)</span>
                  </span>
                </span>
              </div>

              {/* Style Presets Grid */}
              <div className="space-y-3 text-[11px]">
                {/* Visual Style */}
                <div className="rounded-2xl bg-white/[0.025] border border-white/8 p-3">
                  <div className="flex items-center gap-1.5 mb-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.8)]" />
                    <span className="text-[10px] uppercase tracking-wider font-extrabold text-white/60">Visual Style</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {STYLE_OPTIONS.map((opt) => {
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
                  </div>
                </div>

                {/* Lighting */}
                <div className="rounded-2xl bg-white/[0.025] border border-white/8 p-3">
                  <div className="flex items-center gap-1.5 mb-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-pink-400 shadow-[0_0_8px_rgba(244,114,182,0.8)]" />
                    <span className="text-[10px] uppercase tracking-wider font-extrabold text-white/60">Lighting</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {LIGHTING_OPTIONS.map((opt) => {
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
                  </div>
                </div>

                {/* Camera & Mood (2 Columns on larger screens) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {/* Camera */}
                  <div className="rounded-2xl bg-white/[0.025] border border-white/8 p-3">
                    <div className="flex items-center gap-1.5 mb-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
                      <span className="text-[10px] uppercase tracking-wider font-extrabold text-white/60">Camera Look</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {CAMERA_OPTIONS.map((opt) => {
                        const isSelected = selectedCamera === opt;
                        return (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => handleToggle(selectedCamera, opt, setSelectedCamera)}
                            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-[0_2px_12px_rgba(245,158,11,0.4)] border border-amber-300/80 scale-[1.02]'
                                : 'bg-white/[0.05] text-white/80 hover:bg-white/10 hover:text-white border border-white/10 active:scale-95'
                            }`}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Mood */}
                  <div className="rounded-2xl bg-white/[0.025] border border-white/8 p-3">
                    <div className="flex items-center gap-1.5 mb-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.8)]" />
                      <span className="text-[10px] uppercase tracking-wider font-extrabold text-white/60">Mood</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {MOOD_OPTIONS.map((opt) => {
                        const isSelected = selectedMood === opt;
                        return (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => handleToggle(selectedMood, opt, setSelectedMood)}
                            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-[0_2px_12px_rgba(139,92,246,0.4)] border border-violet-300/80 scale-[1.02]'
                                : 'bg-white/[0.05] text-white/80 hover:bg-white/10 hover:text-white border border-white/10 active:scale-95'
                            }`}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

              </div>
            </div>

          </div>

          {/* Modal Footer Action Button */}
          <div className="pt-3.5 border-t border-white/10 dark:border-white/8 shrink-0 relative z-10">
            <button
              type="button"
              onClick={handleProceedToMixer}
              className="cursor-pointer w-full py-3.5 sm:py-4 px-5 rounded-full text-sm sm:text-base font-black text-white bg-gradient-to-r from-[#7437ff] via-[#cc3ce2] to-[#f97316] hover:brightness-110 active:scale-[0.99] transition-all duration-300 shadow-[0_6px_25px_rgba(116,55,255,0.4)] flex items-center justify-center gap-2 relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 pointer-events-none rounded-full" />
              <span className="relative z-10">Mix &amp; Generate Remixed Prompt</span>
              <ChevronRight className="w-4 h-4 relative z-10 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
}
