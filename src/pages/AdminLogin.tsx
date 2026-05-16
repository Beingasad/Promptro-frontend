import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, User, ArrowRight, Loader2, AlertCircle, Sparkles } from 'lucide-react';
import { cn } from '../utils/cn';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Simulate API delay
    setTimeout(() => {
      if (username === 'asadtwinkle8318' && password === 'twinkleasad@87') {
        setSuccess(true);
        localStorage.setItem('adminAuth', 'true');
        setTimeout(() => navigate('/asad87'), 800);
      } else {
        setError('Invalid username or password. Please try again.');
        setLoading(false);
      }
    }, 1200);
  };

  return (
    <div className="min-h-screen w-full bg-[#f8f7fc] dark:bg-[#0a0a0b] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/20 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '1s' }} />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md z-10"
      >
        <div className="flex flex-col items-center mb-10">
          <div className="w-28 h-28 rounded-[2.5rem] bg-white dark:bg-white/10 flex items-center justify-center shadow-2xl shadow-primary/10 mb-8 group transition-all hover:scale-105">
            <img src="/brand/logo.png" alt="Logo" className="w-20 h-20 object-contain" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-[#171421] dark:text-white">Admin Portal</h1>
          <p className="text-[#756d8d] dark:text-[#afa6c8] mt-2 font-medium">Please sign in to continue to dashboard</p>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-5">
          <div className="bg-white/80 dark:bg-white/5 border border-white/72 dark:border-white/10 rounded-[2.5rem] p-8 shadow-[0_22px_56px_rgba(32,26,54,0.12)] backdrop-blur-2xl flex flex-col gap-6">
            
            <AnimatePresence mode="wait">
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center gap-3 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold"
                >
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-bold text-[#171421] dark:text-white uppercase tracking-wider ml-1">Username</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#756d8d] group-focus-within:text-primary transition-colors">
                  <User className="w-4 h-4" />
                </div>
                <input 
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  className="w-full h-14 pl-12 pr-6 rounded-2xl bg-[#f8f7fc] dark:bg-black/20 border border-[#e9e2f3] dark:border-white/5 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all dark:text-white"
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-bold text-[#171421] dark:text-white uppercase tracking-wider ml-1">Password</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#756d8d] group-focus-within:text-primary transition-colors">
                  <Lock className="w-4 h-4" />
                </div>
                <input 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full h-14 pl-12 pr-6 rounded-2xl bg-[#f8f7fc] dark:bg-black/20 border border-[#e9e2f3] dark:border-white/5 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all dark:text-white"
                  required
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading || success}
              className={cn(
                "h-14 rounded-2xl text-white font-bold shadow-xl transition-all flex items-center justify-center gap-3 disabled:opacity-50 mt-2",
                success ? "bg-green-500 shadow-green-500/20" : "bg-gradient-to-r from-primary to-secondary shadow-primary/20 hover:scale-[1.02] active:scale-95"
              )}
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : success ? (
                <>
                  Success
                  <Sparkles className="w-5 h-5" />
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>

          <p className="text-center text-[11px] font-medium text-[#756d8d] dark:text-[#afa6c8] mt-4 uppercase tracking-widest opacity-50">
            Promptro &bull; Administrative Access Only
          </p>
        </form>
      </motion.div>
    </div>
  );
}
