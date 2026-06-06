import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, ShieldCheck, X, Loader2, CheckCircle2 } from 'lucide-react';
import { onAuthStateChanged, sendEmailVerification, type User } from 'firebase/auth';
import { auth } from '../lib/firebase';

export default function EmailVerificationPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (!auth) return;

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);

      if (!currentUser) {
        setIsOpen(false);
        return;
      }

      // Only show for email/password users who haven't verified
      const usesPasswordLogin = currentUser.providerData.some(
        (p) => p.providerId === 'password'
      );
      if (!usesPasswordLogin || currentUser.emailVerified) {
        setIsOpen(false);
        return;
      }

      // Check if user dismissed recently (24h cooldown)
      const dismissedAt = localStorage.getItem(`promptro:email-verify-dismissed:${currentUser.uid}`);
      if (dismissedAt) {
        const dismissed = parseInt(dismissedAt, 10);
        const now = Date.now();
        const twentyFourHours = 24 * 60 * 60 * 1000;
        if (now - dismissed < twentyFourHours) {
          setIsOpen(false);
          return;
        }
      }

      setIsOpen(true);
    });

    return () => unsubscribe();
  }, []);

  const handleVerify = async () => {
    if (!user) return;
    setSending(true);
    try {
      await sendEmailVerification(user);
      setSent(true);
    } catch (err) {
      console.error('Failed to send verification email:', err);
    } finally {
      setSending(false);
    }
  };

  const handleDismiss = () => {
    if (user) {
      localStorage.setItem(
        `promptro:email-verify-dismissed:${user.uid}`,
        Date.now().toString()
      );
    }
    setIsOpen(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleDismiss}
            className="fixed inset-0 bg-black/5 backdrop-blur-[8px]"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 flex w-full max-w-md flex-col overflow-hidden rounded-3xl border border-white/50 bg-white/75 shadow-[0_24px_60px_rgba(72,56,118,0.14)] backdrop-blur-3xl text-[#171421] dark:border-white/10 dark:bg-[#171421]/80 dark:text-white"
          >
            {/* Close button */}
            <button
              onClick={handleDismiss}
              className="absolute right-4 top-4 z-20 flex h-8 w-8 items-center justify-center rounded-full text-[#978eaa] transition-colors hover:bg-primary/10 hover:text-primary"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Gradient accent bar */}
            <div className="h-1.5 w-full bg-gradient-to-r from-[#8b5cf6] via-[#d94bcb] to-[#ff6a3d]" />

            <div className="p-6 sm:p-8">
              {/* Icon */}
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#8b5cf6]/15 to-[#ff6a3d]/10 dark:from-[#8b5cf6]/25 dark:to-[#ff6a3d]/15">
                <Mail className="h-7 w-7 text-primary" />
              </div>

              {!sent ? (
                <>
                  <h3 className="text-xl font-black tracking-tight text-[#171421] dark:text-white">
                    Verify Your Email
                  </h3>
                  <p className="mt-2 text-sm font-medium leading-relaxed text-[#5f5774] dark:text-[#afa6c8]">
                    Your account has been created successfully. Please verify your email to secure
                    your account and unlock all Promptro features.
                  </p>

                  {user?.email && (
                    <div className="mt-4 flex items-center gap-2.5 rounded-xl border border-[#e9e2f3] bg-[#faf8ff] px-4 py-2.5 dark:border-white/10 dark:bg-white/5">
                      <Mail className="h-4 w-4 shrink-0 text-primary" />
                      <span className="truncate text-sm font-bold text-[#242033] dark:text-white">
                        {user.email}
                      </span>
                    </div>
                  )}

                  <div className="mt-5 flex gap-2.5">
                    <button
                      onClick={handleDismiss}
                      className="flex h-11 flex-1 items-center justify-center rounded-full border border-[#e9e2f3] bg-white/78 text-sm font-bold text-[#242033] transition-all hover:-translate-y-0.5 dark:border-white/10 dark:bg-white/5 dark:text-white"
                    >
                      Later
                    </button>
                    <button
                      onClick={handleVerify}
                      disabled={sending}
                      className="flex h-11 flex-[1.6] items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#8b5cf6] to-[#ff6a3d] text-sm font-bold text-white shadow-[0_16px_34px_rgba(139,92,246,0.22)] transition-all hover:-translate-y-0.5 disabled:opacity-60"
                    >
                      {sending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <ShieldCheck className="h-4 w-4" />
                      )}
                      Verify Email
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                    <h3 className="text-xl font-black tracking-tight text-[#171421] dark:text-white">
                      Verification Email Sent!
                    </h3>
                  </div>
                  <p className="mt-2 text-sm font-medium leading-relaxed text-[#5f5774] dark:text-[#afa6c8]">
                    We've sent a verification link to{' '}
                    <span className="font-bold text-primary">{user?.email}</span>. Please check
                    your inbox and click the link to verify your email.
                  </p>
                  <p className="mt-2 text-xs font-medium text-[#978eaa]">
                    Don't forget to check your spam folder.
                  </p>

                  <button
                    onClick={handleDismiss}
                    className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#8b5cf6] to-[#ff6a3d] text-sm font-bold text-white shadow-[0_16px_34px_rgba(139,92,246,0.22)] transition-all hover:-translate-y-0.5"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Got it!
                  </button>
                </>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
