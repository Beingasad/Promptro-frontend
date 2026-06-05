import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cookie } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { auth } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    // Listen for auth state to associate user ID with cookie consent updates
    if (auth) {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
          setUserId(user.uid);
          // If we have a stored preference, sync it with the database when the user logs in
          const storedConsent = localStorage.getItem('promptro:cookie-consent');
          if (storedConsent && (storedConsent === 'accepted' || storedConsent === 'rejected')) {
            axios.post(`${API_BASE_URL}/api/consent/cookie`, {
              user_id: user.uid,
              status: storedConsent,
            }).catch(err => console.error('Error syncing cookie consent:', err));
          }
        } else {
          setUserId(null);
        }
      });
      return () => unsubscribe();
    }
  }, []);

  useEffect(() => {
    // Check if user has already chosen cookie settings
    const storedConsent = localStorage.getItem('promptro:cookie-consent');
    if (!storedConsent) {
      // Small delay to make the entry feel smoother
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  // Prevent parent page scrolling when cookie consent is open
  useEffect(() => {
    if (isVisible) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isVisible]);

  const handleConsent = async (status: 'accepted' | 'rejected') => {
    localStorage.setItem('promptro:cookie-consent', status);
    setIsVisible(false);

    try {
      await axios.post(`${API_BASE_URL}/api/consent/cookie`, {
        user_id: userId,
        status: status,
      });
    } catch (error) {
      console.error('Failed to update cookie consent on server:', error);
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop Blur Overlay */}
          <motion.div
            key="cookie-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[105] bg-[#0c0a12]/30 backdrop-blur-[3px] pointer-events-auto"
          />

          <motion.div
            key="cookie-banner"
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-0 left-0 right-0 z-[110] w-full rounded-t-3xl border-t border-[#e9e2f3] bg-white/94 px-6 py-5 shadow-[0_-12px_42px_rgba(72,56,118,0.12)] backdrop-blur-2xl dark:border-white/10 dark:bg-[#0d0b14]/94 dark:shadow-[0_-12px_52px_rgba(0,0,0,0.48)] md:px-12 md:py-4.5"
          >
            <div className="mx-auto flex max-w-[1600px] flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary dark:bg-primary/20">
                  <Cookie className="h-5 w-5" />
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-[15px] font-bold text-[#171421] dark:text-white">Cookie Preferences</h4>
                  <p className="text-xs sm:text-sm font-semibold leading-relaxed text-[#5f5774] dark:text-[#afa6c8]">
                    We use cookies to improve your experience, analytics, and platform performance. Read our{' '}
                    <Link
                      to="/privacy-policy"
                      onClick={() => setIsVisible(false)}
                      className="text-primary hover:underline font-bold"
                    >
                      Privacy Policy
                    </Link>.
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2.5 justify-end shrink-0 w-full md:w-auto mt-2 md:mt-0">
                <button
                  onClick={() => handleConsent('rejected')}
                  className="flex-1 md:flex-initial text-center rounded-full border border-[#e9e2f3] bg-white/50 px-5 py-2.5 text-xs font-bold text-[#242033] hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10 transition-all active:scale-[0.98]"
                >
                  Reject
                </button>
                <button
                  onClick={() => handleConsent('accepted')}
                  className="flex-1 md:flex-initial text-center rounded-full bg-gradient-to-r from-[#8b5cf6] to-[#ff6a3d] px-6 py-2.5 text-xs font-bold text-white shadow-[0_10px_20px_rgba(139,92,246,0.15)] hover:opacity-95 transition-all active:scale-[0.98]"
                >
                  Accept All
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
