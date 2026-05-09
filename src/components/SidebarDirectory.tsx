import { useState } from 'react';
import { LayoutGrid, Star, Folder, FolderOpen, ChevronRight, MoreHorizontal } from 'lucide-react';
import type { Link } from '../types';

interface SidebarDirectoryProps {
  links: Link[];
  selectedCategory: string | null;
  selectedSubcategory: string | null;
  onSelectCategory: (category: string | null, subcategory?: string | null) => void;
  categoryColors: Record<string, string>;
  openPicker: (e: React.MouseEvent<HTMLButtonElement>, category: string) => void;
  pickerCategory: string | undefined;
}

export const SidebarDirectory = ({
  links,
  selectedCategory,
  selectedSubcategory,
  onSelectCategory,
  categoryColors,
  openPicker,
  pickerCategory
}: SidebarDirectoryProps) => {
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

  const categories = Array.from(new Set(links.map(link => link.category))).sort();

  // Build a map: category → sorted unique subcategories
  const subcategoryMap = categories.reduce((acc, cat) => {
    const subs = Array.from(
      new Set(
        links
          .filter(l => l.category === cat && l.subcategory && l.subcategory.trim())
          .map(l => l.subcategory.trim())
      )
    ).sort();
    acc[cat] = subs;
    return acc;
  }, {} as Record<string, string[]>);

  const categoryCounts = categories.reduce((acc, cat) => {
    acc[cat] = links.filter(l => l.category === cat).length;
    return acc;
  }, {} as Record<string, number>);

  const subcategoryCounts = (cat: string) =>
    subcategoryMap[cat].reduce((acc, sub) => {
      acc[sub] = links.filter(l => l.category === cat && l.subcategory === sub).length;
      return acc;
    }, {} as Record<string, number>);

  const favoritesCount = links.filter(l => l.isFavorite).length;

  const toggleExpand = (cat: string) => {
    setExpandedCategories(prev => ({ ...prev, [cat]: !prev[cat] }));
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 space-y-6">
      {/* Biblioteca */}
      <div>
        <h3 className="px-3 mb-2 text-[11px] font-bold text-surface-400 dark:text-surface-500 uppercase tracking-widest font-display">
          Biblioteca
        </h3>
        <ul className="space-y-0.5">
          <li>
            <button
              onClick={() => onSelectCategory(null, null)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedCategory === null
                  ? 'bg-white dark:bg-surface-800 text-accent-600 dark:text-accent-400 shadow-sm border border-surface-200/60 dark:border-surface-700'
                  : 'text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800/50 hover:text-surface-900 dark:hover:text-surface-200'
              }`}
            >
              <div className="flex items-center space-x-3">
                <LayoutGrid className="w-4 h-4 text-surface-400 dark:text-surface-500" />
                <span>Toda la Biblioteca</span>
              </div>
              <span className="text-xs bg-surface-100 dark:bg-surface-800/80 text-surface-500 dark:text-surface-400 px-2 py-0.5 rounded-full font-bold">
                {links.length}
              </span>
            </button>
          </li>
          <li>
            <button
              onClick={() => onSelectCategory('__FAVORITES__', null)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedCategory === '__FAVORITES__'
                  ? 'bg-white dark:bg-surface-800 text-accent-600 dark:text-accent-400 shadow-sm border border-surface-200/60 dark:border-surface-700'
                  : 'text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800/50 hover:text-surface-900 dark:hover:text-surface-200'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Star
                  className={`w-4 h-4 ${
                    selectedCategory === '__FAVORITES__'
                      ? 'text-accent-500 fill-accent-50 dark:fill-accent-900/30'
                      : 'text-surface-400 dark:text-surface-500'
                  }`}
                />
                <span>Favoritos</span>
              </div>
              <span className="text-xs bg-surface-100 dark:bg-surface-800/80 text-surface-500 dark:text-surface-400 px-2 py-0.5 rounded-full font-bold">
                {favoritesCount}
              </span>
            </button>
          </li>
        </ul>
      </div>

      {/* Directorios con subcategorías desplegables */}
      <div>
        <h3 className="px-3 mb-2 text-[11px] font-bold text-surface-400 dark:text-surface-500 uppercase tracking-widest font-display">
          Directorios
        </h3>
        <ul className="space-y-0.5">
          {categories.map(category => {
            const catColor = categoryColors[category];
            const isSelected = selectedCategory === category && !selectedSubcategory;
            const isPickerOpen = pickerCategory === category;
            const subs = subcategoryMap[category];
            const isExpanded = !!expandedCategories[category];
            const subCounts = subcategoryCounts(category);

            return (
              <li key={category}>
                {/* Category row */}
                <div
                  className={`flex items-center rounded-md transition-colors group relative ${
                    isSelected
                      ? 'bg-white dark:bg-surface-800 shadow-sm border border-surface-200/60 dark:border-surface-700'
                      : 'hover:bg-surface-100 dark:hover:bg-surface-800/50'
                  }`}
                >
                  {/* Color strip */}
                  {catColor && (
                    <div
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full"
                      style={{ backgroundColor: catColor }}
                    />
                  )}

                  {/* Expand/collapse chevron (only if has subcategories) */}
                  {subs.length > 0 ? (
                    <button
                      onClick={() => toggleExpand(category)}
                      className="pl-2 pr-0 py-2 text-surface-400 dark:text-surface-500 hover:text-surface-700 dark:hover:text-surface-300 transition-colors shrink-0"
                      title={isExpanded ? 'Colapsar' : 'Expandir'}
                    >
                      <ChevronRight
                        className={`w-3.5 h-3.5 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
                      />
                    </button>
                  ) : (
                    <div className="w-5 shrink-0" />
                  )}

                  {/* Main category button */}
                  <button
                    onClick={() => onSelectCategory(category, null)}
                    className={`flex-1 flex items-center justify-between px-2 py-2 text-sm font-medium min-w-0 ${
                      isSelected
                        ? 'text-accent-600 dark:text-accent-400'
                        : 'text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-surface-200'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 truncate">
                      {isExpanded
                        ? <FolderOpen className="w-4 h-4 shrink-0 transition-colors" style={{ color: catColor || undefined }} />
                        : <Folder className="w-4 h-4 shrink-0 transition-colors" style={{ color: catColor || undefined }} />
                      }
                      <span className="truncate">{category}</span>
                    </div>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-bold shrink-0 ml-1 ${
                        isSelected
                          ? 'bg-accent-50 dark:bg-accent-900/30 text-accent-700 dark:text-accent-300'
                          : 'bg-surface-100 dark:bg-surface-800/80 text-surface-400'
                      }`}
                    >
                      {categoryCounts[category]}
                    </span>
                  </button>

                  {/* Color picker trigger */}
                  <button
                    onClick={e => openPicker(e, category)}
                    className={`shrink-0 w-7 h-7 mr-1.5 rounded flex items-center justify-center transition-all ${
                      isPickerOpen
                        ? 'bg-surface-200 dark:bg-surface-700 text-surface-700 dark:text-surface-200 opacity-100'
                        : 'opacity-0 group-hover:opacity-100 text-surface-400 dark:text-surface-500 hover:bg-surface-200 dark:hover:bg-surface-700 hover:text-surface-700 dark:hover:text-surface-200'
                    }`}
                    title="Cambiar color de categoría"
                  >
                    {catColor ? (
                      <span
                        className="w-3 h-3 rounded-full block ring-1 ring-black/10"
                        style={{ backgroundColor: catColor }}
                      />
                    ) : (
                      <MoreHorizontal className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>

                {/* Subcategories (collapsible) */}
                {subs.length > 0 && isExpanded && (
                  <ul className="mt-0.5 ml-5 space-y-0.5 border-l border-surface-200 dark:border-surface-700 pl-2">
                    {subs.map(sub => {
                      const isSubSelected = selectedCategory === category && selectedSubcategory === sub;
                      return (
                        <li key={sub}>
                          <button
                            onClick={() => onSelectCategory(category, sub)}
                            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                              isSubSelected
                                ? 'bg-accent-50 dark:bg-accent-900/30 text-accent-600 dark:text-accent-400'
                                : 'text-surface-500 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800/50 hover:text-surface-800 dark:hover:text-surface-200'
                            }`}
                          >
                            <div className="flex items-center space-x-2 truncate">
                              <span
                                className="w-1.5 h-1.5 rounded-full shrink-0"
                                style={{ backgroundColor: catColor || 'currentColor', opacity: 0.7 }}
                              />
                              <span className="truncate">{sub}</span>
                            </div>
                            <span className="text-[10px] font-bold text-surface-400 dark:text-surface-500 shrink-0 ml-1">
                              {subCounts[sub]}
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};
