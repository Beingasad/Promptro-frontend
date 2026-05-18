import { useState, useEffect } from 'react';

export function useIsMobileDevice() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      if (typeof window === 'undefined') return;

      const ua = navigator.userAgent || '';
      const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
      
      const screenWidth = window.screen?.width || 0;
      const screenHeight = window.screen?.height || 0;
      const hasTouch = navigator.maxTouchPoints > 0;
      
      // Mobile UA or touch-enabled device with narrow dimension less than 768px
      const isPhysicallyMobile = isMobileUA || (hasTouch && Math.min(screenWidth, screenHeight) < 768);
      
      setIsMobile(isPhysicallyMobile);
    };

    checkMobile();
    // Watch for window resizing (such as orientation change)
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
}
