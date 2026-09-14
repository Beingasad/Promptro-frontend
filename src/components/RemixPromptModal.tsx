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
        {/* Backdrop Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-md"
          onClick={onClose}
        />

        {/* Bottom Sheet Modal (Swipe-up, ~65% screen max height) */}
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          drag="y"
          dragConstraints={{ top: 0 }}
          dragElastic={0.15}
          onDragEnd={(_, info) => {
            if (info.offset.y > 120 || info.velocity.y > 400) {
              onClose();
            }
          }}
          className="relative z-10 w-full max-w-2xl mx-auto rounded-t-[2.25rem] bg-[#120c22]/95 dark:bg-[#0e091b]/95 border-t border-x border-white/20 dark:border-white/10 p-4 sm:p-6 shadow-2xl backdrop-blur-2xl max-h-[82vh] sm:max-h-[86vh] flex flex-col justify-between overflow-hidden"
          style={{ willChange: 'transform' }}
        >
          {/* Top Drag Handle Bar */}
          <div className="flex justify-center pb-2 cursor-grab active:cursor-grabbing">
            <div className="w-12 h-1.5 rounded-full bg-white/30 hover:bg-white/50 transition-colors" />
          </div>

          {/* Modal Header */}
          <div className="flex items-center justify-between gap-3 pb-3 border-b border-white/10 shrink-0">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500/20 to-orange-500/20 border border-purple-400/30 text-purple-400">
                <SparkleIcon className="w-4.5 h-4.5 shrink-0" variant="purple" />
              </div>
              <div className="min-w-0">
                <h3 className="text-base sm:text-lg font-black text-white leading-tight flex items-center gap-1.5">
                  Remix This Prompt
                </h3>
                <p className="text-[11px] sm:text-xs font-medium text-white/60 truncate">
                  Personalize and blend new styles into this prompt
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-4.5 h-4.5" />
            </button>
          </div>

          {/* Scrollable Modal Body (3 Boxes) */}
          <div className="flex-1 overflow-y-auto overscroll-contain py-3.5 space-y-4 pr-1 text-white">
            
            {/* BOX 1: Original Prompt Display */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs font-bold text-purple-300 px-0.5">
                <span className="flex items-center gap-1">
                  <span>1. Original Prompt</span>
                </span>
                <button
                  type="button"
                  onClick={handleCopyOriginal}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-purple-300/80 hover:text-purple-200 transition-colors cursor-pointer"
                >
                  {copiedOriginal ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              <div className="rounded-2xl bg-white/[0.04] border border-white/10 p-3 text-xs sm:text-[13px] leading-relaxed text-white/90 max-h-[110px] overflow-y-auto select-text font-normal">
                {originalPrompt}
              </div>
            </div>

            {/* BOX 2: Modifications / What changes to make */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs font-bold text-orange-300 px-0.5">
                <span>2. What changes do you want to make?</span>
                <span className="text-[10.5px] font-medium text-white/40">
                  {modifications.length}/300
                </span>
              </div>

              <div className="relative">
                <textarea
                  value={modifications}
                  onChange={(e) => setModifications(e.target.value.slice(0, 300))}
                  placeholder="Describe your adjustments (e.g., change background to futuristic cyberpunk neon city, make lighting dramatic sunset, add rain reflections on road...)"
                  rows={3}
                  className="w-full rounded-2xl bg-white/[0.07] border border-white/15 focus:border-purple-400/80 p-3 text-xs sm:text-sm text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-purple-400/40 transition-all resize-none"
                />
              </div>
            </div>

            {/* BOX 3: Style Mixer Options (Presets) */}
            <div className="flex flex-col gap-2.5 pt-1">
              <div className="flex items-center justify-between text-xs font-bold text-purple-300 px-0.5">
                <span className="flex items-center gap-1.5">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-purple-400" />
                  <span>3. Add AI Style Presets (Optional)</span>
                </span>
              </div>

              {/* Style Presets */}
              <div className="space-y-2 text-[11px]">
                {/* Visual Style */}
                <div>
                  <span className="text-[10px] uppercase tracking-wider font-extrabold text-white/50 block mb-1">Visual Style</span>
                  <div className="flex flex-wrap gap-1.5">
                    {STYLE_OPTIONS.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => handleToggle(selectedStyle, opt, setSelectedStyle)}
                        className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          selectedStyle === opt
                            ? 'bg-purple-600 text-white shadow-md shadow-purple-600/40 border border-purple-400'
                            : 'bg-white/5 text-white/80 hover:bg-white/10 border border-white/10'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Lighting */}
                <div>
                  <span className="text-[10px] uppercase tracking-wider font-extrabold text-white/50 block mb-1">Lighting</span>
                  <div className="flex flex-wrap gap-1.5">
                    {LIGHTING_OPTIONS.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => handleToggle(selectedLighting, opt, setSelectedLighting)}
                        className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          selectedLighting === opt
                            ? 'bg-pink-600 text-white shadow-md shadow-pink-600/40 border border-pink-400'
                            : 'bg-white/5 text-white/80 hover:bg-white/10 border border-white/10'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Camera & Mood (2 Columns or flex-wrap) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider font-extrabold text-white/50 block mb-1">Camera Look</span>
                    <div className="flex flex-wrap gap-1.5">
                      {CAMERA_OPTIONS.map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => handleToggle(selectedCamera, opt, setSelectedCamera)}
                          className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            selectedCamera === opt
                              ? 'bg-amber-600 text-white shadow-md shadow-amber-600/40 border border-amber-400'
                              : 'bg-white/5 text-white/80 hover:bg-white/10 border border-white/10'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase tracking-wider font-extrabold text-white/50 block mb-1">Mood</span>
                    <div className="flex flex-wrap gap-1.5">
                      {MOOD_OPTIONS.map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => handleToggle(selectedMood, opt, setSelectedMood)}
                          className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            selectedMood === opt
                              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/40 border border-indigo-400'
                              : 'bg-white/5 text-white/80 hover:bg-white/10 border border-white/10'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

              </div>
            </div>

          </div>

          {/* Modal Footer Action Button */}
          <div className="pt-3 border-t border-white/10 shrink-0">
            <button
              type="button"
              onClick={handleProceedToMixer}
              className="cursor-pointer w-full py-3.5 px-5 rounded-full text-sm sm:text-base font-black text-white bg-gradient-to-r from-[#7437ff] via-[#cc3ce2] to-[#f97316] hover:brightness-110 active:scale-[0.99] transition-all duration-300 shadow-[0_6px_22px_rgba(116,55,255,0.35)] flex items-center justify-center gap-2"
            >
              <span>Mix &amp; Generate Remixed Prompt</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
}
