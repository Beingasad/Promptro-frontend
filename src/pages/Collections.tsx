import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { 
  Folder, 
  Plus, 
  Trash2, 
  Edit3, 
  ArrowLeft, 
  ArrowUpRight,
  Check,
  Loader2,
  GalleryVerticalEnd
} from 'lucide-react';
import MasonryGrid from '../components/MasonryGrid';
import { 
  readLocalActivity, 
  deleteCollection, 
  renameCollection, 
  createCollection,
  saveUserActivity,
  Collection 
} from '../lib/activity';
import { auth } from '../lib/firebase';
import SEOMeta from '../components/common/SEOMeta';

export default function Collections() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(null);
  
  const [createOpen, setCreateOpen] = useState(false);
  const [newColName, setNewColName] = useState('');
  const [renameOpen, setRenameOpen] = useState<string | null>(null);
  const [renameColName, setRenameColName] = useState('');
  const [saving, setSaving] = useState(false);

  const loadCollections = () => {
    setCollections(readLocalActivity().collections || []);
  };

  useEffect(() => {
    loadCollections();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColName.trim()) return;
    setSaving(true);
    try {
      createCollection(newColName.trim());
      loadCollections();
      setNewColName('');
      setCreateOpen(false);
      await saveUserActivity(auth.currentUser);
    } catch (err) {
      console.error("Failed to create collection:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleRename = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!renameColName.trim() || !renameOpen) return;
    setSaving(true);
    try {
      renameCollection(renameOpen, renameColName.trim());
      loadCollections();
      setRenameColName('');
      setRenameOpen(null);
      await saveUserActivity(auth.currentUser);
    } catch (err) {
      console.error("Failed to rename collection:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, e?: React.MouseEvent) => {
    if (e) { e.stopPropagation(); e.preventDefault(); }
    if (!confirm("Delete this collection? Prompts inside won't be deleted from saved.")) return;
    try {
      deleteCollection(id);
      loadCollections();
      if (selectedCollectionId === id) setSelectedCollectionId(null);
      await saveUserActivity(auth.currentUser);
    } catch (err) {
      console.error("Failed to delete collection:", err);
    }
  };

  const activeCollection = collections.find(c => c.id === selectedCollectionId);

  // ── DETAIL VIEW ──
  if (selectedCollectionId && activeCollection) {
    return (
      <div className="w-full flex flex-col gap-1">
        <SEOMeta
          title={`${activeCollection.name} | Promptro`}
          description={`Browse prompts in your ${activeCollection.name} collection.`}
          robots="noindex, nofollow"
        />
        <section className="mb-6 md:mb-8 flex items-end justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelectedCollectionId(null)}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/60 dark:border-white/10 bg-white/70 dark:bg-white/5 text-[#171421] dark:text-white shadow-sm hover:scale-105 transition-transform"
              aria-label="Back"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div>
              <span className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-primary dark:text-[#a78bfa] mb-0.5">
                <GalleryVerticalEnd className="h-3.5 w-3.5" />
                COLLECTION
              </span>
              <h1 className="text-2xl font-black tracking-tight text-text-primary md:text-3xl">
                {activeCollection.name}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setRenameOpen(activeCollection.id); setRenameColName(activeCollection.name); }}
              className="h-9 px-3.5 rounded-full border border-[#e9e2f3] dark:border-white/10 bg-white/70 dark:bg-white/5 text-[10px] font-bold text-primary hover:bg-white dark:hover:bg-white/10 transition-all flex items-center gap-1.5"
            >
              <Edit3 className="w-3 h-3" /> Rename
            </button>
            <button
              onClick={() => handleDelete(activeCollection.id)}
              className="h-9 px-3.5 rounded-full border border-rose-500/10 bg-rose-500/8 text-[10px] font-bold text-rose-500 hover:bg-rose-500/15 transition-all flex items-center gap-1.5"
            >
              <Trash2 className="w-3 h-3" /> Delete
            </button>
          </div>
        </section>

        {activeCollection.prompts.length > 0 ? (
          <MasonryGrid prompts={activeCollection.prompts} isTwoColumns={true} />
        ) : (
          <div className="min-h-[48vh] rounded-[1.8rem] border border-white/70 bg-white/58 px-6 py-12 text-center shadow-[0_18px_46px_rgba(72,56,118,0.12)] backdrop-blur-2xl dark:border-white/10 dark:bg-[#14111f]/62">
            <p className="text-lg font-bold text-[#171421] dark:text-white">No prompts yet</p>
            <p className="mt-2 text-sm font-medium leading-6 text-[#6f6684] dark:text-[#afa6c8]">Tap the folder icon on any prompt to add it here.</p>
          </div>
        )}

        {/* Rename Modal */}
        <AnimatePresence>
          {renameOpen && (
            <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
              <motion.button type="button" className="fixed inset-0 bg-[#0d0b14]/50 dark:bg-black/60 backdrop-blur-md w-full h-full border-none outline-none" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setRenameOpen(null)} />
              <motion.div initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.94 }} className="relative w-full max-w-[20rem] rounded-[2rem] border border-white/80 bg-white/80 p-5 shadow-2xl backdrop-blur-3xl dark:border-white/10 dark:bg-[#14111f]/90 dark:text-white">
                <h3 className="text-sm font-black uppercase tracking-wider text-[#171421] dark:text-white mb-3">Rename Board</h3>
                <form onSubmit={handleRename} className="flex flex-col gap-3">
                  <input type="text" required value={renameColName} onChange={(e) => setRenameColName(e.target.value)} placeholder="Collection Name" maxLength={30} className="w-full h-10 px-3.5 rounded-full border border-[#cfc7dd] dark:border-white/10 bg-white/50 dark:bg-white/5 text-xs font-semibold focus:outline-none focus:border-primary placeholder-[#8a819d] text-[#171421] dark:text-white" />
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setRenameOpen(null)} className="flex-1 h-9 rounded-full border border-[#cfc7dd] dark:border-white/10 text-xs font-bold text-[#242033] dark:text-white">Cancel</button>
                    <button type="submit" disabled={saving || !renameColName.trim()} className="flex-1 h-9 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-primary/25 disabled:opacity-50">{saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />} Save</button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // ── LIST VIEW ──
  return (
    <div className="min-h-screen pb-32 sm:pb-20 px-4 sm:px-6">
      <SEOMeta
        title="Prompt Collections | Promptro"
        description="Organize and curate your favorite AI image prompts in boards."
        robots="noindex, nofollow"
      />
      <div className="max-w-7xl mx-auto">
        {/* Header — matching Categories style */}
        <header className="mb-2 sm:mb-4 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl sm:text-6xl font-black tracking-tight mb-2 sm:mb-4 whitespace-nowrap"
          >
            Your <span className="text-primary">Collections</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-[#756d8d] dark:text-[#afa6c8] text-base sm:text-xl font-medium max-w-xs sm:max-w-none mx-auto"
          >
            Curate and organize your favorite prompts into boards.
          </motion.p>

          {/* Create Board Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mt-5"
          >
            <button
              onClick={() => setCreateOpen(true)}
              className="inline-flex items-center gap-2 h-11 rounded-full bg-gradient-to-r from-primary to-[#ff6a3d] text-white px-6 text-sm font-bold shadow-[0_12px_28px_rgba(109,77,236,0.26)] hover:scale-105 active:scale-95 transition-transform"
            >
              <Plus className="w-4 h-4" />
              Create Board
            </button>
          </motion.div>
        </header>

        {collections.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 px-0 mt-2">
            {collections.map((col, i) => {
              const coverImage = col.prompts[0]?.image_url;

              return (
                <motion.div
                  key={col.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <div
                    onClick={() => setSelectedCollectionId(col.id)}
                    className="group relative block aspect-[4/5] overflow-hidden rounded-[1.5rem] sm:rounded-[2.5rem] bg-[#f8f7fc] dark:bg-white/5 cursor-pointer"
                  >
                    {/* Cover Image or Empty State */}
                    {coverImage ? (
                      <img
                        src={coverImage}
                        alt={col.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/8 via-transparent to-[#ff6a3d]/8">
                        <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                          <Folder className="w-8 h-8" />
                        </div>
                      </div>
                    )}

                    {/* Gradient Overlay with Info */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-4 sm:p-8">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg sm:text-2xl font-bold text-white mb-0.5 sm:mb-1 line-clamp-1">{col.name}</h3>
                          <p className="text-white/60 text-[10px] sm:text-sm font-medium">
                            {col.prompts.length} {col.prompts.length === 1 ? 'Prompt' : 'Prompts'}
                          </p>
                        </div>
                        <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white opacity-0 group-hover:opacity-100 -translate-y-4 group-hover:translate-y-0 transition-all shrink-0">
                          <ArrowUpRight className="w-4 h-4 sm:w-6 sm:h-6" />
                        </div>
                      </div>
                    </div>

                    {/* Delete Button (top-right, on hover) */}
                    <button
                      onClick={(e) => handleDelete(col.id, e)}
                      className="absolute top-3 right-3 w-8 h-8 rounded-xl bg-black/30 backdrop-blur-xl flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-500/80"
                      aria-label="Delete collection"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="min-h-[40vh] rounded-[1.8rem] border border-white/70 bg-white/58 px-6 py-12 text-center shadow-[0_18px_46px_rgba(72,56,118,0.12)] backdrop-blur-2xl dark:border-white/10 dark:bg-[#14111f]/62 flex flex-col justify-center items-center mt-4"
          >
            <Folder className="w-14 h-14 text-primary opacity-40 mb-3" />
            <p className="text-lg font-bold text-[#171421] dark:text-white">No collections yet</p>
            <p className="mt-2 text-sm font-medium leading-6 text-[#6f6684] dark:text-[#afa6c8] max-w-sm">
              Create a board to organize prompts by style, project, or mood.
            </p>
          </motion.div>
        )}
      </div>

      {/* Create Board Modal */}
      <AnimatePresence>
        {createOpen && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
            <motion.button type="button" className="fixed inset-0 bg-[#0d0b14]/50 dark:bg-black/60 backdrop-blur-md w-full h-full border-none outline-none" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setCreateOpen(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.94 }} className="relative w-full max-w-[20rem] rounded-[2rem] border border-white/80 bg-white/80 p-5 shadow-2xl backdrop-blur-3xl dark:border-white/10 dark:bg-[#14111f]/90 dark:text-white">
              <h3 className="text-sm font-black uppercase tracking-wider text-[#171421] dark:text-white mb-3">Create Board</h3>
              <form onSubmit={handleCreate} className="flex flex-col gap-3">
                <input type="text" required value={newColName} onChange={(e) => setNewColName(e.target.value)} placeholder="e.g. Cinematic Landscapes" maxLength={30} className="w-full h-10 px-3.5 rounded-full border border-[#cfc7dd] dark:border-white/10 bg-white/50 dark:bg-white/5 text-xs font-semibold focus:outline-none focus:border-primary placeholder-[#8a819d] text-[#171421] dark:text-white" />
                <div className="flex gap-2">
                  <button type="button" onClick={() => setCreateOpen(false)} className="flex-1 h-9 rounded-full border border-[#cfc7dd] dark:border-white/10 text-xs font-bold text-[#242033] dark:text-white">Cancel</button>
                  <button type="submit" disabled={saving || !newColName.trim()} className="flex-1 h-9 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-primary/25 disabled:opacity-50">{saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />} Confirm</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Rename Modal */}
      <AnimatePresence>
        {renameOpen && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
            <motion.button type="button" className="fixed inset-0 bg-[#0d0b14]/50 dark:bg-black/60 backdrop-blur-md w-full h-full border-none outline-none" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setRenameOpen(null)} />
            <motion.div initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.94 }} className="relative w-full max-w-[20rem] rounded-[2rem] border border-white/80 bg-white/80 p-5 shadow-2xl backdrop-blur-3xl dark:border-white/10 dark:bg-[#14111f]/90 dark:text-white">
              <h3 className="text-sm font-black uppercase tracking-wider text-[#171421] dark:text-white mb-3">Rename Board</h3>
              <form onSubmit={handleRename} className="flex flex-col gap-3">
                <input type="text" required value={renameColName} onChange={(e) => setRenameColName(e.target.value)} placeholder="Collection Name" maxLength={30} className="w-full h-10 px-3.5 rounded-full border border-[#cfc7dd] dark:border-white/10 bg-white/50 dark:bg-white/5 text-xs font-semibold focus:outline-none focus:border-primary placeholder-[#8a819d] text-[#171421] dark:text-white" />
                <div className="flex gap-2">
                  <button type="button" onClick={() => setRenameOpen(null)} className="flex-1 h-9 rounded-full border border-[#cfc7dd] dark:border-white/10 text-xs font-bold text-[#242033] dark:text-white">Cancel</button>
                  <button type="submit" disabled={saving || !renameColName.trim()} className="flex-1 h-9 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-primary/25 disabled:opacity-50">{saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />} Save</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
