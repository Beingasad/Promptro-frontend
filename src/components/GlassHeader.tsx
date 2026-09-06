import { ArrowLeft } from 'lucide-react';
import { ReactNode } from 'react';

interface GlassHeaderProps {
  title: string;
  icon: ReactNode;
  onBack: (e: React.MouseEvent) => void;
}

export default function GlassHeader({ title, icon, onBack }: GlassHeaderProps) {
  return (
    <div className="sticky top-0 z-30 mb-3 mx-1 sm:mx-2 shrink-0 touch-none transition-all">
      <div className="liquid-glass-search liquid-glass-sheen relative grid grid-cols-[2.75rem_1fr_2.75rem] items-center h-12 md:h-14 w-full rounded-full px-1.5 overflow-hidden">
        <button
          type="button"
          onClick={onBack}
          className="liquid-glass-control liquid-glass-sheen flex h-9.5 w-9.5 md:h-11 md:w-11 items-center justify-center rounded-full text-[#171421] dark:text-white hover:scale-105 active:scale-95 transition-transform cursor-pointer"
          aria-label="Back to menu"
        >
          <ArrowLeft className="h-4.5 w-4.5 md:h-5 md:w-5" />
        </button>
        <h2 className="text-center text-sm md:text-base font-bold text-[#171421] dark:text-white line-clamp-1 px-2">
          {title}
        </h2>
        <div className="liquid-glass-control liquid-glass-sheen flex h-9.5 w-9.5 md:h-11 md:w-11 items-center justify-center overflow-hidden rounded-full text-primary">
          {icon}
        </div>
      </div>
    </div>
  );
}
