import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Search,
  Bell,
  Menu,
  X,
  Clock3,
  Moon,
  CircleHelp,
  Info,
  LogOut,
  UserX,
  CheckCircle2,
  ChevronRight,
  Heart,
  Bookmark,
  Camera,
  CircleUserRound,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { onAuthStateChanged, signOut, type User } from 'firebase/auth';
import ImageCard, { Prompt } from './ImageCard';
import { auth } from '../lib/firebase';
import { clearLocalActivity, onActivityUpdated, readLocalActivity, syncUserActivity } from '../lib/activity';
import { applyThemeMode, readThemeMode, type ThemeMode } from '../lib/theme';
import axios from 'axios';
import { API_BASE_URL } from '../config';

import { useSearch } from '../context/SearchContext';

type DrawerView = 'recent' | 'help' | 'about' | null;

export default function TopNavbar() {
  const navigate = useNavigate();
  const { searchQuery, setSearchQuery } = useSearch();
  const [isFocused, setIsFocused] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [expandedView, setExpandedView] = useState<DrawerView>(null);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [appearanceMode, setAppearanceMode] = useState<ThemeMode>(() => readThemeMode());
  const [recentPrompts, setRecentPrompts] = useState<Prompt[]>([]);
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackStatus, setFeedbackStatus] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [localAvatar, setLocalAvatar] = useState('');
  const isLoggedIn = Boolean(currentUser);
  const displayName = currentUser?.displayName || (isLoggedIn ? 'Promptro Creator' : 'Guest Mode');
  const displayEmail = currentUser?.email || (isLoggedIn ? 'Signed in' : 'Login to sync your profile');
  const profileInitial = displayName.trim().charAt(0).toUpperCase() || 'P';
  const profilePhoto = localAvatar || currentUser?.photoURL || '';
  const premiumLabel = isLoggedIn ? 'Signed In' : 'Free Guest';

  const closePanels = () => {
    setMenuOpen(false);
    setExpandedView(null);
    setNotificationsOpen(false);
    setProfileOpen(false);
  };

  const drawerItems = [
    {
      icon: Bookmark,
      title: 'Saved Prompts',
      description: 'Open your saved prompt board',
      action: 'saved',
    },
    {
      icon: Clock3,
      title: 'Recently Viewed',
      description: 'View prompts you recently explored',
      action: 'recent',
    },
    {
      icon: Moon,
      title: 'Appearance',
      description: 'Switch between light and dark mode',
      action: 'appearance',
    },
    {
      icon: CircleHelp,
      title: 'Help & Feedback',
      description: 'Report issues or send suggestions',
      action: 'help',
    },
    {
      icon: Info,
      title: 'About Promptro',
      description: 'Learn more about the platform',
      action: 'about',
    },
    ...(isLoggedIn ? [{
      icon: UserX,
      title: 'Delete Account',
      description: 'Permanently remove your account',
      action: 'delete-account',
    }] : []),
  ];

  useEffect(() => {
    if (!auth) return;

    return onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user) {
        setLocalAvatar(localStorage.getItem(`promptro:avatar:${user.uid}`) || '');
        syncUserActivity(user).catch(() => undefined);
      } else {
        setLocalAvatar('');
      }
    });
  }, []);

  useEffect(() => {
    if (!menuOpen) return;

    setRecentPrompts(readLocalActivity().recentPrompts);

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [menuOpen]);

  useEffect(() => onActivityUpdated(() => {
    setRecentPrompts(readLocalActivity().recentPrompts);
  }), []);

  const handleLogout = async () => {
    if (auth) await signOut(auth);
    clearLocalActivity();
    closePanels();
  };

  const handleDeleteAccount = async () => {
    if (!currentUser) return;
    
    const confirmed = window.confirm("Are you sure you want to delete your account? This action cannot be undone.");
    if (!confirmed) return;

    try {
      await currentUser.delete();
      clearLocalActivity();
      closePanels();
      alert("Account deleted successfully.");
    } catch (err: any) {
      if (err.code === 'auth/requires-recent-login') {
        alert("Please logout and login again to delete your account for security reasons.");
      } else {
        console.error("Error deleting account:", err);
        alert("Failed to delete account. Please try again later.");
      }
    }
  };

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !currentUser) return;

    const reader = new FileReader();
    reader.onload = () => {
      const avatar = typeof reader.result === 'string' ? reader.result : '';
      if (!avatar) return;

      localStorage.setItem(`promptro:avatar:${currentUser.uid}`, avatar);
      setLocalAvatar(avatar);
    };
    reader.readAsDataURL(file);
    event.target.value = '';
  };

  useEffect(() => {
    setAppearanceMode(readThemeMode());
    setHasUnreadNotifications(localStorage.getItem('promptro:notifications-read') !== 'true');

    // Fetch dynamic notifications
    axios.get(`${API_BASE_URL}/api/notifications`).then(res => {
      setNotifications(res.data);
      if (res.data.length > 0 && localStorage.getItem('promptro:notifications-read') !== 'true') {
        setHasUnreadNotifications(true);
      }
    }).catch(err => console.error('Error fetching notifications:', err));
  }, []);

  const handleDrawerAction = (action: string) => {
    if (action === 'saved') {
      navigate('/saved');
      closePanels();
      return;
    }

    if (action === 'recent') {
      setExpandedView('recent');
      return;
    }

    if (action === 'appearance') {
      const nextMode = appearanceMode === 'Light' ? 'Dark' : 'Light';
      setAppearanceMode(nextMode);
      applyThemeMode(nextMode);
    }

    if (action === 'help') {
      setExpandedView('help');
      return;
    }

    if (action === 'about') {
      setExpandedView('about');
      return;
    }

    if (action === 'delete-account') {
      handleDeleteAccount();
      return;
    }
  };

  const handleSendFeedback = async () => {
    if (!feedbackText.trim()) return;
    setFeedbackStatus('sending');
    try {
      await axios.post(`${API_BASE_URL}/api/feedback`, {
        user: isLoggedIn ? displayName : 'Guest',
        email: isLoggedIn ? displayEmail : 'N/A',
        subject: 'General Feedback',
        message: feedbackText.trim()
      });
      setFeedbackStatus('sent');
      setFeedbackText('');
    } catch (err) {
      console.error('Error sending feedback:', err);
      alert('Failed to send feedback. Please try again.');
    } finally {
      setTimeout(() => setFeedbackStatus('idle'), 3000);
    }
  };

  const expandedTitle =
    expandedView === 'recent'
      ? 'Recently Viewed'
      : expandedView === 'help'
        ? 'Help & Feedback'
        : 'About Promptro';

  const renderExpandedContent = () => {
    if (expandedView === 'recent') {
      return (
        <div className="columns-1 sm:columns-2 gap-3 space-y-3 pb-6">
          {recentPrompts.length ? (
            recentPrompts.map((prompt) => (
              <div key={prompt.id} className="break-inside-avoid">
                <ImageCard prompt={prompt} />
              </div>
            ))
          ) : (
            <div className="break-inside-avoid rounded-[1.35rem] border border-white/70 bg-white/62 p-4 text-sm font-medium leading-6 text-[#6f6684] shadow-[0_16px_34px_rgba(72,56,118,0.1)]">
              Open a prompt detail page and it will appear here.
            </div>
          )}
        </div>
      );
    }

    if (expandedView === 'help') {
      const faqs = [
        ['How do I save prompts?', 'Tap the bookmark button on any image card.'],
        ['Where are my saves stored?', 'Guest saves are stored locally on this device.'],
        ['Can I share feedback?', 'Use the form below and our team will review it.'],
      ];

      return (
        <div className="flex flex-col gap-3 pb-6">
          {faqs.map(([question, answer]) => (
            <div key={question} className="rounded-[1.25rem] border border-white/72 bg-white/62 p-4 shadow-[0_14px_32px_rgba(72,56,118,0.1)]">
              <h3 className="text-sm font-bold text-[#171421]">{question}</h3>
              <p className="mt-1 text-xs font-medium leading-5 text-[#756d8d]">{answer}</p>
            </div>
          ))}
          <div className="rounded-[1.25rem] border border-white/72 bg-white/62 p-4 shadow-[0_14px_32px_rgba(72,56,118,0.1)]">
            <h3 className="text-sm font-bold text-[#171421]">Report an issue</h3>
            <textarea
              className="mt-3 h-24 w-full resize-none rounded-2xl border border-[#ebe6f4] bg-white/72 p-3 text-sm font-medium text-[#171421] outline-none placeholder:text-[#958baa] disabled:opacity-60"
              placeholder="Tell us what happened..."
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              disabled={feedbackStatus === 'sending' || feedbackStatus === 'sent'}
            />
            <button 
              onClick={handleSendFeedback}
              disabled={feedbackStatus === 'sending' || feedbackStatus === 'sent' || !feedbackText.trim()}
              className="mt-3 w-full rounded-full bg-gradient-to-r from-[#8b5cf6] to-[#ff6a3d] px-4 py-2.5 text-sm font-bold text-white shadow-[0_14px_30px_rgba(139,92,246,0.2)] transition-opacity disabled:opacity-50"
            >
              {feedbackStatus === 'sending' ? 'Sending...' : feedbackStatus === 'sent' ? 'Sent successfully!' : 'Send feedback'}
            </button>
          </div>
          <div className="rounded-[1.25rem] border border-white/72 bg-white/62 p-4 text-sm font-medium text-[#6f6684] shadow-[0_14px_32px_rgba(72,56,118,0.1)]">
            Support: feedback@promptro.ai
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-3 pb-6">
        <div className="rounded-[1.45rem] border border-white/72 bg-white/64 p-5 text-center shadow-[0_18px_42px_rgba(72,56,118,0.12)]">
          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center overflow-hidden rounded-[1.25rem] bg-white shadow-[0_16px_34px_rgba(139,92,246,0.18)]">
            <img src="/brand/logo.png" alt="" className="h-14 w-auto object-contain" />
          </div>
          <h3 className="text-xl font-bold text-[#171421]">Promptro</h3>
          <p className="mt-2 text-sm font-medium leading-6 text-[#6f6684]">
            A premium AI prompt inspiration gallery for creators, designers, and visual storytellers.
          </p>
        </div>
        <div className="rounded-[1.25rem] border border-white/72 bg-white/62 p-4 shadow-[0_14px_32px_rgba(72,56,118,0.1)]">
          <p className="text-xs font-medium uppercase text-primary">Mission</p>
          <p className="mt-2 text-sm font-medium leading-6 text-[#5f5774]">
            Help creators discover beautiful prompt ideas faster and turn inspiration into polished AI visuals.
          </p>
        </div>
        <div className="rounded-[1.25rem] border border-white/72 bg-white/62 p-4 text-sm font-medium text-[#6f6684] shadow-[0_14px_32px_rgba(72,56,118,0.1)]">
          Version 1.0.0
        </div>
      </div>
    );
  };

  return (
    <motion.nav
      initial={{ y: -18, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="fixed top-0 w-full z-[100] px-4 py-3 md:px-8"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[118px] bg-[radial-gradient(circle_at_18%_0%,rgba(139,92,246,0.18),transparent_44%),radial-gradient(circle_at_92%_0%,rgba(255,106,61,0.16),transparent_42%),linear-gradient(180deg,#fff_0%,#fbf8ff_70%,rgba(251,248,255,0)_95%)] [mask-image:linear-gradient(to_bottom,#000_0%,#000_70%,transparent_95%)] dark:bg-[radial-gradient(circle_at_18%_0%,rgba(139,92,246,0.22),transparent_44%),radial-gradient(circle_at_92%_0%,rgba(255,106,61,0.15),transparent_42%),linear-gradient(180deg,#0d0b14_0%,#12101b_70%,rgba(18,16,27,0)_95%)]" />
      <div className="relative z-10 mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-x-3 gap-y-2 md:glass-panel md:flex-nowrap md:rounded-full md:px-6 md:py-3">
        <div className="flex min-w-0 items-center gap-1 md:gap-2">
          <button
            className="flex h-12 w-12 md:h-14 md:w-14 -mt-[2px] md:-mt-[3px] items-center justify-center rounded-full text-[#171421] dark:text-white transition-colors hover:bg-white/75 dark:hover:bg-white/10"
            onClick={() => {
              setMenuOpen((open) => {
                if (open) setExpandedView(null);
                return !open;
              });
              setNotificationsOpen(false);
              setProfileOpen(false);
            }}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          >
            {menuOpen ? (
              <X className="w-6 h-6 md:w-7 md:h-7" />
            ) : (
              <div className="flex flex-col gap-[6px] md:gap-[7px] items-start">
                <span className="block h-[2.5px] w-6 md:h-[3px] md:w-7 rounded-full bg-current transition-all duration-300" />
                <span className="block h-[2.5px] w-3.5 md:h-[3px] md:w-4 rounded-full bg-current transition-all duration-300" />
                <span className="block h-[2.5px] w-5 md:h-[3px] md:w-6 rounded-full bg-current transition-all duration-300" />
              </div>
            )}
          </button>

          <Link to="/" className="flex shrink-0 items-center gap-1.5 md:gap-2" aria-label="Promptro home">
            <img
              src="/brand/logo.png"
              alt=""
              className="-ml-1 h-14 w-auto object-contain md:-ml-2 md:h-[4.5rem]"
            />
            <img
              src="/brand/text-light.png"
              alt="Promptro"
              className="-ml-1 mt-0.5 md:mt-[3px] h-9 w-auto max-w-[6.8rem] object-contain dark:hidden md:-ml-2 md:h-11 md:max-w-[8.6rem]"
            />
            <img
              src="/brand/text-dark.png"
              alt="Promptro"
              className="hidden -ml-1 mt-0.5 md:mt-[3px] h-9 w-auto max-w-[6.8rem] object-contain dark:block md:-ml-2 md:h-11 md:max-w-[8.6rem]"
            />
          </Link>
        </div>

        <div className="order-3 w-full md:order-none md:min-w-[280px] md:flex-1 md:max-w-[700px]">
          <div className={`relative flex items-center w-full transition-all duration-300 ${isFocused ? 'scale-[1.015]' : 'scale-100'}`}>
            <div className={`absolute inset-0 rounded-full bg-gradient-to-r from-primary/24 via-fuchsia-300/22 to-secondary/22 blur-2xl transition-opacity duration-300 ${isFocused ? 'opacity-100' : 'opacity-45'}`}></div>
            <div className="relative flex h-11 w-full items-center overflow-hidden rounded-full border border-white/80 dark:border-white/10 bg-white/78 dark:bg-white/5 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_16px_38px_rgba(80,67,120,0.14)] dark:shadow-none backdrop-blur-2xl md:h-14">
              <div className="pl-4 md:pl-5 pr-2.5 text-[#81789e]">
                <Search className="w-5 h-5 md:w-5.5 md:h-5.5" />
              </div>
              <input
                type="text"
                placeholder="Search prompts, styles, themes..."
                className="h-full w-full border-none bg-transparent pr-4 text-sm font-medium tracking-normal text-[#171421] dark:text-white placeholder-[#8c84a6] dark:placeholder-[#afa6c8]/60 focus:outline-none md:text-base"
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 md:gap-3">
          <button
            className="relative flex h-10 w-10 items-center justify-center rounded-full text-[#171421] dark:text-white transition-colors hover:bg-white/75 dark:hover:bg-white/10 md:h-11 md:w-11"
            onClick={() => {
              setNotificationsOpen((open) => !open);
              setHasUnreadNotifications(false);
              localStorage.setItem('promptro:notifications-read', 'true');
              setMenuOpen(false);
              setProfileOpen(false);
            }}
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5 md:w-6 md:h-6" />
            {hasUnreadNotifications && (
              <span className="absolute top-2 right-2.5 h-2 w-2 rounded-full bg-[#ff6a3d] ring-2 ring-white" />
            )}
          </button>
          <button
            className="flex h-10 w-10 items-center justify-center rounded-full text-[#171421] transition-colors hover:bg-white/75 md:h-11 md:w-11"
            onClick={() => {
              setProfileOpen((open) => !open);
              setMenuOpen(false);
              setNotificationsOpen(false);
            }}
            aria-label="Profile"
          >
            {profilePhoto ? (
              <img
                src={profilePhoto}
                alt={displayName}
                className="h-6 w-6 rounded-full object-cover shadow-[0_2px_8px_rgba(23,20,33,0.14)] md:h-7 md:w-7"
                referrerPolicy="no-referrer"
              />
            ) : isLoggedIn ? (
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary md:h-8 md:w-8">
                {profileInitial}
              </span>
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-white/75 dark:hover:bg-white/10 md:h-11 md:w-11">
                <CircleUserRound className="w-5 h-5 md:w-6 md:h-6 text-[#171421] dark:text-white" />
              </div>
            )}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.button
              type="button"
              aria-label="Close menu backdrop"
              className="fixed inset-0 z-[80] bg-[#171421]/46 backdrop-blur-[7px]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
              onClick={closePanels}
            />
            <motion.aside
              initial={{ x: '-105%', opacity: 0.75 }}
              animate={{
                x: 0,
                opacity: 1,
                width: expandedView ? '100vw' : '56vw',
                maxWidth: expandedView ? '100vw' : '19rem',
                borderTopRightRadius: expandedView ? '0rem' : '1.65rem',
                borderBottomRightRadius: expandedView ? '0rem' : '1.65rem',
              }}
              exit={{ x: '-105%', opacity: 0.75 }}
              transition={{ type: 'spring', stiffness: 420, damping: 38 }}
              className="fixed bottom-0 left-0 top-0 z-[90] flex min-w-[230px] flex-col overflow-hidden border-r border-white/72 bg-[linear-gradient(180deg,rgba(255,255,255,0.94)_0%,rgba(250,246,255,0.9)_54%,rgba(255,246,252,0.92)_100%)] px-3 pb-3 pt-5 shadow-[18px_0_58px_rgba(24,20,38,0.24)] backdrop-blur-2xl dark:border-white/12 dark:bg-[linear-gradient(180deg,rgba(28,24,42,0.96)_0%,rgba(18,16,27,0.94)_54%,rgba(24,17,31,0.94)_100%)]"
            >
              <div className="mx-auto mb-4 h-1.5 w-14 shrink-0 rounded-full bg-[#cfc7dd]" />

              <AnimatePresence mode="wait">
                {expandedView ? (
                  <motion.div
                    key={expandedView}
                    initial={{ opacity: 0, x: 18 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -18 }}
                    transition={{ duration: 0.22 }}
                    className="flex min-h-0 flex-1 flex-col"
                  >
                    <div className="mb-4 grid shrink-0 grid-cols-[2.75rem_1fr_2.75rem] items-center">
                      <button
                        type="button"
                        onClick={() => setExpandedView(null)}
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-white/68 text-[#171421] shadow-[0_12px_28px_rgba(72,56,118,0.12)]"
                        aria-label="Back to menu"
                      >
                        <ArrowLeft className="h-5 w-5" />
                      </button>
                      <h2 className="text-center text-lg font-bold text-[#171421]">{expandedTitle}</h2>
                      <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-white shadow-[0_10px_24px_rgba(72,56,118,0.1)]">
                        <img src="/brand/logo.png" alt="" className="h-9 w-auto object-contain" />
                      </div>
                    </div>
                    <div className="min-h-0 flex-1 overflow-y-auto pr-1 hide-scrollbar">
                      {renderExpandedContent()}
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -12 }}
                    transition={{ duration: 0.18 }}
                    className="flex min-h-0 flex-1 flex-col"
                  >
              <div className="mb-3 shrink-0 rounded-[1.15rem] border border-white/78 bg-white/62 p-3 shadow-[0_14px_34px_rgba(139,92,246,0.1)] backdrop-blur-2xl">
                <div className="flex items-start gap-2">
                  <div className="min-w-0">
                    <p className="text-[10px] font-medium uppercase tracking-normal text-[#8b5cf6]">Profile</p>
                    <p className="mt-0.5 truncate text-[15px] font-bold leading-tight text-[#171421]">{displayName}</p>
                    <p className="mt-0.5 truncate text-[11px] font-medium text-[#80779a]">{displayEmail}</p>
                  </div>
                </div>
              </div>

              <div className="flex shrink-0 flex-col gap-2">
                {drawerItems.map((item) => (
                  <button
                    key={item.title}
                    type="button"
                    onClick={() => handleDrawerAction(item.action)}
                    className={`group flex w-full items-center gap-2.5 rounded-[1rem] border px-2.5 py-2.5 text-left backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 ${
                      item.action === 'delete-account'
                        ? 'border-[#ffd1e1] bg-[#fff4f8]/72 text-[#f23672] shadow-[0_12px_24px_rgba(242,54,114,0.09)] hover:bg-[#fff8fb] dark:border-[#f23672]/28 dark:bg-[#f23672]/12 dark:text-[#ff8fb4] dark:hover:bg-[#f23672]/18'
                        : 'border-white/64 bg-white/62 text-[#242033] shadow-[0_12px_24px_rgba(72,56,118,0.08)] hover:bg-white/82 hover:shadow-[0_14px_28px_rgba(139,92,246,0.12)]'
                    }`}
                  >
                    <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl shadow-[0_0_18px_rgba(139,92,246,0.13)] transition-transform duration-300 group-hover:scale-105 ${
                      item.action === 'delete-account' ? 'bg-[#ffe5ef] text-[#f23672] dark:bg-[#f23672]/16 dark:text-[#ff8fb4]' : 'bg-primary/10 text-primary'
                    }`}>
                      <item.icon className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className={`block truncate text-[12px] font-medium leading-tight ${item.action === 'delete-account' ? 'text-[#f23672]' : 'text-[#242033]'}`}>{item.title}</span>
                      <span className="mt-0.5 block line-clamp-2 text-[10px] font-medium leading-snug text-[#80779a]">
                        {item.action === 'appearance' ? `${item.description} (${appearanceMode})` : item.description}
                      </span>
                    </span>
                    <ChevronRight className={`h-4 w-4 shrink-0 ${item.action === 'delete-account' ? 'text-[#f23672]' : 'text-[#80779a]'}`} />
                  </button>
                ))}
              </div>

              <div className="mt-auto shrink-0 border-t border-[#ded8ee] pt-3 text-center">
                <div className="flex items-center justify-center gap-1 text-[10px] font-medium text-[#8a819d]">
                  Made with <Heart className="h-3.5 w-3.5 fill-[#ff3f5f] text-[#ff3f5f]" /> by <span className="font-bold text-primary">Promptro</span>
                </div>
                <p className="mt-1.5 text-[10px] font-medium text-[#8a819d]">v1.0.0</p>
              </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {notificationsOpen && (
          <>
            <motion.button
              type="button"
              aria-label="Close notifications"
              className="fixed inset-0 z-[15] cursor-default bg-transparent"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setNotificationsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              className="fixed right-[3.6rem] top-[3.65rem] z-[25] w-[min(20rem,calc(100vw-1.5rem))] rounded-[1.45rem] border border-white/80 bg-white/88 p-3 shadow-[0_22px_54px_rgba(72,56,118,0.18)] backdrop-blur-2xl md:right-20 md:top-[5.1rem]"
            >
              <div className="mb-2 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setNotificationsOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary"
                  aria-label="Back"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <h3 className="flex-1 text-sm font-bold text-[#171421] uppercase tracking-wider">Notifications</h3>
                <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-bold text-primary">{notifications.length} NEW</span>
              </div>
              <div className="flex flex-col gap-1">
                {notifications.length > 0 ? (
                  notifications.map((notif) => (
                    <button 
                      key={notif.id} 
                      onClick={() => {
                        navigate(notif.link);
                        setNotificationsOpen(false);
                      }}
                      className="flex w-full items-start gap-3 rounded-2xl px-3 py-3 text-left transition-all hover:bg-primary/5 group"
                    >
                      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform group-hover:scale-110">
                        <CheckCircle2 className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <p className="text-[13px] font-bold text-[#171421] dark:text-white leading-tight group-hover:text-primary transition-colors">{notif.text}</p>
                        <p className="mt-1 text-[10px] font-medium text-[#756d8d] uppercase tracking-wider">Just now</p>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="py-8 text-center">
                    <Bell className="mx-auto h-8 w-8 text-[#afa6c8]/40 mb-3" />
                    <p className="text-sm font-bold text-[#756d8d]">No new notifications</p>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {profileOpen && (
          <>
            <motion.button
              type="button"
              aria-label="Close profile"
              className="fixed inset-0 z-[15] cursor-default bg-transparent"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setProfileOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              className="fixed right-3 top-[3.65rem] z-[25] w-[min(18rem,calc(100vw-1.5rem))] overflow-hidden rounded-[1.6rem] border border-white/80 bg-white/90 p-3.5 shadow-[0_22px_54px_rgba(72,56,118,0.18)] backdrop-blur-2xl md:right-8 md:top-[5.1rem]"
            >
              <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-[radial-gradient(circle_at_20%_0%,rgba(139,92,246,0.16),transparent_44%),radial-gradient(circle_at_88%_6%,rgba(255,106,61,0.14),transparent_42%)]" />
              <div className="relative mb-3 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setProfileOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-white/76 text-primary shadow-[0_10px_24px_rgba(72,56,118,0.1)] transition-colors hover:bg-white"
                  aria-label="Back"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
                {isLoggedIn && (
                  <span className="rounded-full bg-white/76 px-2.5 py-1 text-[11px] font-medium text-primary shadow-[0_10px_24px_rgba(72,56,118,0.08)]">
                    {premiumLabel}
                  </span>
                )}
              </div>
              {isLoggedIn ? (
                <>
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white shadow-[0_10px_24px_rgba(72,56,118,0.1)]">
                      {profilePhoto ? (
                        <img src={profilePhoto} alt={displayName} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <span className="flex h-full w-full items-center justify-center bg-primary/10 text-lg font-bold text-primary">
                          {profileInitial}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-[#171421]">{displayName}</p>
                      <p className="truncate text-xs font-medium text-[#7a728d]">{displayEmail}</p>
                    </div>
                  </div>
                  <label className="mb-3 flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-full border border-[#e9e2f3] bg-white/78 px-3 text-sm font-bold text-primary transition-colors hover:bg-white">
                    <Camera className="h-4 w-4" />
                    Set profile photo
                    <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                  </label>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="mx-auto flex h-11 w-full items-center justify-center rounded-full bg-[#fff4f8] px-3 text-center text-sm font-bold text-[#f23672] transition-colors hover:bg-[#ffeaf2] dark:bg-[#f23672]/12 dark:text-[#ff8fb4] dark:hover:bg-[#f23672]/18"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <div className="relative pt-1">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center text-[#171421] dark:text-white">
                    <CircleUserRound className="h-9 w-9" />
                  </div>
                  <h3 className="mt-3 text-center text-lg font-bold text-[#171421]">Welcome</h3>
                  <Link
                    to="/auth"
                    onClick={closePanels}
                    className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#8b5cf6] to-[#ff6a3d] px-4 text-sm font-bold text-white shadow-[0_16px_34px_rgba(139,92,246,0.22)] transition-all hover:-translate-y-0.5"
                  >
                    Login / Sign up
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
