import { useEffect, useState } from 'react';
import { Bookmark } from 'lucide-react';
import MasonryGrid from '../components/MasonryGrid';
import { Prompt } from '../components/ImageCard';
import { onActivityUpdated, readLocalActivity } from '../lib/activity';

export default function Saved() {
  const [savedPrompts, setSavedPrompts] = useState<Prompt[]>([]);

  useEffect(() => {
    const updateSavedPrompts = () => setSavedPrompts(readLocalActivity().savedPrompts);
    updateSavedPrompts();

    return onActivityUpdated(updateSavedPrompts);
  }, []);

  return (
    <div className="w-full flex flex-col gap-1">
      <section className="mb-2 flex items-end justify-between gap-4">
        <div>
          <span className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-primary dark:text-[#a78bfa] mb-1">
            <Bookmark className="h-3.5 w-3.5" />
            YOUR PRIVATE BOARD
          </span>
          <h1 className="text-2xl font-black tracking-tight text-text-primary md:text-3xl">
            Saved Prompts
          </h1>
        </div>
      </section>

      {savedPrompts.length ? (
        <MasonryGrid prompts={savedPrompts} isTwoColumns={true} />
      ) : (
        <div className="min-h-[48vh] rounded-[1.8rem] border border-white/70 bg-white/58 px-6 py-12 text-center shadow-[0_18px_46px_rgba(72,56,118,0.12)] backdrop-blur-2xl">
          <p className="text-lg font-bold text-[#171421]">No saved prompts yet</p>
          <p className="mt-2 text-sm font-medium leading-6 text-[#6f6684]">Tap the bookmark on any image card to save it here.</p>
        </div>
      )}
    </div>
  );
}
