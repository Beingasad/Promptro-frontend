import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { StandardIcon } from './icons/StandardIcon';
import { VerifiedIcon } from './icons/VerifiedIcon';
import { PremiumIcon } from './icons/PremiumIcon';
import { EliteIcon } from './icons/EliteIcon';
import { ExcellentIcon } from './icons/ExcellentIcon';

// Note: Ensure PromptDetail/Prompt interface has the required fields
interface PillPrompt {
  category: string;
  final_quality_score?: number;
}

interface AnimatedCategoryQualityPillProps {
  prompt: PillPrompt;
  className?: string;
  size?: 'sm' | 'md';
}

export const AnimatedCategoryQualityPill = ({ prompt, className = '', size = 'md' }: AnimatedCategoryQualityPillProps) => {
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
    if (s >= 95) return { bg: 'from-amber-500/80 to-amber-600/80', border: 'border-amber-400/50', Icon: EliteIcon, name: 'Elite' };
    if (s >= 90) return { bg: 'from-blue-500/80 to-blue-600/80', border: 'border-blue-400/50', Icon: PremiumIcon, name: 'Premium' };
    if (s >= 80) return { bg: 'from-purple-500/80 to-purple-600/80', border: 'border-purple-400/50', Icon: ExcellentIcon, name: 'Excellent' };
    if (s >= 70) return { bg: 'from-green-500/80 to-green-600/80', border: 'border-green-400/50', Icon: VerifiedIcon, name: 'Verified' };
    return { bg: 'from-black/50 to-black/30', border: 'border-white/20', Icon: StandardIcon, name: 'Standard' };
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
    const currentFrame = frames[frameIndex] || frames[0];
    const delay = currentFrame.type === 'category' ? 5000 : 2000;

    const timeout = setTimeout(() => {
      setFrameIndex(prev => (prev + 1) % frames.length);
    }, delay);

    return () => clearTimeout(timeout);
  }, [frameIndex, frames.length]);

  const currentFrame = frames[frameIndex] || frames[0];
  const isBadge = currentFrame.type === 'badge';

  const isSm = size === 'sm';
  
  const containerHeight = isSm ? 'h-[24px] md:h-[28px]' : 'h-8 md:h-10';
  const containerMinW = isSm ? 'min-w-[95px] md:min-w-[105px]' : 'min-w-[125px] md:min-w-[145px]';
  const categoryTextClass = isSm ? 'text-[10px] md:text-[11px]' : 'text-xs md:text-sm';
  const badgeTextClass = isSm ? 'text-[9px] md:text-[10px]' : 'text-[10px] md:text-sm';
  const iconClass = isSm ? 'w-2.5 h-2.5 md:w-3 md:h-3' : 'w-[10px] h-[10px] md:w-3.5 md:h-3.5';
  const containerPadding = isSm ? 'px-2.5 md:px-3' : 'px-4';
  const badgePadding = isSm ? 'px-2 md:px-2.5' : 'px-3 md:px-4';
  const badgeGap = isSm ? 'gap-1.5 md:gap-2' : 'gap-3 md:gap-4';

  return (
    <div className={`relative flex ${containerHeight} ${containerMinW} items-center justify-center rounded-full border transition-all duration-300 overflow-hidden bg-gradient-to-r shadow-[0_12px_28px_rgba(0,0,0,0.15)] box-border ${currentFrame.bg} ${currentFrame.border} ${className}`}>
       <AnimatePresence mode="wait">
          {isBadge ? (
             <motion.div 
                key="badge-layout"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className={`flex items-center justify-between w-full h-full ${badgePadding} ${badgeGap}`}
             >
                <div className="flex items-center gap-1 shrink-0">
                   {tier && <tier.Icon className={`${iconClass} text-white`} strokeWidth={2.5} />}
                   <span className={`${badgeTextClass} font-bold text-white tracking-wide leading-none`}>{tier?.name}</span>
                </div>
                <div className="flex items-center justify-end overflow-hidden">
                   <AnimatePresence mode="wait">
                      <motion.span
                         key={frameIndex}
                         initial={{ y: 15, opacity: 0 }}
                         animate={{ y: 0, opacity: 1 }}
                         exit={{ y: -15, opacity: 0 }}
                         transition={{ duration: 0.3 }}
                         className={`whitespace-nowrap ${badgeTextClass} font-bold text-white tracking-normal`}
                      >
                         {currentFrame.content}
                      </motion.span>
                   </AnimatePresence>
                </div>
             </motion.div>
          ) : (
             <motion.span
                key="category-layout"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className={`flex items-center justify-center w-full h-full whitespace-nowrap ${categoryTextClass} font-bold text-white tracking-wide ${containerPadding}`}
             >
                {currentFrame.content}
             </motion.span>
          )}
       </AnimatePresence>
    </div>
  );
};
