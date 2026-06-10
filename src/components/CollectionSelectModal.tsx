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
  const [showNewInput, setShowNewInput] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCollections(readLocalActivity().collections || []);
      setShowNewInput(false);
      setNewCollectionName('');
    }
  }, [isOpen]);

  const handleToggleCollection = async (collectionId: string) => {
    const col = collections.find(c => c.id === collectionId);
    if (!col) return;
    const isSaved = col.prompts.some(p => p.id === prompt.id);
    
    if (isSaved) {
      removePromptFromCollection(collectionId, prompt.id);
      alert(`Removed from "${col.name}" successfully`);
    } else {
      addPromptToCollection(collectionId, prompt);
      alert(`Added to "${col.name}" successfully`);
    }

    const updated = readLocalActivity().collections || [];
    setCollections(updated);

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
      setShowNewInput(false);

      await saveUserActivity(auth.currentUser);
      alert(`Created and saved to "${newCol.name}" successfully`);
    } catch (err) {
      console.error("Failed to create and sync new collection:", err);
    } finally {
      setLoading(false);
    }
  };

  const savedCount = collections.filter(c => c.prompts.some(p => p.id === prompt.id)).length;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.button
            type="button"
            className="fixed inset-0 backdrop-blur-md cursor-default w-full h-full border-none outline-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            aria-label="Close modal"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 15 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-[22rem] overflow-hidden rounded-[2rem] pill-glass"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-5 pb-3.5 border-b border-[#e9e2f3] dark:border-white/5">
              <div className="flex items-center gap-2">
                <FolderPlus className="w-5 h-5 text-primary" />
                <h3 className="text-sm font-black uppercase tracking-wider text-[#171421] dark:text-white">Add to Board</h3>
              </div>
              <button
                onClick={onClose}
                className="flex h-7 w-7 items-center justify-center rounded-full border border-[#e9e2f3] dark:border-white/10 bg-white/80 dark:bg-white/5 text-[#756d8d] dark:text-[#afa6c8] hover:scale-105 transition-transform"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Collections List */}
            <div className="px-5 py-4 max-h-60 overflow-y-auto hide-scrollbar flex flex-col gap-2">
              {collections.length > 0 ? (
                collections.map((col) => {
                  const isSaved = col.prompts.some(p => p.id === prompt.id);
                  return (
                    <button
                      key={col.id}
                      onClick={() => handleToggleCollection(col.id)}
                      className={`w-full flex items-center justify-between p-3 rounded-2xl border transition-all text-left text-xs font-bold ${
                        isSaved 
                          ? 'border-primary/30 bg-primary/8 dark:bg-primary/15' 
                          : 'border-white/60 bg-white/40 dark:border-white/5 dark:bg-white/5 hover:bg-white/80 dark:hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate pr-2">
                        <Folder className={`w-4 h-4 shrink-0 ${isSaved ? 'text-primary' : 'text-[#8a819d]'}`} />
                        <span className="truncate text-[#242033] dark:text-white">{col.name}</span>
                        <span className="text-[10px] text-[#8a819d] font-semibold shrink-0">({col.prompts.length})</span>
                      </div>
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center border-2 transition-all shrink-0 ${
                        isSaved 
                          ? 'bg-primary border-primary text-white scale-105' 
                          : 'border-[#cfc7dd] dark:border-white/15 text-transparent'
                      }`}>
                        <Check className="w-3.5 h-3.5" strokeWidth={3} />
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="py-6 text-center">
                  <Folder className="w-8 h-8 text-[#8a819d] mx-auto opacity-40 mb-2" />
                  <p className="text-xs text-[#756d8d] dark:text-[#afa6c8] font-bold">No boards yet</p>
                  <p className="text-[10px] text-[#8a819d] mt-1 font-semibold leading-relaxed">Create one below to organize your prompts.</p>
                </div>
              )}
            </div>

            {/* Create New Collection */}
            <div className="px-5 pb-4 border-t border-[#e9e2f3] dark:border-white/5 pt-3">
              {showNewInput ? (
                <form onSubmit={handleCreateCollection} className="flex gap-2">
                  <input
                    type="text"
                    autoFocus
                    value={newCollectionName}
                    onChange={(e) => setNewCollectionName(e.target.value)}
                    placeholder="Board name..."
                    maxLength={30}
                    className="flex-1 h-10 px-3.5 rounded-full border border-[#cfc7dd] dark:border-white/10 bg-white/50 dark:bg-[#1a1727]/80 text-xs font-semibold focus:outline-none focus:border-primary placeholder-[#8a819d] text-[#171421] dark:text-white"
                  />
                  <button
                    type="submit"
                    disabled={loading || !newCollectionName.trim()}
                    className="w-10 h-10 rounded-full bg-primary hover:bg-primary-hover disabled:opacity-50 text-white flex items-center justify-center shadow-md shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" strokeWidth={2.5} />}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowNewInput(false); setNewCollectionName(''); }}
                    className="w-10 h-10 rounded-full border border-[#cfc7dd] dark:border-white/10 text-[#756d8d] flex items-center justify-center hover:scale-105 transition-all"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                <button
                  onClick={() => setShowNewInput(true)}
                  className="w-full h-10 flex items-center justify-center gap-2 rounded-full border border-dashed border-[#cfc7dd] dark:border-white/10 text-xs font-bold text-primary hover:bg-primary/5 dark:hover:bg-primary/10 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  New Board
                </button>
              )}
            </div>

            {/* Done Button */}
            <div className="px-5 pb-5">
              <button
                onClick={onClose}
                className="w-full h-11 rounded-full bg-gradient-to-r from-primary to-[#ff6a3d] text-white text-sm font-bold shadow-[0_10px_24px_rgba(109,77,236,0.26)] hover:scale-[1.02] active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" strokeWidth={2.5} />
                Done{savedCount > 0 ? ` · Saved to ${savedCount} board${savedCount > 1 ? 's' : ''}` : ''}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
