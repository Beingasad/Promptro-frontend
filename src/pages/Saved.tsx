import { useEffect, useState } from 'react';
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
    <div className="w-full flex flex-col gap-6 pt-4">
      <div>
        <p className="text-[15px] font-medium leading-6 text-[#6f6684]">Your private board</p>
        <h1 className="mt-2 text-[40px] font-bold leading-[0.96] text-[#171421] md:text-5xl">Saved Prompts</h1>
      </div>

      {savedPrompts.length ? (
        <MasonryGrid prompts={savedPrompts} />
      ) : (
        <div className="min-h-[48vh] rounded-[1.8rem] border border-white/70 bg-white/58 px-6 py-12 text-center shadow-[0_18px_46px_rgba(72,56,118,0.12)] backdrop-blur-2xl">
          <p className="text-lg font-bold text-[#171421]">No saved prompts yet</p>
          <p className="mt-2 text-sm font-medium leading-6 text-[#6f6684]">Tap the bookmark on any image card to save it here.</p>
        </div>
      )}
    </div>
  );
}
