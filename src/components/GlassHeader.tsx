import { ArrowLeft } from 'lucide-react';
import { ReactNode } from 'react';

interface GlassHeaderProps {
  title: string;
  icon: ReactNode;
  onBack: (e: React.MouseEvent) => void;
}

export default function GlassHeader({ title, icon, onBack }: GlassHeaderProps) {
  return (
    <div className="sticky top-2 z-30 grid grid-cols-[2.75rem_1fr_2.75rem] items-center h-14 bg-white/85 dark:bg-[#1f1a2e]/85 backdrop-blur-xl border border-white/70 dark:border-white/10 shadow-[0_4px_16px_rgba(72,56,118,0.08)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.3)] rounded-full px-1.5 touch-none mb-4 shrink-0 mx-2 transition-all">
      <button
        type="button"
        onClick={onBack}
        className="liquid-glass-control liquid-glass-sheen flex h-11 w-11 items-center justify-center rounded-full text-[#171421] dark:text-white"
        aria-label="Back to menu"
      >
        <ArrowLeft className="h-5 w-5" />
      </button>
      <h2 className="text-center text-base sm:text-lg font-bold text-[#171421] dark:text-white line-clamp-1 px-2">
        {title}
      </h2>
      <div className="liquid-glass-subtle flex h-11 w-11 items-center justify-center overflow-hidden rounded-full text-[#171421] dark:text-white">
        {icon}
      </div>
    </div>
  );
}
