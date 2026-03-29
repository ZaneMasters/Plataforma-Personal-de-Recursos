import { useState, useEffect } from 'react';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { User } from 'firebase/auth';

export type ThemeType = 'light' | 'dark';
export type ColorPalette = 'blue' | 'emerald' | 'violet' | 'rose' | 'amber';
export type SurfaceStyle = 'slate' | 'neutral' | 'stone' | 'tinted';

export interface UserPreferences {
  theme: ThemeType;
  colorPalette: ColorPalette;
  surfaceStyle: SurfaceStyle;
}

const DEFAULT_PREFERENCES: UserPreferences = {
  theme: 'light',
  colorPalette: 'blue',
  surfaceStyle: 'slate'
};

export function useUserPreferences(user?: User | null) {
  const [preferences, setPreferences] = useState<UserPreferences>(() => {
    const saved = localStorage.getItem('linkvault_settings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback
      }
    }
    // Check system preference for dark mode if nothing saved
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
       return { ...DEFAULT_PREFERENCES, theme: 'dark' };
    }
    return DEFAULT_PREFERENCES;
  });

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
    if (preferences.colorPalette === 'blue') {
      htmlEl.removeAttribute('data-theme');
    } else {
      htmlEl.setAttribute('data-theme', preferences.colorPalette);
    }

    // Apply surface style
    if (preferences.surfaceStyle === 'slate') {
      htmlEl.removeAttribute('data-surface');
    } else {
      htmlEl.setAttribute('data-surface', preferences.surfaceStyle);
    }
    
    // Save locally
    localStorage.setItem('linkvault_settings', JSON.stringify(preferences));

  }, [preferences.theme, preferences.colorPalette, preferences.surfaceStyle]);

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
                    return { ...prev, ...data.preferences };
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
