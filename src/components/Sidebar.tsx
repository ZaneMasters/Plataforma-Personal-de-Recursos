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

const PRESETS = [
  '#ef4444', '#f97316', '#f59e0b', '#84cc16',
  '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899',
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
  const colorInputRef = useRef<HTMLInputElement>(null);
  const [localColor, setLocalColor] = useState(color || '#6366f1');

  useEffect(() => {
    if (color) setLocalColor(color);
  }, [color]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    const t = setTimeout(() => document.addEventListener('mousedown', handler), 0);
    return () => { clearTimeout(t); document.removeEventListener('mousedown', handler); };
  }, [onClose]);

  const pickerWidth = 196;
  const viewportWidth = window.innerWidth;
  const left = pickerState.left + pickerWidth > viewportWidth
    ? viewportWidth - pickerWidth - 8
    : pickerState.left;

  return createPortal(
    <div
      ref={ref}
      className="fixed z-[9999] bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl shadow-2xl p-3.5"
      style={{ top: pickerState.top, left, width: pickerWidth }}
      onClick={e => e.stopPropagation()}
    >
      <p className="text-[10px] font-bold uppercase tracking-widest text-surface-400 dark:text-surface-500 mb-3">
        Color de carpeta
      </p>

      {/* RGB picker area */}
      <div className="flex items-center gap-2.5 mb-3">
        {/* Color swatch that opens native picker */}
        <div
          className="relative w-12 h-12 rounded-lg overflow-hidden cursor-pointer border-2 border-surface-200 dark:border-surface-600 shadow-inner shrink-0 hover:border-surface-400 transition-colors"
          style={{ backgroundColor: localColor }}
          onClick={() => colorInputRef.current?.click()}
        >
          <input
            ref={colorInputRef}
            type="color"
            value={localColor}
            onChange={e => setLocalColor(e.target.value)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/15 hover:bg-black/25 transition-colors">
            <svg className="w-5 h-5 text-white drop-shadow" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </div>
        </div>

        <div className="flex-1 flex flex-col gap-1.5">
          {/* Hex input */}
          <input
            type="text"
            value={localColor.toUpperCase()}
            onChange={e => {
              const val = e.target.value;
              if (/^#[0-9a-fA-F]{0,6}$/.test(val)) setLocalColor(val);
            }}
            className="w-full bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-600 rounded-md px-2 py-1.5 text-xs font-mono font-bold text-surface-700 dark:text-surface-300 focus:outline-none focus:border-accent-400 uppercase tracking-wider"
            maxLength={7}
          />
          {/* Apply button */}
          <button
            onClick={() => { onSelect(localColor); onClose(); }}
            className="w-full py-1.5 rounded-md text-[11px] font-bold text-white transition-all active:scale-95 shadow-sm"
            style={{ backgroundColor: localColor }}
          >
            Aplicar
          </button>
        </div>
      </div>

      {/* Hue range slider */}
      <input
        type="range"
        min={0}
        max={360}
        value={(() => {
          const r = parseInt(localColor.slice(1, 3), 16) / 255;
          const g = parseInt(localColor.slice(3, 5), 16) / 255;
          const b = parseInt(localColor.slice(5, 7), 16) / 255;
          const max = Math.max(r, g, b), min = Math.min(r, g, b);
          if (max === min) return 0;
          const d = max - min;
          let h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
          return Math.round((h / 6) * 360);
        })()}
        onChange={e => {
          const h = Number(e.target.value) / 360;
          const s = 0.75, l = 0.55;
          const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
          const p = 2 * l - q;
          const toRGB = (t: number) => {
            if (t < 0) t += 1; if (t > 1) t -= 1;
            if (t < 1/6) return p + (q - p) * 6 * t;
            if (t < 1/2) return q;
            if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
          };
          const r = Math.round(toRGB(h + 1/3) * 255);
          const g = Math.round(toRGB(h) * 255);
          const b = Math.round(toRGB(h - 1/3) * 255);
          setLocalColor(`#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`);
        }}
        className="w-full h-3 rounded-full appearance-none cursor-pointer mb-3"
        style={{
          background: 'linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)',
        }}
      />

      {/* Quick preset swatches */}
      <div className="flex gap-1.5">
        {PRESETS.map(c => (
          <button
            key={c}
            onClick={() => { setLocalColor(c); onSelect(c); onClose(); }}
            className="flex-1 h-5 rounded transition-transform hover:scale-110 active:scale-95"
            style={{
              backgroundColor: c,
              boxShadow: color === c ? `0 0 0 2px white, 0 0 0 3px ${c}` : undefined,
            }}
            title={c}
          />
        ))}
      </div>

      {color && (
        <button
          onClick={() => { onSelect(''); onClose(); }}
          className="mt-2.5 w-full text-[10px] font-bold text-surface-500 dark:text-surface-400 hover:text-red-500 transition-colors text-center py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20"
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
