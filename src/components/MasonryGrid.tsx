import ImageCard, { Prompt } from './ImageCard';
import { useIsMobileDevice } from '../utils/device';

interface MasonryGridProps {
  prompts: Prompt[];
  isTwoColumns?: boolean;
}

export default function MasonryGrid({ prompts, isTwoColumns }: MasonryGridProps) {
  const isMobile = useIsMobileDevice();

  // If mobile device in desktop mode/landscape (innerWidth >= 768), force 2 columns
  const gridColumns = (isMobile && window.innerWidth >= 768)
    ? 'columns-2'
    : isTwoColumns 
      ? 'columns-2 md:columns-4' 
      : 'columns-1 sm:columns-2 md:columns-4';

  return (
    <div className={`w-full gap-2.5 md:gap-3.5 space-y-2.5 md:space-y-3.5 ${gridColumns}`}>
      {prompts.map((prompt, index) => (
        <div key={prompt.id} className="break-inside-avoid" style={{ animationDelay: `${index * 55}ms` }}>
          <ImageCard prompt={prompt} />
        </div>
      ))}
    </div>
  );
}

