import { FormEvent, useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
  LockKeyhole,
  Mail,
  User,
  UserPlus,
  ChevronDown,
  ShieldCheck,
  KeyRound,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
} from 'firebase/auth';
import { auth, googleProvider, isFirebaseConfigured } from '../lib/firebase';
import SEOMeta from '../components/common/SEOMeta';
import axios from 'axios';
import { API_BASE_URL } from '../config';

type AuthMode = 'login' | 'signup';
type SignupStep = 'info' | 'otp' | 'terms';

const GENDER_OPTIONS = ['Male', 'Female', 'Other', 'Prefer not to say'];

export default function Auth() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<AuthMode>('login');
  const [signupStep, setSignupStep] = useState<SignupStep>('info');

  // Form fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [gender, setGender] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // OTP
  const [otpValues, setOtpValues] = useState<string[]>(['', '', '', '', '', '']);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [resendTimer, setResendTimer] = useState(0);

  // Terms
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // UI State
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(false);
  const [genderOpen, setGenderOpen] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (!auth) return;
    return onAuthStateChanged(auth, (user) => {
      if (user) {
        navigate('/', { replace: true });
      }
    });
  }, [navigate]);

  // Resend timer countdown
  useEffect(() => {
    if (resendTimer <= 0) return;
    const interval = setInterval(() => {
      setResendTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [resendTimer]);

  const resetForm = () => {
    setFirstName('');
    setLastName('');
    setGender('');
    setEmail('');
    setPassword('');
    setOtpValues(['', '', '', '', '', '']);
    setAgreedToTerms(false);
    setSignupStep('info');
    setError('');
    setNotice('');
  };

  // --- Google Login ---
  const handleGoogleLogin = async () => {
    if (!auth) return;
    setError('');
    setNotice('');
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      // Register profile for Google users too
      try {
        await axios.post(`${API_BASE_URL}/api/auth/register-profile`, {
          firebase_uid: result.user.uid,
          first_name: result.user.displayName?.split(' ')[0] || 'User',
          last_name: result.user.displayName?.split(' ').slice(1).join(' ') || null,
          email: result.user.email,
          provider: 'google',
          terms_accepted: true,
        });
      } catch { /* profile may already exist */ }
      navigate('/', { replace: true });
    } catch (err) {
      setError(getFirebaseError(err));
    } finally {
      setLoading(false);
    }
  };

  // --- Login with Email ---
  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!auth) return;
    setError('');
    setNotice('');
    setLoading(true);
    try {
      const normalizedEmail = email.trim().toLowerCase();

      // Check if email has a google provider in our DB
      try {
        const checkRes = await axios.get(`${API_BASE_URL}/api/auth/check-email?email=${encodeURIComponent(normalizedEmail)}`);
        if (checkRes.data && checkRes.data.exists && checkRes.data.provider === 'google') {
          setError('This email is registered via Google. Please log in using the Google button.');
          setLoading(false);
          return;
        }
      } catch (checkErr) {
        console.error('Error checking email provider:', checkErr);
        // Fallback: let Firebase handle it if check fails
      }

      const loginResult = await signInWithEmailAndPassword(auth, normalizedEmail, password);
      
      // Auto-register profile for existing email users if missing in DB
      try {
        await axios.post(`${API_BASE_URL}/api/auth/register-profile`, {
          firebase_uid: loginResult.user.uid,
          first_name: loginResult.user.displayName?.split(' ')[0] || 'User',
          last_name: loginResult.user.displayName?.split(' ').slice(1).join(' ') || null,
          email: loginResult.user.email,
          provider: 'email',
          terms_accepted: true,
        });
      } catch { /* profile may already exist */ }

      navigate('/', { replace: true });
    } catch (err) {
      setError(getFirebaseError(err));
    } finally {
      setLoading(false);
    }
  };

  // --- Signup Step 1: Send OTP ---
  const handleSendOTP = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!firstName.trim()) {
      setError('First name is required.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setError('');
    setLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/api/auth/send-otp`, {
        email: email.trim().toLowerCase(),
      });
      setSignupStep('otp');
      setResendTimer(60);
      setNotice(`Verification code sent to ${email.trim()}`);
    } catch (err: any) {
      const msg = err?.response?.data?.detail || 'Failed to send OTP. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // --- Signup Step 2: Verify OTP ---
  const handleVerifyOTP = async () => {
    const otp = otpValues.join('');
    if (otp.length !== 6) {
      setError('Please enter the complete 6-digit code.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/api/auth/verify-otp`, {
        email: email.trim().toLowerCase(),
        otp,
      });
      setSignupStep('terms');
      setNotice('');
    } catch (err: any) {
      const msg = err?.response?.data?.detail || 'Invalid OTP. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // --- Resend OTP ---
  const handleResendOTP = async () => {
    if (resendTimer > 0) return;
    setError('');
    setLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/api/auth/send-otp`, {
        email: email.trim().toLowerCase(),
      });
      setResendTimer(60);
      setOtpValues(['', '', '', '', '', '']);
      setNotice('New code sent to your email.');
    } catch (err: any) {
      const msg = err?.response?.data?.detail || 'Failed to resend OTP.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // --- Signup Step 3: Create Account ---
  const handleCreateAccount = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!agreedToTerms) return;
    if (!auth) return;
    setError('');
    setLoading(true);
    try {
      const normalizedEmail = email.trim();
      const fullName = `${firstName.trim()}${lastName.trim() ? ' ' + lastName.trim() : ''}`;

      // 1. Create Firebase account
      const credential = await createUserWithEmailAndPassword(auth, normalizedEmail, password);
      await updateProfile(credential.user, { displayName: fullName });

      // 2. Register profile in our DB
      try {
        await axios.post(`${API_BASE_URL}/api/auth/register-profile`, {
          firebase_uid: credential.user.uid,
          first_name: firstName.trim(),
          last_name: lastName.trim() || null,
          gender: gender || null,
          email: normalizedEmail,
          provider: 'email',
          terms_accepted: true,
        });
      } catch (profileErr) {
        console.error('Failed to save user profile:', profileErr);
      }

      // 3. Save consent (existing system)
      try {
        await axios.post(`${API_BASE_URL}/api/consent/accept`, {
          user_id: credential.user.uid,
          email: normalizedEmail,
        });
      } catch (consentErr) {
        console.error('Failed to save user consent:', consentErr);
      }

      // 4. Auto-login — navigate to home (user stays logged in)
      navigate('/', { replace: true });
    } catch (err) {
      setError(getFirebaseError(err));
    } finally {
      setLoading(false);
    }
  };

  // --- OTP Input Handlers ---
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newValues = [...otpValues];
    newValues[index] = value.slice(-1);
    setOtpValues(newValues);
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
    if (e.key === 'Enter' && otpValues.join('').length === 6) {
      handleVerifyOTP();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setOtpValues(pasted.split(''));
      otpRefs.current[5]?.focus();
    }
  };

  // --- Step indicator labels ---
  const stepLabels = ['Your Info', 'Verify Email', 'Accept Terms'];
  const stepIndex = signupStep === 'info' ? 0 : signupStep === 'otp' ? 1 : 2;

  return (
    <div className="mx-auto flex w-full max-w-6xl items-center justify-center">
      <SEOMeta
        title={mode === 'login' ? 'Login | Promptro' : 'Sign Up | Promptro'}
        description="Login or sign up to Promptro to save prompts and access your boards."
        robots="noindex, nofollow"
      />
      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="grid w-full max-w-[27rem] overflow-hidden rounded-[1.45rem] border border-white/80 bg-white/74 shadow-[0_22px_58px_rgba(72,56,118,0.14)] backdrop-blur-2xl md:max-w-4xl md:grid-cols-[0.86fr_1.14fr] md:rounded-[1.75rem]"
      >
        {/* Left Panel */}
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
                {mode === 'signup'
                  ? 'Create your account and start creating.'
                  : 'Save ideas, sync boards, and keep creating.'}
              </h1>
              <p className="mt-4 text-sm font-medium leading-6 text-white/68">
                {mode === 'signup'
                  ? 'Sign up with your email to unlock all Promptro features.'
                  : 'Continue with Google or use your email to keep your Promptro profile connected across devices.'}
              </p>
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="p-4 sm:p-6 md:p-10">
          {/* Mobile header */}
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

          <p className="text-xs font-medium uppercase text-primary">
            {mode === 'login' ? 'Welcome back' : 'Create profile'}
          </p>
          <h2 className="mt-1.5 text-2xl font-bold text-[#171421] sm:text-3xl">
            {mode === 'login' ? 'Login to Promptro' : 'Sign up on Promptro'}
          </h2>
          <p className="mt-1.5 text-sm font-medium leading-5 text-[#736b88]">
            {mode === 'login'
              ? 'Choose Google or email to open your account.'
              : signupStep === 'info'
                ? 'Fill in your details to get started.'
                : signupStep === 'otp'
                  ? 'Enter the 6-digit code sent to your email.'
                  : 'Review and accept our policies.'}
          </p>

          {!isFirebaseConfigured && (
            <div className="mt-5 rounded-2xl border border-[#ffd6c8] bg-[#fff6f1] p-3 text-sm font-medium leading-6 text-[#9a482c]">
              Firebase environment config is missing. Add the VITE_FIREBASE_* values to enable login.
            </div>
          )}

          {/* Signup Step Indicator */}
          {mode === 'signup' && (
            <div className="mt-5 flex items-center gap-1">
              {stepLabels.map((label, i) => (
                <div key={label} className="flex items-center gap-1 flex-1">
                  <div className={`flex items-center gap-1.5 flex-1 ${i <= stepIndex ? '' : 'opacity-40'}`}>
                    <div
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold transition-all ${
                        i < stepIndex
                          ? 'bg-emerald-500 text-white'
                          : i === stepIndex
                            ? 'bg-gradient-to-r from-[#8b5cf6] to-[#ff6a3d] text-white'
                            : 'bg-[#e9e2f3] text-[#736b88]'
                      }`}
                    >
                      {i < stepIndex ? '✓' : i + 1}
                    </div>
                    <span className="text-[10px] font-bold text-[#736b88] hidden sm:block truncate">
                      {label}
                    </span>
                  </div>
                  {i < 2 && (
                    <div className={`h-px flex-1 mx-1 ${i < stepIndex ? 'bg-emerald-400' : 'bg-[#e9e2f3]'}`} />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Google Login (only on login mode or signup step 1) */}
          {(mode === 'login' || (mode === 'signup' && signupStep === 'info')) && (
            <>
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={!isFirebaseConfigured || loading}
                className="mt-5 flex h-11 w-full items-center justify-center gap-3 rounded-full border border-[#e9e2f3] bg-white/78 px-4 text-sm font-bold text-[#242033] shadow-[0_14px_30px_rgba(72,56,118,0.1)] transition-all hover:-translate-y-0.5 hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#f8f5ff] text-sm font-bold text-primary">G</span>
                {mode === 'login' ? 'Login with Google' : 'Sign up with Google'}
              </button>

              <div className="my-4 flex items-center gap-3">
                <div className="h-px flex-1 bg-[#e7e1f0]" />
                <span className="text-xs font-medium uppercase text-[#978eaa]">or email</span>
                <div className="h-px flex-1 bg-[#e7e1f0]" />
              </div>
            </>
          )}

          {/* ====== LOGIN FORM ====== */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="flex flex-col gap-3">
              <label className="block">
                <span className="mb-1.5 block text-sm font-bold text-[#242033]">Email</span>
                <span className="flex h-11 items-center gap-3 rounded-2xl border border-[#e9e2f3] bg-white/72 px-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
                  <Mail className="h-5 w-5 shrink-0 text-[#8b5cf6]" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="auth-input h-full min-w-0 flex-1 bg-transparent text-sm font-medium text-[#171421] outline-none placeholder:text-[#958baa]"
                    minLength={6}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#7a728d] transition-colors hover:bg-primary/10 hover:text-primary"
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
                <div className="rounded-2xl border border-[#d9caf8] bg-primary/10 px-3 py-2 text-sm font-medium leading-5 text-primary">
                  {notice}
                </div>
              )}

              <button
                type="submit"
                disabled={!isFirebaseConfigured || loading}
                className="mt-0.5 flex h-11 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#8b5cf6] to-[#ff6a3d] px-5 text-sm font-bold text-white shadow-[0_16px_34px_rgba(139,92,246,0.22)] transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
                Login with Email
              </button>
            </form>
          )}

          {/* ====== SIGNUP STEP 1: INFO ====== */}
          {mode === 'signup' && signupStep === 'info' && (
            <form onSubmit={handleSendOTP} className="flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="mb-1.5 block text-sm font-bold text-[#242033]">
                    First Name <span className="text-[#ff6a3d]">*</span>
                  </span>
                  <span className="flex h-11 items-center gap-3 rounded-2xl border border-[#e9e2f3] bg-white/72 px-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
                    <User className="h-5 w-5 shrink-0 text-[#8b5cf6]" />
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="First name"
                      className="auth-input h-full min-w-0 flex-1 bg-transparent text-sm font-medium text-[#171421] outline-none placeholder:text-[#958baa]"
                      required
                    />
                  </span>
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-sm font-bold text-[#242033]">Last Name</span>
                  <span className="flex h-11 items-center gap-3 rounded-2xl border border-[#e9e2f3] bg-white/72 px-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Last name"
                      className="auth-input h-full min-w-0 flex-1 bg-transparent text-sm font-medium text-[#171421] outline-none placeholder:text-[#958baa]"
                    />
                  </span>
                </label>
              </div>

              {/* Gender Dropdown */}
              <label className="block">
                <span className="mb-1.5 block text-sm font-bold text-[#242033]">Gender <span className="text-[10px] font-medium text-[#978eaa]">(optional)</span></span>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setGenderOpen(!genderOpen)}
                    className="flex h-11 w-full items-center justify-between gap-3 rounded-2xl border border-[#e9e2f3] bg-white/72 px-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] text-sm font-medium"
                  >
                    <span className={gender ? 'text-[#171421]' : 'text-[#958baa]'}>
                      {gender || 'Select gender'}
                    </span>
                    <ChevronDown className={`h-4 w-4 text-[#8b5cf6] transition-transform ${genderOpen ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {genderOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        className="absolute left-0 right-0 top-full z-20 mt-1 overflow-hidden rounded-xl border border-[#e9e2f3] bg-white shadow-[0_12px_32px_rgba(72,56,118,0.14)]"
                      >
                        {GENDER_OPTIONS.map((opt) => (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => { setGender(opt); setGenderOpen(false); }}
                            className={`w-full px-4 py-2.5 text-left text-sm font-medium transition-colors hover:bg-primary/5 ${gender === opt ? 'bg-primary/10 text-primary font-bold' : 'text-[#242033]'}`}
                          >
                            {opt}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </label>

              <label className="block">
                <span className="mb-1.5 block text-sm font-bold text-[#242033]">
                  Email <span className="text-[#ff6a3d]">*</span>
                </span>
                <span className="flex h-11 items-center gap-3 rounded-2xl border border-[#e9e2f3] bg-white/72 px-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
                  <Mail className="h-5 w-5 shrink-0 text-[#8b5cf6]" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="auth-input h-full min-w-0 flex-1 bg-transparent text-sm font-medium text-[#171421] outline-none placeholder:text-[#958baa]"
                    required
                  />
                </span>
              </label>

              <label className="block">
                <span className="mb-1.5 block text-sm font-bold text-[#242033]">
                  Password <span className="text-[#ff6a3d]">*</span>
                </span>
                <span className="flex h-11 items-center gap-3 rounded-2xl border border-[#e9e2f3] bg-white/72 px-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
                  <LockKeyhole className="h-5 w-5 shrink-0 text-[#8b5cf6]" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="auth-input h-full min-w-0 flex-1 bg-transparent text-sm font-medium text-[#171421] outline-none placeholder:text-[#958baa]"
                    minLength={6}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#7a728d] transition-colors hover:bg-primary/10 hover:text-primary"
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

              <button
                type="submit"
                disabled={!isFirebaseConfigured || loading}
                className="mt-0.5 flex h-11 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#8b5cf6] to-[#ff6a3d] px-5 text-sm font-bold text-white shadow-[0_16px_34px_rgba(139,92,246,0.22)] transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                Continue
              </button>
            </form>
          )}

          {/* ====== SIGNUP STEP 2: OTP ====== */}
          {mode === 'signup' && signupStep === 'otp' && (
            <div className="mt-4 flex flex-col gap-4">
              <div className="flex items-center gap-3 rounded-2xl border border-[#d9caf8] bg-primary/5 p-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#8b5cf6] to-[#ff6a3d]">
                  <KeyRound className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#242033]">Check your inbox</p>
                  <p className="text-[11px] font-medium text-[#736b88]">
                    Code sent to <span className="font-bold text-primary">{email.trim()}</span>
                  </p>
                </div>
              </div>

              {/* OTP Input Boxes */}
              <div className="flex justify-center gap-2.5" onPaste={handleOtpPaste}>
                {otpValues.map((val, i) => (
                  <input
                    key={i}
                    ref={(el) => { otpRefs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={val}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    className={`h-12 w-12 rounded-xl border-2 text-center text-lg font-bold outline-none transition-all ${
                      val
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-[#e9e2f3] bg-white/72 text-[#171421] focus:border-primary focus:bg-primary/5'
                    }`}
                  />
                ))}
              </div>

              {/* Resend */}
              <div className="text-center">
                {resendTimer > 0 ? (
                  <p className="text-xs font-medium text-[#978eaa]">
                    Resend code in <span className="font-bold text-primary">{resendTimer}s</span>
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    disabled={loading}
                    className="text-xs font-bold text-primary hover:underline disabled:opacity-50"
                  >
                    Resend Code
                  </button>
                )}
              </div>

              {error && (
                <div className="rounded-2xl border border-[#ffd1e1] bg-[#fff4f8] p-3 text-sm font-medium leading-6 text-[#d52c65]">
                  {error}
                </div>
              )}
              {notice && (
                <div className="rounded-2xl border border-[#d9caf8] bg-primary/10 px-3 py-2 text-sm font-medium leading-5 text-primary">
                  {notice}
                </div>
              )}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => { setSignupStep('info'); setError(''); setNotice(''); }}
                  className="flex h-11 flex-1 items-center justify-center gap-2 rounded-full border border-[#e9e2f3] bg-white/78 text-sm font-bold text-[#242033] transition-all hover:-translate-y-0.5"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleVerifyOTP}
                  disabled={loading || otpValues.join('').length !== 6}
                  className="flex h-11 flex-[2] items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#8b5cf6] to-[#ff6a3d] px-5 text-sm font-bold text-white shadow-[0_16px_34px_rgba(139,92,246,0.22)] transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                  Verify Code
                </button>
              </div>
            </div>
          )}

          {/* ====== SIGNUP STEP 3: TERMS ====== */}
          {mode === 'signup' && signupStep === 'terms' && (
            <form onSubmit={handleCreateAccount} className="mt-4 flex flex-col gap-4">
              <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500">
                  <ShieldCheck className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-xs font-bold text-emerald-800">Email verified!</p>
                  <p className="text-[11px] font-medium text-emerald-600">
                    {email.trim()} has been verified successfully.
                  </p>
                </div>
              </div>

              <label className="flex items-start gap-2.5 mt-1 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-1 h-4 w-4 shrink-0 rounded border-[#e9e2f3] text-primary focus:ring-primary/20 accent-primary"
                  required
                />
                <span className="text-xs font-semibold text-[#736b88] leading-tight">
                  I agree to the{' '}
                  <Link to="/terms" target="_blank" className="text-primary hover:underline font-bold">
                    Terms & Conditions
                  </Link>{' '}
                  and{' '}
                  <Link to="/privacy-policy" target="_blank" className="text-primary hover:underline font-bold">
                    Privacy Policy
                  </Link>.
                </span>
              </label>

              {error && (
                <div className="rounded-2xl border border-[#ffd1e1] bg-[#fff4f8] p-3 text-sm font-medium leading-6 text-[#d52c65]">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={!isFirebaseConfigured || loading || !agreedToTerms}
                className="mt-0.5 flex h-11 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#8b5cf6] to-[#ff6a3d] px-5 text-sm font-bold text-white shadow-[0_16px_34px_rgba(139,92,246,0.22)] transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
                Create Account
              </button>
            </form>
          )}

          {/* Toggle Login/Signup */}
          <button
            type="button"
            onClick={() => {
              setMode((current) => (current === 'login' ? 'signup' : 'login'));
              resetForm();
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
