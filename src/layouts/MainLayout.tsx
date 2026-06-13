import { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import TopNavbar from '../components/TopNavbar';
import BottomNav from '../components/BottomNav';
import SearchPill from '../components/SearchPill';
import PageBackButton from '../components/PageBackButton';
import CookieConsent from '../components/CookieConsent';
import TermsAcceptanceModal from '../components/TermsAcceptanceModal';
import EmailVerificationPopup from '../components/EmailVerificationPopup';
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
  endWidth: number;
  endHeight: number;
}

export default function MainLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [flyingCards, setFlyingCards] = useState<FlyingCard[]>([]);
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 768);
  const [navbarHeight, setNavbarHeight] = useState(120);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const isHomeRoute = 
      location.pathname === '/' ||
      location.pathname === '/about' ||
      location.pathname === '/contact' ||
      location.pathname === '/privacy-policy' ||
      location.pathname === '/terms';

    if (!isHomeRoute) return;

    const updateHeight = () => {
      const navbar = document.querySelector('nav');
      if (navbar) {
        setNavbarHeight(navbar.offsetHeight);
      }
    };
    
    updateHeight();
    window.addEventListener('resize', updateHeight);
    const timer = setTimeout(updateHeight, 100);
    
    return () => {
      window.removeEventListener('resize', updateHeight);
      clearTimeout(timer);
    };
  }, [location.pathname]);

  useEffect(() => {
    const handleSavedAnimation = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      const targetElement = document.getElementById('bottom-nav-saved-icon') || document.getElementById('bottom-nav-saved');
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
            endWidth: targetRect.width,
            endHeight: targetRect.height,
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
  
  // Swipe navigation for mobile devices (screen width < 768px)
  useEffect(() => {
    let touchStartX = 0;
    let touchStartY = 0;
    let touchStartTime = 0;

    const handleTouchStart = (e: TouchEvent) => {
      if (window.innerWidth >= 768) return;

      // Disable swipe navigation if any modal, popup, drawer, or dialog is open
      const isModalOrPopupOpen = () => {
        // Check standard body/html scroll lock (used when modals are open)
        if (
          document.body.style.overflow === 'hidden' ||
          document.documentElement.style.overflow === 'hidden'
        ) {
          return true;
        }

        // Check for role dialog, alertdialog or HTML5 dialog element
        if (document.querySelector('[role="dialog"], [role="alertdialog"], dialog[open]')) {
          return true;
        }

        // Check for elements containing specific modal/popup keywords in classes
        if (document.querySelector('[class*="modal-glass"], [class*="profile-modal-glass"], [class*="modal-container"], .modal, [class*="popup-container"]')) {
          return true;
        }

        // Check for active fixed/absolute high z-index overlay backdrops (>= 50) that cover the screen
        const overlays = document.querySelectorAll('.fixed, .absolute');
        for (let i = 0; i < overlays.length; i++) {
          const el = overlays[i] as HTMLElement;
          // Ignore overlays inside top navbar or bottom navbar
          if (el.closest('header, nav, #bottom-nav, .top-navbar, #top-navbar, .bottom-navbar')) {
            continue;
          }
          // If it covers viewport (inset-0 or style covering full screen)
          const isInset0 = el.classList.contains('inset-0') || 
                            (el.classList.contains('inset-x-0') && el.classList.contains('inset-y-0')) ||
                            (el.style.top === '0px' && el.style.left === '0px' && el.style.right === '0px' && el.style.bottom === '0px');
                            
          if (isInset0) {
            const zIndex = window.getComputedStyle(el).zIndex;
            const zIndexNum = parseInt(zIndex, 10);
            if (!isNaN(zIndexNum) && zIndexNum >= 50) {
              return true;
            }
          }
        }
        return false;
      };

      if (isModalOrPopupOpen()) {
        return;
      }

      const target = e.target as HTMLElement;
      if (!target) return;

      const x = e.touches[0].clientX;
      const y = e.touches[0].clientY;

      // Exclude top header (y < 110px) and bottom navbar (y > window.innerHeight - 90px)
      if (y < 110 || y > window.innerHeight - 90) {
        return;
      }

      // Exclude 3% margin from left and right edges to avoid conflicting with OS/browser navigation
      const edgeMargin = window.innerWidth * 0.03;
      if (x < edgeMargin || x > window.innerWidth - edgeMargin) {
        return;
      }

      // Ignore interactive form elements but allow swipes on links (<a>)
      if (target.closest('input, textarea, button, select, [role="button"], [contenteditable="true"]')) {
        return;
      }
      
      // Detect if swiping inside a horizontally scrollable element
      let currentEl: HTMLElement | null = target;
      while (currentEl && currentEl !== document.body) {
        if (currentEl.classList.contains('no-swipe') || currentEl.getAttribute('data-no-swipe') === 'true') {
          return;
        }
        const style = window.getComputedStyle(currentEl);
        if ((style.overflowX === 'auto' || style.overflowX === 'scroll') && currentEl.scrollWidth > currentEl.clientWidth) {
          return;
        }
        currentEl = currentEl.parentElement;
      }

      touchStartX = x;
      touchStartY = y;
      touchStartTime = Date.now();
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (window.innerWidth >= 768) return;
      if (!touchStartX || !touchStartY) return;

      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;
      const duration = Date.now() - touchStartTime;

      const deltaX = touchEndX - touchStartX;
      const deltaY = touchEndY - touchStartY;

      // Thresholds:
      // - Minimum horizontal swipe distance of 70px
      // - Must be primarily horizontal (deltaX is significantly larger than deltaY)
      // - Gesture must be completed within 400ms (fast swipe)
      if (Math.abs(deltaX) > 70 && Math.abs(deltaY) < Math.abs(deltaX) * 0.5 && duration < 400) {
        const currentPath = location.pathname;
        const paths = ['/', '/explore', '/collections', '/saved', '/categories'];
        const currentIndex = paths.indexOf(currentPath);

        if (currentIndex !== -1) {
          if (deltaX < 0) {
            // Swipe Left (Go next: Home -> Explore -> Collections -> Saved -> Categories)
            if (currentIndex < paths.length - 1) {
              navigate(paths[currentIndex + 1]);
              window.scrollTo({ top: 0 });
            }
          } else {
            // Swipe Right (Go back: Categories -> Saved -> Collections -> Explore -> Home)
            if (currentIndex > 0) {
              navigate(paths[currentIndex - 1]);
              window.scrollTo({ top: 0 });
            }
          }
        }
      }

      // Reset
      touchStartX = 0;
      touchStartY = 0;
      touchStartTime = 0;
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [location.pathname, navigate]);

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
    location.pathname === '/collections' ||
    location.pathname === '/categories';
  const pagePillLabel = location.pathname === '/categories'
    ? 'Prompt worlds'
    : location.pathname === '/explore'
      ? 'Explore prompts'
      : location.pathname === '/saved'
        ? 'Saved prompts'
        : location.pathname === '/collections'
          ? 'Prompt Collections'
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
        <div className="fixed top-0 w-full z-[100] px-4 pt-1.5 pb-3 md:pt-1.5 md:pb-3 md:px-8">
          <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[118px] bg-[radial-gradient(circle_at_18%_0%,rgba(139,92,246,0.18),transparent_44%),radial-gradient(circle_at_92%_0%,rgba(255,106,61,0.16),transparent_42%),linear-gradient(180deg,#ffffff_0%,#ffffff_15%,rgba(255,255,255,0.8)_35%,rgba(255,255,255,0.3)_60%,rgba(255,255,255,0)_100%)] [mask-image:linear-gradient(to_bottom,#000_0%,#000_15%,rgba(0,0,0,0.8)_35%,rgba(0,0,0,0.3)_60%,rgba(0,0,0,0.05)_80%,transparent_100%)] dark:bg-[radial-gradient(circle_at_18%_0%,rgba(139,92,246,0.22),transparent_44%),radial-gradient(circle_at_92%_0%,rgba(255,106,61,0.15),transparent_42%),linear-gradient(180deg,#0d0b14_0%,#0d0b14_15%,rgba(13,11,20,0.8)_35%,rgba(13,11,20,0.3)_60%,rgba(13,11,20,0)_100%)]" />
          <div className="relative z-10 mx-auto flex max-w-[1600px] items-center gap-3">
            {showPageBack && <PageBackButton />}
            {showPageSearch ? (
              <SearchPill />
            ) : pagePillLabel ? (
              <span className="pill-glass rounded-full px-4 py-2 text-xs font-bold uppercase tracking-normal text-primary">
                {pagePillLabel}
              </span>
            ) : null}
          </div>
        </div>
      ) : null}

      <main 
        style={isHome && isMobile ? { paddingTop: `${navbarHeight}px` } : undefined}
        className={`flex-grow relative z-10 w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 ${
          isAuth 
            ? 'flex min-h-svh items-center py-3 sm:py-4' 
            : isPromptDetail 
              ? 'pt-5 pb-8' 
              : isHome 
                ? 'pb-6 md:pt-[84px] md:pb-10' 
                : showPageSearch
                  ? 'pt-[78px] pb-6 md:pt-[84px] md:pb-10'
                  : 'pt-[68px] pb-6 md:pt-[72px] md:pb-10'
        }`}
      >
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

      {location.pathname !== '/verify-email' && <CookieConsent />}
      {!isAuth && <TermsAcceptanceModal />}
      {!isAuth && <EmailVerificationPopup />}

      {/* Flying card animations overlay */}
      <AnimatePresence>
        {flyingCards.map((card) => {
          // Fit the card exactly inside the target icon container dimensions
          const scaleTarget = Math.min(card.endWidth / card.startWidth, card.endHeight / card.startHeight);

          return (
            <motion.div
              key={card.id}
              style={{
                position: 'fixed',
                top: card.startY,
                left: card.startX,
                width: card.startWidth,
                height: card.startHeight,
                overflow: 'hidden',
                zIndex: 99999,
                pointerEvents: 'none',
                transformOrigin: 'center center',
                willChange: 'transform, opacity, clip-path',
              }}
              initial={{
                opacity: 0.95,
                x: 0,
                y: 0,
                scale: 1,
                rotate: 0,
                clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 50% 100%, 0% 100%)', // Rectangle
              }}
              animate={{
                x: card.endX - (card.startX + card.startWidth / 2),
                y: card.endY - (card.startY + card.startHeight / 2),
                scale: scaleTarget,
                rotate: -12,
                opacity: 0.1,
                clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 50% 80%, 0% 100%)', // Bookmark shape
              }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 0.6,
                x: { ease: [0.16, 1, 0.3, 1] }, // easeOutExpo
                y: { ease: [0.7, 0, 0.84, 0] }, // easeIn (creating a parabolic curved path)
                scale: { ease: [0.16, 1, 0.3, 1] },
                rotate: { ease: [0.16, 1, 0.3, 1] },
                opacity: { duration: 0.5, ease: 'linear' },
                clipPath: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
              }}
              onAnimationComplete={() => {
                setFlyingCards((prev) => {
                  const exists = prev.some((c) => c.id === card.id);
                  if (exists) {
                    // Snappy bounce/fill feedback on the target saved button
                    const target = document.getElementById('bottom-nav-saved');
                    if (target) {
                      target.classList.remove('animate-bounce-short');
                      void target.offsetWidth; // Force reflow
                      target.classList.add('animate-bounce-short');
                      
                      // Cleanup class after 400ms so it immediately goes back to how it was before
                      setTimeout(() => {
                        target.classList.remove('animate-bounce-short');
                      }, 400);
                    }
                  }
                  return prev.filter((c) => c.id !== card.id);
                });
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
