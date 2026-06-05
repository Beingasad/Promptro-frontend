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
          // Fallback to showing modal to be safe if checking fails, or keep hidden?
          // Since it's mandatory, let's keep it closed unless we confirm they are false, to prevent disrupting legitimate sessions.
        }
      } else {
        setUser(null);
        setIsOpen(false);
      }
    });

    return () => unsubscribe();
  }, []);

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
            className="fixed inset-0 bg-[#0c0a12]/80 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 flex w-full max-w-lg flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#171421]/90 p-6 shadow-[0_24px_60px_rgba(0,0,0,0.5)] backdrop-blur-2xl text-white sm:p-8"
          >
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Terms of Service Updates</h3>
                <p className="text-xs font-semibold text-[#afa6c8] uppercase tracking-wider">Required Agreement</p>
              </div>
            </div>

            <p className="text-sm font-medium text-[#c4bed6] mb-4">
              To continue using Promptro, please review and accept our updated Terms of Service and Privacy Policy.
            </p>

            {/* Scrollable Summary */}
            <div className="mb-5 max-h-48 overflow-y-auto rounded-2xl border border-white/5 bg-white/5 p-4 text-xs font-medium text-[#afa6c8] leading-relaxed space-y-3 custom-scrollbar">
              <div>
                <h4 className="font-bold text-white mb-1">1. Acceptance of Terms</h4>
                <p>By creating an account or signing in to Promptro, you agree to comply with our full Terms of Service and Privacy Policy. Please ensure you review both documents.</p>
              </div>
              <div>
                <h4 className="font-bold text-white mb-1">2. User Account & Safety</h4>
                <p>You agree to protect your credentials, maintain account security, and notify us of any security breach. Accounts violating terms may be suspended.</p>
              </div>
              <div>
                <h4 className="font-bold text-white mb-1">3. Curated Library & Scraper Protection</h4>
                <p>Prompts are provided for personal and commercial creative use. Scraped/resold libraries or competing products built from data scraping are strictly prohibited.</p>
              </div>
              <div>
                <h4 className="font-bold text-white mb-1">4. Cookies & Analytics</h4>
                <p>We use localized browser storage to retain state and cookie preferences. We run minimal analytics to optimize system and database performance.</p>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleAccept} className="flex flex-col gap-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <div className="relative mt-0.5 shrink-0">
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="peer sr-only"
                    required
                  />
                  <div className="h-5 w-5 rounded-md border border-white/20 bg-white/5 transition-all peer-checked:border-primary peer-checked:bg-primary flex items-center justify-center">
                    <Check className="h-3 w-3 text-white opacity-0 transition-opacity peer-checked:opacity-100" />
                  </div>
                </div>
                <span className="text-xs font-medium text-[#c4bed6]">
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
                className="flex h-11 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#8b5cf6] to-[#ff6a3d] text-sm font-bold text-white shadow-[0_16px_34px_rgba(139,92,246,0.22)] transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
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
