import { useEffect, useState, useRef, memo } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { StandardIcon } from './icons/StandardIcon';
import { VerifiedIcon } from './icons/VerifiedIcon';
import { PremiumIcon } from './icons/PremiumIcon';
import { EliteIcon } from './icons/EliteIcon';
import { ExcellentIcon } from './icons/ExcellentIcon';
import type { Prompt } from './ImageCard';

interface AnimatedQualityBadgeProps {
  prompt: Prompt;
  className?: string;
}

const AnimatedQualityBadge = memo(({ prompt, className }: AnimatedQualityBadgeProps) => {
  const score = prompt.final_quality_score;
  if (score === undefined) return null;

  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  // Deterministic top % based on score
  const getTopPercentile = (s: number) => {
    if (s >= 95) return 1;
    if (s >= 90) return 5;
    if (s >= 80) return 15;
    if (s >= 70) return 30;
    return 50;
  };

  // Format large numbers
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      notation: "compact",
      compactDisplay: "short",
      maximumFractionDigits: 1
    }).format(num);
  };

  const copies = prompt.copies || 0;
  const topPercent = getTopPercentile(score);

  // Configuration based on score
  let config = {
    tier: 'Standard',
    text: 'text-white',
    border: 'border-white/20',
    glow: 'shadow-[0_4px_15px_rgba(0,0,0,0.3)]',
    bg: 'bg-black/40',
    Icon: StandardIcon
  };

  if (score >= 95) {
    config = { tier: 'Elite', text: 'text-white', border: 'border-amber-400/50', glow: 'shadow-[0_4px_15px_rgba(245,158,11,0.5)]', bg: 'bg-gradient-to-r from-amber-500/60 to-amber-600/60', Icon: EliteIcon };
  } else if (score >= 90) {
    config = { tier: 'Premium', text: 'text-white', border: 'border-blue-400/50', glow: 'shadow-[0_4px_15px_rgba(59,130,246,0.5)]', bg: 'bg-gradient-to-r from-blue-500/60 to-blue-600/60', Icon: PremiumIcon };
  } else if (score >= 80) {
    config = { tier: 'Excellent', text: 'text-white', border: 'border-purple-400/50', glow: 'shadow-[0_4px_15px_rgba(168,85,247,0.5)]', bg: 'bg-gradient-to-r from-purple-500/60 to-purple-600/60', Icon: ExcellentIcon };
  } else if (score >= 70) {
    config = { tier: 'Verified', text: 'text-white', border: 'border-green-400/50', glow: 'shadow-[0_4px_15px_rgba(34,197,94,0.5)]', bg: 'bg-gradient-to-r from-green-500/60 to-green-600/60', Icon: VerifiedIcon };
  }

  const { Icon, text, border, glow, bg, tier } = config;

  // 4 steps of animation
  const frames = [
    { id: 'score', content: <span>{score}/100</span> },
    { id: 'ai', content: <span>AI Rated</span> },
    { id: 'copies', content: <span>Copied {formatNumber(copies)}</span> },
    { id: 'top', content: <span>Top {topPercent}%</span> }
  ];

  // IntersectionObserver to pause animation when off-screen
  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          intervalId = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % frames.length);
          }, 3000);
        } else {
          clearInterval(intervalId);
        }
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      clearInterval(intervalId);
      observer.disconnect();
    };
  }, [frames.length]);

  const variants = {
    initial: { y: prefersReducedMotion ? 0 : 10, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: prefersReducedMotion ? 0 : -10, opacity: 0 }
  };

  const containerClasses = className 
    ? `${className} flex items-center justify-between rounded-full ${bg} backdrop-blur-md px-2.5 py-[5px] border ${border} ${glow} pointer-events-none w-[115px] max-w-[120px] overflow-hidden`
    : `absolute z-10 top-1.5 right-2 md:top-2 md:right-3 flex items-center justify-between rounded-full ${bg} backdrop-blur-md px-2.5 py-[5px] border ${border} ${glow} pointer-events-none w-[115px] max-w-[120px] overflow-hidden`;

  return (
    <div 
      ref={containerRef}
      className={containerClasses}
    >
      {/* Left Static Side */}
      <div className="flex items-center gap-1 z-10 pr-1.5">
        <Icon className={`w-3 h-3 ${text}`} strokeWidth={2.5} />
        <span className={`text-[9px] font-bold ${text} tracking-wide`}>{tier}</span>
      </div>

      {/* Right Animated Side */}
      <div className="flex-1 relative flex items-center justify-end h-[14px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={frames[currentIndex].id}
            variants={variants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.3, ease: "easeOut" }}
            className={`absolute right-0 flex items-center gap-1 text-[8.5px] font-semibold ${text} whitespace-nowrap drop-shadow-sm`}
          >
            {frames[currentIndex].content}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
});

export default AnimatedQualityBadge;
