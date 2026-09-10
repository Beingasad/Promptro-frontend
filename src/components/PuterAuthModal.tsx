import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ShieldCheck, X, ArrowRight, Loader2 } from 'lucide-react';

interface PuterAuthModalProps {
  isOpen: boolean;
  onContinue: () => Promise<void>;
  onCancel: () => void;
}

export default function PuterAuthModal({
  isOpen,
  onContinue,
  onCancel,
}: PuterAuthModalProps) {
  const [loading, setLoading] = useState(false);

  const handleContinueClick = async () => {
    try {
      setLoading(true);
      await onContinue();
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 select-none">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={loading ? undefined : onCancel}
            className="fixed inset-0 bg-black/55 backdrop-blur-[6px]"
            aria-hidden="true"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 14 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 14 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="puter-auth-title"
            className="relative z-10 w-full max-w-[440px] rounded-[1.85rem] bg-white/95 dark:bg-[#160f26]/95 border border-[#ede7f6] dark:border-white/15 p-5 sm:p-7 shadow-[0_24px_64px_rgba(0,0,0,0.35)] backdrop-blur-2xl flex flex-col gap-4.5"
          >
            {/* Top Close Button */}
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="absolute top-4 right-4 p-1.5 rounded-full text-[#7b7294] dark:text-[#a299be] hover:text-[#171421] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer disabled:opacity-40"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Sparkle Icon Badge */}
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-purple-500/20 via-fuchsia-500/20 to-orange-500/20 border border-purple-500/30 text-purple-600 dark:text-purple-300 shadow-sm">
                <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-300" />
              </div>
              <div className="flex-1 min-w-0 pr-6">
                <h3
                  id="puter-auth-title"
                  className="text-base sm:text-lg font-black text-[#1e1735] dark:text-white leading-snug tracking-tight"
                >
                  One quick step before we create ✨
                </h3>
              </div>
            </div>

            {/* Main Message */}
            <p className="text-xs sm:text-sm font-medium text-[#524a68] dark:text-[#bcb4d4] leading-relaxed">
              AI Style Mixer uses Puter's AI service to create your prompt. A free Puter account is required to use the AI generation feature.
            </p>

            {/* Reassuring Line with Shield Icon */}
            <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-purple-500/[0.08] dark:bg-purple-500/15 border border-purple-500/20 dark:border-purple-500/30">
              <ShieldCheck className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
              <p className="text-[11.5px] sm:text-xs font-semibold text-purple-900 dark:text-purple-200 leading-snug">
                Your Promptro account and password are not shared with Puter. Authentication is handled by Puter.
              </p>
            </div>

            {/* Small Note */}
            <p className="text-[11px] text-[#786f91] dark:text-[#9e95b7] italic leading-snug">
              You'll only need to sign in once. After that, Puter should remember your session so you won't have to sign in every time.
            </p>

            {/* Actions Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-1 mt-1">
              {/* Continue to Sign In */}
              <button
                type="button"
                onClick={handleContinueClick}
                disabled={loading}
                className="w-full sm:flex-1 py-3 px-5 rounded-full text-xs sm:text-sm font-black text-white bg-gradient-to-r from-[#7437ff] via-[#cc3ce2] to-[#f97316] hover:brightness-110 active:scale-[0.98] transition-all duration-200 shadow-[0_6px_20px_rgba(116,55,255,0.3)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Connecting to Puter...</span>
                  </>
                ) : (
                  <>
                    <span>Continue to Sign In</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>

              {/* Cancel */}
              <button
                type="button"
                onClick={onCancel}
                disabled={loading}
                className="w-full sm:w-auto py-2.5 px-4 rounded-full text-xs sm:text-sm font-bold text-[#62597b] dark:text-[#b8afcf] hover:text-[#171421] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer disabled:opacity-40"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
