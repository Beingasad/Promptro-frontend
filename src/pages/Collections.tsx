import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { 
  Folder, 
  Plus, 
  Trash2, 
  Edit3, 
  ArrowLeft, 
  Calendar, 
  Layers, 
  Grid,
  Check,
  X,
  Loader2
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
  
  // Dialog/Modal States
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
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    if (!confirm("Are you sure you want to delete this collection? Prompts inside won't be deleted from your saved list.")) return;

    try {
      deleteCollection(id);
      loadCollections();
      if (selectedCollectionId === id) {
        setSelectedCollectionId(null);
      }
      await saveUserActivity(auth.currentUser);
    } catch (err) {
      console.error("Failed to delete collection:", err);
    }
  };

  const activeCollection = collections.find(c => c.id === selectedCollectionId);

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="w-full flex flex-col gap-1">
      <SEOMeta
        title={activeCollection ? `${activeCollection.name} Collection | Promptro` : "Prompt Collections | Promptro"}
        description="Organize and curate your favorite AI image prompts in boards."
        robots="noindex, nofollow"
      />

      {/* RENDER COLLECTION DETAIL VIEW */}
      {selectedCollectionId && activeCollection ? (
        <div className="flex flex-col gap-4">
          <section className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <button
                onClick={() => setSelectedCollectionId(null)}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#e9e2f3] dark:border-white/10 bg-white/70 dark:bg-white/5 text-[#171421] dark:text-white shadow-[0_4px_12px_rgba(72,56,118,0.08)] transition-all hover:scale-105 hover:bg-white dark:hover:bg-white/15"
                aria-label="Back to collections list"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <span className="flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider text-primary dark:text-[#a78bfa] mb-1">
                  <Folder className="h-3.5 w-3.5" />
                  Prompt Collection
                </span>
                <h1 className="text-2xl font-black tracking-tight text-text-primary md:text-3xl flex items-center gap-2">
                  {activeCollection.name}
                  <span className="text-sm font-bold text-[#8a819d] dark:text-[#afa6c8] shrink-0">
                    ({activeCollection.prompts.length})
                  </span>
                </h1>
              </div>
            </div>

            {/* Detail Actions */}
            <div className="flex items-center gap-2.5 ml-14 sm:ml-0">
              <button
                onClick={() => {
                  setRenameOpen(activeCollection.id);
                  setRenameColName(activeCollection.name);
                }}
                className="flex items-center gap-1.5 px-4 h-10 rounded-full border border-[#e9e2f3] dark:border-white/10 bg-white/70 dark:bg-white/5 text-xs font-bold text-primary transition-all hover:bg-white dark:hover:bg-white/10"
              >
                <Edit3 className="w-3.5 h-3.5" />
                Rename
              </button>
              <button
                onClick={() => handleDelete(activeCollection.id)}
                className="flex items-center gap-1.5 px-4 h-10 rounded-full border border-rose-500/10 bg-rose-500/10 text-xs font-bold text-rose-500 transition-all hover:bg-rose-500/18"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete
              </button>
            </div>
          </section>

          {activeCollection.prompts.length > 0 ? (
            <MasonryGrid prompts={activeCollection.prompts} isTwoColumns={true} />
          ) : (
            <div className="min-h-[45vh] rounded-[1.8rem] border border-white/70 bg-white/58 px-6 py-12 text-center shadow-[0_18px_46px_rgba(72,56,118,0.12)] backdrop-blur-2xl dark:border-white/10 dark:bg-[#14111f]/62 flex flex-col justify-center items-center">
              <Folder className="w-12 h-12 text-[#8a819d] opacity-50 mb-3" />
              <p className="text-lg font-bold text-[#171421] dark:text-white">This collection is empty</p>
              <p className="mt-2 text-sm font-medium leading-6 text-[#6f6684] dark:text-[#afa6c8] max-w-sm">
                Go to Home or Explore, click the folder icon on any prompt card, and check this folder to add prompts.
              </p>
              <a
                href="/explore"
                className="mt-5 flex h-10 items-center justify-center rounded-full bg-primary text-white text-xs font-bold px-5 hover:scale-102 transition-transform shadow-md shadow-primary/15"
              >
                Browse Prompts
              </a>
            </div>
          )}
        </div>
      ) : (
        /* RENDER COLLECTIONS LIST VIEW */
        <div className="flex flex-col gap-4">
          <section className="mb-4 flex items-center justify-between gap-4">
            <div>
              <span className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-primary dark:text-[#a78bfa] mb-1">
                <Layers className="h-3.5 w-3.5" />
                YOUR PRIVATE BOARDS
              </span>
              <h1 className="text-2xl font-black tracking-tight text-text-primary md:text-3xl">
                Collections
              </h1>
            </div>

            <button
              onClick={() => setCreateOpen(true)}
              className="flex items-center justify-center gap-1.5 h-10 rounded-full bg-primary text-white px-4 text-xs font-bold transition-all shadow-md shadow-primary/20 hover:scale-105 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              Create Board
            </button>
          </section>

          {collections.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {collections.map((col) => {
                const previewImages = col.prompts.slice(0, 4).map(p => p.image_url);

                return (
                  <div
                    key={col.id}
                    onClick={() => setSelectedCollectionId(col.id)}
                    className="relative cursor-pointer rounded-[2rem] border border-white/70 bg-white/50 p-4 shadow-[0_16px_38px_rgba(72,56,118,0.08)] backdrop-blur-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_48px_rgba(139,92,246,0.14)] dark:border-white/10 dark:bg-[#14111f]/62 group flex flex-col justify-between"
                  >
                    {/* Collection Preview Grid (2x2) */}
                    <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-[#e8e2f0]/30 dark:bg-white/5 border border-white/50 dark:border-white/5 mb-3.5 flex items-center justify-center shrink-0">
                      {previewImages.length > 0 ? (
                        <div className="grid grid-cols-2 gap-0.5 w-full h-full">
                          {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="bg-primary/5 dark:bg-white/5 w-full h-full relative overflow-hidden">
                              {previewImages[i] ? (
                                <img
                                  src={previewImages[i]}
                                  alt=""
                                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                  loading="lazy"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-[#cfc7dd] dark:text-white/10">
                                  <Grid className="w-4 h-4 opacity-50" />
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center gap-1.5 py-6">
                          <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                            <Folder className="w-6 h-6" />
                          </div>
                          <span className="text-[10px] text-[#8a819d] font-bold uppercase tracking-wider">Empty Board</span>
                        </div>
                      )}
                    </div>

                    {/* Collection Metadata */}
                    <div className="px-1 text-left flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="text-base font-black text-[#171421] dark:text-white line-clamp-1 leading-snug">
                          {col.name}
                        </h3>
                        <p className="text-xs text-[#8a819d] font-bold mt-1">
                          {col.prompts.length} {col.prompts.length === 1 ? 'prompt' : 'prompts'}
                        </p>
                      </div>

                      <div className="flex items-center gap-1 text-[10px] font-semibold text-[#8a819d] mt-3 border-t border-[#e9e2f3]/60 dark:border-white/5 pt-2.5 justify-between">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {formatDate(col.createdAt)}
                        </span>
                        
                        {/* Hover Quick Actions */}
                        <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setRenameOpen(col.id);
                              setRenameColName(col.name);
                            }}
                            className="p-1 rounded-md text-primary hover:bg-primary/10 transition-colors"
                            aria-label="Rename collection"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => handleDelete(col.id, e)}
                            className="p-1 rounded-md text-rose-500 hover:bg-rose-500/10 transition-colors"
                            aria-label="Delete collection"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="min-h-[48vh] rounded-[1.8rem] border border-white/70 bg-white/58 px-6 py-12 text-center shadow-[0_18px_46px_rgba(72,56,118,0.12)] backdrop-blur-2xl dark:border-white/10 dark:bg-[#14111f]/62 flex flex-col justify-center items-center">
              <Folder className="w-14 h-14 text-primary opacity-50 mb-3" />
              <p className="text-lg font-bold text-[#171421] dark:text-white">No collections created yet</p>
              <p className="mt-2 text-sm font-medium leading-6 text-[#6f6684] dark:text-[#afa6c8] max-w-sm">
                Create a collection to organize prompts by topics, projects, or creative styles.
              </p>
              <button
                onClick={() => setCreateOpen(true)}
                className="mt-5 flex h-10 items-center justify-center rounded-full bg-primary text-white text-xs font-bold px-5 hover:scale-102 transition-transform shadow-md shadow-primary/15"
              >
                Create First Collection
              </button>
            </div>
          )}
        </div>
      )}

      {/* CREATE DIALOG MODAL (Glassmorphic) */}
      <AnimatePresence>
        {createOpen && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
            <motion.button
              type="button"
              className="fixed inset-0 bg-[#0d0b14]/50 dark:bg-black/60 backdrop-blur-md w-full h-full border-none outline-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setCreateOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              className="relative w-full max-w-[20rem] overflow-hidden rounded-[2rem] border border-white/80 bg-white/80 p-5 shadow-2xl backdrop-blur-3xl dark:border-white/10 dark:bg-[#14111f]/90 dark:text-white"
            >
              <h3 className="text-sm font-black uppercase tracking-wider text-[#171421] dark:text-white mb-3">Create Board</h3>
              <form onSubmit={handleCreate} className="flex flex-col gap-3">
                <input
                  type="text"
                  required
                  value={newColName}
                  onChange={(e) => setNewColName(e.target.value)}
                  placeholder="Collection Name (e.g. Cinematic Landscapes)"
                  maxLength={30}
                  className="w-full h-10 px-3.5 rounded-full border border-[#cfc7dd] dark:border-white/10 bg-white/50 dark:bg-white/5 text-xs font-semibold focus:outline-none focus:border-primary placeholder-[#8a819d] text-[#171421] dark:text-white"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setCreateOpen(false)}
                    className="flex-1 h-9 rounded-full border border-[#cfc7dd] dark:border-white/10 text-xs font-bold text-[#242033] dark:text-white hover:bg-white/20"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving || !newColName.trim()}
                    className="flex-1 h-9 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-primary/25 disabled:opacity-50 hover:scale-102"
                  >
                    {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                    Confirm
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* RENAME DIALOG MODAL (Glassmorphic) */}
      <AnimatePresence>
        {renameOpen && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
            <motion.button
              type="button"
              className="fixed inset-0 bg-[#0d0b14]/50 dark:bg-black/60 backdrop-blur-md w-full h-full border-none outline-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setRenameOpen(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              className="relative w-full max-w-[20rem] overflow-hidden rounded-[2rem] border border-white/80 bg-white/80 p-5 shadow-2xl backdrop-blur-3xl dark:border-white/10 dark:bg-[#14111f]/90 dark:text-white"
            >
              <h3 className="text-sm font-black uppercase tracking-wider text-[#171421] dark:text-white mb-3">Rename Board</h3>
              <form onSubmit={handleRename} className="flex flex-col gap-3">
                <input
                  type="text"
                  required
                  value={renameColName}
                  onChange={(e) => setRenameColName(e.target.value)}
                  placeholder="Collection Name"
                  maxLength={30}
                  className="w-full h-10 px-3.5 rounded-full border border-[#cfc7dd] dark:border-white/10 bg-white/50 dark:bg-white/5 text-xs font-semibold focus:outline-none focus:border-primary placeholder-[#8a819d] text-[#171421] dark:text-white"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setRenameOpen(null)}
                    className="flex-1 h-9 rounded-full border border-[#cfc7dd] dark:border-white/10 text-xs font-bold text-[#242033] dark:text-white hover:bg-white/20"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving || !renameColName.trim()}
                    className="flex-1 h-9 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-primary/25 disabled:opacity-50 hover:scale-102"
                  >
                    {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                    Save
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
