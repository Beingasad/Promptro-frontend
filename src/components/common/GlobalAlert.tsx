import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

interface AlertState {
  isOpen: boolean;
  message: string;
  type: 'success' | 'warning' | 'error' | 'info';
}

export default function GlobalAlert() {
  const [alert, setAlert] = useState<AlertState>({
    isOpen: false,
    message: '',
    type: 'info',
  });

  useEffect(() => {
    const handleGlobalAlert = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      const message = detail?.message || '';
      
      // Determine type based on keywords
      const lowerMsg = message.toLowerCase();
      let type: 'success' | 'warning' | 'error' | 'info' = 'info';
      
      if (
        lowerMsg.includes('copied') || 
        lowerMsg.includes('success') || 
        lowerMsg.includes('successfully') || 
        lowerMsg.includes('saved')
      ) {
        type = 'success';
      } else if (
        lowerMsg.includes('fail') || 
        lowerMsg.includes('failed') || 
        lowerMsg.includes('error') || 
        lowerMsg.includes('blocked') || 
        lowerMsg.includes('could not') ||
        lowerMsg.includes('unable') ||
        lowerMsg.includes('invalid')
      ) {
        type = 'error';
      } else if (
        lowerMsg.includes('maximum') || 
        lowerMsg.includes('limit') || 
        lowerMsg.includes('unselect') || 
        lowerMsg.includes('please') || 
        lowerMsg.includes('select between')
      ) {
        type = 'warning';
      }

      setAlert({
        isOpen: true,
        message,
        type,
      });
    };

    window.addEventListener('promptro-global-alert', handleGlobalAlert);
    return () => {
      window.removeEventListener('promptro-global-alert', handleGlobalAlert);
    };
  }, []);

  // Auto close success toasts after 2 seconds
  useEffect(() => {
    if (alert.isOpen && alert.type === 'success') {
      const timer = setTimeout(() => {
        closeAlert();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [alert.isOpen, alert.type]);

  const closeAlert = () => {
    setAlert((prev) => ({ ...prev, isOpen: false }));
  };

  const getTypeStyles = () => {
    switch (alert.type) {
      case 'success':
        return {
          bg: 'bg-emerald-500/10 dark:bg-emerald-500/15',
          border: 'border-emerald-500/24 dark:border-emerald-500/30',
          text: 'text-emerald-600 dark:text-emerald-400',
          icon: <CheckCircle2 className="h-5 w-5 text-emerald-500" />,
          title: 'Success',
        };
      case 'error':
        return {
          bg: 'bg-rose-500/10 dark:bg-rose-500/15',
          border: 'border-rose-500/24 dark:border-rose-500/30',
          text: 'text-rose-600 dark:text-rose-400',
          icon: <AlertCircle className="h-5 w-5 text-rose-500" />,
          title: 'Failed',
        };
      case 'warning':
        return {
          bg: 'bg-amber-500/10 dark:bg-amber-500/15',
          border: 'border-amber-500/24 dark:border-amber-500/30',
          text: 'text-amber-600 dark:text-amber-400',
          icon: <AlertTriangle className="h-5 w-5 text-amber-500" />,
          title: 'Alert',
        };
      default:
        return {
          bg: 'bg-primary/10 dark:bg-primary/15',
          border: 'border-primary/24 dark:border-primary/30',
          text: 'text-primary dark:text-[#a78bfa]',
          icon: <Info className="h-5 w-5 text-primary dark:text-[#a78bfa]" />,
          title: 'Notice',
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <AnimatePresence>
      {alert.isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-hidden">
          {/* Backdrop Blur overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeAlert}
            className="absolute inset-0 bg-black/15 dark:bg-black/40 backdrop-blur-[3px]"
          />

          {/* Premium Glass Modal Card */}
          <motion.div
            initial={{ scale: 0.94, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.96, opacity: 0, y: 10 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
            className="relative w-full max-w-sm rounded-[1.75rem] p-5 md:p-6 modal-glass"
          >
            {/* Top Close Button (for non-success alerts or manual dismissal) */}
            {alert.type !== 'success' && (
              <button
                onClick={closeAlert}
                className="absolute top-4 right-4 p-1 rounded-full text-[#8d86a0]/70 hover:text-primary hover:bg-[#8d86a0]/10 dark:text-[#afa6c8] dark:hover:text-primary dark:hover:bg-white/5 transition-all"
              >
                <X className="h-4 w-4" />
              </button>
            )}

            {/* Alert Content Row */}
            <div className="flex items-start gap-4">
              <div className={`p-2.5 rounded-2xl ${styles.bg} border ${styles.border} shrink-0`}>
                {styles.icon}
              </div>
              <div className="min-w-0 flex-grow pt-0.5">
                <h3 className="text-sm font-bold text-[#171421] dark:text-white leading-none mb-1.5">
                  {styles.title}
                </h3>
                <p className="text-xs font-semibold text-[#6f6684] dark:text-[#afa6c8] leading-relaxed break-words">
                  {alert.message}
                </p>
              </div>
            </div>

            {/* Bottom Actions Row (For alerts that require clicking OK, success toasts close automatically) */}
            {alert.type !== 'success' && (
              <div className="mt-5 flex justify-end">
                <button
                  onClick={closeAlert}
                  className="px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-[#7437ff] to-[#dd4bd2] rounded-full hover:opacity-95 transition-all shadow-[0_8px_20px_rgba(116,55,255,0.25)] select-none hover:scale-[1.02] active:scale-[0.98]"
                >
                  OK
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
