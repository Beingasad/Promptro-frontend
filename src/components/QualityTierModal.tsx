import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, CheckCircle2, Award, Zap, HelpCircle } from 'lucide-react';
import { EliteIcon } from './icons/EliteIcon';
import { PremiumIcon } from './icons/PremiumIcon';
import { ExcellentIcon } from './icons/ExcellentIcon';
import { VerifiedIcon } from './icons/VerifiedIcon';
import { StandardIcon } from './icons/StandardIcon';

export interface QualityPromptData {
  title?: string;
  category?: string;
  final_quality_score?: number;
  copies?: number;
  saves?: number;
  image_url?: string;
}

interface QualityTierModalProps {
  isOpen: boolean;
  onClose: () => void;
  prompt: QualityPromptData;
}

export const getTierMetadata = (score?: number) => {
  if (score === undefined || score === null) {
    return {
      tier: 'Standard',
      label: 'Standard Quality',
      badge: 'Standard',
      minScore: 0,
      maxScore: 69,
      percentile: 'Top 50%',
      gradient: 'from-slate-500 to-slate-600',
      badgeBg: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
      pillBg: 'from-slate-500/80 to-slate-600/80',
      borderColor: 'border-slate-400/40',
      glow: 'rgba(148, 163, 184, 0.25)',
      Icon: StandardIcon,
      tagReason: 'Yeh prompt Promptro ke standard AI generation criteria ko meet karta hai aur creative experimentation ke liye verified hai.',
      meaning: 'Standard tier prompts reliable aur simple rendering provide karte hain.'
    };
  }
  if (score >= 95) {
    return {
      tier: 'Elite',
      label: 'Elite Tier Masterpiece',
      badge: 'Elite',
      minScore: 95,
      maxScore: 100,
      percentile: 'Top 1%',
      gradient: 'from-amber-400 via-amber-500 to-orange-500',
      badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      pillBg: 'from-amber-500/85 to-amber-600/85',
      borderColor: 'border-amber-400/50',
      glow: 'rgba(245, 158, 11, 0.35)',
      Icon: EliteIcon,
      tagReason: 'Yeh prompt Promptro ke supreme Top 1% bracket me aata hai. Isme studio-grade camera lighting, ultra-detailed subject prompts aur exceptional community adoption hai.',
      meaning: 'Elite tier sirf un prompts ko milta hai jinki prompt engineering aur image realism industry-level benchmark hoti hai.'
    };
  }
  if (score >= 90) {
    return {
      tier: 'Premium',
      label: 'Premium Quality',
      badge: 'Premium',
      minScore: 90,
      maxScore: 94,
      percentile: 'Top 5%',
      gradient: 'from-blue-400 via-blue-500 to-indigo-600',
      badgeBg: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
      pillBg: 'from-blue-500/85 to-blue-600/85',
      borderColor: 'border-blue-400/50',
      glow: 'rgba(59, 130, 246, 0.35)',
      Icon: PremiumIcon,
      tagReason: 'Cinematic composition, sharp lighting parameters aur high prompt fidelity ke kaaran is prompt ko Premium badge diya gaya hai.',
      meaning: 'Premium tier prompts commercial projects aur high-definition digital art ke liye best maane jaate hain.'
    };
  }
  if (score >= 80) {
    return {
      tier: 'Excellent',
      label: 'Excellent Quality',
      badge: 'Excellent',
      minScore: 80,
      maxScore: 89,
      percentile: 'Top 15%',
      gradient: 'from-purple-400 via-purple-500 to-pink-500',
      badgeBg: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
      pillBg: 'from-purple-500/85 to-purple-600/85',
      borderColor: 'border-purple-400/50',
      glow: 'rgba(168, 85, 247, 0.35)',
      Icon: ExcellentIcon,
      tagReason: 'Rich artistic direction, consistent aesthetic results aur clean character/scene coherence ki wajah se is image ko Excellent rating mili hai.',
      meaning: 'Excellent tier prompts creators ko bina kisi distortion ke balanced aur visually striking results deliver karte hain.'
    };
  }
  if (score >= 70) {
    return {
      tier: 'Verified',
      label: 'Verified Quality',
      badge: 'Verified',
      minScore: 70,
      maxScore: 79,
      percentile: 'Top 30%',
      gradient: 'from-emerald-400 via-green-500 to-teal-600',
      badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      pillBg: 'from-green-500/85 to-green-600/85',
      borderColor: 'border-green-400/50',
      glow: 'rgba(16, 185, 129, 0.35)',
      Icon: VerifiedIcon,
      tagReason: 'Community tested & verified prompt. Is prompt ko multiple models pe verify kiya gaya hai aur yeh reliably clean art generate karta hai.',
      meaning: 'Verified tier confirm karta hai ki prompt tested hai aur broken anatomy ya blurry output create nahi karta.'
    };
  }
  return {
    tier: 'Standard',
    label: 'Standard Quality',
    badge: 'Standard',
    minScore: 0,
    maxScore: 69,
    percentile: 'Top 50%',
    gradient: 'from-slate-500 to-slate-600',
    badgeBg: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
    pillBg: 'from-slate-500/80 to-slate-600/80',
    borderColor: 'border-slate-400/40',
    glow: 'rgba(148, 163, 184, 0.25)',
    Icon: StandardIcon,
    tagReason: 'Yeh prompt Promptro ke standard AI generation criteria ko meet karta hai aur creative experimentation ke liye verified hai.',
    meaning: 'Standard tier prompts reliable aur simple rendering provide karte hain.'
  };
};

const ALL_TIERS = [
  { name: 'Elite', min: 95, icon: EliteIcon, color: 'text-amber-400', desc: 'Top 1% Masterpieces' },
  { name: 'Premium', min: 90, icon: PremiumIcon, color: 'text-blue-400', desc: 'Top 5% Cinematic Art' },
  { name: 'Excellent', min: 80, icon: ExcellentIcon, color: 'text-purple-400', desc: 'Top 15% Artistic Depth' },
  { name: 'Verified', min: 70, icon: VerifiedIcon, color: 'text-emerald-400', desc: 'Top 30% Tested & Reliable' },
];

export const QualityTierModal: React.FC<QualityTierModalProps> = ({ isOpen, onClose, prompt }) => {
  const score = prompt.final_quality_score ?? 78;
  const currentTier = getTierMetadata(prompt.final_quality_score);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4">
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onClose();
            }}
            className="fixed inset-0 bg-black/60 backdrop-blur-[10px] cursor-pointer"
          />

          {/* Liquid Glass Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 14 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-[420px] max-h-[88vh] overflow-y-auto hide-scrollbar rounded-[28px] p-5 sm:p-6 text-white liquid-glass-modal border border-white/20 shadow-[0_24px_70px_rgba(0,0,0,0.6)]"
          >
            {/* Ambient Radial Glow based on tier */}
            <div 
              className="pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 h-44 w-72 rounded-full blur-3xl opacity-35"
              style={{ background: currentTier.glow }}
            />

            {/* Header: Tier Icon, Title, and Close Button */}
            <div className="relative z-10 flex items-start justify-between gap-3 pb-3.5 border-b border-white/12">
              <div className="flex items-center gap-3">
                <div 
                  className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border border-white/25 shadow-md relative overflow-hidden"
                  style={{ background: `linear-gradient(135deg, ${currentTier.glow}, rgba(255,255,255,0.05))` }}
                >
                  <currentTier.Icon className="w-6 h-6 text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)]" strokeWidth={2.5} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base sm:text-lg font-black text-white leading-tight">
                      {currentTier.label}
                    </h3>
                  </div>
                  <p className="text-[11px] font-semibold text-[#E2E8F0] mt-0.5">
                    Promptro AI Quality Rating
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onClose();
                }}
                className="liquid-glass-control liquid-glass-sheen flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white hover:opacity-80 transition-all cursor-pointer"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content Body */}
            <div className="relative z-10 flex flex-col gap-4 mt-4">
              {/* Score & Percentile Overview Card */}
              <div className="p-3.5 sm:p-4 rounded-2xl liquid-glass-card border border-white/15 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#E2E8F0]">
                    AI Quality Score
                  </span>
                  <div className="flex items-baseline gap-1.5 mt-0.5">
                    <span className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                      {score}
                    </span>
                    <span className="text-xs font-bold text-white/60">/ 100</span>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1.5">
                  <span className={`text-[11px] font-black px-2.5 py-1 rounded-full border ${currentTier.badgeBg}`}>
                    {currentTier.percentile} Prompts
                  </span>
                  <span className="text-[10px] font-bold text-white/80">
                    {prompt.category || 'AI Prompt Art'}
                  </span>
                </div>
              </div>

              {/* Section 1: Yeh tag kyu mila hai? (Why this tag?) */}
              <div className="flex flex-col gap-1.5 text-left">
                <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-primary dark:text-[#c4b5fd]">
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                  <span>Is Image Ko Yeh Tag Kyu Mila?</span>
                </div>
                <p className="text-xs font-medium text-white/95 leading-relaxed bg-white/5 p-3 rounded-xl border border-white/10">
                  {currentTier.tagReason}
                </p>
              </div>

              {/* Evaluation Highlights */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex flex-col items-center justify-center">
                  <Award className="w-4 h-4 text-amber-400 mb-1" />
                  <span className="text-[10px] font-bold text-white">Lighting & Detail</span>
                  <span className="text-[9px] text-[#E2E8F0] font-medium mt-0.5">High Fidelity</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex flex-col items-center justify-center">
                  <Zap className="w-4 h-4 text-blue-400 mb-1" />
                  <span className="text-[10px] font-bold text-white">Coherence</span>
                  <span className="text-[9px] text-[#E2E8F0] font-medium mt-0.5">Zero Artifacts</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex flex-col items-center justify-center">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 mb-1" />
                  <span className="text-[10px] font-bold text-white">Reliability</span>
                  <span className="text-[9px] text-[#E2E8F0] font-medium mt-0.5">Tested Prompt</span>
                </div>
              </div>

              {/* Section 2: Iska kya matlab hai? (What does it mean?) */}
              <div className="flex flex-col gap-2 text-left">
                <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-primary dark:text-[#c4b5fd]">
                  <HelpCircle className="w-3.5 h-3.5 text-primary" />
                  <span>Promptro Quality Tiers Ka Matlab</span>
                </div>
                
                <div className="flex flex-col gap-1.5">
                  {ALL_TIERS.map((t) => {
                    const isCurrent = t.name.toLowerCase() === currentTier.tier.toLowerCase();
                    const TierIcon = t.icon;
                    return (
                      <div
                        key={t.name}
                        className={`flex items-center justify-between px-3 py-2 rounded-xl transition-all ${
                          isCurrent
                            ? 'bg-white/15 border border-white/35 shadow-[0_0_15px_rgba(255,255,255,0.12)]'
                            : 'bg-white/5 border border-white/8 opacity-80'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <TierIcon className={`w-4 h-4 ${t.color}`} strokeWidth={2.5} />
                          <div>
                            <span className="text-xs font-bold text-white leading-none">
                              {t.name} {isCurrent && <span className="text-[10px] font-black text-emerald-400 ml-1">(Current)</span>}
                            </span>
                            <p className="text-[10px] text-[#E2E8F0] font-medium mt-0.5">
                              {t.desc}
                            </p>
                          </div>
                        </div>
                        <span className="text-[10px] font-extrabold text-white/90 bg-white/10 px-2 py-0.5 rounded-md">
                          {t.min}+ Score
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onClose();
                }}
                className="w-full h-11 mt-1 rounded-2xl text-white text-xs font-black tracking-wide transition-all shadow-lg flex items-center justify-center cursor-pointer hover:scale-[1.01] active:scale-[0.98]"
                style={{
                  background: 'linear-gradient(135deg, #7C3AED, #9333EA)',
                  boxShadow: '0 4px 18px rgba(124, 58, 237, 0.45)'
                }}
              >
                Got It • Samajh Aa Gaya
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};
