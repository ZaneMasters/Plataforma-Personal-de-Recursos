import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { MainContent } from './components/MainContent';
import { AddModal } from './components/AddModal';
import { SettingsModal } from './components/SettingsModal';
import { mockLinks } from './data/mockData';
import type { Link } from './types';
import { useUserPreferences } from './hooks/useUserPreferences';
import { Toaster, toast } from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

// Firebase imports
import { collection, onSnapshot, setDoc, doc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';
import { signInWithPopup, onAuthStateChanged, signOut } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { db, storage, auth, googleProvider } from './lib/firebase';

function App() {
  const [links, setLinks] = useState<Link[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode] = useState<'grid' | 'list'>('grid');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Auth State
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // User Preferences
  const { preferences, updatePreferences } = useUserPreferences(user);

  // Auth Listener
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

  // Database Listener (Depends on User)
  useEffect(() => {
    if (!import.meta.env.VITE_FIREBASE_API_KEY) {
      console.log("Firebase no configurado. Cayendo a persistencia local.");
      const saved = localStorage.getItem('curator_links');
      if (saved) {
        try { setLinks(JSON.parse(saved)); } 
        catch (e) { setLinks(mockLinks); }
      } else {
        setLinks(mockLinks);
      }
      return;
    }

    if (!user) {
      setLinks([]); // Clean state if not logged in
      return;
    }

    const q = query(collection(db, 'links'), where('userId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fbLinks = snapshot.docs.map(doc => {
        const data = doc.data();
        return { 
          ...data, 
          id: doc.id,
          tags: data.tags || [],
          isFavorite: data.isFavorite || false
        } as Link;
      });
      setLinks(fbLinks);
    }, (error) => {
      console.error("Error conectando con Firestore:", error);
      toast.error("Error al sincronizar tu base de datos privada.");
    });

    return () => unsubscribe();
  }, [user]);

  // Save to LocalStorage whenever links change as a fallback sync
  useEffect(() => {
    if (links.length > 0 && !import.meta.env.VITE_FIREBASE_API_KEY) {
      localStorage.setItem('curator_links', JSON.stringify(links));
    }
  }, [links]);

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

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success("Has cerrado sesión seguro.");
    } catch (e) {
      toast.error("Error al salir de la cuenta.");
    }
  };

  const handleAddLink = async (newLink: Link) => {
    if (!import.meta.env.VITE_FIREBASE_API_KEY) {
      setLinks(prev => [newLink, ...prev]);
      toast.success('¡Referencia añadida localmente!');
      return;
    }
    
    if (!user) return;

    try {
      const { id, ...data } = newLink;
      // Inject the owner's user ID so it's protected by the query
      await setDoc(doc(db, 'links', id), { ...data, userId: user.uid });
      toast.success('¡Nueva referencia guardada en la nube!');
    } catch (e) {
      console.error(e);
      toast.error("Error Crítico: No se pudo asegurar la referencia en tu perfil.");
    }
  };

  const handleDeleteLink = async (id: string, imageUrl?: string) => {
    if (!import.meta.env.VITE_FIREBASE_API_KEY) {
      setLinks(prev => prev.filter(l => l.id !== id));
      toast.success("Enlace eliminado permanentemente.");
      return;
    }

    try {
      if (imageUrl && imageUrl.includes('firebasestorage.googleapis.com')) {
        try {
          const imagePath = decodeURIComponent(imageUrl.split('/o/')[1].split('?')[0]);
          const imageRef = ref(storage, imagePath);
          await deleteObject(imageRef);
        } catch (storageError) {
          console.error("Error borrando imagen de Storage:", storageError);
        }
      }
      
      await deleteDoc(doc(db, 'links', id));
      toast.success("Enlace eliminado de tu catálogo.");
    } catch (e) {
      console.error(e);
      toast.error("Error al intentar eliminar esta referencia.");
    }
  };

  const handleToggleFavorite = async (id: string) => {
    const link = links.find(l => l.id === id);
    if (!link) return;

    if (!import.meta.env.VITE_FIREBASE_API_KEY) {
      setLinks(prev => prev.map(l => 
        l.id === id ? { ...l, isFavorite: !l.isFavorite } : l
      ));
      if (!link.isFavorite) toast.success("Añadido a tus Favoritos.");
      return;
    }

    try {
      await updateDoc(doc(db, 'links', id), { isFavorite: !link.isFavorite });
      if (!link.isFavorite) toast.success("Añadido a tus Favoritos.");
    } catch (e) {
      console.error("Fallo conectando favorito", e);
      toast.error("Hubo un error al sincronizar este favorito.");
    }
  };

  const handleUpdateLink = async (id: string, updatedData: Partial<Link>) => {
    if (!import.meta.env.VITE_FIREBASE_API_KEY) {
      setLinks(prev => prev.map(link => 
        link.id === id ? { ...link, ...updatedData, modifiedAt: "Recién Modificado" } : link
      ));
      toast.success("Cambios guardados con éxito.");
      return;
    }

    try {
      await updateDoc(doc(db, 'links', id), { ...updatedData, modifiedAt: "Recién Modificado" });
      toast.success("Tus datos han sido actualizados.");
    } catch (e) {
      console.error("Fallo en sincronización", e);
      toast.error("Fallo grave al guardar.");
    }
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(links, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'linkvault_backup.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  // --- RENDERING --- //

  if (authLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-surface-50 dark:bg-surface-900">
        <Loader2 className="w-8 h-8 animate-spin text-surface-400 dark:text-surface-500" />
      </div>
    );
  }

  // Si existe llave de Firebase pero no hay usuario logueado -> Pantalla de Inicio
  if (import.meta.env.VITE_FIREBASE_API_KEY && !user) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-surface-50 dark:bg-[#0b1120] relative overflow-hidden font-sans transition-colors duration-200">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-accent-100 dark:bg-accent-900/40 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-50"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-amber-100 dark:bg-amber-900/40 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-50"></div>
        
        <div className="bg-white dark:bg-surface-800 p-10 rounded-2xl shadow-xl z-10 max-w-sm w-full border border-surface-100 dark:border-surface-700 flex flex-col items-center">
            <div className="w-16 h-16 bg-surface-900 dark:bg-surface-700 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
              <svg className="w-8 h-8 text-white dark:text-accent-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
              </svg>
            </div>
            <h1 className="text-3xl font-display font-black text-surface-900 dark:text-surface-50 tracking-tight mb-2">LinkVault</h1>
            <p className="text-surface-500 dark:text-surface-400 text-center text-sm mb-8 leading-relaxed">Conecta tu cuenta para acceder a tu ecosistema privado de referencias y recursos.</p>
            
            <button 
                onClick={handleLogin}
                className="w-full flex items-center justify-center space-x-3 bg-white dark:bg-surface-800 border border-surface-300 dark:border-surface-600 text-surface-700 dark:text-surface-200 py-3 px-4 rounded-xl font-bold hover:bg-surface-50 dark:hover:bg-surface-700 hover:shadow-sm transition-all active:scale-95"
            >
               <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
               <span>Ingresar con Google</span>
            </button>
        </div>
        <Toaster position="bottom-right" toastOptions={{ className: 'font-sans font-medium text-sm rounded shadow-lg' }} />
      </div>
    );
  }

  // --- MAIN APP --- //

  const breadcrumbs = ["LinkVault"];
  if (selectedCategory === '__FAVORITES__') {
    breadcrumbs.push("Favoritos");
  } else if (selectedCategory) {
    breadcrumbs.push(selectedCategory);
  } else {
    breadcrumbs.push("Toda la Biblioteca");
  }

  return (
    <div className="flex h-screen w-full bg-surface-50 dark:bg-[#0b1120] overflow-hidden font-sans text-surface-800 dark:text-surface-200 transition-colors duration-200">
      <Toaster position="bottom-right" toastOptions={{ className: 'font-sans font-medium text-sm rounded shadow-lg dark:bg-surface-800 dark:text-surface-200 dark:border dark:border-surface-700' }} />
      <Sidebar 
        links={links} 
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        onAddClick={() => setIsAddModalOpen(true)} 
        user={user}
        onLogout={handleLogout}
        onSettingsClick={() => setIsSettingsModalOpen(true)}
      />
      
      <div className="flex-[4] flex flex-col h-full overflow-hidden relative">
        <TopBar 
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          productName="LinkVault"
          breadcrumbs={breadcrumbs}
          onReset={() => {
            setSelectedCategory(null);
            setSearchQuery('');
          }}
        />
        <MainContent 
          links={links}
          selectedCategory={selectedCategory}
          searchQuery={searchQuery}
          viewMode={viewMode}
          onToggleFavorite={handleToggleFavorite}
          onUpdateLink={handleUpdateLink}
          onDeleteLink={handleDeleteLink}
        />
      </div>

      {isAddModalOpen && (
        <AddModal 
          onClose={() => setIsAddModalOpen(false)} 
          onAdd={handleAddLink} 
        />
      )}

      {isSettingsModalOpen && (
        <SettingsModal 
          onClose={() => setIsSettingsModalOpen(false)}
          preferences={preferences}
          onUpdatePreferences={updatePreferences}
          onExport={handleExport}
        />
      )}
    </div>
  );
}

export default App;
