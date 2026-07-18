import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles } from 'lucide-react';

interface AITool {
  id: string;
  name: string;
  icon: string;
  color: string;
  webUrl: string;
  androidPackage?: string;
}

const AI_TOOLS: AITool[] = [
  { id: 'chatgpt', name: 'ChatGPT', icon: 'https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg', color: '#10a37f', webUrl: 'https://chatgpt.com/', androidPackage: 'com.openai.chatgpt' },
  { id: 'claude', name: 'Claude', icon: 'https://upload.wikimedia.org/wikipedia/commons/8/8c/Anthropic_logo.svg', color: '#d97757', webUrl: 'https://claude.ai/new', androidPackage: 'com.anthropic.claude' },
  { id: 'gemini', name: 'Gemini', icon: 'https://upload.wikimedia.org/wikipedia/commons/8/8a/Google_Gemini_logo.svg', color: '#1a73e8', webUrl: 'https://gemini.google.com/app', androidPackage: 'com.google.android.apps.bard' },
  { id: 'copilot', name: 'Copilot', icon: 'https://upload.wikimedia.org/wikipedia/commons/2/22/Microsoft_Copilot_logo.svg', color: '#4caf50', webUrl: 'https://copilot.microsoft.com/', androidPackage: 'com.microsoft.copilot' },
  { id: 'meta', name: 'Meta AI', icon: 'https://upload.wikimedia.org/wikipedia/commons/a/ab/Meta-Logo.png', color: '#0668E1', webUrl: 'https://www.meta.ai/' },
  { id: 'midjourney', name: 'Discord (MJ)', icon: 'https://assets-global.website-files.com/6257adef93867e50d84d30e2/636e0a6a49cf127bf92de1e2_icon_clyde_blurple_RGB.png', color: '#5865F2', webUrl: 'https://discord.com/app', androidPackage: 'com.discord' },
];

interface AIToolsSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTool: (url: string) => void;
}

export default function AIToolsSheet({ isOpen, onClose, onSelectTool }: AIToolsSheetProps) {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  const handleSelect = (tool: AITool) => {
    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
    const isAndroid = /android/i.test(userAgent);
    
    let targetUrl = tool.webUrl;
    
    // Use Android Intent to strictly open native apps (falls back to web if not installed)
    if (isAndroid && tool.androidPackage) {
      const fallbackUrl = encodeURIComponent(tool.webUrl);
      targetUrl = `intent://${tool.webUrl.replace(/^https?:\/\//, '')}/#Intent;scheme=https;package=${tool.androidPackage};S.browser_fallback_url=${fallbackUrl};end`;
    }
    
    onSelectTool(targetUrl);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[999]"
          />
          
          {/* Bottom Sheet Modal */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-[1000] bg-white dark:bg-[#110e1b] rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.3)] pb-safe md:top-1/2 md:bottom-auto md:left-1/2 md:right-auto md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-2xl md:w-[400px] border border-white/10 dark:border-white/5 overflow-hidden"
          >
            {/* Handle for mobile */}
            <div className="flex justify-center pt-3 pb-2 md:hidden">
              <div className="w-12 h-1.5 bg-black/10 dark:bg-white/10 rounded-full" />
            </div>

            <div className="px-6 pb-4 pt-2 flex items-center justify-between border-b border-black/5 dark:border-white/5">
              <div>
                <h3 className="text-lg font-black flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  Open with AI
                </h3>
                <p className="text-xs text-black/50 dark:text-white/50 mt-0.5">Prompt will be copied automatically</p>
              </div>
              <button 
                onClick={onClose}
                className="p-2 bg-black/5 dark:bg-white/5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-3 gap-y-6 gap-x-4">
                {AI_TOOLS.map((tool) => (
                  <button
                    key={tool.id}
                    onClick={() => handleSelect(tool)}
                    className="group flex flex-col items-center gap-3 outline-none"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-black/5 dark:bg-white/5 flex items-center justify-center border border-black/5 dark:border-white/10 shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:shadow-md group-active:scale-95 overflow-hidden p-2.5">
                      <img src={tool.icon} alt={tool.name} className="w-full h-full object-contain drop-shadow-sm" />
                    </div>
                    <span className="text-[11px] font-bold text-black/70 dark:text-white/70 group-hover:text-black dark:group-hover:text-white text-center leading-tight">
                      {tool.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
            
            {/* Bottom spacer for mobile home bar */}
            <div className="h-6 md:hidden" />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
