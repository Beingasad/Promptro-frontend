import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Layers, ChevronRight, X, FolderPlus, Heart, Share2, Sparkles } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

interface CollectionsTourProps {
  show?: boolean;
}

export default function CollectionsTour({ show = true }: CollectionsTourProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(false);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  
  const [cookieConsentGiven, setCookieConsentGiven] = useState(() => 
    !!localStorage.getItem('promptro:cookie-consent')
  );

  useEffect(() => {
    const handleConsent = () => {
      setCookieConsentGiven(true);
    };
    window.addEventListener('promptro-cookie-consent-given', handleConsent);
    return () => {
      window.removeEventListener('promptro-cookie-consent-given', handleConsent);
    };
  }, []);

  useEffect(() => {
    // If the tour is not active or user is on mobile/tablet view but bottom nav isn't visible, don't show
    if (!show) {
      setIsVisible(false);
      return;
    }

    // Pause the tour if the user is still viewing the Cookie Consent banner
    if (!cookieConsentGiven) {
      setIsVisible(false);
      return;
    }

    // Check if the user has already seen the tour
    const tourSeen = localStorage.getItem('promptro_collections_tour_seen');
    if (tourSeen === 'true') {
      setIsVisible(false);
      return;
    }

    // If they directly navigate to the collections page, auto-complete the tour silently
    if (location.pathname === '/collections') {
      localStorage.setItem('promptro_collections_tour_seen', 'true');
      setIsVisible(false);
      return;
    }

    const updatePosition = () => {
      const el = document.getElementById('bottom-nav-collections');
      if (el) {
        setRect(el.getBoundingClientRect());
        setIsVisible(true);
      } else {
        // Retry shortly if the layout is still loading
        setTimeout(updatePosition, 150);
      }
    };

    updatePosition();

    // Re-calculate target element rect on viewport changes
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, { passive: true });

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition);
    };
  }, [location.pathname, show, cookieConsentGiven]);

  const handleCompleteTour = () => {
    localStorage.setItem('promptro_collections_tour_seen', 'true');
    setIsVisible(false);
    setShowDetailsModal(false);
  };

  if (!isVisible || !rect) return null;

  // Center point of spotlight
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  // Radius of spotlight circle (slightly larger than the icon container)
  const r = Math.max(rect.width, rect.height) / 2 + 10;

  const handleOverlayClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const clickX = e.clientX;
    const clickY = e.clientY;
    // Calculate distance from center of spotlight to detect click inside cutout
    const dist = Math.sqrt((clickX - cx) ** 2 + (clickY - cy) ** 2);
    if (dist <= r) {
      // Clicked inside the Collections button circle! Navigate and finish.
      handleCompleteTour();
      navigate('/collections');
    }
  };

  return (
    <>
      {/* ── SCREEN DIMMING MASK & TARGET OVERLAY ── */}
      <AnimatePresence>
        {!showDetailsModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] pointer-events-auto"
          >
            {/* SVG Mask Cutout */}
            <svg 
              className="absolute inset-0 w-full h-full cursor-pointer"
              onClick={handleOverlayClick}
            >
              <defs>
                <mask id="spotlight-mask">
                  <rect width="100%" height="100%" fill="white" />
                  <circle cx={cx} cy={cy} r={r} fill="black" />
                </mask>
              </defs>
              {/* Semi-transparent dark background layer */}
              <rect width="100%" height="100%" fill="rgba(6, 4, 12, 0.72)" mask="url(#spotlight-mask)" />
            </svg>

            {/* Glowing animated border outline precisely around target */}
            <div
              className="absolute pointer-events-none rounded-full border-2 border-primary animate-pulse"
              style={{
                left: `${cx - r}px`,
                top: `${cy - r}px`,
                width: `${r * 2}px`,
                height: `${r * 2}px`,
                boxShadow: '0 0 18px rgba(109, 77, 236, 0.6), inset 0 0 10px rgba(109, 77, 236, 0.4)',
              }}
            />

            {/* Pulsing indicator aura */}
            <div
              className="absolute pointer-events-none rounded-full bg-primary/10 animate-ping duration-[2000ms]"
              style={{
                left: `${cx - r - 4}px`,
                top: `${cy - r - 4}px`,
                width: `${(r + 4) * 2}px`,
                height: `${(r + 4) * 2}px`,
              }}
            />

            {/* ── TOOLTIP CARD FLOAT ABOVE SPOTLIGHT ── */}
            <div
              className="absolute z-[210] w-[290px] max-w-[calc(100vw-32px)]"
              style={{
                left: `${cx}px`,
                bottom: `${window.innerHeight - rect.top + 16}px`,
                transform: 'translateX(-50%)',
              }}
            >
              <motion.div
                initial={{ y: 12, opacity: 0, scale: 0.95 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: 12, opacity: 0, scale: 0.95 }}
                transition={{ delay: 0.2, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="bg-white/95 dark:bg-[#130f1e]/95 border border-[#e4e2ec] dark:border-white/10 backdrop-blur-xl rounded-[1.25rem] p-4 shadow-[0_22px_48px_rgba(72,56,118,0.14)] dark:shadow-[0_22px_48px_rgba(0,0,0,0.6)] text-left"
              >
                {/* Pointing down arrow */}
                <div 
                  className="absolute bottom-[-7px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[7px] border-l-transparent border-r-[7px] border-r-transparent border-t-[7px] border-t-white dark:border-t-[#130f1e]/95" 
                  style={{ filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.15))' }}
                />

                <div className="flex gap-2.5 items-start">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-[#ff6a3d] shadow-[0_4px_10px_rgba(109,77,236,0.3)]">
                    <Layers className="h-4.5 w-4.5 text-white" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-black text-primary dark:text-[#ff6a3d] uppercase tracking-wider flex items-center gap-1.5">
                      New Feature <Sparkles className="h-3 w-3 text-[#ff6a3d] animate-pulse" />
                    </h4>
                    <p className="text-sm font-black text-[#171421] dark:text-white mt-0.5 leading-snug">
                      Introduce Board Collections
                    </p>
                    <p className="text-[12px] font-semibold text-[#5c5470] dark:text-[#a8a1c0] mt-1.5 leading-relaxed">
                      Organize your favourite prompts into custom boards and share them with the world!
                    </p>
                  </div>
                </div>

                {/* Tooltip Actions */}
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#e4e2ec]/60 dark:border-white/5">
                  <button
                    onClick={handleCompleteTour}
                    className="text-[#88819e] hover:text-[#171421] dark:hover:text-white text-[11px] font-bold px-2 py-1 transition-colors"
                  >
                    Skip
                  </button>
                  <button
                    onClick={() => setShowDetailsModal(true)}
                    className="bg-gradient-to-r from-primary to-[#ff6a3d] text-white text-[11px] font-black tracking-normal px-3 py-1.5 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center gap-0.5 hover:scale-[1.03] active:scale-[0.97]"
                  >
                    Read More
                    <ChevronRight className="h-3 w-3 stroke-[2.5]" />
                  </button>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── EXPANDED DETAILS MODAL ── */}
      <AnimatePresence>
        {showDetailsModal && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm pointer-events-auto">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 15 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-sm bg-white/95 dark:bg-[#0e0a16]/95 border border-[#e4e2ec] dark:border-white/10 backdrop-blur-2xl rounded-[2.25rem] p-6 shadow-[0_24px_60px_rgba(72,56,118,0.18)] dark:shadow-[0_24px_60px_rgba(109,77,236,0.18)] overflow-hidden text-center"
            >
              {/* Premium Background Auras */}
              <div className="absolute -top-20 -right-20 w-48 h-48 rounded-full bg-primary/20 blur-3xl pointer-events-none" />
              <div className="absolute -bottom-20 -left-20 w-48 h-48 rounded-full bg-[#ff6a3d]/12 blur-3xl pointer-events-none" />

              {/* Close Button */}
              <button
                onClick={handleCompleteTour}
                className="absolute top-4 right-4 text-[#8a819d] hover:text-[#171421] dark:hover:text-white bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 rounded-full p-1.5 transition-colors"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>

              {/* Graphic Header */}
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-[#ff6a3d] shadow-[0_8px_24px_rgba(109,77,236,0.3)]">
                <Layers className="h-7 w-7 text-white" />
              </div>

              <h3 className="text-xl font-black text-[#171421] dark:text-white tracking-tight">
                How{' '}
                <span className="bg-gradient-to-r from-primary via-[#dd4bd2] to-[#ff6a3d] bg-clip-text text-transparent">
                  Collections
                </span>{' '}
                Works
              </h3>
              <p className="text-[12px] font-semibold text-[#5c5470] dark:text-[#8a819d] mt-1.5 max-w-xs mx-auto">
                Organize, save and share prompt boards like a pro.
              </p>

              {/* Steps List */}
              <div className="flex flex-col gap-4 mt-6 text-left">
                {/* Step 1 */}
                <div className="flex gap-3.5 items-start">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 text-primary shadow-sm">
                    <FolderPlus className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h4 className="text-[13px] font-bold text-[#171421] dark:text-white">Create Custom Boards</h4>
                    <p className="text-[11px] font-semibold text-[#6f6684] dark:text-[#8d86a0] mt-0.5 leading-normal">
                      Group prompts by themes like <em>Cinematic</em>, <em>Anime</em>, or <em>Portraits</em> to access them instantly.
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex gap-3.5 items-start">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 shadow-sm">
                    <Heart className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h4 className="text-[13px] font-bold text-[#171421] dark:text-white">One-Tap Quick Save</h4>
                    <p className="text-[11px] font-semibold text-[#6f6684] dark:text-[#8d86a0] mt-0.5 leading-normal">
                      Tap the board folder icon on any prompt card to add it to one or more collections.
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex gap-3.5 items-start">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-500 shadow-sm">
                    <Share2 className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h4 className="text-[13px] font-bold text-[#171421] dark:text-white">Public Sharing Links</h4>
                    <p className="text-[11px] font-semibold text-[#6f6684] dark:text-[#8d86a0] mt-0.5 leading-normal">
                      Share your boards with friends in one click. Other users can view and save your collections!
                    </p>
                  </div>
                </div>
              </div>

              {/* CTA Button */}
              <button
                onClick={() => {
                  handleCompleteTour();
                  navigate('/collections');
                }}
                className="w-full mt-6 bg-gradient-to-r from-primary to-[#ff6a3d] hover:brightness-110 text-white font-bold py-3.5 px-6 rounded-full shadow-[0_12px_28px_rgba(109,77,236,0.35)] hover:scale-102 active:scale-98 transition-all flex items-center justify-center gap-1.5"
              >
                Start Curating Now! 🚀
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
