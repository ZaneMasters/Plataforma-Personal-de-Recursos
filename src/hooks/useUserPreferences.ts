import { useState, useEffect } from 'react';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { User } from 'firebase/auth';

export type ThemeType = 'light' | 'dark';
export type ColorPalette = 'blue' | 'emerald' | 'violet' | 'rose' | 'amber' | 'custom';
export type SurfaceStyle = 'slate' | 'neutral' | 'stone' | 'tinted';

export interface UserPreferences {
  theme: ThemeType;
  colorPalette: ColorPalette;
  customAccentColor?: string; // hex, e.g. "#7c3aed"
  surfaceStyle: SurfaceStyle;
  categoryColors: Record<string, string>;
}

const DEFAULT_PREFERENCES: UserPreferences = {
  theme: 'light',
  colorPalette: 'blue',
  surfaceStyle: 'slate',
  categoryColors: {}
};

// --- Helpers for custom accent color ---
function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map(c => c + c).join('') : h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function mixWith(base: [number, number, number], white: [number, number, number], t: number): string {
  return base.map((c, i) => Math.round(c + (white[i] - c) * t)).join(' ');
}

function applyCustomAccent(hex: string) {
  const root = document.documentElement;
  const [r, g, b] = hexToRgb(hex);
  const base: [number, number, number] = [r, g, b];
  const white: [number, number, number] = [255, 255, 255];
  const black: [number, number, number] = [0, 0, 0];
  root.style.setProperty('--color-accent-50',  mixWith(base, white, 0.92));
  root.style.setProperty('--color-accent-100', mixWith(base, white, 0.82));
  root.style.setProperty('--color-accent-200', mixWith(base, white, 0.68));
  root.style.setProperty('--color-accent-300', mixWith(base, white, 0.50));
  root.style.setProperty('--color-accent-400', mixWith(base, white, 0.25));
  root.style.setProperty('--color-accent-500', `${r} ${g} ${b}`);
  root.style.setProperty('--color-accent-600', mixWith(base, black, 0.18));
  root.style.setProperty('--color-accent-700', mixWith(base, black, 0.35));
  root.style.setProperty('--color-accent-900', mixWith(base, black, 0.60));
}

function clearCustomAccent() {
  const props = ['50','100','200','300','400','500','600','700','900'];
  props.forEach(p => document.documentElement.style.removeProperty(`--color-accent-${p}`));
}

// Returns the localStorage key scoped to the current user (or a guest key)
function getStorageKey(uid?: string | null) {
  return uid ? `linkvault_settings_${uid}` : 'linkvault_settings_guest';
}

function loadFromStorage(uid?: string | null): UserPreferences | null {
  // Remove the old shared key to prevent bleed-through (one-time migration)
  localStorage.removeItem('linkvault_settings');

  const key = getStorageKey(uid);
  const saved = localStorage.getItem(key);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      // ignore parse errors
    }
  }
  return null;
}

export function useUserPreferences(user?: User | null) {
  const [preferences, setPreferences] = useState<UserPreferences>(() => {
    // On first render user is usually undefined; load guest defaults
    const saved = loadFromStorage(user?.uid);
    if (saved) return saved;
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return { ...DEFAULT_PREFERENCES, theme: 'dark' };
    }
    return DEFAULT_PREFERENCES;
  });

  // Reset preferences whenever the logged-in user changes
  useEffect(() => {
    const saved = loadFromStorage(user?.uid);
    if (saved) {
      setPreferences(saved);
    } else {
      const systemDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      setPreferences({ ...DEFAULT_PREFERENCES, theme: systemDark ? 'dark' : 'light' });
    }
  }, [user?.uid]);

  // Effect to apply classes to HTML and Body
  useEffect(() => {
    const htmlEl = document.documentElement;
    
    // Apply dark mode
    if (preferences.theme === 'dark') {
      htmlEl.classList.add('dark');
    } else {
      htmlEl.classList.remove('dark');
    }

    // Apply color palette
    if (preferences.colorPalette === 'custom' && preferences.customAccentColor) {
      htmlEl.setAttribute('data-theme', 'custom');
      applyCustomAccent(preferences.customAccentColor);
    } else if (preferences.colorPalette === 'blue') {
      htmlEl.removeAttribute('data-theme');
      clearCustomAccent();
    } else {
      htmlEl.setAttribute('data-theme', preferences.colorPalette);
      clearCustomAccent();
    }

    // Apply surface style
    if (preferences.surfaceStyle === 'slate') {
      htmlEl.removeAttribute('data-surface');
    } else {
      htmlEl.setAttribute('data-surface', preferences.surfaceStyle);
    }
    
    // Save locally using the user-scoped key
    localStorage.setItem(getStorageKey(user?.uid), JSON.stringify(preferences));

  }, [preferences.theme, preferences.colorPalette, preferences.customAccentColor, preferences.surfaceStyle, user?.uid]);

  // Effect to sync with Firebase if user is logged in
  useEffect(() => {
     if (!import.meta.env.VITE_FIREBASE_API_KEY || !user) return;

     const docRef = doc(db, 'users', user.uid);
     
     const unsubscribe = onSnapshot(docRef, (docSnap) => {
         if (docSnap.exists()) {
           const data = docSnap.data();
           if (data.preferences) {
              setPreferences((prev) => {
                 // only update if different to avoid looping
                 if (prev.theme !== data.preferences.theme || prev.colorPalette !== data.preferences.colorPalette || prev.surfaceStyle !== data.preferences.surfaceStyle) {
                    return { ...prev, ...data.preferences, categoryColors: { ...prev.categoryColors, ...(data.preferences.categoryColors || {}) } };
                 }
                 if (JSON.stringify(prev.categoryColors) !== JSON.stringify(data.preferences.categoryColors || {})) {
                    return { ...prev, categoryColors: { ...prev.categoryColors, ...(data.preferences.categoryColors || {}) } };
                 }
                 return prev;
              });
           }
         }
     });

     return () => unsubscribe();
  }, [user]);

  const updatePreferences = async (newPrefs: Partial<UserPreferences>) => {
     const updated = { ...preferences, ...newPrefs };
     setPreferences(updated);

     // Try to save to Firebase if logged in
     if (user && import.meta.env.VITE_FIREBASE_API_KEY) {
        try {
           const docRef = doc(db, 'users', user.uid);
           await setDoc(docRef, { preferences: updated }, { merge: true });
        } catch (error) {
           console.error('Error saving preferences to Firebase:', error);
        }
     }
  };

  return { preferences, updatePreferences };
}
