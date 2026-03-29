import { Search, Menu } from 'lucide-react';

interface TopBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  productName?: string;
  breadcrumbs?: string[];
  onReset?: () => void;
  onMenuClick?: () => void;
}

export function TopBar({ searchQuery, onSearchChange, breadcrumbs = ["Plataforma"], onReset, onMenuClick }: TopBarProps) {
  return (
    <header className="h-20 bg-white dark:bg-surface-800 border-b border-surface-200 dark:border-surface-700 flex items-center justify-between px-4 md:px-8 shrink-0 z-10 shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-colors duration-200">
      <div className="flex items-center space-x-2 md:space-x-8">
        {onMenuClick && (
          <button 
            onClick={onMenuClick} 
            className="md:hidden p-2 -ml-2 text-surface-500 hover:text-accent-600 dark:text-surface-400 dark:hover:text-accent-400 transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
        )}
        {/* Logo and name removed per user request */}
        <div className="hidden md:flex items-center space-x-1">
          {breadcrumbs.map((crumb, i) => (
            <div key={crumb} className="flex items-center">
              {i > 0 && <span className="text-surface-300 dark:text-surface-600 mx-2 text-lg">/</span>}
              <span 
                className={`font-medium text-sm transition-colors ${i === breadcrumbs.length - 1 ? 'text-surface-800 dark:text-surface-200 font-bold' : 'text-surface-500 dark:text-surface-400 hover:text-surface-900 dark:hover:text-surface-200 cursor-pointer'} ${i === 0 ? 'hover:text-accent-600 dark:hover:text-accent-400 cursor-pointer' : ''}`}
                onClick={i === 0 ? onReset : undefined}
                title={i === 0 ? "Volver a Toda la Biblioteca" : undefined}
              >
                {crumb}
              </span>
            </div>
          ))}
        </div>
      </div>
      
      <div className="flex-1 max-w-xl mx-2 md:mx-8">
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="w-5 h-5 text-surface-400 dark:text-surface-500 group-focus-within:text-accent-500 transition-colors" />
          </div>
          <input
            type="text"
            className="w-full pl-11 pr-4 py-2.5 bg-surface-50 dark:bg-surface-900/50 border border-surface-200 dark:border-surface-700 rounded-lg text-sm text-surface-900 dark:text-surface-100 placeholder-surface-400 dark:placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 focus:bg-white dark:focus:bg-surface-800 transition-all shadow-sm"
            placeholder="Buscar enlaces, etiquetas, o directorios..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>
      
      <div className="hidden md:flex items-center w-24">
        {/* Placeholder for future top-right utilities, keeping flex balance */}
      </div>
    </header>
  );
}
