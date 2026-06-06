import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Check, Loader2 } from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { auth } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

interface TermsAcceptanceModalProps {
  // Option to trigger a manual check or check automatically
  onAccepted?: () => void;
}

export default function TermsAcceptanceModal({ onAccepted }: TermsAcceptanceModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    if (!auth) return;

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);

        // Only show Terms modal for Google users
        const isGoogleUser = currentUser.providerData.some(
          (p) => p.providerId === 'google.com'
        );
        if (!isGoogleUser) {
          setIsOpen(false);
          return;
        }

        try {
          // Check backend consent status
          const response = await axios.get(`${API_BASE_URL}/api/consent/${currentUser.uid}`);
          if (response.data && response.data.terms_accepted === false) {
            setIsOpen(true);
          } else {
            setIsOpen(false);
          }
        } catch (error) {
          console.error('Failed to check user terms acceptance:', error);
          // Since it's mandatory, let's keep it closed unless we confirm they are false, to prevent disrupting legitimate sessions.
        }
      } else {
        setUser(null);
        setIsOpen(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Prevent parent page scrolling when modal is open
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

  const handleAccept = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed || !user) return;

    setSubmitting(true);
    try {
      await axios.post(`${API_BASE_URL}/api/consent/accept`, {
        user_id: user.uid,
        email: user.email || null,
      });
      setIsOpen(false);
      if (onAccepted) onAccepted();
    } catch (error) {
      console.error('Failed to save terms acceptance:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Blur Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/5 backdrop-blur-[8px] pointer-events-auto"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 flex w-full max-w-lg flex-col overflow-hidden rounded-3xl border border-white/50 bg-white/75 p-6 shadow-[0_24px_60px_rgba(72,56,118,0.12)] backdrop-blur-3xl text-[#171421] dark:border-white/10 dark:bg-[#171421]/80 dark:text-white sm:p-8"
          >
            {/* Header */}
            <div className="flex flex-col gap-1.5 mb-4 pb-4 border-b border-[#e9e2f3] dark:border-white/5">
              {/* Row 1: Icon & Required Agreement text inline and same size */}
              <div className="flex items-center gap-1.5 text-primary">
                <FileText className="h-[18px] w-[18px] shrink-0" />
                <span className="text-[11px] font-black uppercase tracking-widest leading-none">
                  Required Agreement
                </span>
              </div>
              
              {/* Row 2: Heading below */}
              <h3 className="text-base sm:text-lg font-black tracking-tight text-[#171421] dark:text-white leading-tight">
                Terms & Conditions
              </h3>
            </div>

            <p className="text-xs font-semibold leading-relaxed text-[#5f5774] dark:text-[#afa6c8] mb-4">
              To continue using Promptro, please review and accept our Terms & Conditions and Privacy Policy.
            </p>

            {/* Scrollable Summary Cards */}
            <div className="mb-5 max-h-52 overflow-y-auto space-y-3.5 hide-scrollbar">
              <div className="flex gap-3.5 items-start">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary dark:bg-primary/20">
                  1
                </span>
                <div>
                  <h4 className="font-bold text-[#171421] dark:text-white text-xs mb-0.5">Acceptance of Terms</h4>
                  <p className="text-[11px] leading-relaxed text-[#5f5774] dark:text-[#afa6c8]">By creating an account, you agree to comply with our full Terms of Service and Privacy Policy.</p>
                </div>
              </div>

              <div className="flex gap-3.5 items-start">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary dark:bg-primary/20">
                  2
                </span>
                <div>
                  <h4 className="font-bold text-[#171421] dark:text-white text-xs mb-0.5">Account & Credentials</h4>
                  <p className="text-[11px] leading-relaxed text-[#5f5774] dark:text-[#afa6c8]">You are responsible for safeguarding your credentials. Violations of policy can result in account suspension.</p>
                </div>
              </div>

              <div className="flex gap-3.5 items-start">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary dark:bg-primary/20">
                  3
                </span>
                <div>
                  <h4 className="font-bold text-[#171421] dark:text-white text-xs mb-0.5">No Scrapes & Crawlers</h4>
                  <p className="text-[11px] leading-relaxed text-[#5f5774] dark:text-[#afa6c8]">Prompts are for personal and commercial creative use. Data scraping to build competing databases is prohibited.</p>
                </div>
              </div>

              <div className="flex gap-3.5 items-start">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary dark:bg-primary/20">
                  4
                </span>
                <div>
                  <h4 className="font-bold text-[#171421] dark:text-white text-xs mb-0.5">Privacy & Cookies</h4>
                  <p className="text-[11px] leading-relaxed text-[#5f5774] dark:text-[#afa6c8]">We use browser local storage to save your preferences. Minimal analytics run in the background to ensure reliability.</p>
                </div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleAccept} className="flex flex-col gap-4">
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <div className="relative mt-0.5 shrink-0">
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="peer sr-only"
                    required
                  />
                  <div className={`h-5 w-5 rounded-md border transition-all flex items-center justify-center ${
                    agreed 
                      ? "border-primary bg-primary scale-105" 
                      : "border-[#d9cde8] bg-[#fdfcff] hover:border-primary/50 dark:border-white/20 dark:bg-white/5"
                  }`}>
                    <Check className={`h-3 w-3 text-white transition-opacity duration-200 ${agreed ? "opacity-100" : "opacity-0"}`} />
                  </div>
                </div>
                <span className="text-[12px] font-semibold text-[#4a445f] dark:text-[#c4bed6] leading-snug">
                  I agree to the{' '}
                  <a
                    href="/terms"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline font-bold"
                  >
                    Terms & Conditions
                  </a>{' '}
                  and{' '}
                  <a
                    href="/privacy-policy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline font-bold"
                  >
                    Privacy Policy
                  </a>.
                </span>
              </label>

              <button
                type="submit"
                disabled={!agreed || submitting}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#8b5cf6] to-[#ff6a3d] text-sm font-bold text-white shadow-[0_16px_34px_rgba(139,92,246,0.22)] transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 active:scale-[0.98]"
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Accept & Continue'
                )}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
