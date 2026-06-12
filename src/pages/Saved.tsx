import { useEffect, useState } from 'react';
import { Bookmark, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import MasonryGrid from '../components/MasonryGrid';
import { Prompt } from '../components/ImageCard';
import { onActivityUpdated, readLocalActivity } from '../lib/activity';
import SEOMeta from '../components/common/SEOMeta';
import { GridSkeleton } from '../components/common/Skeleton';
import { auth } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

export default function Saved() {
  const navigate = useNavigate();
  const [savedPrompts, setSavedPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      setAuthLoading(false);
      return;
    }
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setAuthLoading(false);
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    const updateSavedPrompts = () => setSavedPrompts(readLocalActivity().savedPrompts);
    updateSavedPrompts();

    const timer = setTimeout(() => {
      setLoading(false);
    }, 450);

    const unsubscribe = onActivityUpdated(updateSavedPrompts);

    return () => {
      clearTimeout(timer);
      unsubscribe();
    };
  }, []);

  if (authLoading) {
    return (
      <div className="w-full flex flex-col gap-1">
        <SEOMeta
          title="Saved Prompts | Promptro"
          description="View your saved AI image prompts and creative templates."
          robots="noindex, nofollow"
        />
        <header className="mb-6 md:mb-10 text-left flex flex-col items-start">
          <span className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-primary dark:text-[#a78bfa] mb-1">
            <Bookmark className="h-3.5 w-3.5" />
            YOUR PRIVATE BOARD
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-[#171421] dark:text-white mb-2">
            Saved <span className="text-primary">Prompts</span>
          </h1>
        </header>
        <GridSkeleton isHome={false} />
      </div>
    );
  }

  if (!currentUser) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="w-full flex flex-col gap-1"
      >
        <SEOMeta
          title="Saved Prompts | Promptro"
          description="View your saved AI image prompts and creative templates."
          robots="noindex, nofollow"
        />
        <header className="mb-6 md:mb-10 text-left flex flex-col items-start">
          <motion.span
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-primary dark:text-[#a78bfa] mb-1"
          >
            <Bookmark className="h-3.5 w-3.5" />
            YOUR PRIVATE BOARD
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-[#171421] dark:text-white mb-2"
          >
            Saved <span className="text-primary">Prompts</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-[#756d8d] dark:text-[#afa6c8] text-sm sm:text-base font-medium max-w-lg"
          >
            Browse and manage your private gallery of saved creative prompts.
          </motion.p>
        </header>

        <div className="min-h-[48vh] rounded-[2.25rem] border border-white/70 bg-white/45 dark:border-white/5 dark:bg-[#14111f]/45 p-8 text-center shadow-[0_24px_58px_rgba(72,56,118,0.08)] backdrop-blur-2xl flex flex-col justify-center items-center max-w-xl mx-auto mt-4">
          <div className="w-16 h-16 rounded-3xl bg-primary/10 text-primary flex items-center justify-center mb-4 shadow-[0_10px_25px_rgba(109,77,236,0.12)]">
            <Lock className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-black text-[#171421] dark:text-white">Authentication Required</h3>
          <p className="mt-2 text-sm font-semibold text-[#6f6684] dark:text-[#afa6c8] max-w-sm leading-relaxed">
            To use this feature, you need to signup or login
          </p>
          <button
            onClick={() => navigate('/auth')}
            className="mt-6 inline-flex items-center gap-2 h-11 rounded-full bg-gradient-to-r from-primary to-[#ff6a3d] text-white px-6 text-sm font-bold shadow-[0_12px_28px_rgba(109,77,236,0.26)] hover:scale-105 active:scale-95 transition-transform cursor-pointer"
          >
            Login / Sign Up
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="w-full flex flex-col gap-1"
    >
      <SEOMeta
        title="Saved Prompts | Promptro"
        description="View your saved AI image prompts and creative templates."
        robots="noindex, nofollow"
      />
      <header className="mb-6 md:mb-10 text-left flex flex-col items-start">
        <motion.span
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-primary dark:text-[#a78bfa] mb-1"
        >
          <Bookmark className="h-3.5 w-3.5" />
          YOUR PRIVATE BOARD
        </motion.span>
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-[#171421] dark:text-white mb-2"
        >
          Saved <span className="text-primary">Prompts</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-[#756d8d] dark:text-[#afa6c8] text-sm sm:text-base font-medium max-w-lg"
        >
          Browse and manage your private gallery of saved creative prompts.
        </motion.p>
      </header>

      {loading ? (
        <GridSkeleton isHome={false} />
      ) : savedPrompts.length ? (
        <MasonryGrid prompts={savedPrompts} isTwoColumns={true} />
      ) : (
        <div className="min-h-[48vh] rounded-[1.8rem] border border-white/70 bg-white/58 px-6 py-12 text-center shadow-[0_18px_46px_rgba(72,56,118,0.12)] backdrop-blur-2xl">
          <p className="text-lg font-bold text-[#171421]">No saved prompts yet</p>
          <p className="mt-2 text-sm font-medium leading-6 text-[#6f6684]">Tap the bookmark on any image card to save it here.</p>
        </div>
      )}
    </motion.div>
  );
}

