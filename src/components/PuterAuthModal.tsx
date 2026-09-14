import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, X, ArrowRight, Loader2 } from 'lucide-react';
import { SparkleIcon } from './icons/SparkleIcon';

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

  // Prevent background page scrolling when modal is active
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

  const handleContinueClick = async () => {
    try {
      setLoading(true);
      await onContinue();
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 select-none">
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={loading ? undefined : onCancel}
            className="fixed inset-0 bg-black/45 backdrop-blur-[6px] z-[80]"
            aria-hidden="true"
          />

          {/* Liquid Glass Modal Card */}
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 18 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 18 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="puter-auth-title"
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[92%] md:w-full max-w-md rounded-[2rem] md:rounded-[2.5rem] z-[90] overflow-hidden modal-glass p-5 sm:p-7 shadow-[0_24px_64px_rgba(0,0,0,0.45)] flex flex-col gap-4.5 text-[#171421] dark:text-white"
          >
            {/* Top Close Button */}
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="absolute top-4 right-4 p-2 rounded-full text-[#7b7294] dark:text-[#a299be] hover:text-[#171421] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer disabled:opacity-40"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Sparkle Icon Badge & Heading */}
            <div className="flex items-center gap-3.5 pr-6">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-purple-500/25 via-fuchsia-500/20 to-orange-500/20 border border-purple-400/35 text-purple-600 dark:text-purple-300 shadow-[0_4px_16px_rgba(168,85,247,0.22)] backdrop-blur-md">
                <SparkleIcon className="w-6 h-6 shrink-0 drop-shadow-[0_0_12px_rgba(168,85,247,0.8)]" variant="purple" />
              </div>
              <div className="min-w-0">
                <h3
                  id="puter-auth-title"
                  className="text-base sm:text-lg font-black text-[#171421] dark:text-white leading-tight tracking-tight"
                >
                  One quick step before we create
                </h3>
                <span className="text-[10.5px] sm:text-xs font-semibold text-purple-600 dark:text-purple-400 block mt-0.5">
                  AI Style Mixer &bull; Puter Integration
                </span>
              </div>
            </div>

            {/* Main Message */}
            <p className="text-xs sm:text-[13.5px] font-medium text-[#524a68] dark:text-[#afa6c8] leading-relaxed">
              AI Style Mixer uses Puter's advanced AI engine to craft your prompts. A free Puter account is required to generate prompts.
            </p>

            {/* Reassuring Security Callout with Shield Icon */}
            <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-purple-500/[0.08] dark:bg-purple-500/12 border border-purple-400/20 dark:border-purple-400/25 backdrop-blur-md">
              <ShieldCheck className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
              <p className="text-[11.5px] sm:text-xs font-semibold text-[#372d50] dark:text-[#e4d8ff] leading-snug">
                Your Promptro account and password are <span className="text-purple-600 dark:text-purple-300 font-bold">never shared</span> with Puter. Authentication is handled safely by Puter.
              </p>
            </div>

            {/* Reassurance Subtext */}
            <p className="text-[11px] font-medium text-[#786f91] dark:text-[#8e85a6] italic leading-snug">
              ✦ You'll only need to sign in once. Puter will remember your session so you won't have to sign in every time.
            </p>

            {/* Action Buttons (Consistent with AuthModal liquid glass design) */}
            <div className="flex items-center gap-3 pt-1 mt-1">
              {/* Cancel Button */}
              <button
                type="button"
                onClick={onCancel}
                disabled={loading}
                className="flex-1 h-11 sm:h-12 rounded-full border border-[#e9e2f3] dark:border-white/15 text-xs sm:text-sm font-bold text-[#242033] dark:text-white hover:bg-white/10 active:scale-98 transition-all cursor-pointer flex items-center justify-center disabled:opacity-40"
              >
                Cancel
              </button>

              {/* Continue to Sign In Button */}
              <button
                type="button"
                onClick={handleContinueClick}
                disabled={loading}
                className="flex-[1.8] h-11 sm:h-12 rounded-full bg-gradient-to-r from-[#7437ff] via-[#cc3ce2] to-[#f97316] text-xs sm:text-sm font-bold text-white shadow-lg shadow-purple-500/25 hover:scale-[1.02] active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Connecting...</span>
                  </>
                ) : (
                  <>
                    <span>Continue to Sign In</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
