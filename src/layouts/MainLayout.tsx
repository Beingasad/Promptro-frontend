import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import TopNavbar from '../components/TopNavbar';
import BottomNav from '../components/BottomNav';
import SearchPill from '../components/SearchPill';
import PageBackButton from '../components/PageBackButton';
import CookieConsent from '../components/CookieConsent';
import TermsAcceptanceModal from '../components/TermsAcceptanceModal';
import { motion, AnimatePresence } from 'framer-motion';

interface FlyingCard {
  id: number;
  imageUrl: string;
  startX: number;
  startY: number;
  startWidth: number;
  startHeight: number;
  endX: number;
  endY: number;
}

export default function MainLayout() {
  const location = useLocation();
  const [flyingCards, setFlyingCards] = useState<FlyingCard[]>([]);

  useEffect(() => {
    const handleSavedAnimation = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      const targetElement = document.getElementById('bottom-nav-saved');
      const targetRect = targetElement?.getBoundingClientRect();
      if (targetRect) {
        const id = Date.now() + Math.random();
        setFlyingCards((prev) => [
          ...prev,
          {
            id,
            imageUrl: detail.imageUrl,
            startX: detail.startX,
            startY: detail.startY,
            startWidth: detail.startWidth,
            startHeight: detail.startHeight,
            endX: targetRect.left + targetRect.width / 2,
            endY: targetRect.top + targetRect.height / 2,
          },
        ]);
      }
    };

    window.addEventListener('prompt-saved-animation', handleSavedAnimation);
    return () => {
      window.removeEventListener('prompt-saved-animation', handleSavedAnimation);
    };
  }, []);

  useEffect(() => {
    // Record page visit
    const trackVisit = async () => {
      try {
        await axios.post(`${API_BASE_URL}/api/analytics/track`, {
          path: location.pathname,
          referrer: document.referrer || null
        });
      } catch (err) {
        console.error('Error tracking page visit:', err);
      }
    };
    trackVisit();
  }, [location.pathname]);

  const isPromptDetail = location.pathname.startsWith('/prompt/');
  const isHome = 
    location.pathname === '/' ||
    location.pathname === '/about' ||
    location.pathname === '/contact' ||
    location.pathname === '/privacy-policy' ||
    location.pathname === '/terms';
  const isBlog = location.pathname === '/blog' || location.pathname.startsWith('/blog/');
  const isAuth = location.pathname === '/auth';
  const showPageSearch = location.pathname === '/explore' || location.pathname === '/saved';
  const showPageBack = !isHome && !isPromptDetail && !isAuth;
  const showBottomNav = 
    location.pathname === '/' ||
    location.pathname === '/explore' ||
    location.pathname === '/saved' ||
    location.pathname === '/categories';
  const pagePillLabel = location.pathname === '/categories'
    ? 'Prompt worlds'
    : location.pathname === '/explore'
      ? 'Explore prompts'
      : location.pathname === '/saved'
        ? 'Saved prompts'
        : location.pathname === '/about'
          ? 'About Promptro'
          : location.pathname === '/contact'
            ? 'Contact'
            : location.pathname === '/privacy-policy'
              ? 'Privacy Policy'
              : location.pathname === '/terms'
                ? 'Terms of Service'
                : location.pathname === '/blog'
                  ? 'Blog & Guides'
                  : isBlog
                    ? 'Article'
                    : '';

  return (
    <div className="min-h-screen bg-background relative flex flex-col">
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_14%_4%,rgba(139,92,246,0.18),transparent_32%),radial-gradient(circle_at_88%_10%,rgba(255,106,61,0.16),transparent_28%),radial-gradient(circle_at_48%_34%,rgba(217,75,203,0.1),transparent_30%),linear-gradient(180deg,#ffffff_0%,#faf8ff_38%,#f6f3fb_100%)] dark:bg-[radial-gradient(circle_at_14%_4%,rgba(139,92,246,0.22),transparent_32%),radial-gradient(circle_at_88%_10%,rgba(255,106,61,0.16),transparent_30%),radial-gradient(circle_at_48%_34%,rgba(217,75,203,0.12),transparent_32%),linear-gradient(180deg,#0d0b14_0%,#12101b_46%,#0a0910_100%)]"></div>
        <div className="absolute -left-28 top-32 h-72 w-72 rounded-full bg-[#8b5cf6]/10 blur-[70px] dark:bg-[#8b5cf6]/16"></div>
        <div className="absolute -right-20 top-20 h-80 w-80 rounded-full bg-[#ff6a3d]/10 blur-[76px] dark:bg-[#ff6a3d]/14"></div>
        <div className="absolute left-1/3 top-[45%] h-64 w-64 rounded-full bg-[#d94bcb]/8 blur-[82px] dark:bg-[#d94bcb]/12"></div>
        {/* Premium Drifting Background Orbs for Dynamic Glass Refraction - Optimized: Hidden on Mobile to prevent GPU lag */}
        <div className="hidden md:block absolute left-[8%] top-[18%] h-96 w-96 rounded-full bg-gradient-to-tr from-[#8b5cf6]/12 to-[#d94bcb]/8 blur-[80px] dark:from-[#8b5cf6]/18 dark:to-[#d94bcb]/12 animate-drift-blob-1 pointer-events-none" />
        <div className="hidden md:block absolute right-[10%] top-[42%] h-[26rem] w-[26rem] rounded-full bg-gradient-to-br from-[#ff6a3d]/10 to-[#8b5cf6]/10 blur-[90px] dark:from-[#ff6a3d]/14 dark:to-[#8b5cf6]/14 animate-drift-blob-2 pointer-events-none" />
      </div>

      {isHome && <TopNavbar />}
      
      {showPageSearch || showPageBack ? (
        <div className="fixed top-0 w-full z-[100] px-4 pt-1.5 pb-3 md:py-3 md:px-8">
          <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[118px] bg-[radial-gradient(circle_at_18%_0%,rgba(139,92,246,0.18),transparent_44%),radial-gradient(circle_at_92%_0%,rgba(255,106,61,0.16),transparent_42%),linear-gradient(180deg,#ffffff_0%,#ffffff_15%,rgba(255,255,255,0.8)_35%,rgba(255,255,255,0.3)_60%,rgba(255,255,255,0)_100%)] [mask-image:linear-gradient(to_bottom,#000_0%,#000_15%,rgba(0,0,0,0.8)_35%,rgba(0,0,0,0.3)_60%,rgba(0,0,0,0.05)_80%,transparent_100%)] dark:bg-[radial-gradient(circle_at_18%_0%,rgba(139,92,246,0.22),transparent_44%),radial-gradient(circle_at_92%_0%,rgba(255,106,61,0.15),transparent_42%),linear-gradient(180deg,#0d0b14_0%,#0d0b14_15%,rgba(13,11,20,0.8)_35%,rgba(13,11,20,0.3)_60%,rgba(13,11,20,0)_100%)]" />
          <div className="relative z-10 mx-auto flex max-w-[1600px] items-center gap-3">
            {showPageBack && <PageBackButton />}
            {showPageSearch ? (
              <SearchPill />
            ) : pagePillLabel ? (
              <span className="rounded-full bg-white/72 px-4 py-2 text-xs font-bold uppercase tracking-normal text-primary shadow-[0_14px_34px_rgba(72,56,118,0.12)] backdrop-blur-2xl dark:bg-[#171421]/78 dark:text-primary dark:shadow-[0_16px_38px_rgba(0,0,0,0.28)]">
                {pagePillLabel}
              </span>
            ) : null}
          </div>
        </div>
      ) : null}

      <main className={`flex-grow relative z-10 w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 ${
        isAuth 
          ? 'flex min-h-svh items-center py-3 sm:py-4' 
          : isPromptDetail 
            ? 'pt-5 pb-8' 
            : isHome 
              ? 'pt-[110px] pb-6 md:pt-[84px] md:pb-10' 
              : showPageSearch
                ? 'pt-[78px] pb-6 md:pt-[84px] md:pb-10'
                : 'pt-[68px] pb-6 md:pt-[72px] md:pb-10'
      }`}>
        <Outlet />
      </main>

      {!isAuth && (
        <footer className={`relative z-10 text-center ${showBottomNav ? 'pb-24 md:pb-32' : 'pb-6 md:pb-8'}`}>
          <p className="text-[10px] font-medium text-[#8d86a0]/50">
            &copy; {new Date().getFullYear()} Promptro. All rights reserved.
          </p>
        </footer>
      )}

      {showBottomNav && <BottomNav />}

      <CookieConsent />
      {!isAuth && <TermsAcceptanceModal />}

      {/* Flying card animations overlay */}
      <AnimatePresence>
        {flyingCards.map((card) => {
          const targetWidth = 24;
          const scaleTarget = targetWidth / card.startWidth;

          return (
            <motion.div
              key={card.id}
              style={{
                position: 'fixed',
                top: card.startY,
                left: card.startX,
                width: card.startWidth,
                height: card.startHeight,
                borderRadius: '1.25rem',
                overflow: 'hidden',
                boxShadow: '0 10px 30px rgba(109, 77, 236, 0.25)',
                border: '2px solid rgba(139, 92, 246, 0.4)',
                zIndex: 99999,
                pointerEvents: 'none',
                transformOrigin: 'center center',
                willChange: 'transform, opacity',
              }}
              initial={{
                opacity: 0.95,
                x: 0,
                y: 0,
                scale: 1,
                rotate: 0,
              }}
              animate={{
                x: card.endX - (card.startX + card.startWidth / 2),
                y: card.endY - (card.startY + card.startHeight / 2),
                scale: scaleTarget,
                rotate: -12,
                opacity: 0.1,
              }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 0.45,
                x: { ease: [0.16, 1, 0.3, 1] }, // easeOutExpo
                y: { ease: [0.7, 0, 0.84, 0] }, // easeIn (creating a parabolic curved path)
                scale: { ease: [0.16, 1, 0.3, 1] },
                rotate: { ease: [0.16, 1, 0.3, 1] },
                opacity: { duration: 0.4, ease: 'linear' },
              }}
              onAnimationComplete={() => {
                setFlyingCards((prev) => prev.filter((c) => c.id !== card.id));
                
                // Bounce feedback on the target saved button
                const target = document.getElementById('bottom-nav-saved');
                if (target) {
                  target.classList.remove('animate-bounce-short');
                  void target.offsetWidth; // Force reflow
                  target.classList.add('animate-bounce-short');
                  
                  // Cleanup class after animation ends so the icon returns to its original style
                  setTimeout(() => {
                    target.classList.remove('animate-bounce-short');
                  }, 450);
                }

                // Trigger the ripple ring burst animation on the bottom nav icon
                const ripple = document.getElementById('bottom-nav-saved-ripple');
                if (ripple) {
                  ripple.classList.remove('animate-ripple-ring');
                  void ripple.offsetWidth; // Force reflow
                  ripple.classList.add('animate-ripple-ring');
                  
                  // Cleanup class after animation ends
                  setTimeout(() => {
                    ripple.classList.remove('animate-ripple-ring');
                  }, 550);
                }
              }}
            >
              <img src={card.imageUrl} decoding="async" className="w-full h-full object-cover" alt="" />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
