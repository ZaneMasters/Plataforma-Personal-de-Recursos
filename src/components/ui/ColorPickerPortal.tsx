import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

const PRESETS = [
  '#ef4444', '#f97316', '#f59e0b', '#84cc16',
  '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899',
];

export interface PickerState {
  category: string;
  top: number;
  left: number;
}

interface ColorPickerPortalProps {
  pickerState: PickerState;
  color?: string;
  onSelect: (c: string) => void;
  onClose: () => void;
}

export function ColorPickerPortal({
  pickerState,
  color,
  onSelect,
  onClose,
}: ColorPickerPortalProps) {
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

      <div className="flex items-center gap-2.5 mb-3">
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
          <button
            onClick={() => { onSelect(localColor); onClose(); }}
            className="w-full py-1.5 rounded-md text-[11px] font-bold text-white transition-all active:scale-95 shadow-sm"
            style={{ backgroundColor: localColor }}
          >
            Aplicar
          </button>
        </div>
      </div>

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
