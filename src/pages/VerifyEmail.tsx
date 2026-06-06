import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, CheckCircle2, XCircle, Loader2, ArrowRight } from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import SEOMeta from '../components/common/SEOMeta';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('No verification token provided. Please request a new verification email from your profile.');
      return;
    }

    const verify = async () => {
      try {
        const response = await axios.post(`${API_BASE_URL}/api/auth/confirm-verification`, {
          token: token.trim(),
        });
        setStatus('success');
        setMessage(response.data?.message || 'Your email has been verified successfully.');
      } catch (err: any) {
        setStatus('error');
        setMessage(err.response?.data?.detail || 'The verification link is invalid or has expired.');
      }
    };

    verify();
  }, [token]);

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <SEOMeta
        title="Verify Email | Promptro"
        description="Verify your Promptro account email to unlock full features."
        robots="noindex, nofollow"
      />
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 flex w-full max-w-md flex-col overflow-hidden rounded-3xl border border-white/80 bg-white/74 p-6 shadow-[0_24px_58px_rgba(72,56,118,0.14)] backdrop-blur-3xl dark:border-white/10 dark:bg-[#14111f]/80 text-[#171421] dark:text-white sm:p-8"
      >
        {/* Top gradient bar */}
        <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-[#8b5cf6] via-[#d94bcb] to-[#ff6a3d]" />

        <div className="flex flex-col items-center text-center mt-4">
          {status === 'loading' && (
            <>
              <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
              <h1 className="text-2xl font-black tracking-tight">Verifying Email</h1>
              <p className="mt-3 text-sm font-medium leading-relaxed text-[#756d8d] dark:text-[#afa6c8]">
                Please wait while we verify your email address and update your account...
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                type="spring"
                className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500"
              >
                <CheckCircle2 className="h-9 w-9" />
              </motion.div>
              <h1 className="text-2xl font-black tracking-tight text-[#171421] dark:text-white">Email Verified!</h1>
              <p className="mt-3 text-sm font-medium leading-relaxed text-[#5f5774] dark:text-[#afa6c8]">
                {message || 'Thank you, your email has been verified successfully. Your account is now fully secured.'}
              </p>
              <Link
                to="/"
                className="mt-6 flex h-11 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#8b5cf6] to-[#ff6a3d] text-sm font-bold text-white shadow-[0_12px_28px_rgba(139,92,246,0.2)] transition-all hover:-translate-y-0.5"
              >
                Go to Homepage
                <ArrowRight className="h-4 w-4" />
              </Link>
            </>
          )}

          {status === 'error' && (
            <>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                type="spring"
                className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-500"
              >
                <XCircle className="h-9 w-9" />
              </motion.div>
              <h1 className="text-2xl font-black tracking-tight text-[#171421] dark:text-white">Verification Failed</h1>
              <p className="mt-3 text-sm font-medium leading-relaxed text-[#5f5774] dark:text-[#afa6c8]">
                {message || 'The verification link is invalid or has expired.'}
              </p>
              <Link
                to="/"
                className="mt-6 flex h-11 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#8b5cf6] to-[#ff6a3d] text-sm font-bold text-white shadow-[0_12px_28px_rgba(139,92,246,0.2)] transition-all hover:-translate-y-0.5"
              >
                Go to Homepage
                <ArrowRight className="h-4 w-4" />
              </Link>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
