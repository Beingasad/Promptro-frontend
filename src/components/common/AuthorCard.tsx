import { ExternalLink, Instagram, Twitter } from 'lucide-react';
import { Link } from 'react-router-dom';

interface AuthorCardProps {
  /** Compact inline variant vs. full card */
  variant?: 'compact' | 'full';
  /** Extra classes */
  className?: string;
}

/**
 * AuthorCard — EEAT trust signal.
 * Displays founder attribution on blog posts, prompt pages, and about page.
 * Hidden from casual notice but visible to search crawlers for E-E-A-T signals.
 */
export default function AuthorCard({ variant = 'full', className = '' }: AuthorCardProps) {
  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-2.5 ${className}`}>
        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#7437ff] to-[#ff642d] flex items-center justify-center shrink-0 shadow-[0_6px_16px_rgba(116,55,255,0.3)]">
          <span className="text-xs font-bold text-white">MA</span>
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold text-[#3a344c] dark:text-[#e4dcf5] leading-none">
            Mohammad Asad Ansari
          </p>
          <p className="text-[10px] text-[#756d8d] dark:text-[#afa6c8] mt-0.5">
            Founder of Promptro
          </p>
        </div>
      </div>
    );
  }

  return (
    <aside
      className={`rounded-[1.5rem] bg-white/60 dark:bg-white/5 border border-white/80 dark:border-white/10 p-5 md:p-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center ${className}`}
      aria-label="Article author"
    >
      {/* Avatar */}
      <div className="shrink-0">
        <div className="h-16 w-16 rounded-[1rem] bg-gradient-to-br from-[#7437ff] via-[#dd4bd2] to-[#ff642d] flex items-center justify-center shadow-[0_12px_28px_rgba(116,55,255,0.28)]">
          <span className="text-2xl font-black text-white select-none">MA</span>
        </div>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <h3 className="text-base font-bold text-[#171421] dark:text-white leading-none">
            Mohammad Asad Ansari
          </h3>
          <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider">
            Founder
          </span>
        </div>
        <p className="text-[13px] font-medium text-[#756d8d] dark:text-[#afa6c8] leading-relaxed">
          Founder of <strong className="text-[#171421] dark:text-white font-semibold">Promptro</strong> — a curated AI image prompt platform helping creators, designers and artists generate stunning visuals using the best AI models.
        </p>
        <div className="flex items-center gap-3 mt-3">
          <Link
            to="/about"
            className="flex items-center gap-1 text-[11px] font-semibold text-primary hover:text-primary-hover transition-colors"
          >
            About Promptro
            <ExternalLink className="h-3 w-3" />
          </Link>
          <a
            href="https://instagram.com/promptro.in"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[11px] font-semibold text-[#756d8d] dark:text-[#afa6c8] hover:text-primary transition-colors"
            aria-label="Promptro on Instagram"
          >
            <Instagram className="h-3.5 w-3.5" />
            Instagram
          </a>
          <a
            href="https://twitter.com/promptro_in"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[11px] font-semibold text-[#756d8d] dark:text-[#afa6c8] hover:text-primary transition-colors"
            aria-label="Promptro on Twitter"
          >
            <Twitter className="h-3.5 w-3.5" />
            Twitter
          </a>
        </div>
      </div>
    </aside>
  );
}
