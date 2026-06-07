import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FolderPlus, Folder, Check, Plus, Loader2 } from 'lucide-react';
import { 
  readLocalActivity, 
  createCollection, 
  addPromptToCollection, 
  removePromptFromCollection,
  saveUserActivity,
  Collection
} from '../lib/activity';
import { auth } from '../lib/firebase';
import type { Prompt } from './ImageCard';

interface CollectionSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  prompt: Prompt;
}

export default function CollectionSelectModal({ isOpen, onClose, prompt }: CollectionSelectModalProps) {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCollections(readLocalActivity().collections || []);
    }
  }, [isOpen]);

  const handleToggleCollection = async (collectionId: string) => {
    const isSaved = collections.find(c => c.id === collectionId)?.prompts.some(p => p.id === prompt.id);
    
    if (isSaved) {
      removePromptFromCollection(collectionId, prompt.id);
    } else {
      addPromptToCollection(collectionId, prompt);
    }

    // Refresh state
    const updated = readLocalActivity().collections || [];
    setCollections(updated);

    // Sync to backend
    try {
      await saveUserActivity(auth.currentUser);
    } catch (err) {
      console.error("Failed to sync collections change:", err);
    }
  };

  const handleCreateCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCollectionName.trim()) return;

    setLoading(true);
    try {
      const newCol = createCollection(newCollectionName.trim());
      addPromptToCollection(newCol.id, prompt);
      
      const updated = readLocalActivity().collections || [];
      setCollections(updated);
      setNewCollectionName('');

      // Sync to backend
      await saveUserActivity(auth.currentUser);
    } catch (err) {
      console.error("Failed to create and sync new collection:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-4">
          {/* Backdrop overlay */}
          <motion.button
            type="button"
            className="fixed inset-0 bg-[#0d0b14]/50 dark:bg-black/60 backdrop-blur-md cursor-default w-full h-full border-none outline-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            aria-label="Close modal backdrop"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 15 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-[22rem] overflow-hidden rounded-[2rem] border border-white/80 bg-white/70 p-6 shadow-[0_24px_60px_rgba(72,56,118,0.22)] backdrop-blur-3xl dark:border-white/10 dark:bg-[#14111f]/80 dark:text-white"
          >
            {/* Title */}
            <div className="flex items-center justify-between pb-3.5 border-b border-[#e9e2f3] dark:border-white/5 mb-4">
              <div className="flex items-center gap-2">
                <FolderPlus className="w-5 h-5 text-primary" />
                <h3 className="text-sm font-black uppercase tracking-wider text-[#171421] dark:text-white">Save to Collection</h3>
              </div>
              <button
                onClick={onClose}
                className="flex h-7 w-7 items-center justify-center rounded-full border border-[#e9e2f3] dark:border-white/10 bg-white/80 dark:bg-white/5 text-[#756d8d] dark:text-[#afa6c8]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Collections List */}
            <div className="max-h-56 overflow-y-auto pr-1 flex flex-col gap-2 hide-scrollbar mb-4">
              {collections.length > 0 ? (
                collections.map((col) => {
                  const isSaved = col.prompts.some(p => p.id === prompt.id);
                  return (
                    <button
                      key={col.id}
                      onClick={() => handleToggleCollection(col.id)}
                      className="w-full flex items-center justify-between p-3 rounded-xl border border-white/60 bg-white/40 dark:border-white/5 dark:bg-white/5 hover:bg-white/80 dark:hover:bg-white/10 transition-all text-left text-xs font-bold"
                    >
                      <div className="flex items-center gap-2.5 truncate pr-2">
                        <Folder className="w-4 h-4 text-[#8a819d] shrink-0" />
                        <span className="truncate text-[#242033] dark:text-white">{col.name}</span>
                        <span className="text-[10px] text-[#8a819d] font-semibold shrink-0">({col.prompts.length})</span>
                      </div>
                      <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all shrink-0 ${
                        isSaved 
                          ? 'bg-primary border-primary text-white' 
                          : 'border-[#cfc7dd] dark:border-white/10 text-transparent'
                      }`}>
                        <Check className="w-3.5 h-3.5" />
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="py-6 text-center">
                  <Folder className="w-8 h-8 text-[#8a819d] mx-auto opacity-40 mb-2" />
                  <p className="text-xs text-[#756d8d] dark:text-[#afa6c8] font-bold">No collections yet</p>
                  <p className="text-[10px] text-[#8a819d] mt-1 font-semibold leading-relaxed">Create one below to start organizing your boards.</p>
                </div>
              )}
            </div>

            {/* Create Collection Input Form */}
            <form onSubmit={handleCreateCollection} className="flex gap-2 border-t border-[#e9e2f3] dark:border-white/5 pt-4">
              <input
                type="text"
                value={newCollectionName}
                onChange={(e) => setNewCollectionName(e.target.value)}
                placeholder="New Collection Name..."
                maxLength={30}
                className="flex-1 h-10 px-3.5 rounded-full border border-[#cfc7dd] dark:border-white/10 bg-white/50 dark:bg-[#1a1727]/80 text-xs font-semibold focus:outline-none focus:border-primary placeholder-[#8a819d] text-[#171421] dark:text-white transition-all"
              />
              <button
                type="submit"
                disabled={loading || !newCollectionName.trim()}
                className="w-10 h-10 rounded-full bg-primary hover:bg-primary-hover disabled:opacity-50 text-white flex items-center justify-center shadow-md shadow-primary/20 transition-all hover:scale-105 active:scale-95"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4.5 h-4.5" />}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
