import { Folder } from 'lucide-react';
import type { Link } from '../types';

interface CategoryFilterCardProps {
  links: Link[];
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
}

export function CategoryFilterCard({ links, selectedCategory, onSelectCategory }: CategoryFilterCardProps) {
  
  // Extract unique categories and count them
  const categoryCounts = links.reduce((acc, link) => {
    if (link.category) {
      acc[link.category] = (acc[link.category] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const categories = Object.keys(categoryCounts).sort();

  return (
    <div className="bg-white border border-slate-200 rounded shadow-sm w-72 shrink-0 flex flex-col max-h-[calc(100vh-8rem)] sticky top-6">
      <div className="p-4 border-b border-slate-100 bg-slate-50/50 rounded-t">
        <h2 className="text-sm font-display font-bold text-slate-800 tracking-tight">Categories</h2>
        <p className="text-xs text-slate-500 font-medium">Browse by topic</p>
      </div>
      <div className="p-3 overflow-y-auto flex-1">
        <div className="flex flex-col gap-1">
          <button
            onClick={() => onSelectCategory(null)}
            className={`flex items-center w-full px-3 py-2 rounded text-sm transition-colors ${
              selectedCategory === null 
                ? "bg-slate-100 text-slate-900 font-semibold" 
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            <Folder className={`w-4 h-4 mr-2 ${selectedCategory === null ? 'text-slate-600' : 'text-slate-400'}`} />
            <span className="flex-1 text-left">All Sources</span>
            <span className="ml-2 text-xs font-semibold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
              {links.length}
            </span>
          </button>

          {categories.map((category) => (
            <button
              key={category}
              onClick={() => onSelectCategory(category)}
              className={`flex items-center w-full px-3 py-2 rounded text-sm transition-colors ${
                selectedCategory === category 
                  ? "bg-slate-100 text-slate-900 font-semibold" 
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Folder className={`w-4 h-4 mr-2 ${selectedCategory === category ? 'text-slate-600' : 'text-slate-400'}`} />
              <span className="flex-1 text-left truncate">{category}</span>
              <span className="ml-2 text-xs font-semibold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                {categoryCounts[category]}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
