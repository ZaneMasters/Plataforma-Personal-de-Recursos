import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { MainContent } from './components/MainContent';
import { AddModal } from './components/AddModal';
import { AuthScreen } from './components/AuthScreen';
import { SettingsModal } from './components/SettingsModal';
import { useUserPreferences } from './hooks/useUserPreferences';
import { Toaster } from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

import { useLinks } from './hooks/useLinks';
import { useAuth } from './hooks/useAuth';

function App() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode] = useState<'grid' | 'list'>('grid');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const { user, authLoading, handleLogin, handleEmailLogin, handleEmailRegister, handleLogout } = useAuth();
  const { links, handleAddLink, handleDeleteLink, handleToggleFavorite, handleUpdateLink, handleExport } = useLinks(user);
  
  // User Preferences
  const { preferences, updatePreferences } = useUserPreferences(user);

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

  const breadcrumbs = ['LinkVault'];
  if (selectedCategory === '__FAVORITES__') {
    breadcrumbs.push('Favoritos');
  } else if (selectedCategory) {
    breadcrumbs.push(selectedCategory);
    if (selectedSubcategory) breadcrumbs.push(selectedSubcategory);
  } else {
    breadcrumbs.push('Toda la Biblioteca');
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
          selectedSubcategory={selectedSubcategory}
          onSelectCategory={(cat, sub = null) => {
             setSelectedCategory(cat);
             setSelectedSubcategory(sub ?? null);
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
          selectedSubcategory={selectedSubcategory}
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
