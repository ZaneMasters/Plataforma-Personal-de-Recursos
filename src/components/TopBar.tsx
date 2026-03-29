import { Search } from 'lucide-react';

interface TopBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  productName?: string;
  breadcrumbs?: string[];
  onReset?: () => void;
}

export function TopBar({ searchQuery, onSearchChange, productName = "LinkVault", breadcrumbs = ["Plataforma"], onReset }: TopBarProps) {
  return (
    <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0 z-10 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
      <div className="flex items-center space-x-8">
        <div 
          className="flex items-center gap-2 cursor-pointer group"
          onClick={onReset}
        >
          <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center group-hover:bg-blue-600 transition-colors">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
            </svg>
          </div>
          <span className="font-display font-bold text-lg text-slate-900 tracking-tight group-hover:text-blue-600 transition-colors">{productName}</span>
        </div>
        
        <div className="hidden md:flex items-center space-x-1">
          {breadcrumbs.map((crumb, i) => (
            <div key={crumb} className="flex items-center">
              {i > 0 && <span className="text-slate-300 mx-2 text-lg">/</span>}
              <span 
                className={`font-medium text-sm transition-colors ${i === breadcrumbs.length - 1 ? 'text-slate-800 font-bold' : 'text-slate-500 hover:text-slate-900 cursor-pointer'} ${i === 0 ? 'hover:text-blue-600 cursor-pointer' : ''}`}
                onClick={i === 0 ? onReset : undefined}
                title={i === 0 ? "Volver a Toda la Biblioteca" : undefined}
              >
                {crumb}
              </span>
            </div>
          ))}
        </div>
      </div>
      
      <div className="flex-1 max-w-xl mx-8">
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
          </div>
          <input
            type="text"
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all shadow-sm"
            placeholder="Buscar enlaces, etiquetas, o directorios..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>
      
      <div className="flex items-center w-24">
        {/* Placeholder for future top-right utilities, keeping flex balance */}
      </div>
    </header>
  );
}
