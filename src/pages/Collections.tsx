import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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
  GalleryVerticalEnd,
  Share2
} from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import MasonryGrid from '../components/MasonryGrid';
import { 
  readLocalActivity, 
  deleteCollection, 
  renameCollection, 
  createCollection,
  saveUserActivity,
  onActivityUpdated,
  Collection 
} from '../lib/activity';
import { auth } from '../lib/firebase';
import SEOMeta from '../components/common/SEOMeta';

export default function Collections() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const selectedCollectionId = queryParams.get('id');
  const setSelectedCollectionId = (id: string | null) => {
    if (id) {
      navigate(`?id=${id}`);
    } else {
      navigate('/collections');
    }
  };
  const [collections, setCollections] = useState<Collection[]>([]);
  
  const [createOpen, setCreateOpen] = useState(false);
  const [newColName, setNewColName] = useState('');
  const [renameOpen, setRenameOpen] = useState<string | null>(null);
  const [renameColName, setRenameColName] = useState('');
  const [saving, setSaving] = useState(false);

  // Sharing states
  const [sharedCollection, setSharedCollection] = useState<Collection | null>(null);
  const [sharedLoading, setSharedLoading] = useState(false);
  const [sharedError, setSharedError] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);

  const loadCollections = () => {
    setCollections(readLocalActivity().collections || []);
  };

  useEffect(() => {
    loadCollections();
    return onActivityUpdated(loadCollections);
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [selectedCollectionId]);

  // Fetch shared collection if viewing another user's collection
  useEffect(() => {
    if (selectedCollectionId) {
      const localCol = collections.find(c => c.id === selectedCollectionId);
      if (localCol) {
        setSharedCollection(null);
        setSharedError(false);
      } else {
        setSharedLoading(true);
        setSharedError(false);
        axios.get(`${API_BASE_URL}/api/collections/${selectedCollectionId}`)
          .then(res => {
            setSharedCollection(res.data);
          })
          .catch(err => {
            console.error("Failed to fetch shared collection:", err);
            setSharedError(true);
          })
          .finally(() => {
            setSharedLoading(false);
          });
      }
    } else {
      setSharedCollection(null);
      setSharedError(false);
    }
  }, [selectedCollectionId, collections]);

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

  const activeCollection = collections.find(c => c.id === selectedCollectionId) || sharedCollection;

  const handleShareCollection = async () => {
    if (!activeCollection) return;
    const shareUrl = `${window.location.origin}/collections?id=${activeCollection.id}`;
    const shareText = `Check out my prompt collection "${activeCollection.name}" on Promptro! 🎨✨`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: activeCollection.name,
          text: shareText,
          url: shareUrl,
        });
      } catch (err) {
        console.error("Error sharing collection:", err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
        setCopiedShare(true);
        setTimeout(() => setCopiedShare(false), 2000);
      } catch (err) {
        console.error("Failed to copy link:", err);
      }
    }
  };

  const handleSaveSharedCollection = async () => {
    if (!activeCollection) return;
    try {
      if (collections.some(c => c.id === activeCollection.id)) return;
      const activity = readLocalActivity();
      const updatedCollections = [...(activity.collections || []), activeCollection];
      writeLocalActivity({ ...activity, collections: updatedCollections });
      loadCollections();
      await saveUserActivity(auth.currentUser);
      alert("Collection saved to your boards!");
    } catch (err) {
      console.error("Failed to save shared collection:", err);
    }
  };

  // ── DETAIL VIEW ──
  if (selectedCollectionId) {
    if (sharedLoading) {
      return (
        <div className="min-h-[60vh] flex flex-col justify-center items-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-xs font-bold text-[#8a819d] mt-3">Loading collection...</p>
        </div>
      );
    }

    if (sharedError || !activeCollection) {
      return (
        <div className="min-h-[50vh] flex flex-col justify-center items-center text-center px-4">
          <Folder className="w-12 h-12 text-[#ff6a3d] opacity-50 mb-3" />
          <p className="text-lg font-bold text-[#171421] dark:text-white">Collection not found</p>
          <p className="text-xs font-semibold text-[#8a819d] mt-1 max-w-xs leading-relaxed">
            This collection may have been deleted, or the shared link is invalid.
          </p>
          <button
            onClick={() => setSelectedCollectionId(null)}
            className="mt-5 h-9 px-5 rounded-full bg-primary text-white text-xs font-bold shadow-md shadow-primary/20 cursor-pointer"
          >
            Back to Collections
          </button>
        </div>
      );
    }

    const coverImage = activeCollection.prompts[0]?.image_url;
    const isSharedViewer = !collections.some(c => c.id === activeCollection.id);

    return (
      <div className="w-full flex flex-col gap-1">
        <SEOMeta
          title={`${activeCollection.name} | Promptro`}
          description={`Browse prompts in your ${activeCollection.name} collection.`}
          robots="noindex, nofollow"
        />

        {/* Collection Banner Card (similar to Category cards style but banner aspect) */}
        <div className="relative w-full h-48 sm:h-72 md:h-80 overflow-hidden rounded-[1.5rem] sm:rounded-[2.5rem] bg-[#f8f7fc] dark:bg-white/5 mb-6 sm:mb-8 shadow-lg">
          {coverImage ? (
            <img
              src={coverImage}
              alt={activeCollection.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/10 via-[#ff6a3d]/5 to-transparent flex items-center justify-center">
              <GalleryVerticalEnd className="w-14 h-14 text-primary/20 animate-pulse" />
            </div>
          )}
          
          {/* Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/20" />

          {/* Banner Content overlay */}
          <div className="absolute inset-x-0 bottom-0 p-5 sm:p-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div className="flex flex-col items-start">
              {isSharedViewer && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-[9px] font-black uppercase tracking-wider text-white mb-2 border border-white/10">
                  <GalleryVerticalEnd className="w-3 h-3 text-[#ff6a3d]" /> Public Board
                </span>
              )}
              <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight text-white line-clamp-1 mt-2">
                {activeCollection.name}
              </h1>
              <p className="text-white/60 text-xs sm:text-sm font-semibold mt-1">
                {activeCollection.prompts.length} {activeCollection.prompts.length === 1 ? 'Prompt' : 'Prompts'}
              </p>
            </div>

            {/* Controls (glass style) */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleShareCollection}
                className="h-9 px-4 rounded-full border border-white/20 bg-white/10 backdrop-blur-md text-xs font-bold text-white hover:bg-white/25 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                {copiedShare ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />} 
                {copiedShare ? 'Copied' : 'Share'}
              </button>

              {!isSharedViewer ? (
                <>
                  <button
                    onClick={() => { setRenameOpen(activeCollection.id); setRenameColName(activeCollection.name); }}
                    className="h-9 px-4 rounded-full border border-white/20 bg-white/10 backdrop-blur-md text-xs font-bold text-white hover:bg-white/25 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Rename
                  </button>
                  <button
                    onClick={() => handleDelete(activeCollection.id)}
                    className="h-9 px-4 rounded-full border border-rose-500/20 bg-rose-500/20 backdrop-blur-md text-xs font-bold text-rose-100 hover:bg-rose-500/35 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                </>
              ) : (
                <button
                  onClick={handleSaveSharedCollection}
                  className="h-9 px-4 rounded-full bg-gradient-to-r from-primary to-[#ff6a3d] text-white text-xs font-black shadow-md shadow-primary/20 hover:scale-102 transition-transform flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Save Board
                </button>
              )}
            </div>
          </div>
        </div>

        {activeCollection.prompts.length > 0 ? (
          <MasonryGrid prompts={activeCollection.prompts} isTwoColumns={true} />
        ) : (
          <div className="min-h-[35vh] rounded-[1.8rem] border border-white/70 bg-white/58 px-6 py-12 text-center shadow-[0_18px_46px_rgba(72,56,118,0.12)] backdrop-blur-2xl dark:border-white/10 dark:bg-[#14111f]/62 flex flex-col justify-center items-center">
            <p className="text-lg font-bold text-[#171421] dark:text-white">No prompts yet</p>
            <p className="mt-2 text-sm font-medium leading-6 text-[#6f6684] dark:text-[#afa6c8]">This board doesn't contain any prompts.</p>
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
        {/* Header — modern dashboard layout */}
        <header className="mb-6 md:mb-10">
          <div className="flex flex-col items-start">
            <motion.span
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-primary dark:text-[#a78bfa] mb-1"
            >
              <GalleryVerticalEnd className="h-3.5 w-3.5" />
              YOUR BOARDS
            </motion.span>
            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-[#171421] dark:text-white mb-2"
            >
              Your <span className="text-primary">Collections</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-[#756d8d] dark:text-[#afa6c8] text-sm sm:text-base font-medium max-w-lg"
            >
              Curate and organize your favorite prompts into boards.
            </motion.p>
          </div>
        </header>

        {collections.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 px-0 mt-2">
            {/* Pinterest-style Create Board Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0 }}
              onClick={() => setCreateOpen(true)}
              className="group relative flex aspect-[4/5] flex-col items-center justify-center rounded-[1.5rem] sm:rounded-[2.5rem] border-2 border-dashed border-[#cfc7dd] dark:border-white/10 bg-white/20 dark:bg-white/5 hover:bg-white/40 dark:hover:bg-white/8 hover:border-primary dark:hover:border-primary/50 transition-all duration-300 cursor-pointer shadow-sm hover:shadow-md"
            >
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-105 group-hover:bg-primary group-hover:text-white transition-all duration-300 shadow-[0_8px_20px_rgba(109,77,236,0.08)]">
                <Plus className="w-6 h-6 sm:w-8 sm:h-8" />
              </div>
              <span className="mt-3 sm:mt-4 text-xs sm:text-sm font-black text-[#5f5774] dark:text-[#c4bed6] group-hover:text-primary transition-colors uppercase tracking-wider">
                Create Board
              </span>
            </motion.div>

            {collections.map((col, i) => {
              const coverImage = col.prompts[0]?.image_url;

              return (
                <motion.div
                  key={col.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: (i + 1) * 0.05 }}
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
            transition={{ delay: 0.15 }}
            className="min-h-[45vh] rounded-[2.25rem] border border-white/70 bg-white/45 dark:border-white/5 dark:bg-[#14111f]/45 p-8 text-center shadow-[0_24px_58px_rgba(72,56,118,0.08)] backdrop-blur-2xl flex flex-col justify-center items-center max-w-xl mx-auto mt-4"
          >
            <div className="w-16 h-16 rounded-3xl bg-primary/10 text-primary flex items-center justify-center mb-4 shadow-[0_10px_25px_rgba(109,77,236,0.12)]">
              <Folder className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-black text-[#171421] dark:text-white">No collections yet</h3>
            <p className="mt-2 text-sm font-semibold text-[#6f6684] dark:text-[#afa6c8] max-w-sm leading-relaxed">
              Create a board to organize prompts by style, project, or mood. Start fresh and compile your favorites!
            </p>
            <button
              onClick={() => setCreateOpen(true)}
              className="mt-6 inline-flex items-center gap-2 h-11 rounded-full bg-gradient-to-r from-primary to-[#ff6a3d] text-white px-6 text-sm font-bold shadow-[0_12px_28px_rgba(109,77,236,0.26)] hover:scale-105 active:scale-95 transition-transform cursor-pointer"
            >
              <Plus className="w-4.5 h-4.5" />
              Create First Board
            </button>
          </motion.div>
        )}
      </div>

      {/* Create Board Modal */}
      <AnimatePresence>
        {createOpen && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
            <motion.button type="button" className="fixed inset-0 bg-[#0d0b14]/50 dark:bg-black/60 backdrop-blur-md w-full h-full border-none outline-none" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setCreateOpen(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 10 }}
              className="relative w-full max-w-[22rem] rounded-[2.5rem] border border-white/80 bg-white/80 p-6 shadow-2xl backdrop-blur-3xl dark:border-white/10 dark:bg-[#14111f]/90 dark:text-white text-center"
            >
              <div className="mx-auto w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-3">
                <Folder className="w-6 h-6" />
              </div>
              <h3 className="text-base font-black text-[#171421] dark:text-white mb-1">Create Board</h3>
              <p className="text-[11px] font-semibold text-[#756d8d] dark:text-[#afa6c8] mb-4">Give your new prompt board a unique name.</p>
              <form onSubmit={handleCreate} className="flex flex-col gap-3.5">
                <input
                  type="text"
                  required
                  value={newColName}
                  onChange={(e) => setNewColName(e.target.value)}
                  placeholder="e.g. Cinematic Landscapes"
                  maxLength={30}
                  autoFocus
                  className="w-full h-11 px-4 rounded-full border border-[#cfc7dd] dark:border-white/10 bg-white/50 dark:bg-white/5 text-xs font-semibold focus:outline-none focus:border-primary placeholder-[#8a819d] text-[#171421] dark:text-white"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setCreateOpen(false)}
                    className="flex-1 h-10 rounded-full border border-[#cfc7dd] dark:border-white/10 text-xs font-bold text-[#242033] dark:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving || !newColName.trim()}
                    className="flex-1 h-10 rounded-full bg-gradient-to-r from-primary to-[#ff6a3d] text-white text-xs font-black flex items-center justify-center gap-1.5 shadow-md shadow-primary/25 disabled:opacity-50 hover:scale-102 transition-transform cursor-pointer"
                  >
                    {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                    Create
                  </button>
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
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 10 }}
              className="relative w-full max-w-[22rem] rounded-[2.5rem] border border-white/80 bg-white/80 p-6 shadow-2xl backdrop-blur-3xl dark:border-white/10 dark:bg-[#14111f]/90 dark:text-white text-center"
            >
              <div className="mx-auto w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-3">
                <Edit3 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-black text-[#171421] dark:text-white mb-1">Rename Board</h3>
              <p className="text-[11px] font-semibold text-[#756d8d] dark:text-[#afa6c8] mb-4">Provide a new name for your prompt board.</p>
              <form onSubmit={handleRename} className="flex flex-col gap-3.5">
                <input
                  type="text"
                  required
                  value={renameColName}
                  onChange={(e) => setRenameColName(e.target.value)}
                  placeholder="Collection Name"
                  maxLength={30}
                  autoFocus
                  className="w-full h-11 px-4 rounded-full border border-[#cfc7dd] dark:border-white/10 bg-white/50 dark:bg-white/5 text-xs font-semibold focus:outline-none focus:border-primary placeholder-[#8a819d] text-[#171421] dark:text-white"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setRenameOpen(null)}
                    className="flex-1 h-10 rounded-full border border-[#cfc7dd] dark:border-white/10 text-xs font-bold text-[#242033] dark:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving || !renameColName.trim()}
                    className="flex-1 h-10 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-primary/25 disabled:opacity-50 hover:scale-102 transition-transform cursor-pointer"
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
