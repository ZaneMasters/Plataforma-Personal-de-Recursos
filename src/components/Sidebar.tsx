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
}

export function Sidebar({ links, selectedCategory, onSelectCategory, onAddClick, user, onLogout }: SidebarProps) {
  
  const handleExport = () => {
    const dataStr = JSON.stringify(links, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'curator_backup.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const categories = Array.from(new Set(links.map(link => link.category))).sort();
  const categoryCounts = categories.reduce((acc, cat) => {
    acc[cat] = links.filter(l => l.category === cat).length;
    return acc;
  }, {} as Record<string, number>);

  const favoritesCount = links.filter(l => l.isFavorite).length;

  return (
    <aside className="w-64 h-full bg-slate-50 border-r border-slate-200 flex flex-col pt-6 pb-6 shrink-0 z-20 shadow-[1px_0_10px_rgba(0,0,0,0.02)]">
      <div className="px-6 mb-8">
        <button 
          onClick={onAddClick}
          className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 px-4 rounded shadow-sm text-sm transition-all flex items-center justify-center space-x-2 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Añadir Enlace</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 space-y-6">
        <div>
          <h3 className="px-3 mb-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest font-display">
            Biblioteca
          </h3>
          <ul className="space-y-0.5">
            <li>
              <button
                onClick={() => onSelectCategory(null)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedCategory === null ? 'bg-white text-blue-600 shadow-sm border border-slate-200/60' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <LayoutGrid className="w-4 h-4 text-slate-400" />
                  <span>Toda la Biblioteca</span>
                </div>
                <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-bold">{links.length}</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => onSelectCategory('__FAVORITES__')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedCategory === '__FAVORITES__' ? 'bg-white text-blue-600 shadow-sm border border-slate-200/60' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Star className={`w-4 h-4 ${selectedCategory === '__FAVORITES__' ? 'text-blue-500 fill-blue-50' : 'text-slate-400'}`} />
                  <span>Favoritos</span>
                </div>
                <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-bold">{favoritesCount}</span>
              </button>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="px-3 mb-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest font-display flex items-center justify-between">
            <span>Directorios</span>
          </h3>
          <ul className="space-y-0.5">
            {categories.map(category => (
              <li key={category}>
                <button
                  onClick={() => onSelectCategory(category)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors group ${
                    selectedCategory === category ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center space-x-3 truncate">
                    <FolderOpen className={`w-4 h-4 ${selectedCategory === category ? 'text-slate-800' : 'text-slate-400 group-hover:text-slate-600'}`} />
                    <span className="truncate">{category}</span>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-bold shrink-0 ${
                    selectedCategory === category ? 'bg-slate-100 text-slate-600' : 'bg-slate-100 text-slate-400'
                  }`}>
                    {categoryCounts[category]}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="px-4 mt-auto pt-6 border-t border-slate-200/50 space-y-0.5">
        <button 
           onClick={handleExport}
           className="w-full flex items-center space-x-3 px-3 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors text-sm font-medium group"
           title="Descargar tus enlaces como un archivo JSON"
        >
          <Settings className="w-4 h-4 text-slate-400 group-hover:text-slate-600" />
          <span>Exportar Respaldo</span>
        </button>
        <a 
          href="https://github.com/ZaneMasters"
          target="_blank"
          rel="noreferrer"
          className="w-full flex items-center space-x-3 px-3 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors text-sm font-medium group"
        >
          <HelpCircle className="w-4 h-4 text-slate-400 group-hover:text-slate-600" />
          <span>Perfil de GitHub</span>
        </a>
      </div>

      {user && (
        <div className="mx-4 mt-4 p-3 bg-white border border-slate-200 rounded-lg flex flex-col gap-3 shadow-[0_2px_4px_rgba(0,0,0,0.02)]">
          <div className="flex items-center gap-3">
             {user.photoURL ? (
                <img src={user.photoURL} alt="Avatar" className="w-8 h-8 rounded-full shadow-sm" />
             ) : (
                <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold">{user.email?.charAt(0).toUpperCase()}</div>
             )}
             <div className="overflow-hidden flex-1">
                <p className="text-xs font-bold text-slate-800 truncate">{user.displayName || 'Usuario'}</p>
                <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
             </div>
          </div>
          <button 
             onClick={onLogout}
             className="w-full py-1.5 px-2 bg-slate-50 hover:bg-red-50 text-slate-600 hover:text-red-600 rounded text-xs font-bold transition-colors border border-slate-200 hover:border-red-200 flex items-center justify-center space-x-1"
          >
             <LogOut className="w-3 h-3" />
             <span>Cerrar Sesión</span>
          </button>
        </div>
      )}

    </aside>
  );
}
