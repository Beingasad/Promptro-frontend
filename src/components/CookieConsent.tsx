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
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.95 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="fixed bottom-24 left-4 right-4 z-50 mx-auto max-w-4xl rounded-2xl border border-white/60 bg-white/70 p-5 shadow-[0_20px_50px_rgba(72,56,118,0.18)] backdrop-blur-xl dark:border-white/10 dark:bg-[#1a1625]/80 sm:p-6 md:bottom-4"
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary dark:bg-primary/20">
                <Cookie className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-bold text-[#171421] dark:text-white">Cookie Preferences</h4>
                <p className="text-sm font-medium leading-relaxed text-[#736b88] dark:text-[#afa6c8]">
                  We use cookies to improve your experience, analytics, and platform performance.
                </p>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-2.5 sm:justify-end">
              <Link
                to="/privacy-policy"
                onClick={() => setIsVisible(false)}
                className="rounded-full px-3 py-1.5 text-xs font-bold text-[#736b88] hover:text-[#171421] dark:text-[#afa6c8] dark:hover:text-white transition-colors"
              >
                View Privacy Policy
              </Link>
              <button
                onClick={() => handleConsent('rejected')}
                className="rounded-full border border-[#e9e2f3] bg-white/50 px-4 py-2.5 text-xs font-bold text-[#242033] hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10 transition-colors"
              >
                Reject Non-Essential Cookies
              </button>
              <button
                onClick={() => handleConsent('accepted')}
                className="rounded-full bg-gradient-to-r from-[#8b5cf6] to-[#ff6a3d] px-5 py-2.5 text-xs font-bold text-white shadow-[0_10px_20px_rgba(139,92,246,0.15)] hover:opacity-95 transition-all"
              >
                Accept All
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
