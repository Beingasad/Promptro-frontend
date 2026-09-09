import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
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
  anchorRect?: DOMRect | null;
}

export const getTierMetadata = (score?: number) => {
  if (score === undefined || score === null) {
    return {
      tier: 'Standard',
      badge: 'Standard',
      percentile: 'Top 50%',
      pillBg: 'from-[#475569]/85 via-[#64748B]/80 to-[#475569]/85',
      borderColor: 'border-[#94A3B8]/40',
      Icon: StandardIcon,
      shortWhy: 'Balanced prompt structure following general creative standards.',
      shortMeaning: 'Good baseline prompt ready for your creative customization.'
    };
  }
  if (score >= 95) {
    return {
      tier: 'Elite',
      badge: 'Elite',
      percentile: 'Top 1%',
      pillBg: 'from-amber-500/85 via-amber-600/80 to-amber-700/85',
      borderColor: 'border-amber-400/50',
      Icon: EliteIcon,
      shortWhy: 'Crafted with master-level details, studio lighting, and zero flaws.',
      shortMeaning: 'Top 1% prompt. Generates flawless, ultra-realistic masterpiece art.'
    };
  }
  if (score >= 90) {
    return {
      tier: 'Premium',
      badge: 'Premium',
      percentile: 'Top 5%',
      pillBg: 'from-blue-500/85 via-blue-600/80 to-indigo-700/85',
      borderColor: 'border-blue-400/50',
      Icon: PremiumIcon,
      shortWhy: 'Cinematic composition, vibrant color balance, and high prompt accuracy.',
      shortMeaning: 'Top 5% high-grade prompt tested for sharp, commercial-quality images.'
    };
  }
  if (score >= 80) {
    return {
      tier: 'Excellent',
      badge: 'Excellent',
      percentile: 'Top 15%',
      pillBg: 'from-purple-500/85 via-purple-600/80 to-pink-600/85',
      borderColor: 'border-purple-400/50',
      Icon: ExcellentIcon,
      shortWhy: 'Rich artistic styling, scene balance, and clean visual details.',
      shortMeaning: 'Top 15% prompt that consistently creates striking and creative images.'
    };
  }
  if (score >= 70) {
    return {
      tier: 'Verified',
      badge: 'Verified',
      percentile: 'Top 30%',
      pillBg: 'from-emerald-500/85 via-green-600/80 to-teal-700/85',
      borderColor: 'border-emerald-400/50',
      Icon: VerifiedIcon,
      shortWhy: 'Tested by AI to ensure clean output without messy artifacts or blur.',
      shortMeaning: 'Reliable prompt proven to produce clean, high-quality images consistently.'
    };
  }
  return {
    tier: 'Standard',
    badge: 'Standard',
    percentile: 'Top 50%',
    pillBg: 'from-[#475569]/85 via-[#64748B]/80 to-[#475569]/85',
    borderColor: 'border-[#94A3B8]/40',
    Icon: StandardIcon,
    shortWhy: 'Balanced prompt structure following general creative standards.',
    shortMeaning: 'Good baseline prompt ready for your creative customization.'
  };
};

/**
 * In-Card Quality Tier Overlay:
 * Directly renders inside the ImageCard, positioned right beneath the top tag,
 * spanning from the card's left side all the way beneath the right tag.
 */
export const QualityTierCardOverlay: React.FC<{
  prompt: QualityPromptData;
  onClose: () => void;
}> = ({ prompt, onClose }) => {
  const score = prompt.final_quality_score ?? 78;
  const currentTier = getTierMetadata(prompt.final_quality_score);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      if (overlayRef.current && !overlayRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const timer = setTimeout(() => {
      window.addEventListener('click', handleOutsideClick, true);
      window.addEventListener('touchstart', handleOutsideClick, true);
    }, 10);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('click', handleOutsideClick, true);
      window.removeEventListener('touchstart', handleOutsideClick, true);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  return (
    <motion.div
      ref={overlayRef}
      initial={{ opacity: 0, y: -6, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -6, scale: 0.96 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      style={{
        WebkitBackdropFilter: 'blur(36px) saturate(210%)',
        backdropFilter: 'blur(36px) saturate(210%)',
        boxShadow: 'inset 0 1px 1px 0 rgba(255, 255, 255, 0.45), inset 0 -1px 1px 0 rgba(0, 0, 0, 0.2), 0 14px 34px -4px rgba(0, 0, 0, 0.65)',
      }}
      className={`absolute top-[32px] md:top-[38px] left-2 right-2 md:left-3 md:right-3 z-30 rounded-[18px] border p-2 sm:p-2.5 bg-gradient-to-r ${currentTier.pillBg} ${currentTier.borderColor} text-white flex flex-col gap-1.5 select-none`}
    >
      {/* Header: Tier Icon, Badge Name, Score Pill, Close Button */}
      <div className="flex items-center justify-between gap-1.5 border-b border-white/20 pb-1">
        <div className="flex items-center gap-1.5 min-w-0">
          <div className="w-4.5 h-4.5 rounded-full bg-white/20 border border-white/30 flex items-center justify-center shrink-0 shadow-xs">
            <currentTier.Icon className="w-2.5 h-2.5 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]" strokeWidth={2.5} />
          </div>
          <span className="text-[11px] font-black text-white tracking-wide truncate">
            {currentTier.badge} Quality
          </span>
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-white/20 border border-white/25 text-white shrink-0">
            {score}/100 • {currentTier.percentile}
          </span>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onClose();
          }}
          className="w-4.5 h-4.5 rounded-full bg-white/15 hover:bg-white/30 text-white flex items-center justify-center shrink-0 cursor-pointer transition-all active:scale-90"
          aria-label="Close"
        >
          <X className="w-2.5 h-2.5" />
        </button>
      </div>

      {/* Explanation: Why & Meaning in simple English */}
      <div className="flex flex-col gap-1 text-left px-0.5">
        <div className="flex items-start gap-1 text-[10px] leading-tight">
          <span className="font-black text-white shrink-0">Why:</span>
          <span className="text-white/95 font-medium leading-snug">{currentTier.shortWhy}</span>
        </div>
        <div className="flex items-start gap-1 text-[9.5px] leading-tight text-white/90">
          <span className="font-black text-white shrink-0">Meaning:</span>
          <span className="font-medium leading-snug">{currentTier.shortMeaning}</span>
        </div>
      </div>
    </motion.div>
  );
};

export const QualityTierModal: React.FC<QualityTierModalProps> = ({ 
  isOpen, 
  onClose, 
  prompt, 
  anchorRect 
}) => {
  const score = prompt.final_quality_score ?? 78;
  const currentTier = getTierMetadata(prompt.final_quality_score);

  const [popoverStyle, setPopoverStyle] = useState<React.CSSProperties>({});

  useEffect(() => {
    if (!isOpen) return;

    const updatePosition = () => {
      const width = Math.min(window.innerWidth - 20, 360);

      if (anchorRect) {
        let left = anchorRect.left;
        // Keep within horizontal screen bounds
        if (left + width > window.innerWidth - 10) {
          left = window.innerWidth - width - 10;
        }
        if (left < 10) left = 10;

        // Position vertically: prefer directly below the tag, fallback to above if near bottom
        const estimatedHeight = 100;
        let top = anchorRect.bottom + 6;
        if (top + estimatedHeight > window.innerHeight - 10) {
          top = Math.max(10, anchorRect.top - estimatedHeight - 6);
        }

        setPopoverStyle({
          position: 'fixed',
          top: `${top}px`,
          left: `${left}px`,
          width: `${width}px`,
        });
      } else {
        // Fallback: top center
        setPopoverStyle({
          position: 'fixed',
          top: '75px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: `${width}px`,
        });
      }
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, anchorRect, onClose]);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Subtle click-outside backdrop to dismiss */}
          <div
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onClose();
            }}
            className="fixed inset-0 z-[9998] bg-black/15 cursor-default"
          />

          {/* Slim & Wide Liquid Glass Anchored Popover */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            style={{
              ...popoverStyle,
              WebkitBackdropFilter: 'blur(36px) saturate(210%)',
              backdropFilter: 'blur(36px) saturate(210%)',
              boxShadow: 'inset 0 1px 1px 0 rgba(255, 255, 255, 0.45), inset 0 -1px 1px 0 rgba(0, 0, 0, 0.2), 0 16px 36px -4px rgba(0, 0, 0, 0.55)',
            }}
            className={`z-[9999] rounded-[20px] border p-2.5 sm:p-3 bg-gradient-to-r ${currentTier.pillBg} ${currentTier.borderColor} text-white flex flex-col gap-1.5 select-none`}
          >
            {/* Header: Tag Icon, Badge Name, Score Pill, Close Button */}
            <div className="flex items-center justify-between gap-2 border-b border-white/20 pb-1.5">
              <div className="flex items-center gap-1.5 min-w-0">
                <div className="w-5 h-5 rounded-full bg-white/20 border border-white/30 flex items-center justify-center shrink-0 shadow-xs">
                  <currentTier.Icon className="w-3 h-3 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]" strokeWidth={2.5} />
                </div>
                <span className="text-[11.5px] font-black text-white tracking-wide">
                  {currentTier.badge} Quality
                </span>
                <span className="text-[9.5px] font-bold px-2 py-0.5 rounded-full bg-white/20 border border-white/25 text-white shrink-0">
                  {score}/100 • {currentTier.percentile}
                </span>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onClose();
                }}
                className="w-4.5 h-4.5 rounded-full bg-white/15 hover:bg-white/30 text-white flex items-center justify-center shrink-0 cursor-pointer transition-all active:scale-90"
                aria-label="Close"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </div>

            {/* Explanation Rows: Why & Meaning */}
            <div className="flex flex-col gap-1 text-left px-0.5">
              <div className="flex items-start gap-1 text-[10.5px] leading-tight">
                <span className="font-black text-white shrink-0">Why:</span>
                <span className="text-white/95 font-medium">{currentTier.shortWhy}</span>
              </div>
              <div className="flex items-start gap-1 text-[10px] leading-tight text-white/90">
                <span className="font-black text-white shrink-0">Meaning:</span>
                <span className="font-medium">{currentTier.shortMeaning}</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
};
