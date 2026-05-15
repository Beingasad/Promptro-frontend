import { useState } from 'react';
import { Search } from 'lucide-react';
import { useSearch } from '../context/SearchContext';

export default function SearchPill() {
  const [isFocused, setIsFocused] = useState(false);
  const { searchQuery, setSearchQuery } = useSearch();

  return (
    <div className="w-full">
      <div className={`relative flex items-center transition-all duration-300 ${isFocused ? 'scale-[1.01]' : 'scale-100'}`}>
        <div className={`absolute inset-0 rounded-full bg-gradient-to-r from-primary/24 via-fuchsia-300/22 to-secondary/22 blur-2xl transition-opacity duration-300 ${isFocused ? 'opacity-100' : 'opacity-45'}`} />
        <div className="relative flex h-12 w-full items-center overflow-hidden rounded-full border border-white/80 bg-white/78 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_16px_38px_rgba(80,67,120,0.14)] backdrop-blur-2xl dark:border-white/12 dark:bg-[#171421]/78 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_16px_38px_rgba(0,0,0,0.28)] md:h-14">
          <div className="pl-4 pr-2.5 text-[#81789e] md:pl-5">
            <Search className="h-5 w-5" />
          </div>
          <input
            type="text"
            placeholder="Search prompts, styles, themes..."
            className="h-full w-full border-none bg-transparent pr-4 text-sm font-medium tracking-normal text-[#171421] placeholder-[#8c84a6] outline-none dark:text-[#f7f2ff] dark:placeholder-[#8f85a8] md:text-base"
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
