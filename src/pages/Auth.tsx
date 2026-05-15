import { FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Loader2,
  LockKeyhole,
  Mail,
  User,
  UserPlus,
} from 'lucide-react';
import { motion } from 'framer-motion';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendEmailVerification,
  signOut,
  signInWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
} from 'firebase/auth';
import { auth, googleProvider, isFirebaseConfigured } from '../lib/firebase';

type AuthMode = 'login' | 'signup';

export default function Auth() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<AuthMode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!auth) return;
    const currentAuth = auth;

    return onAuthStateChanged(currentAuth, async (user) => {
      if (!user) return;

      const usesPasswordLogin = user.providerData.some((provider) => provider.providerId === 'password');
      if (!usesPasswordLogin || user.emailVerified) {
        navigate('/', { replace: true });
        return;
      }

      setNotice(`Please verify ${user.email || 'your email'}, then log in with the same password.`);
      await signOut(currentAuth);
    });
  }, [navigate]);

  const handleGoogleLogin = async () => {
    if (!auth) return;

    setError('');
    setNotice('');
    setLoading(true);

    try {
      await signInWithPopup(auth, googleProvider);
      navigate('/', { replace: true });
    } catch (err) {
      setError(getFirebaseError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!auth) return;

    setError('');
    setNotice('');
    setLoading(true);

    try {
      if (mode === 'signup') {
        const normalizedEmail = email.trim();
        const normalizedName = name.trim();
        const credential = await createUserWithEmailAndPassword(auth, normalizedEmail, password);
        await updateProfile(credential.user, { displayName: normalizedName });
        await sendEmailVerification(credential.user);
        await signOut(auth);
        setMode('login');
        setName('');
        setEmail(normalizedEmail);
        setPassword('');
        setNotice(`Please verify ${normalizedEmail}, then log in with the same password.`);
        return;
      } else {
        const normalizedEmail = email.trim();
        const credential = await signInWithEmailAndPassword(auth, normalizedEmail, password);
        await credential.user.reload();

        if (!credential.user.emailVerified) {
          await sendEmailVerification(credential.user);
          await signOut(auth);
          const unverifiedEmail = credential.user.email || normalizedEmail;
          setNotice(`Please verify ${unverifiedEmail}, then log in with the same password.`);
          return;
        }
      }
      navigate('/', { replace: true });
    } catch (err) {
      setError(getFirebaseError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-6xl items-center justify-center">
      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="grid w-full max-w-[27rem] overflow-hidden rounded-[1.45rem] border border-white/80 bg-white/74 shadow-[0_22px_58px_rgba(72,56,118,0.14)] backdrop-blur-2xl md:max-w-4xl md:grid-cols-[0.86fr_1.14fr] md:rounded-[1.75rem]"
      >
        <div className="relative hidden min-h-[34rem] overflow-hidden bg-[#171421] p-7 text-white md:block">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_28%_18%,rgba(139,92,246,0.48),transparent_34%),radial-gradient(circle_at_78%_24%,rgba(255,106,61,0.44),transparent_28%),linear-gradient(160deg,#241b3a_0%,#171421_58%,#2a1830_100%)]" />
          <div className="relative z-10 flex h-full flex-col justify-between">
            <Link
              to="/"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/12 text-white backdrop-blur-xl transition-colors hover:bg-white/20"
              aria-label="Back to home"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>

            <div>
              <div className="mb-5 flex h-16 w-16 items-center justify-center overflow-hidden rounded-[1.25rem] bg-white/90 shadow-[0_18px_46px_rgba(0,0,0,0.18)] backdrop-blur-xl">
                <img src="/brand/logo.png" alt="" className="h-14 w-auto object-contain" />
              </div>
              <p className="text-sm font-medium uppercase text-white/62">Promptro account</p>
              <h1 className="mt-3 text-4xl font-bold leading-tight text-white">
                Save ideas, sync boards, and keep creating.
              </h1>
              <p className="mt-4 text-sm font-medium leading-6 text-white/68">
                Continue with Google or use your email to keep your Promptro profile connected across devices.
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6 md:p-10">
          <div className="mb-4 flex items-center justify-between gap-4 md:hidden">
            <Link
              to="/"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary"
              aria-label="Back to home"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-white shadow-[0_10px_24px_rgba(72,56,118,0.1)]">
              <img src="/brand/logo.png" alt="" className="h-8 w-auto object-contain" />
            </div>
          </div>

          <p className="text-xs font-medium uppercase text-primary">{mode === 'login' ? 'Welcome back' : 'Create profile'}</p>
          <h2 className="mt-1.5 text-2xl font-bold text-[#171421] sm:text-3xl">
            {mode === 'login' ? 'Login to Promptro' : 'Sign up on Promptro'}
          </h2>
          <p className="mt-1.5 text-sm font-medium leading-5 text-[#736b88]">
            {mode === 'login'
              ? 'Choose Google or email to open your account.'
              : 'Use Google or email to create your account.'}
          </p>

          {!isFirebaseConfigured && (
            <div className="mt-5 rounded-2xl border border-[#ffd6c8] bg-[#fff6f1] p-3 text-sm font-medium leading-6 text-[#9a482c]">
              Firebase environment config is missing. Add the VITE_FIREBASE_* values to enable login.
            </div>
          )}

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={!isFirebaseConfigured || loading}
            className="mt-5 flex h-11 w-full items-center justify-center gap-3 rounded-full border border-[#e9e2f3] bg-white/78 px-4 text-sm font-bold text-[#242033] shadow-[0_14px_30px_rgba(72,56,118,0.1)] transition-all hover:-translate-y-0.5 hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#f8f5ff] text-sm font-bold text-primary">G</span>
            Login with Google
          </button>

          <div className="my-4 flex items-center gap-3">
            <div className="h-px flex-1 bg-[#e7e1f0]" />
            <span className="text-xs font-medium uppercase text-[#978eaa]">or email</span>
            <div className="h-px flex-1 bg-[#e7e1f0]" />
          </div>

          <form onSubmit={handleEmailAuth} className="flex flex-col gap-3">
            {mode === 'signup' && (
              <label className="block">
                <span className="mb-1.5 block text-sm font-bold text-[#242033]">Name</span>
                <span className="flex h-11 items-center gap-3 rounded-2xl border border-[#e9e2f3] bg-white/72 px-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
                  <User className="h-5 w-5 shrink-0 text-[#8b5cf6]" />
                  <input
                    type="text"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Your name"
                    className="auth-input h-full min-w-0 flex-1 bg-transparent text-sm font-medium text-[#171421] outline-none placeholder:text-[#958baa]"
                    required
                  />
                </span>
              </label>
            )}

            <label className="block">
              <span className="mb-1.5 block text-sm font-bold text-[#242033]">Email</span>
              <span className="flex h-11 items-center gap-3 rounded-2xl border border-[#e9e2f3] bg-white/72 px-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
                <Mail className="h-5 w-5 shrink-0 text-[#8b5cf6]" />
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  className="auth-input h-full min-w-0 flex-1 bg-transparent text-sm font-medium text-[#171421] outline-none placeholder:text-[#958baa]"
                  required
                />
              </span>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-bold text-[#242033]">Password</span>
              <span className="flex h-11 items-center gap-3 rounded-2xl border border-[#e9e2f3] bg-white/72 px-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
                <LockKeyhole className="h-5 w-5 shrink-0 text-[#8b5cf6]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Minimum 6 characters"
                  className="auth-input h-full min-w-0 flex-1 bg-transparent text-sm font-medium text-[#171421] outline-none placeholder:text-[#958baa]"
                  minLength={6}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((shown) => !shown)}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#7a728d] transition-colors hover:bg-primary/10 hover:text-primary"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </span>
            </label>

            {error && (
              <div className="rounded-2xl border border-[#ffd1e1] bg-[#fff4f8] p-3 text-sm font-medium leading-6 text-[#d52c65]">
                {error}
              </div>
            )}

            {notice && (
              <div className="truncate rounded-2xl border border-[#d9caf8] bg-primary/10 px-3 py-2 text-sm font-medium leading-5 text-primary">
                {notice}
              </div>
            )}

            <button
              type="submit"
              disabled={!isFirebaseConfigured || loading}
              className="mt-0.5 flex h-11 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#8b5cf6] to-[#ff6a3d] px-5 text-sm font-bold text-white shadow-[0_16px_34px_rgba(139,92,246,0.22)] transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
              {mode === 'login' ? 'Login with Email' : 'Create Account'}
            </button>
          </form>

          <button
            type="button"
            onClick={() => {
              setMode((current) => (current === 'login' ? 'signup' : 'login'));
              setName('');
              setError('');
              setNotice('');
            }}
            className="mt-3 w-full text-center text-sm font-bold text-primary"
          >
            {mode === 'login' ? 'New here? Create an account' : 'Already have an account? Login'}
          </button>
        </div>
      </motion.section>
    </div>
  );
}

function getFirebaseError(error: unknown) {
  if (!(error instanceof Error)) return 'Something went wrong. Please try again.';

  if (error.message.includes('auth/invalid-credential')) return 'The email or password is incorrect.';
  if (error.message.includes('auth/email-already-in-use')) return 'An account already exists with this email.';
  if (error.message.includes('auth/popup-closed-by-user')) return 'The Google popup was closed. Please try again.';
  if (error.message.includes('auth/weak-password')) return 'Password must be at least 6 characters long.';

  return error.message;
}
