import { X, Moon, Sun, Download, Palette, Layers } from 'lucide-react';
import type { UserPreferences, ColorPalette, SurfaceStyle } from '../hooks/useUserPreferences';

interface SettingsModalProps {
  onClose: () => void;
  preferences: UserPreferences;
  onUpdatePreferences: (newPrefs: Partial<UserPreferences>) => void;
  onExport: () => void;
}

export function SettingsModal({ onClose, preferences, onUpdatePreferences, onExport }: SettingsModalProps) {
  
  const palettes: { id: ColorPalette; name: string; colorClass: string }[] = [
    { id: 'blue', name: 'Azul', colorClass: 'bg-blue-500' },
    { id: 'emerald', name: 'Esmeralda', colorClass: 'bg-emerald-500' },
    { id: 'violet', name: 'Violeta', colorClass: 'bg-violet-500' },
    { id: 'rose', name: 'Rosa', colorClass: 'bg-rose-500' },
    { id: 'amber', name: 'Ámbar', colorClass: 'bg-amber-500' },
  ];

  const surfaceOptions: { id: SurfaceStyle; name: string; desc: string }[] = [
    { id: 'slate', name: 'Pizarra', desc: 'Clásico' },
    { id: 'neutral', name: 'Neutro', desc: 'Gris puro' },
    { id: 'stone', name: 'Cálido', desc: 'Tonos tierra' },
    { id: 'tinted', name: 'Tintado', desc: 'Mágico' },
  ];

  return (
    <div className="fixed inset-0 bg-surface-900/40 dark:bg-surface-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-surface-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-[fadeIn_0.2s_ease-out]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-surface-100 dark:border-surface-700 flex justify-between items-center bg-surface-50/50 dark:bg-surface-800/50">
          <div className="flex items-center space-x-2">
            <Palette className="w-5 h-5 text-accent-500" />
            <h2 className="text-lg font-bold text-surface-900 dark:text-surface-100 font-display">Configuraciones</h2>
          </div>
          <button 
            onClick={onClose}
            className="text-surface-400 hover:text-surface-600 dark:hover:text-surface-300 transition-colors p-1 rounded-full hover:bg-surface-100 dark:hover:bg-surface-700 active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8">
          
          {/* Theme Section */}
          <section className="space-y-4">
            <h3 className="text-sm font-bold text-surface-500 dark:text-surface-400 uppercase tracking-wider font-display">Apariencia</h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => onUpdatePreferences({ theme: 'light' })}
                className={`flex items-center justify-center space-x-2 py-3 px-4 rounded-xl border-2 transition-all ${
                  preferences.theme === 'light' 
                    ? 'border-accent-500 bg-accent-50 dark:bg-accent-900/30 text-accent-600 dark:text-accent-400' 
                    : 'border-surface-200 dark:border-surface-700 text-surface-600 dark:text-surface-400 hover:border-accent-200 dark:hover:border-accent-800'
                }`}
              >
                <Sun className="w-5 h-5" />
                <span className="font-bold text-sm">Claro</span>
              </button>
              <button
                onClick={() => onUpdatePreferences({ theme: 'dark' })}
                className={`flex items-center justify-center space-x-2 py-3 px-4 rounded-xl border-2 transition-all ${
                  preferences.theme === 'dark' 
                    ? 'border-accent-500 bg-accent-50 dark:bg-accent-900/30 text-accent-600 dark:text-accent-400' 
                    : 'border-surface-200 dark:border-surface-700 text-surface-600 dark:text-surface-400 hover:border-accent-200 dark:hover:border-accent-800'
                }`}
              >
                <Moon className="w-5 h-5" />
                <span className="font-bold text-sm">Oscuro</span>
              </button>
            </div>
          </section>

          {/* Color Palette Section */}
          <section className="space-y-4">
             <h3 className="text-sm font-bold text-surface-500 dark:text-surface-400 uppercase tracking-wider font-display">Color de Acento</h3>
             <div className="flex items-center justify-between px-2">
                {palettes.map(palette => (
                  <button
                    key={palette.id}
                    onClick={() => onUpdatePreferences({ colorPalette: palette.id })}
                    title={`Color ${palette.name}`}
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                       preferences.colorPalette === palette.id 
                        ? 'ring-4 ring-offset-2 ring-accent-500 dark:ring-offset-surface-800' 
                        : 'hover:scale-110 hover:shadow-md'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full ${palette.colorClass} shadow-inner`}></div>
                  </button>
                ))}
             </div>
          </section>

          {/* Surface Style Section */}
          <section className="space-y-4">
            <h3 className="text-sm font-bold text-surface-500 dark:text-surface-400 uppercase tracking-wider font-display flex items-center gap-2">
              <Layers className="w-4 h-4" /> Fondo y Tarjetas
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {surfaceOptions.map(option => (
                <button
                  key={option.id}
                  onClick={() => onUpdatePreferences({ surfaceStyle: option.id })}
                  className={`flex flex-col items-start justify-center p-3 rounded-xl border-2 transition-all ${
                    preferences.surfaceStyle === option.id 
                      ? 'border-accent-500 bg-accent-50 dark:bg-accent-900/30 text-accent-700 dark:text-accent-300' 
                      : 'border-surface-200 dark:border-surface-700 text-surface-600 dark:text-surface-400 hover:border-accent-200 dark:hover:border-accent-800'
                  }`}
                >
                  <span className="font-bold text-sm leading-tight">{option.name}</span>
                  <span className="text-[10px] opacity-70 font-medium uppercase tracking-wider">{option.desc}</span>
                </button>
              ))}
            </div>
          </section>

          <hr className="border-surface-100 dark:border-surface-700" />

          {/* Backup Section */}
          <section className="space-y-4">
             <h3 className="text-sm font-bold text-surface-500 dark:text-surface-400 uppercase tracking-wider font-display">Datos</h3>
             <button
               onClick={onExport}
               className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl bg-surface-100 hover:bg-surface-200 dark:bg-surface-700 dark:hover:bg-surface-600 text-surface-700 dark:text-surface-200 font-bold text-sm transition-colors"
             >
                <Download className="w-4 h-4" />
                <span>Exportar Respaldo Local (JSON)</span>
             </button>
          </section>

        </div>
      </div>
    </div>
  );
}
