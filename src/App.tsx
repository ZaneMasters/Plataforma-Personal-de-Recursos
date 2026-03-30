import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { MainContent } from './components/MainContent';
import * as XLSX from 'xlsx';
import { AddModal } from './components/AddModal';
import { AuthScreen } from './components/AuthScreen';
import { SettingsModal } from './components/SettingsModal';
import { mockLinks } from './data/mockData';
import type { Link } from './types';
import { useUserPreferences } from './hooks/useUserPreferences';
import { Toaster, toast } from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

// Firebase imports
import { collection, onSnapshot, setDoc, doc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';
import { signInWithPopup, onAuthStateChanged, signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { db, storage, auth, googleProvider } from './lib/firebase';

function App() {
  const [links, setLinks] = useState<Link[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode] = useState<'grid' | 'list'>('grid');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
    // Definimos los datos, omitiendo la imagen y el ID
    const data = links.map(link => ({
      'Título': link.title,
      'URL': link.url,
      'Categoría': link.category,
      'Etiquetas': link.tags.length > 0 ? link.tags.join(', ') : '',
      'Descripción': link.description,
      'Fecha Modificación': link.modifiedAt,
      'Favorito': link.isFavorite ? 'Sí' : 'No'
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Links Backup");

    // Guardar archivo .xlsx
    XLSX.writeFile(workbook, "linkvault_backup.xlsx");
    toast.success("¡Respaldo XLSX descargado!");
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
      <AuthScreen
        onGoogleLogin={handleLogin}
        onEmailLogin={handleEmailLogin}
        onEmailRegister={handleEmailRegister}
      />
    );
  }

  // --- MAIN APP --- //

  const existingCategories = Array.from(new Set(links.map(link => link.category))).sort();

  const categoryColors = preferences.categoryColors || {};

  const handleSetCategoryColor = (category: string, color: string) => {
    const updated = { ...categoryColors };
    if (color) {
      updated[category] = color;
    } else {
      delete updated[category];
    }
    updatePreferences({ categoryColors: updated });
  };

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
      
      {/* Mobile Drawer Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-surface-900/60 dark:bg-black/60 backdrop-blur-sm z-30 md:hidden animate-[fadeIn_0.3s_ease-out]" 
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - Floating Drawer on Mobile, Static on Desktop */}
      <div className={`fixed inset-y-0 left-0 z-40 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <Sidebar 
          links={links} 
          selectedCategory={selectedCategory}
          onSelectCategory={(cat) => {
             setSelectedCategory(cat);
             setIsMobileMenuOpen(false);
          }}
          onAddClick={() => {
             setIsAddModalOpen(true);
             setIsMobileMenuOpen(false);
          }} 
          user={user}
          onLogout={handleLogout}
          onSettingsClick={() => {
             setIsSettingsModalOpen(true);
             setIsMobileMenuOpen(false);
          }}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
          categoryColors={categoryColors}
          onSetCategoryColor={handleSetCategoryColor}
        />
      </div>
      
      <div className="flex-1 flex flex-col h-full overflow-hidden relative w-full">
        <TopBar 
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          productName="LinkVault"
          breadcrumbs={breadcrumbs}
          onReset={() => {
            setSelectedCategory(null);
            setSearchQuery('');
          }}
          onMenuClick={() => setIsMobileMenuOpen(true)}
        />
        <MainContent 
          links={links}
          selectedCategory={selectedCategory}
          searchQuery={searchQuery}
          viewMode={viewMode}
          onToggleFavorite={handleToggleFavorite}
          onUpdateLink={handleUpdateLink}
          onDeleteLink={handleDeleteLink}
          existingCategories={existingCategories}
          categoryColors={categoryColors}
        />
      </div>

      {isAddModalOpen && (
        <AddModal 
          onClose={() => setIsAddModalOpen(false)} 
          onAdd={handleAddLink} 
          existingCategories={existingCategories}
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
