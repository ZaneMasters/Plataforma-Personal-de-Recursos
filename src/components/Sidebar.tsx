import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { HelpCircle, FolderOpen, Plus, Settings, Star, LayoutGrid, LogOut, X, MoreHorizontal } from 'lucide-react';
import type { Link } from '../types';
import type { User } from 'firebase/auth';

interface SidebarProps {
  links: Link[];
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
  onAddClick: () => void;
  user?: User | null;
  onLogout?: () => void;
  onSettingsClick: () => void;
  onCloseMobile?: () => void;
  categoryColors: Record<string, string>;
  onSetCategoryColor: (category: string, color: string) => void;
}

const PALETTE = [
  '#ef4444', '#f97316', '#f59e0b', '#84cc16',
  '#22c55e', '#14b8a6', '#3b82f6', '#6366f1',
  '#8b5cf6', '#d946ef', '#ec4899', '#64748b',
  '#0ea5e9', '#10b981', '#e11d48', '#a16207',
];

interface PickerState {
  category: string;
  top: number;
  left: number;
}

function ColorPickerPortal({
  pickerState,
  color,
  onSelect,
  onClose,
}: {
  pickerState: PickerState;
  color?: string;
  onSelect: (c: string) => void;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    // slight delay so the opening click doesn't immediately close it
    const t = setTimeout(() => document.addEventListener('mousedown', handler), 0);
    return () => { clearTimeout(t); document.removeEventListener('mousedown', handler); };
  }, [onClose]);

  // Adjust if picker would go off-screen to the right
  const pickerWidth = 164;
  const viewportWidth = window.innerWidth;
  const left = pickerState.left + pickerWidth > viewportWidth
    ? viewportWidth - pickerWidth - 8
    : pickerState.left;

  return createPortal(
    <div
      ref={ref}
      className="fixed z-[9999] bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl shadow-2xl p-3"
      style={{ top: pickerState.top, left, width: pickerWidth }}
      onClick={e => e.stopPropagation()}
    >
      <p className="text-[10px] font-bold uppercase tracking-widest text-surface-400 dark:text-surface-500 mb-2.5 px-0.5">
        Color de carpeta
      </p>
      <div className="grid grid-cols-4 gap-1.5">
        {PALETTE.map(c => (
          <button
            key={c}
            onClick={() => { onSelect(c); onClose(); }}
            className="w-7 h-7 rounded-lg transition-transform hover:scale-110 active:scale-95"
            style={{
              backgroundColor: c,
              boxShadow: color === c ? `0 0 0 2px white, 0 0 0 3.5px ${c}` : undefined,
            }}
            title={c}
          />
        ))}
      </div>
      {color && (
        <button
          onClick={() => { onSelect(''); onClose(); }}
          className="mt-2.5 w-full text-[10px] font-bold text-surface-500 dark:text-surface-400 hover:text-surface-700 dark:hover:text-surface-200 transition-colors text-center py-1 rounded hover:bg-surface-100 dark:hover:bg-surface-700"
        >
          Quitar color
        </button>
      )}
    </div>,
    document.body
  );
}

export function Sidebar({ links, selectedCategory, onSelectCategory, onAddClick, user, onLogout, onSettingsClick, onCloseMobile, categoryColors, onSetCategoryColor }: SidebarProps) {
  const [pickerState, setPickerState] = useState<PickerState | null>(null);

  const categories = Array.from(new Set(links.map(link => link.category))).sort();
  const categoryCounts = categories.reduce((acc, cat) => {
    acc[cat] = links.filter(l => l.category === cat).length;
    return acc;
  }, {} as Record<string, number>);

  const favoritesCount = links.filter(l => l.isFavorite).length;

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

      <div className="flex-1 overflow-y-auto px-4 space-y-6">
        <div>
          <h3 className="px-3 mb-2 text-[11px] font-bold text-surface-400 dark:text-surface-500 uppercase tracking-widest font-display">
            Biblioteca
          </h3>
          <ul className="space-y-0.5">
            <li>
              <button
                onClick={() => onSelectCategory(null)}
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
                onClick={() => onSelectCategory('__FAVORITES__')}
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

        <div>
          <h3 className="px-3 mb-2 text-[11px] font-bold text-surface-400 dark:text-surface-500 uppercase tracking-widest font-display">
            Directorios
          </h3>
          <ul className="space-y-0.5">
            {categories.map(category => {
              const catColor = categoryColors[category];
              const isSelected = selectedCategory === category;
              const isPickerOpen = pickerState?.category === category;

              return (
                <li key={category}>
                  <div
                    className={`flex items-center rounded-md transition-colors group relative ${
                      isSelected
                        ? 'bg-white dark:bg-surface-800 shadow-sm border border-surface-200/60 dark:border-surface-700'
                        : 'hover:bg-surface-100 dark:hover:bg-surface-800/50'
                    }`}
                  >
                    {/* Color accent strip */}
                    {catColor && (
                      <div
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full"
                        style={{ backgroundColor: catColor }}
                      />
                    )}

                    {/* Main category button */}
                    <button
                      onClick={() => onSelectCategory(category)}
                      className={`flex-1 flex items-center justify-between px-3 py-2 text-sm font-medium min-w-0 ${
                        isSelected
                          ? 'text-accent-600 dark:text-accent-400'
                          : 'text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-surface-200'
                      }`}
                    >
                      <div className="flex items-center space-x-3 truncate">
                        <FolderOpen
                          className="w-4 h-4 shrink-0 transition-colors"
                          style={{ color: catColor || undefined }}
                        />
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
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <div className="px-4 mt-auto pt-6 border-t border-surface-200/50 dark:border-surface-800 space-y-0.5">
        <button
          onClick={onSettingsClick}
          className="w-full flex items-center space-x-3 px-3 py-2 text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-800/50 rounded-md transition-colors text-sm font-medium group"
          title="Personalizar temas y colores"
        >
          <Settings className="w-4 h-4 text-surface-400 dark:text-surface-500 group-hover:text-surface-600 dark:group-hover:text-surface-300" />
          <span>Configuraciones</span>
        </button>
        <a
          href="https://github.com/ZaneMasters"
          target="_blank"
          rel="noreferrer"
          className="w-full flex items-center space-x-3 px-3 py-2 text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-800/50 rounded-md transition-colors text-sm font-medium group"
        >
          <HelpCircle className="w-4 h-4 text-surface-400 dark:text-surface-500 group-hover:text-surface-600 dark:group-hover:text-surface-300" />
          <span>Soporte</span>
        </a>
      </div>

      {user && (
        <div className="mx-4 mt-4 p-3 bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-lg flex flex-col gap-3 shadow-[0_2px_4px_rgba(0,0,0,0.02)] transition-colors">
          <div className="flex items-center gap-3">
            {user.photoURL ? (
              <img src={user.photoURL} alt="Avatar" className="w-8 h-8 rounded-full shadow-sm" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-surface-900 dark:bg-surface-700 text-white flex items-center justify-center text-xs font-bold">
                {user.email?.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="overflow-hidden flex-1">
              <p className="text-xs font-bold text-surface-800 dark:text-surface-200 truncate">
                {user.displayName || 'Usuario'}
              </p>
              <p className="text-[10px] text-surface-500 dark:text-surface-400 truncate">{user.email}</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="w-full py-1.5 px-2 bg-surface-50 dark:bg-surface-800 hover:bg-red-50 dark:hover:bg-red-900/20 text-surface-600 dark:text-surface-400 hover:text-red-600 dark:hover:text-red-400 rounded text-xs font-bold transition-colors border border-surface-200 dark:border-surface-700 hover:border-red-200 dark:hover:border-red-900/50 flex items-center justify-center space-x-1"
          >
            <LogOut className="w-3 h-3" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      )}

      {/* Color picker rendered via portal to escape overflow clipping */}
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
