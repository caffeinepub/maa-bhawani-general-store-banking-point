import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

interface CategoryFilterProps {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

export default function CategoryFilter({
  categories,
  selectedCategory,
  onSelectCategory,
}: CategoryFilterProps) {
  return (
    <ScrollArea className="w-full whitespace-nowrap">
      <div className="flex gap-3 pb-2">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => onSelectCategory(category)}
            className={`flex-shrink-0 min-h-[40px] px-4 rounded-lg text-sm font-semibold transition-all border ${
              selectedCategory === category
                ? 'bg-[#0056b3] text-white border-[#0056b3] shadow-sm'
                : 'bg-white text-gray-700 border-gray-300 hover:border-[#0056b3] hover:text-[#0056b3]'
            }`}
          >
            {category}
          </button>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
