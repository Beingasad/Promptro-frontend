import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ShieldCheck, Clock, User, Landmark, HelpCircle, Loader2, RefreshCw, BadgeCheck, XCircle } from 'lucide-react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../lib/firebase';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import SEOMeta from '../components/common/SEOMeta';

interface BackendProfile {
  id: number;
  firebase_uid: string;
  first_name: string;
  last_name: string | null;
  gender: string | null;
  email: string;
  provider: string;
  terms_accepted: boolean;
  terms_accepted_at: string | null;
  email_verified: boolean;
  created_at: string;
}

export default function Profile() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [profile, setProfile] = useState<BackendProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (!auth) return;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate('/auth', { replace: true });
        return;
      }
      setCurrentUser(user);

      try {
        const response = await axios.get(`${API_BASE_URL}/api/auth/profile/${user.uid}`);
        setProfile(response.data);
      } catch (err) {
        console.error('Failed to load user profile from backend:', err);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleSendVerification = async () => {
    if (!currentUser || !profile) return;
    setActionLoading(true);
    setMessage(null);

    try {
      await axios.post(`${API_BASE_URL}/api/auth/send-verification`, {
        email: profile.email,
        firebase_uid: profile.firebase_uid,
      });
      setMessage({
        type: 'success',
        text: `Verification email sent! Please check your inbox at ${profile.email}.`,
      });
    } catch (err: any) {
      console.error('Failed to send verification email:', err);
      setMessage({
        type: 'error',
        text: err.response?.data?.detail || 'Failed to send verification email. Please try again later.',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
        <XCircle className="h-12 w-12 text-rose-500 mb-3" />
        <h2 className="text-xl font-bold">Profile Load Failed</h2>
        <p className="mt-2 text-sm text-[#756d8d] dark:text-[#afa6c8]">
          We couldn't retrieve your user profile from the database. Please try logging out and logging back in.
        </p>
      </div>
    );
  }

  const isGoogleUser = profile.provider === 'google';

  return (
    <div className="min-h-screen pb-32 sm:pb-20 px-4 sm:px-6">
      <SEOMeta
        title="My Profile | Promptro"
        description="Manage your Promptro user profile, email verification, and privacy consent options."
        robots="noindex, nofollow"
      />
      <div className="max-w-3xl mx-auto">
        <header className="mb-6 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl sm:text-5xl font-black tracking-tight mb-2"
          >
            My <span className="text-primary">Profile</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="text-[#756d8d] dark:text-[#afa6c8] text-sm sm:text-base font-semibold"
          >
            Manage your account settings, consent policies, and email verification.
          </motion.p>
        </header>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative overflow-hidden rounded-[2rem] border border-white/80 bg-white/70 p-6 shadow-[0_24px_58px_rgba(72,56,118,0.1)] backdrop-blur-2xl dark:border-white/10 dark:bg-[#14111f]/62 dark:text-white sm:p-8"
        >
          {/* Subtle background glow */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_25%_0%,rgba(139,92,246,0.12),transparent_40%),radial-gradient(circle_at_85%_0%,rgba(255,106,61,0.1),transparent_40%)]" />

          {/* User Info Header Block */}
          <div className="relative z-10 flex flex-col items-center gap-4 sm:flex-row sm:gap-6 border-b border-[#e9e2f3] dark:border-white/5 pb-6 mb-6">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-gradient-to-br from-primary to-[#ff6a3d] text-white shadow-xl shadow-primary/20">
              <span className="text-3xl font-black">{profile.first_name.charAt(0).toUpperCase()}</span>
            </div>
            <div className="text-center sm:text-left min-w-0 flex-1">
              <h2 className="text-2xl font-black tracking-tight text-[#171421] dark:text-white">
                {profile.first_name} {profile.last_name || ''}
              </h2>
              <p className="text-sm font-semibold text-[#756d8d] dark:text-[#afa6c8] mt-1 flex items-center justify-center sm:justify-start gap-1.5">
                <Mail className="h-4 w-4 text-primary" />
                {profile.email}
              </p>
              <div className="mt-3 flex flex-wrap items-center justify-center sm:justify-start gap-2">
                {profile.email_verified ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-black text-emerald-600 dark:text-emerald-400">
                    <BadgeCheck className="h-4 w-4" />
                    Verified Email
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-black text-amber-600 dark:text-amber-400">
                    Not Verified
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-black text-primary uppercase tracking-wider">
                  {profile.provider} login
                </span>
              </div>
            </div>
          </div>

          {/* Profile form data display grid */}
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-[#8a819d]">First Name</label>
              <div className="flex h-11 items-center gap-3 rounded-2xl border border-[#e9e2f3] bg-[#faf8ff]/50 px-4 text-sm font-bold text-[#171421] dark:border-white/5 dark:bg-white/5 dark:text-white">
                <User className="h-4 w-4 text-primary shrink-0" />
                {profile.first_name}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-[#8a819d]">Last Name</label>
              <div className="flex h-11 items-center gap-3 rounded-2xl border border-[#e9e2f3] bg-[#faf8ff]/50 px-4 text-sm font-bold text-[#171421] dark:border-white/5 dark:bg-white/5 dark:text-white">
                {profile.last_name || <span className="text-[#8a819d] font-normal italic">Not provided</span>}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-[#8a819d]">Gender</label>
              <div className="flex h-11 items-center gap-3 rounded-2xl border border-[#e9e2f3] bg-[#faf8ff]/50 px-4 text-sm font-bold text-[#171421] dark:border-white/5 dark:bg-white/5 dark:text-white">
                {profile.gender || <span className="text-[#8a819d] font-normal italic">Not provided</span>}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-[#8a819d]">Account Created</label>
              <div className="flex h-11 items-center gap-3 rounded-2xl border border-[#e9e2f3] bg-[#faf8ff]/50 px-4 text-sm font-bold text-[#171421] dark:border-white/5 dark:bg-white/5 dark:text-white">
                <Clock className="h-4 w-4 text-primary shrink-0" />
                {formatDate(profile.created_at)}
              </div>
            </div>

            <div className="space-y-1 md:col-span-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-[#8a819d]">Terms & Policy Agreement</label>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl border border-[#e9e2f3] bg-[#faf8ff]/50 text-sm dark:border-white/5 dark:bg-white/5">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-[#171421] dark:text-white">Terms accepted on signup</p>
                    <p className="text-[11px] text-[#756d8d] dark:text-[#afa6c8] mt-0.5">
                      Accepted: {formatDate(profile.terms_accepted_at || profile.created_at)}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <a href="/terms" target="_blank" className="text-xs font-black text-primary hover:underline whitespace-nowrap">Terms</a>
                  <span className="text-[#e9e2f3] dark:text-white/10">|</span>
                  <a href="/privacy-policy" target="_blank" className="text-xs font-black text-primary hover:underline whitespace-nowrap">Privacy</a>
                </div>
              </div>
            </div>
          </div>

          {/* Email verification module */}
          {!profile.email_verified && !isGoogleUser && (
            <div className="relative z-10 mt-8 rounded-2xl border border-[#ffe1d9] bg-[#fffcfb] p-5 dark:border-white/10 dark:bg-white/5">
              <h3 className="text-base font-black text-[#171421] dark:text-white">Verify Your Account</h3>
              <p className="mt-1.5 text-xs font-semibold leading-relaxed text-[#756d8d] dark:text-[#afa6c8]">
                Your email is currently not verified. Verify your email to protect your saved boards and enable advanced Promptro creator tools. We will send a secure activation link to your email.
              </p>

              {message && (
                <div className={`mt-4 rounded-xl border p-3 text-xs font-bold ${message.type === 'success'
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400'
                    : 'border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-400'
                  }`}>
                  {message.text}
                </div>
              )}

              <div className="mt-5 flex gap-3 flex-wrap">
                <button
                  onClick={handleSendVerification}
                  disabled={actionLoading}
                  className="flex h-10 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#8b5cf6] to-[#ff6a3d] px-6 text-xs font-black text-white shadow-md shadow-primary/15 transition-all hover:-translate-y-0.5 disabled:opacity-60"
                >
                  {actionLoading ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <RefreshCw className="h-3.5 w-3.5" />
                  )}
                  Verify Email
                </button>
                <button
                  onClick={handleSendVerification}
                  disabled={actionLoading}
                  className="flex h-10 items-center justify-center gap-2 rounded-full border border-[#e9e2f3] bg-white/78 px-6 text-xs font-black text-[#242033] shadow-sm transition-all hover:-translate-y-0.5 disabled:opacity-60 dark:border-white/10 dark:bg-white/5 dark:text-white"
                >
                  {actionLoading ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Mail className="h-3.5 w-3.5 text-primary" />
                  )}
                  Resend Verification Email
                </button>
              </div>
            </div>
          )}

          {profile.email_verified && (
            <div className="relative z-10 mt-8 flex items-center gap-3.5 rounded-2xl border border-emerald-200 bg-emerald-50/20 p-5 dark:border-emerald-500/10 dark:bg-emerald-500/5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500 text-white">
                <BadgeCheck className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-sm font-black text-[#171421] dark:text-white">Account Fully Verified!</h3>
                <p className="mt-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                  Your email address {profile.email} is verified. Your saved items and prompt collections are secure.
                </p>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
