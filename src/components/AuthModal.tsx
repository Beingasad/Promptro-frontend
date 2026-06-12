import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const navigate = useNavigate();

  // Prevent page scroll when the modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleAction = () => {
    onClose();
    navigate('/auth');
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/5 backdrop-blur-[3px] z-[80]"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[92%] md:w-full rounded-[2rem] md:rounded-[2.5rem] z-[90] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] max-h-[92vh] max-w-md transition-all duration-300 modal-glass"
          >
            <div className="p-5 md:p-8 flex flex-col gap-5 md:gap-6">
              {/* Header */}
              <div className="min-w-0">
                <h2 className="text-[15px] sm:text-lg md:text-xl font-bold text-[#171421] dark:text-white whitespace-nowrap overflow-hidden text-ellipsis">
                  Authentication Required
                </h2>
                <p className="text-[11px] md:text-xs text-[#756d8d] dark:text-[#afa6c8] mt-1 leading-relaxed">
                  To use this feature, you need to signup or login
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-4 pt-1">
                <button
                  onClick={onClose}
                  className="flex-1 h-11 rounded-full border border-[#e9e2f3] dark:border-white/10 text-xs font-bold text-[#242033] dark:text-white transition-all hover:bg-white/10 active:scale-99 cursor-pointer flex items-center justify-center"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAction}
                  className="flex-[2] h-11 rounded-full bg-gradient-to-r from-primary to-secondary text-xs font-bold text-white shadow-md shadow-primary/20 hover:scale-[1.02] active:scale-99 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  Login / Sign Up
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
