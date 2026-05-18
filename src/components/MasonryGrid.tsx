import ImageCard, { Prompt } from './ImageCard';

interface MasonryGridProps {
  prompts: Prompt[];
  isTwoColumns?: boolean;
}

export default function MasonryGrid({ prompts, isTwoColumns }: MasonryGridProps) {
  return (
    <div className={`w-full gap-2.5 md:gap-3.5 space-y-2.5 md:space-y-3.5 ${
      isTwoColumns 
        ? 'columns-2' 
        : 'columns-1 sm:columns-2 lg:columns-3 xl:columns-4'
    }`}>
      {prompts.map((prompt, index) => (
        <div key={prompt.id} className="break-inside-avoid" style={{ animationDelay: `${index * 55}ms` }}>
          <ImageCard prompt={prompt} />
        </div>
      ))}
    </div>
  );
}

