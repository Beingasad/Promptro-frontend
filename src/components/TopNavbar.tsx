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
  Sparkles,
  Share2,
  Download,
  Instagram,
  MessageCircle,
  Copy,
  Check,
  ArrowUpRight,
} from 'lucide-react';
import { useEffect, useState, useMemo } from 'react';
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
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const [menuOpen, setMenuOpen] = useState(false);
  const [expandedView, setExpandedView] = useState<DrawerView>(null);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [isFullWidth, setIsFullWidth] = useState(false);
  const [appearanceMode, setAppearanceMode] = useState<ThemeMode>(() => readThemeMode());
  const [recentPrompts, setRecentPrompts] = useState<Prompt[]>([]);
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackStatus, setFeedbackStatus] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [localAvatar, setLocalAvatar] = useState('');
  const [promptCount, setPromptCount] = useState<number>(0);
  const isLoggedIn = Boolean(currentUser);
  const displayName = currentUser?.displayName || (isLoggedIn ? 'Promptro Creator' : 'Guest Mode');
  const displayEmail = currentUser?.email || (isLoggedIn ? 'Signed in' : 'Login to sync your profile');
  const profileInitial = displayName.trim().charAt(0).toUpperCase() || 'P';
  const profilePhoto = localAvatar || currentUser?.photoURL || '';
  const premiumLabel = isLoggedIn ? 'Signed In' : 'Free Guest';

  // Showcase Creator Modal States
  const [showShowcaseModal, setShowShowcaseModal] = useState<boolean>(() => {
    return localStorage.getItem('showcase_modal_open') === 'true';
  });
  const [showcaseStep, setShowcaseStep] = useState<number>(() => {
    return parseInt(localStorage.getItem('showcase_step') || '1');
  });
  const [selectedPromptsForShowcase, setSelectedPromptsForShowcase] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('showcase_selected_prompts') || '[]');
    } catch {
      return [];
    }
  });
  const [allPromptsForShowcase, setAllPromptsForShowcase] = useState<Prompt[]>([]);
  const [isGeneratingShowcase, setIsGeneratingShowcase] = useState(false);

  // Sync Showcase State to localStorage
  useEffect(() => {
    localStorage.setItem('showcase_modal_open', showShowcaseModal ? 'true' : 'false');
  }, [showShowcaseModal]);

  useEffect(() => {
    localStorage.setItem('showcase_step', showcaseStep.toString());
  }, [showcaseStep]);

  useEffect(() => {
    localStorage.setItem('showcase_selected_prompts', JSON.stringify(selectedPromptsForShowcase));
  }, [selectedPromptsForShowcase]);

  // Load prompts automatically if restored on refresh
  useEffect(() => {
    if (showShowcaseModal && allPromptsForShowcase.length === 0) {
      const loadPrompts = async () => {
        const saved = readLocalActivity().savedPrompts || [];
        let list = [...saved];
        try {
          const res = await axios.get(`${API_BASE_URL}/api/prompts`);
          const globalPrompts = Array.isArray(res.data) ? res.data : [];
          const seen = new Set(saved.map(p => p.id));
          globalPrompts.forEach((p: Prompt) => {
            if (!seen.has(p.id)) {
              list.push(p);
            }
          });
        } catch (e) {
          console.error(e);
        }
        setAllPromptsForShowcase(list);
      };
      loadPrompts();
    }
  }, [showShowcaseModal, allPromptsForShowcase.length]);

  const selectedPrompts = useMemo(() => {
    return allPromptsForShowcase.filter(p => selectedPromptsForShowcase.includes(p.id));
  }, [allPromptsForShowcase, selectedPromptsForShowcase]);

  const shareShowcaseToInstagram = async () => {
    try {
      const canvas = await renderShowcaseCanvas();
      canvas.toBlob(async (blob) => {
        if (!blob) {
          alert("Could not generate poster file.");
          return;
        }
        const file = new File([blob], `Promptro-Showcase-${Date.now()}.png`, { type: 'image/png' });
        if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: 'My Promptro Collection',
            text: 'Check out my favorite AI prompts on Promptro.in! 🎨✨',
          });
        } else {
          navigator.clipboard.writeText('https://promptro.in/explore');
          alert('Explore link copied! Opening Instagram so you can easily post your downloaded poster on your Story and paste the link!');
          window.open('https://instagram.com', '_blank');
        }
      }, 'image/png');
    } catch (error) {
      console.error("Error sharing to Instagram:", error);
      alert("Could not open Instagram sharing. Please download and share manually!");
    }
  };

  const shareShowcaseToWhatsApp = async () => {
    try {
      const canvas = await renderShowcaseCanvas();
      canvas.toBlob(async (blob) => {
        if (!blob) {
          alert("Could not generate poster file.");
          return;
        }
        const file = new File([blob], `Promptro-Showcase-${Date.now()}.png`, { type: 'image/png' });
        if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: 'My Promptro Collection',
            text: 'Check out my favorite AI prompts on Promptro.in! 🎨✨',
          });
        } else {
          const text = encodeURIComponent(
            `Check out my favorite AI prompts on Promptro! 🎨✨\n\nCreate your own stunning showcase story poster and share your prompt art!\n\n👉 Discover here: https://promptro.in/explore`
          );
          window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
        }
      }, 'image/png');
    } catch (error) {
      console.error("Error sharing to WhatsApp:", error);
      alert("Could not open WhatsApp sharing. Please download and share manually!");
    }
  };

  const copyShowcaseLink = () => {
    navigator.clipboard.writeText('https://promptro.in/explore');
    alert('Showcase link copied to clipboard! Share it on Instagram Stories or WhatsApp groups.');
  };

  const renderShowcaseCanvas = (): Promise<HTMLCanvasElement> => {
    return new Promise((resolve, reject) => {
      if (selectedPrompts.length < 1) {
        reject(new Error("No prompts selected"));
        return;
      }

      const canvas = document.createElement('canvas');
      canvas.width = 1080;
      canvas.height = 1920;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error("Could not get canvas context"));
        return;
      }

      // 1. Draw Background Gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, '#181524');
      gradient.addColorStop(0.5, '#0d0b13');
      gradient.addColorStop(1, '#120f1b');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 2. Draw Glow Orbs
      ctx.fillStyle = 'rgba(124, 58, 237, 0.15)';
      ctx.beginPath();
      ctx.arc(canvas.width / 2, canvas.height / 2, 700, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = 'rgba(236, 72, 153, 0.08)';
      ctx.beginPath();
      ctx.arc(100, 200, 400, 0, Math.PI * 2);
      ctx.fill();

      // 3. Draw Branding Header
      ctx.fillStyle = '#7c3aed';
      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(canvas.width / 2 - 180, 150, 360, 64, 32);
      } else {
        ctx.rect(canvas.width / 2 - 180, 150, 360, 64);
      }
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 36px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('PROMPTRO', canvas.width / 2, 196);

      ctx.fillStyle = '#8c84a6';
      ctx.font = 'bold 24px sans-serif';
      ctx.fillText('MY FAVORITE PICKS', canvas.width / 2, 265);

      ctx.fillStyle = '#ffffff';
      ctx.font = '900 58px sans-serif';
      ctx.fillText('CREATIVE INSPIRATIONS', canvas.width / 2, 390);

      // Draw line under heading
      ctx.fillStyle = 'rgba(124, 58, 237, 0.4)';
      ctx.fillRect(canvas.width / 2 - 100, 430, 200, 4);

      // 4. Draw Selected Images dynamically based on count (Staggered Layout)
      let loadedCount = 0;
      const imagesToLoad = selectedPrompts.map(p => p.image_url);
      const loadedImages: HTMLImageElement[] = [];

      const onAllLoaded = () => {
        const drawCard = (img: HTMLImageElement, cx: number, cy: number, cw: number, ch: number, angleDegrees: number, isCenter = false) => {
          ctx.save();
          ctx.translate(cx, cy);
          if (angleDegrees !== 0) {
            ctx.rotate(angleDegrees * Math.PI / 180);
          }

          ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
          ctx.shadowBlur = isCenter ? 60 : 35;
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = isCenter ? 25 : 15;

          ctx.beginPath();
          const rx = -cw / 2;
          const ry = -ch / 2;
          if (ctx.roundRect) {
            ctx.roundRect(rx, ry, cw, ch, isCenter ? 48 : 36);
          } else {
            ctx.rect(rx, ry, cw, ch);
          }
          ctx.fillStyle = '#171421';
          ctx.fill();

          ctx.clip();
          ctx.drawImage(img, rx, ry, cw, ch);
          ctx.restore();
        };

        if (selectedPrompts.length === 1) {
          // 1 Image: Large Center Card
          if (loadedImages[0]) drawCard(loadedImages[0], 540, 900, 560, 760, 0, true);
        } else if (selectedPrompts.length === 2) {
          // 2 Images: Tilted side-by-side
          if (loadedImages[0]) drawCard(loadedImages[0], 330, 900, 420, 580, -8);
          if (loadedImages[1]) drawCard(loadedImages[1], 750, 900, 420, 580, 8, true);
        } else if (selectedPrompts.length === 3) {
          // 3 Images: Overlapping staggered collage
          if (loadedImages[0]) drawCard(loadedImages[0], 290, 880, 420, 560, -12);
          if (loadedImages[2]) drawCard(loadedImages[2], 790, 880, 420, 560, 12);
          if (loadedImages[1]) drawCard(loadedImages[1], 540, 920, 480, 640, 0, true);
        }

        // 5. Draw Footer CTA Block
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 36px sans-serif';
        ctx.fillText('DISCOVER TOP ART PROMPTS', canvas.width / 2, 1420);

        ctx.fillStyle = '#8c84a6';
        ctx.font = '500 24px sans-serif';
        ctx.fillText('Explore high-quality AI prompt templates on Promptro.in', canvas.width / 2, 1475);

        ctx.fillStyle = '#7c3aed';
        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(canvas.width / 2 - 300, 1540, 600, 96, 48);
        } else {
          ctx.rect(canvas.width / 2 - 300, 1540, 600, 96);
        }
        ctx.fill();

        ctx.lineWidth = 4;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 32px sans-serif';
        ctx.fillText('✨ DISCOVER ON PROMPTRO.IN', canvas.width / 2, 1600);

        resolve(canvas);
      };

      imagesToLoad.forEach((src, idx) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          loadedImages[idx] = img;
          loadedCount++;
          if (loadedCount === imagesToLoad.length) onAllLoaded();
        };
        img.onerror = () => {
          const canvasPlaceholder = document.createElement('canvas');
          canvasPlaceholder.width = 420;
          canvasPlaceholder.height = 560;
          const pCtx = canvasPlaceholder.getContext('2d');
          if (pCtx) {
            pCtx.fillStyle = '#1c182d';
            pCtx.fillRect(0, 0, 420, 560);
            pCtx.fillStyle = '#ffffff';
            pCtx.font = 'bold 24px sans-serif';
            pCtx.textAlign = 'center';
            pCtx.fillText('AI Prompt Art', 210, 280);
          }
          const placeholderImg = new Image();
          placeholderImg.src = canvasPlaceholder.toDataURL();
          placeholderImg.onload = () => {
            loadedImages[idx] = placeholderImg;
            loadedCount++;
            if (loadedCount === imagesToLoad.length) onAllLoaded();
          };
        };
        img.src = src;
      });
    });
  };

  const downloadShowcasePoster = async () => {
    try {
      const canvas = await renderShowcaseCanvas();
      const link = document.createElement('a');
      link.download = `Promptro-Showcase-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error("Error creating poster download:", error);
      alert("Failed to render poster image. Please try again!");
    }
  };

  const shareShowcaseNatively = async () => {
    try {
      const canvas = await renderShowcaseCanvas();
      canvas.toBlob(async (blob) => {
        if (!blob) {
          alert("Could not generate sharing file.");
          return;
        }
        const file = new File([blob], `Promptro-Showcase-${Date.now()}.png`, { type: 'image/png' });
        if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: 'My Promptro Collection',
            text: 'Check out my favorite AI prompts on Promptro.in! 🎨✨',
          });
        } else {
          navigator.clipboard.writeText('https://promptro.in/explore');
          alert("Native sharing is not supported by your browser or device. The Showcase Link has been copied to your clipboard, and you can download the image to share manually!");
        }
      }, 'image/png');
    } catch (error) {
      console.error("Error with native share:", error);
      alert("Could not trigger sharing. Please download and share manually!");
    }
  };

  const copyImageToClipboard = async () => {
    try {
      const canvas = await renderShowcaseCanvas();
      canvas.toBlob(async (blob) => {
        if (!blob) {
          alert("Could not copy poster image.");
          return;
        }
        try {
          await navigator.clipboard.write([
            new ClipboardItem({
              [blob.type]: blob
            })
          ]);
          alert("Poster image copied to clipboard successfully! You can now paste it directly into chats or documents.");
        } catch (clipboardError) {
          console.error("Clipboard copy failed:", clipboardError);
          alert("Clipboard writing is blocked or not supported on this browser. Please download the image to save it!");
        }
      }, 'image/png');
    } catch (error) {
      console.error("Error copying image:", error);
      alert("Failed to copy image. Please try downloading instead!");
    }
  };

  const openShowcaseCreator = async () => {
    const saved = readLocalActivity().savedPrompts || [];
    let list = [...saved];
    
    try {
      const res = await axios.get(`${API_BASE_URL}/api/prompts`);
      const globalPrompts = Array.isArray(res.data) ? res.data : [];
      const seen = new Set(saved.map(p => p.id));
      globalPrompts.forEach((p: Prompt) => {
        if (!seen.has(p.id)) list.push(p);
      });
    } catch (err) {
      console.error("Error fetching global prompts for showcase:", err);
    }
    
    setAllPromptsForShowcase(list);
    setSelectedPromptsForShowcase([]);
    setShowcaseStep(1);
    setShowShowcaseModal(true);
    closePanels();
  };

  const closePanels = () => {
    setMenuOpen(false);
    setIsFullWidth(false);
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
      icon: Sparkles,
      title: 'Showcase Creator',
      description: 'Generate beautiful posters of your favorite prompts',
      action: 'showcase',
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

    // Fetch dynamic notifications
    axios.get(`${API_BASE_URL}/api/notifications`).then(res => {
      setNotifications(res.data);
      const lastReadCount = parseInt(localStorage.getItem('promptro:notifications-read-count') || '0');
      if (res.data.length > lastReadCount) {
        setHasUnreadNotifications(true);
      }
    }).catch(err => console.error('Error fetching notifications:', err));

    // Fetch live dynamic prompt count
    axios.get(`${API_BASE_URL}/api/prompts/count`).then(res => {
      setPromptCount(res.data.count);
    }).catch(err => console.error('Error fetching prompts count:', err));
  }, []);

  const handleDrawerAction = (action: string) => {
    if (action === 'saved') {
      navigate('/saved');
      closePanels();
      return;
    }

    if (action === 'showcase') {
      openShowcaseCreator();
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
            Support: Coming Soon
          </div>
        </div>
      );
    }

    const getSystemInfo = () => {
      const ua = navigator.userAgent;
      let os = "Web";
      if (ua.indexOf("Android") !== -1) os = "Android";
      else if (ua.indexOf("like Mac") !== -1) os = "iOS";
      else if (ua.indexOf("Win") !== -1) os = "Windows";
      else if (ua.indexOf("Mac") !== -1) os = "macOS";
      else if (ua.indexOf("Linux") !== -1) os = "Linux";
      
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      return `${os} • ${width}×${height}`;
    };

    const stats = [
      { value: promptCount > 0 ? `${promptCount}` : '...', label: 'Live Prompts', color: 'from-[#8b5cf6] to-[#d946ef]' },
      { value: '100%', label: 'Free Access', color: 'from-[#10b981] to-[#059669]' },
    ];

    return (
      <div className="flex flex-col gap-2 pb-2 px-1 flex-1">
        {/* Main Brand Card */}
        <div className="relative overflow-hidden rounded-[1.5rem] border border-white/70 dark:border-white/10 bg-white/60 dark:bg-white/5 p-4 text-center shadow-[0_12px_32px_rgba(72,56,118,0.06)] backdrop-blur-xl">
          {/* Background Glow */}
          <div className="absolute -right-12 -top-12 -z-10 h-32 w-32 rounded-full bg-primary/10 blur-2xl"></div>
          <div className="absolute -left-12 -bottom-12 -z-10 h-32 w-32 rounded-full bg-[#ff6a3d]/10 blur-2xl"></div>

          <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center overflow-hidden rounded-[1.15rem] bg-white dark:bg-white/10 p-1 shadow-[0_10px_24px_rgba(139,92,246,0.12)] dark:shadow-none hover:scale-105 transition-transform duration-300">
            <img src="/brand/logo.png" alt="Promptro Logo" className="h-full w-auto object-contain" />
          </div>

          <h3 className="text-lg font-black tracking-tight text-[#171421] dark:text-white bg-clip-text bg-gradient-to-r from-primary to-[#ff6a3d]">
            Promptro Studio
          </h3>
          <p className="mt-1 text-[11px] font-medium leading-relaxed text-[#6f6684] dark:text-[#b2abc5]">
            A premium, high-fidelity AI prompt ecosystem built to empower creators. Discover curated prompts and launch concepts instantly.
          </p>
        </div>

        {/* Stats Grid - 2 Column */}
        <div className="grid grid-cols-2 gap-2">
          {stats.map((stat, i) => (
            <div 
              key={i} 
              className="flex flex-col items-center justify-center rounded-[1.15rem] border border-white/70 dark:border-white/10 bg-white/60 dark:bg-white/5 p-2 text-center shadow-[0_8px_20px_rgba(72,56,118,0.03)] hover:shadow-md transition-all duration-300"
            >
              <span className={`bg-gradient-to-r ${stat.color} bg-clip-text text-transparent text-base font-black tracking-tight`}>
                {stat.value}
              </span>
              <span className="mt-0.5 text-[8px] font-extrabold uppercase tracking-wider text-[#8a819d] dark:text-[#a59db5]">
                {stat.label}
              </span>
            </div>
          ))}
        </div>

        {/* Interactive / Helpful Tip */}
        <div className="rounded-[1.15rem] border border-white/70 dark:border-white/10 bg-white/50 dark:bg-white/5 p-3 shadow-[0_8px_20px_rgba(72,56,118,0.03)]">
          <p className="text-[9px] font-black uppercase tracking-widest text-primary dark:text-[#ff6a3d]">Pro Tip 💡</p>
          <p className="mt-0.5 text-[10px] font-medium leading-relaxed text-[#6f6684] dark:text-[#afa6c8]">
            Tap on any tag at the bottom of a prompt to filter the exploration grid instantly!
          </p>
        </div>

        {/* Call to Action Banner */}
        <div className="relative overflow-hidden rounded-[1.35rem] bg-gradient-to-br from-primary/95 to-[#9d66ff]/95 dark:from-primary/20 dark:to-purple-950/20 py-4.5 px-5 text-center shadow-[0_12px_26px_rgba(139,92,246,0.15)] border border-primary/20">
          <h4 className="text-[13px] font-black uppercase tracking-wider text-white">Join the Community</h4>
          <p className="mt-1 text-[10.5px] font-medium leading-relaxed text-white/90 dark:text-[#c4bed6]">
            Sync saved boards & get notified of premium drops.
          </p>
          <Link
            to="/auth"
            onClick={closePanels}
            className="mt-3 inline-flex h-9 items-center justify-center rounded-full bg-white px-5 text-[10px] font-black text-primary shadow hover:scale-[1.03] active:scale-95 transition-all"
          >
            Get Started Free
          </Link>
        </div>

        {/* Footer Info */}
        <div className="mt-auto rounded-[1.15rem] border border-white/70 dark:border-white/10 bg-white/40 dark:bg-white/5 py-2 px-4 text-center">
          <span className="text-[8px] font-bold uppercase tracking-widest text-[#8a819d] dark:text-[#a098b0]">
            v1.0.0 • {getSystemInfo()}
          </span>
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
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[160px] md:h-[120px] bg-[radial-gradient(circle_at_18%_0%,rgba(139,92,246,0.18),transparent_44%),radial-gradient(circle_at_92%_0%,rgba(255,106,61,0.16),transparent_42%),linear-gradient(180deg,#f8f7fc_0%,#f8f7fc_55%,rgba(248,247,252,0.8)_70%,rgba(248,247,252,0.3)_85%,rgba(248,247,252,0)_100%)] [mask-image:linear-gradient(to_bottom,#000_0%,#000_55%,rgba(0,0,0,0.8)_70%,rgba(0,0,0,0.3)_85%,rgba(0,0,0,0.05)_93%,transparent_100%)] dark:bg-[radial-gradient(circle_at_18%_0%,rgba(139,92,246,0.22),transparent_44%),radial-gradient(circle_at_92%_0%,rgba(255,106,61,0.15),transparent_42%),linear-gradient(180deg,#0d0b14_0%,#0d0b14_55%,rgba(13,11,20,0.8)_70%,rgba(13,11,20,0.3)_85%,rgba(13,11,20,0)_100%)]" />
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

          <Link to="/" onClick={() => setSearchQuery('')} className="flex shrink-0 items-center gap-1.5 md:gap-2" aria-label="Promptro home">
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

        <div className="order-3 w-full md:order-none md:min-w-[280px] md:flex-1 md:max-w-[820px]">
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
              localStorage.setItem('promptro:notifications-read-count', notifications.length.toString());
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
              className="fixed inset-0 z-[80] bg-[#171421]/40 backdrop-blur-[4px]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={closePanels}
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{
                x: 0,
                width: windowWidth < 768
                  ? (expandedView || isFullWidth ? '100vw' : '65vw')
                  : (expandedView ? '35rem' : '19.5rem'),
              }}
              exit={{ x: '-100%' }}
              transition={{ 
                duration: 0.35, 
                ease: [0.32, 0.72, 0, 1] 
              }}
              onClick={() => {
                if (windowWidth < 768) setIsFullWidth(true);
              }}
              className={`fixed bottom-0 left-0 top-0 z-[90] flex flex-col overflow-hidden border-r border-white/72 bg-[linear-gradient(180deg,rgba(255,255,255,0.94)_0%,rgba(250,246,255,0.9)_54%,rgba(255,246,252,0.92)_100%)] px-3 pb-3 pt-5 shadow-[18px_0_58px_rgba(24,20,38,0.24)] backdrop-blur-xl dark:border-white/12 dark:bg-[linear-gradient(180deg,rgba(28,24,42,0.96)_0%,rgba(18,16,27,0.94)_54%,rgba(24,17,31,0.94)_100%)] will-change-transform cursor-pointer md:cursor-default transition-[border-radius] duration-300 ${
                (windowWidth < 768 && (expandedView || isFullWidth)) ? 'rounded-none' : 'rounded-tr-[2.5rem] rounded-br-[2.5rem]'
              }`}
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
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedView(null);
                          setIsFullWidth(false);
                        }}
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-white/68 text-[#171421] shadow-[0_12px_28px_rgba(72,56,118,0.12)]"
                        aria-label="Back to menu"
                      >
                        <ArrowLeft className="h-5 w-5" />
                      </button>
                      <h2 className="text-center text-lg font-bold text-[#171421] dark:text-white">{expandedTitle}</h2>
                      <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-white dark:bg-white/10 shadow-[0_10px_24px_rgba(72,56,118,0.1)] dark:shadow-none border border-transparent dark:border-white/10">
                        {expandedView === 'about' ? (
                          <Info className="h-5 w-5 text-primary" />
                        ) : (
                          <img src="/brand/logo.png" alt="" className="h-9 w-auto object-contain" />
                        )}
                      </div>
                    </div>
                    <div className="min-h-0 flex-1 overflow-y-auto pr-1 hide-scrollbar flex flex-col">
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
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDrawerAction(item.action);
                    }}
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
                    {item.action !== 'appearance' && item.action !== 'delete-account' && (
                      <ChevronRight className="h-4 w-4 shrink-0 text-[#80779a]" />
                    )}
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
              className="fixed right-4 top-[4.2rem] md:right-20 md:top-[5.1rem] z-[25] w-[calc(100vw-2rem)] md:w-[20rem] max-w-sm md:max-w-none rounded-[1.45rem] border border-[#e9e2f3] dark:border-white/10 bg-white/95 dark:bg-[#171421]/95 p-3.5 shadow-[0_22px_54px_rgba(72,56,118,0.18)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_24px_48px_rgba(0,0,0,0.35)] backdrop-blur-2xl"
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
                <h3 className="flex-1 text-sm font-bold text-[#171421] dark:text-white uppercase tracking-wider">Notifications</h3>
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

      {/* Showcase Creator Modal */}
      <AnimatePresence>
        {showShowcaseModal && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isGeneratingShowcase && setShowShowcaseModal(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-md z-[80]"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[92%] md:w-full bg-white dark:bg-[#171421] rounded-[2rem] md:rounded-[2.5rem] shadow-2xl z-[90] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] max-h-[92vh] transition-all duration-300 ${
                showcaseStep === 2 ? 'max-w-3xl' : 'max-w-xl'
              }`}
            >
              <div className="p-5 md:p-8">
                {showcaseStep === 1 && (
                  <div className="flex flex-col gap-5 md:gap-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-lg md:text-xl font-bold text-[#171421] dark:text-white">Showcase Creator</h2>
                        <p className="text-[11px] md:text-xs text-[#756d8d]">Select 1 to 3 prompts to build your story poster</p>
                      </div>
                      <div className="text-[10px] font-bold text-primary uppercase tracking-wider bg-primary/10 px-3 py-1 rounded-full whitespace-nowrap shrink-0">
                        {selectedPromptsForShowcase.length} Selected
                      </div>
                    </div>

                    <div className="flex flex-col gap-2.5 md:gap-3 max-h-[220px] md:max-h-[300px] overflow-y-auto pr-2">
                      {allPromptsForShowcase.slice(0, 15).map((prompt) => (
                        <div 
                          key={prompt.id}
                          onClick={() => {
                            if (selectedPromptsForShowcase.includes(prompt.id)) {
                              setSelectedPromptsForShowcase(prev => prev.filter(id => id !== prompt.id));
                            } else {
                              if (selectedPromptsForShowcase.length >= 3) {
                                alert("You can select a maximum of 3 prompts. Please unselect one before selecting another!");
                                return;
                              }
                              setSelectedPromptsForShowcase(prev => [...prev, prompt.id]);
                            }
                          }}
                          className={`flex items-center gap-4 p-3 rounded-2xl border transition-all cursor-pointer ${
                            selectedPromptsForShowcase.includes(prompt.id)
                              ? "border-primary bg-primary/5"
                              : "border-[#e9e2f3] dark:border-white/10"
                          }`}
                        >
                          <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                            <img src={prompt.image_url} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold truncate text-[#171421] dark:text-white">{prompt.title}</p>
                            <p className="text-[10px] text-[#756d8d] mt-0.5 truncate">AI generated creative prompt</p>
                          </div>
                          <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                            selectedPromptsForShowcase.includes(prompt.id)
                              ? "bg-primary border-primary text-white"
                              : "border-[#e9e2f3] dark:border-white/10"
                          }`}>
                            {selectedPromptsForShowcase.includes(prompt.id) && <Check className="w-3 h-3" />}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center gap-4 pt-4">
                      <button 
                        onClick={() => setShowShowcaseModal(false)}
                        className="flex-1 h-12 rounded-2xl border border-[#e9e2f3] dark:border-white/10 font-bold text-sm text-[#171421] dark:text-white"
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={() => {
                          if (selectedPromptsForShowcase.length < 1 || selectedPromptsForShowcase.length > 3) {
                            alert("Please select between 1 and 3 prompts to build your showcase poster!");
                            return;
                          }
                          setIsGeneratingShowcase(true);
                          setTimeout(() => {
                            setShowcaseStep(2);
                            setIsGeneratingShowcase(false);
                          }, 2000);
                        }}
                        className={`flex-[2] h-12 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all ${
                          selectedPromptsForShowcase.length >= 1
                            ? "bg-primary text-white shadow-primary/20 hover:scale-105"
                            : "bg-[#f8f7fc] dark:bg-white/5 border border-[#e9e2f3] dark:border-white/10 text-[#756d8d] cursor-not-allowed"
                        }`}
                      >
                        {isGeneratingShowcase ? <Sparkles className="w-5 h-5 animate-spin" /> : <><Share2 className="w-4 h-4" /> Create Poster</>}
                      </button>
                    </div>
                  </div>
                )}

                {showcaseStep === 2 && (
                  <div className="flex flex-col gap-3 md:gap-4">
                    <div className="flex items-center justify-between border-b border-[#e9e2f3] dark:border-white/10 pb-3 md:pb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center shadow-lg shadow-green-500/25">
                          <Check className="w-5 h-5" strokeWidth={3} />
                        </div>
                        <div>
                          <h2 className="text-xl font-bold text-[#171421] dark:text-white">Poster Created!</h2>
                          <p className="text-[10px] font-bold text-green-500 uppercase tracking-wider">Ready to Download & Share</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => setShowShowcaseModal(false)}
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#e9e2f3] bg-[#f8f7fc]/80 text-[#171421] shadow-sm backdrop-blur-2xl transition-transform hover:scale-105 active:scale-95 dark:border-white/10 dark:bg-[#171421]/80 dark:text-[#f7f2ff] dark:hover:text-white"
                        aria-label="Close"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="flex flex-col items-center gap-3.5 md:gap-4 w-full">
                      {/* Header title */}
                      <div className="text-center w-full -mt-1 md:-mt-2 mb-1">
                        <h3 className="text-lg md:text-xl font-bold text-[#171421] dark:text-white">Share Your Showcase</h3>
                        <p className="text-[11px] md:text-xs text-[#756d8d] mt-0.5">We've rendered your prompts into a premium story poster. Share it with friends or save to your device!</p>
                      </div>

                      {/* Centered Premium Poster Preview Card */}
                      <div className="w-[200px] h-[356px] md:w-[260px] md:h-[462px] rounded-[1.5rem] md:rounded-[2rem] bg-gradient-to-b from-[#181524] via-[#0d0b13] to-[#120f1b] border border-primary/20 shadow-[0_24px_50px_-12px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col relative shrink-0">
                        <div className="absolute -top-12 -left-12 w-28 h-28 rounded-full bg-primary/20 blur-2xl pointer-events-none" />
                        <div className="absolute -bottom-12 -right-12 w-28 h-28 rounded-full bg-secondary/20 blur-2xl pointer-events-none" />

                        {/* Top Watermark */}
                        <div className="flex flex-col items-center pt-4 md:pt-6 gap-0.5 md:gap-1 relative z-10">
                          <div className="text-[7px] md:text-[9px] font-black uppercase tracking-[0.25em] text-primary bg-primary/10 px-2.5 py-0.5 rounded-full border border-primary/20">Promptro</div>
                          <div className="text-[6px] md:text-[8px] font-bold text-[#8c84a6] uppercase tracking-[0.1em] mt-0.5 md:mt-1">Elevate Your Artistry</div>
                        </div>

                        {/* Center Poster Main Heading */}
                        <div className="text-center mt-2.5 md:mt-4 relative z-10 px-4">
                          <h4 className="text-[9px] md:text-xs font-black tracking-wide text-white uppercase bg-gradient-to-r from-white via-[#ece8ff] to-[#dfd5ff] bg-clip-text text-transparent">Creative Inspirations</h4>
                          <div className="h-[1px] w-8 md:w-12 bg-primary/40 mx-auto mt-1.5 md:mt-2" />
                        </div>

                        {/* Dynamic prompt collage stack */}
                        <div className="relative flex items-center justify-center h-36 md:h-48 w-full my-auto z-10">
                          {selectedPrompts.length === 1 && (
                            <div className="w-20 h-28 md:w-28 md:h-36 rounded-xl md:rounded-2xl overflow-hidden border border-white/10 shadow-[0_12px_28px_rgba(0,0,0,0.6)] z-20">
                              <img src={selectedPrompts[0]?.image_url} className="w-full h-full object-cover" />
                            </div>
                          )}

                          {selectedPrompts.length === 2 && (
                            <div className="relative flex items-center justify-center w-full h-full">
                              <div className="w-16 h-22 md:w-22 md:h-30 rounded-xl md:rounded-2xl overflow-hidden border border-white/10 -rotate-[8deg] translate-x-3 shadow-xl opacity-80">
                                <img src={selectedPrompts[0]?.image_url} className="w-full h-full object-cover" />
                              </div>
                              <div className="w-18 h-24 md:w-24 md:h-32 rounded-xl md:rounded-2xl overflow-hidden border border-white/10 rotate-[8deg] -translate-x-3 shadow-[0_12px_28px_rgba(0,0,0,0.6)] z-20">
                                <img src={selectedPrompts[1]?.image_url} className="w-full h-full object-cover" />
                              </div>
                            </div>
                          )}

                          {selectedPrompts.length === 3 && (
                            <>
                              <div className="absolute left-2.5 md:left-4 w-16 h-22 md:w-24 md:h-32 rounded-xl md:rounded-2xl overflow-hidden border border-white/10 -rotate-12 translate-y-2 md:translate-y-3 shadow-xl scale-90 opacity-60">
                                <img src={selectedPrompts[0]?.image_url} className="w-full h-full object-cover" />
                              </div>
                              
                              <div className="absolute right-2.5 md:right-4 w-16 h-22 md:w-24 md:h-32 rounded-xl md:rounded-2xl overflow-hidden border border-white/10 rotate-12 translate-y-2 md:translate-y-3 shadow-xl scale-90 opacity-60">
                                <img src={selectedPrompts[2]?.image_url} className="w-full h-full object-cover" />
                              </div>

                              <div className="absolute w-20 h-26 md:w-28 md:h-36 rounded-xl md:rounded-2xl overflow-hidden border border-white/10 shadow-[0_12px_28px_rgba(0,0,0,0.6)] z-20">
                                <img src={selectedPrompts[1]?.image_url} className="w-full h-full object-cover" />
                              </div>
                            </>
                          )}
                        </div>

                        {/* Bottom CTA Block on Poster */}
                        <div className="flex flex-col items-center gap-1.5 md:gap-2 px-4 pb-4 md:pb-6 text-center mt-auto relative z-10">
                          <h4 className="text-[7px] md:text-[9px] font-black tracking-wide text-white uppercase">My Favorites Collection</h4>
                          <p className="text-[6px] md:text-[7px] font-bold text-[#8c84a6] max-w-[130px] md:max-w-[170px]">Explore these stunning prompt templates on Promptro</p>
                          <div className="w-full py-1.5 md:py-2 rounded-lg md:rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-extrabold text-[7px] md:text-[8px] tracking-wider shadow-lg shadow-primary/25 border border-white/10 flex items-center justify-center gap-0.5 md:gap-1 mt-0.5 md:mt-1">
                            <span>✨ DISCOVER ON PROMPTRO.IN</span>
                            <ArrowUpRight className="w-2.5 h-2.5 md:w-3 md:h-3" />
                          </div>
                        </div>
                      </div>

                      {/* Bottom Core Actions Controls (Sleek Horizontal Bar of Icon Buttons under download) */}
                      <div className="w-[200px] md:w-[260px] flex flex-col gap-3">
                        {/* Premium 5-Button Symmetrical Action Row */}
                        <div className="flex items-center justify-between px-0.5 w-full gap-2">
                          <button 
                            onClick={downloadShowcasePoster}
                            title="Download Poster PNG"
                            className="flex-1 h-11 rounded-xl border border-[#e9e2f3] dark:border-white/10 hover:bg-primary/10 hover:border-primary/50 text-primary flex items-center justify-center shadow-sm transition-all hover:scale-105 active:scale-95"
                          >
                            <Download className="w-5 h-5" />
                          </button>
                          <button 
                            onClick={copyImageToClipboard}
                            title="Copy Image"
                            className="flex-1 h-11 rounded-xl border border-[#e9e2f3] dark:border-white/10 hover:bg-primary/10 hover:border-primary/50 text-primary flex items-center justify-center shadow-sm transition-all hover:scale-105 active:scale-95"
                          >
                            <Copy className="w-5 h-5" />
                          </button>
                          <button 
                            onClick={shareShowcaseNatively}
                            title="Share Poster"
                            className="flex-1 h-11 rounded-xl border border-[#e9e2f3] dark:border-white/10 hover:bg-green-50 dark:hover:bg-green-500/10 hover:border-green-500/50 text-green-500 flex items-center justify-center shadow-sm transition-all hover:scale-105 active:scale-95"
                          >
                            <Share2 className="w-5 h-5" />
                          </button>
                          <button 
                            onClick={shareShowcaseToInstagram}
                            title="Instagram Story"
                            className="flex-1 h-11 rounded-xl border border-[#e9e2f3] dark:border-white/10 hover:bg-[#e1306c]/10 hover:border-[#e1306c]/50 text-[#e1306c] flex items-center justify-center shadow-sm transition-all hover:scale-105 active:scale-95"
                          >
                            <Instagram className="w-5 h-5" />
                          </button>
                          <button 
                            onClick={shareShowcaseToWhatsApp}
                            title="WhatsApp Send"
                            className="flex-1 h-11 rounded-xl border border-[#e9e2f3] dark:border-white/10 hover:bg-green-50 dark:hover:bg-green-500/10 hover:border-green-500/50 text-green-500 flex items-center justify-center shadow-sm transition-all hover:scale-105 active:scale-95"
                          >
                            <MessageCircle className="w-5 h-5" />
                          </button>
                        </div>

                        <button 
                          onClick={copyShowcaseLink}
                          className="w-full h-9 rounded-xl border border-[#e9e2f3] dark:border-white/10 text-[#756d8d] hover:text-primary font-bold text-xs flex items-center justify-center gap-1.5"
                        >
                          <Copy className="w-3.5 h-3.5" /> Copy Showcase Link
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
