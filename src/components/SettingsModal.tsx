import { useState, useRef } from 'react';
import { X, Moon, Sun, Download, Palette, Layers, Check } from 'lucide-react';
import type { UserPreferences, ColorPalette, SurfaceStyle } from '../hooks/useUserPreferences';

interface SettingsModalProps {
  onClose: () => void;
  preferences: UserPreferences;
  onUpdatePreferences: (newPrefs: Partial<UserPreferences>) => void;
  onExport: () => void;
}

// Curated preset swatches
const PRESETS: { label: string; hex: string; palette: ColorPalette }[] = [
  { label: 'Cielo',      hex: '#3b82f6', palette: 'blue'    },
  { label: 'Esmeralda',  hex: '#10b981', palette: 'emerald' },
  { label: 'Violeta',    hex: '#8b5cf6', palette: 'violet'  },
  { label: 'Rosa',       hex: '#f43f5e', palette: 'rose'    },
  { label: 'Ámbar',      hex: '#f59e0b', palette: 'amber'   },
  { label: 'Coral',      hex: '#f97316', palette: 'custom'  },
  { label: 'Cian',       hex: '#06b6d4', palette: 'custom'  },
  { label: 'Lima',       hex: '#84cc16', palette: 'custom'  },
  { label: 'Fucsia',     hex: '#d946ef', palette: 'custom'  },
  { label: 'Índigo',     hex: '#6366f1', palette: 'custom'  },
];

function isValidHex(hex: string) {
  return /^#[0-9a-fA-F]{6}$/.test(hex);
}

export function SettingsModal({ onClose, preferences, onUpdatePreferences, onExport }: SettingsModalProps) {
  // Determine the currently displayed hex
  const currentHex =
    preferences.colorPalette === 'custom' && preferences.customAccentColor
      ? preferences.customAccentColor
      : PRESETS.find(p => p.palette === preferences.colorPalette)?.hex ?? '#3b82f6';

  const [hexInput, setHexInput] = useState(currentHex);
  const [hexError, setHexError] = useState(false);
  const colorInputRef = useRef<HTMLInputElement>(null);

  const applyColor = (hex: string, palette: ColorPalette = 'custom') => {
    if (!isValidHex(hex)) { setHexError(true); return; }
    setHexError(false);
    setHexInput(hex);
    onUpdatePreferences({ colorPalette: palette, customAccentColor: hex });
  };

  const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    if (!val.startsWith('#')) val = '#' + val;
    setHexInput(val);
    if (isValidHex(val)) {
      setHexError(false);
      onUpdatePreferences({ colorPalette: 'custom', customAccentColor: val });
    } else {
      setHexError(val.length > 1);
    }
  };

  const surfaceOptions: { id: SurfaceStyle; name: string; desc: string }[] = [
    { id: 'slate',   name: 'Pizarra', desc: 'Clásico'   },
    { id: 'neutral', name: 'Neutro',  desc: 'Gris puro' },
    { id: 'stone',   name: 'Cálido',  desc: 'Tierra'    },
    { id: 'tinted',  name: 'Tintado', desc: 'Mágico'    },
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
        <div className="p-6 space-y-8 max-h-[80vh] overflow-y-auto">
          
          {/* Theme Section */}
          <section className="space-y-3">
            <h3 className="text-xs font-bold text-surface-500 dark:text-surface-400 uppercase tracking-wider font-display">Apariencia</h3>
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

          {/* Color de Acento — Fancy Picker */}
          <section className="space-y-4">
            <h3 className="text-xs font-bold text-surface-500 dark:text-surface-400 uppercase tracking-wider font-display">Color de Acento</h3>

            {/* Spectrum gradient bar → opens native color picker */}
            <div
              className="relative w-full h-10 rounded-xl cursor-pointer overflow-hidden shadow-inner border border-surface-200 dark:border-surface-700 group"
              style={{
                background: 'linear-gradient(to right, #ff0000, #ff8800, #ffff00, #00ff88, #00ffff, #0088ff, #8800ff, #ff00ff, #ff0000)'
              }}
              onClick={() => colorInputRef.current?.click()}
              title="Haz clic para abrir el selector de color"
            >
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-white text-xs font-bold drop-shadow-md tracking-widest uppercase">Elegir color</span>
              </div>
              {/* Hidden native color input */}
              <input
                ref={colorInputRef}
                type="color"
                value={isValidHex(hexInput) ? hexInput : currentHex}
                onChange={(e) => applyColor(e.target.value)}
                className="absolute opacity-0 w-0 h-0 pointer-events-none"
              />
            </div>

            {/* Preset chips */}
            <div className="flex flex-wrap gap-2">
              {PRESETS.map(preset => {
                const isActive =
                  (preset.palette !== 'custom' && preferences.colorPalette === preset.palette) ||
                  (preferences.customAccentColor?.toLowerCase() === preset.hex.toLowerCase());
                return (
                  <button
                    key={preset.hex}
                    onClick={() => applyColor(preset.hex, preset.palette)}
                    title={preset.label}
                    className="relative w-9 h-9 rounded-full transition-all hover:scale-110 focus:outline-none shadow-md"
                    style={{ backgroundColor: preset.hex }}
                  >
                    {isActive && (
                      <span className="absolute inset-0 flex items-center justify-center">
                        <Check className="w-4 h-4 text-white drop-shadow-md" strokeWidth={3} />
                      </span>
                    )}
                    <span className="sr-only">{preset.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Hex input + live preview */}
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-lg shadow-md border border-surface-200 dark:border-surface-600 shrink-0 transition-colors duration-200 cursor-pointer"
                style={{ backgroundColor: isValidHex(hexInput) ? hexInput : '#aaaaaa' }}
                onClick={() => colorInputRef.current?.click()}
                title="Clic para abrir selector"
              />
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={hexInput}
                  onChange={handleHexChange}
                  maxLength={7}
                  placeholder="#3b82f6"
                  className={`w-full px-3 py-2 rounded-lg border-2 text-sm font-mono font-bold transition-colors focus:outline-none bg-surface-50 dark:bg-surface-900/50 dark:text-surface-100 ${
                    hexError
                      ? 'border-red-400 text-red-500 dark:border-red-600'
                      : 'border-surface-200 dark:border-surface-700 focus:border-accent-500'
                  }`}
                />
                {hexError && (
                  <p className="text-[10px] text-red-500 mt-1 font-semibold">Hex inválido (ej: #a855f7)</p>
                )}
              </div>
            </div>

            {/* Active color label */}
            <p className="text-[11px] text-surface-400 dark:text-surface-500 font-medium">
              Color activo: <span className="font-bold" style={{ color: isValidHex(hexInput) ? hexInput : undefined }}>{hexInput.toUpperCase()}</span>
            </p>
          </section>

          {/* Surface Style Section */}
          <section className="space-y-3">
            <h3 className="text-xs font-bold text-surface-500 dark:text-surface-400 uppercase tracking-wider font-display flex items-center gap-2">
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
          <section className="space-y-3">
            <h3 className="text-xs font-bold text-surface-500 dark:text-surface-400 uppercase tracking-wider font-display">Datos</h3>
            <button
              onClick={onExport}
              className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl bg-surface-100 hover:bg-surface-200 dark:bg-surface-700 dark:hover:bg-surface-600 text-surface-700 dark:text-surface-200 font-bold text-sm transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Exportar a Excel (XLSX)</span>
            </button>
          </section>

        </div>
      </div>
    </div>
  );
}
