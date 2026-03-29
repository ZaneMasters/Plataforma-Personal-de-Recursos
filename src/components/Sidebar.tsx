import { HelpCircle, FolderOpen, Plus, Settings, Star, LayoutGrid, LogOut } from 'lucide-react';
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
}

export function Sidebar({ links, selectedCategory, onSelectCategory, onAddClick, user, onLogout, onSettingsClick }: SidebarProps) {
  
  
  const categories = Array.from(new Set(links.map(link => link.category))).sort();
  const categoryCounts = categories.reduce((acc, cat) => {
    acc[cat] = links.filter(l => l.category === cat).length;
    return acc;
  }, {} as Record<string, number>);

  const favoritesCount = links.filter(l => l.isFavorite).length;

  return (
    <aside className="w-64 h-full bg-surface-50 dark:bg-surface-900/50 border-r border-surface-200 dark:border-surface-800 flex flex-col pt-6 pb-6 shrink-0 z-20 shadow-[1px_0_10px_rgba(0,0,0,0.02)] transition-colors duration-200">
      <div className="px-6 mb-8">
        <button 
          onClick={onAddClick}
          className="w-full bg-accent-600 hover:bg-accent-700 dark:bg-accent-500 dark:hover:bg-accent-600 text-white font-bold py-2.5 px-4 rounded shadow-sm text-sm transition-all flex items-center justify-center space-x-2 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Añadir Enlace</span>
        </button>
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
                  selectedCategory === null ? 'bg-white dark:bg-surface-800 text-accent-600 dark:text-accent-400 shadow-sm border border-surface-200/60 dark:border-surface-700' : 'text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800/50 hover:text-surface-900 dark:hover:text-surface-200'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <LayoutGrid className="w-4 h-4 text-surface-400 dark:text-surface-500" />
                  <span>Toda la Biblioteca</span>
                </div>
                <span className="text-xs bg-surface-100 dark:bg-surface-800/80 text-surface-500 dark:text-surface-400 px-2 py-0.5 rounded-full font-bold">{links.length}</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => onSelectCategory('__FAVORITES__')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedCategory === '__FAVORITES__' ? 'bg-white dark:bg-surface-800 text-accent-600 dark:text-accent-400 shadow-sm border border-surface-200/60 dark:border-surface-700' : 'text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800/50 hover:text-surface-900 dark:hover:text-surface-200'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Star className={`w-4 h-4 ${selectedCategory === '__FAVORITES__' ? 'text-accent-500 fill-accent-50 dark:fill-accent-900/30' : 'text-surface-400 dark:text-surface-500'}`} />
                  <span>Favoritos</span>
                </div>
                <span className="text-xs bg-surface-100 dark:bg-surface-800/80 text-surface-500 dark:text-surface-400 px-2 py-0.5 rounded-full font-bold">{favoritesCount}</span>
              </button>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="px-3 mb-2 text-[11px] font-bold text-surface-400 dark:text-surface-500 uppercase tracking-widest font-display flex items-center justify-between">
            <span>Directorios</span>
          </h3>
          <ul className="space-y-0.5">
            {categories.map(category => (
              <li key={category}>
                <button
                  onClick={() => onSelectCategory(category)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors group ${
                    selectedCategory === category ? 'bg-white dark:bg-surface-800 text-accent-600 dark:text-accent-400 shadow-sm border border-surface-200/60 dark:border-surface-700' : 'text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800/50 hover:text-surface-900 dark:hover:text-surface-200'
                  }`}
                >
                  <div className="flex items-center space-x-3 truncate">
                    <FolderOpen className={`w-4 h-4 ${selectedCategory === category ? 'text-accent-500' : 'text-surface-400 dark:text-surface-500 group-hover:text-surface-600 dark:group-hover:text-surface-300'}`} />
                    <span className="truncate">{category}</span>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-bold shrink-0 ${
                    selectedCategory === category ? 'bg-accent-50 dark:bg-accent-900/30 text-accent-700 dark:text-accent-300' : 'bg-surface-100 dark:bg-surface-800/80 text-surface-400'
                  }`}>
                    {categoryCounts[category]}
                  </span>
                </button>
              </li>
            ))}
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
          <span>Perfil de GitHub</span>
        </a>
      </div>

      {user && (
        <div className="mx-4 mt-4 p-3 bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-lg flex flex-col gap-3 shadow-[0_2px_4px_rgba(0,0,0,0.02)] transition-colors">
          <div className="flex items-center gap-3">
             {user.photoURL ? (
                <img src={user.photoURL} alt="Avatar" className="w-8 h-8 rounded-full shadow-sm" />
             ) : (
                <div className="w-8 h-8 rounded-full bg-surface-900 dark:bg-surface-700 text-white flex items-center justify-center text-xs font-bold">{user.email?.charAt(0).toUpperCase()}</div>
             )}
             <div className="overflow-hidden flex-1">
                <p className="text-xs font-bold text-surface-800 dark:text-surface-200 truncate">{user.displayName || 'Usuario'}</p>
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

    </aside>
  );
}
