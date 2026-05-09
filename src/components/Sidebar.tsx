import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import type { Link } from '../types';
import type { User } from 'firebase/auth';
import { ColorPickerPortal, type PickerState } from './ui/ColorPickerPortal';
import { SidebarDirectory } from './SidebarDirectory';
import { SidebarFooter } from './SidebarFooter';
import { SidebarProfile } from './SidebarProfile';

interface SidebarProps {
  links: Link[];
  selectedCategory: string | null;
  selectedSubcategory: string | null;
  onSelectCategory: (category: string | null, subcategory?: string | null) => void;
  onAddClick: () => void;
  user?: User | null;
  onLogout?: () => void;
  onSettingsClick: () => void;
  onCloseMobile?: () => void;
  categoryColors: Record<string, string>;
  onSetCategoryColor: (category: string, color: string) => void;
}



export function Sidebar({ links, selectedCategory, selectedSubcategory, onSelectCategory, onAddClick, user, onLogout, onSettingsClick, onCloseMobile, categoryColors, onSetCategoryColor }: SidebarProps) {
  const [pickerState, setPickerState] = useState<PickerState | null>(null);


  const openPicker = (e: React.MouseEvent<HTMLButtonElement>, category: string) => {
    e.stopPropagation();
    if (pickerState?.category === category) {
      setPickerState(null);
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    setPickerState({
      category,
      top: rect.bottom + 6,
      left: rect.left,
    });
  };

  return (
    <aside className="w-64 h-full bg-surface-50 dark:bg-surface-900/50 border-r border-surface-200 dark:border-surface-800 flex flex-col pt-6 pb-6 shrink-0 z-20 shadow-[1px_0_10px_rgba(0,0,0,0.02)] transition-colors duration-200 relative">
      <div className="px-6 mb-8 flex justify-between items-center">
        <button
          onClick={onAddClick}
          className="w-full bg-accent-600 hover:bg-accent-700 dark:bg-accent-500 dark:hover:bg-accent-600 text-white font-bold py-2.5 px-4 rounded shadow-sm text-sm transition-all flex items-center justify-center space-x-2 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Añadir Enlace</span>
        </button>
        {onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="md:hidden ml-4 p-2 -mr-2 text-surface-400 hover:text-accent-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <SidebarDirectory
        links={links}
        selectedCategory={selectedCategory}
        selectedSubcategory={selectedSubcategory}
        onSelectCategory={onSelectCategory}
        categoryColors={categoryColors}
        openPicker={openPicker}
        pickerCategory={pickerState?.category}
      />

      <SidebarFooter onSettingsClick={onSettingsClick} />

      <SidebarProfile user={user} onLogout={onLogout} />

      {pickerState && (
        <ColorPickerPortal
          pickerState={pickerState}
          color={categoryColors[pickerState.category]}
          onSelect={color => onSetCategoryColor(pickerState.category, color)}
          onClose={() => setPickerState(null)}
        />
      )}
    </aside>
  );
}
