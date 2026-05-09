import { useState, useEffect } from 'react';
import { 
  signInWithPopup, 
  onAuthStateChanged, 
  signOut, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  type User
} from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import { toast } from 'react-hot-toast';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    if (!import.meta.env.VITE_FIREBASE_API_KEY) {
      setAuthLoading(false);
      return;
    }

    const unsubAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubAuth();
  }, []);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      toast.success("¡Bienvenido a LinkVault!");
    } catch (e: any) {
      console.error(e);
      if (e.code !== 'auth/popup-closed-by-user') {
        toast.error("Hubo un error al iniciar sesión.");
      }
    }
  };

  const handleEmailLogin = async (email: string, password: string) => {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    toast.success(`¡Bienvenido de vuelta, ${cred.user.email}!`);
  };

  const handleEmailRegister = async (email: string, password: string) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    toast.success(`¡Cuenta creada! Bienvenido, ${cred.user.email}`);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success("Has cerrado sesión seguro.");
    } catch (e) {
      toast.error("Error al salir de la cuenta.");
    }
  };

  return {
    user,
    authLoading,
    handleLogin,
    handleEmailLogin,
    handleEmailRegister,
    handleLogout
  };
};
