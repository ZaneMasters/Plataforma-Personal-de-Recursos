import { LinkCard } from './LinkCard';
import { motion } from 'framer-motion';
import { FolderOpen } from 'lucide-react';
import type { Link } from '../types';

interface MainContentProps {
  links: Link[];
  selectedCategory: string | null;
  searchQuery: string;
  viewMode: 'grid' | 'list';
  onToggleFavorite: (id: string) => void;
  onUpdateLink: (id: string, updatedData: Partial<Link>) => void;
  onDeleteLink: (id: string, imageUrl?: string) => void;
}

export function MainContent({ links, selectedCategory, searchQuery, viewMode, onToggleFavorite, onUpdateLink, onDeleteLink }: MainContentProps) {
  
  // Filter logic: Category select + Search
  const filteredLinks = links.filter(l => {
    const matchesCategory = selectedCategory === '__FAVORITES__' 
      ? l.isFavorite 
      : (selectedCategory ? l.category === selectedCategory : true);
      
    if (!searchQuery) return matchesCategory;
    
    const query = searchQuery.toLowerCase();
    return matchesCategory && (
      l.title.toLowerCase().includes(query) ||
      l.description.toLowerCase().includes(query) ||
      l.url.toLowerCase().includes(query) ||
      l.category.toLowerCase().includes(query) ||
      l.tags.some(t => t.toLowerCase().includes(query))
    );
  });

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  if (filteredLinks.length === 0) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-surface-400 dark:text-surface-500 p-8 transition-colors">
        <FolderOpen className="w-16 h-16 mb-4 text-surface-300 dark:text-surface-600" />
        <p className="font-medium text-lg text-surface-500 dark:text-surface-400">
          {searchQuery ? "No se encontraron recursos con esa búsqueda" : "No hay referencias en esta categoría. ¡Añade tu primer enlace!"}
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto w-full">
      <div className="max-w-[1600px] mx-auto w-full h-full p-6 sm:p-8 lg:p-10">
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className={viewMode === 'grid' 
          ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 pb-20 auto-rows-min" 
          : "flex flex-col gap-3 pb-20"}
        >
          {filteredLinks.map((link) => (
            <motion.div key={link.id} className={link.isFavorite && viewMode === 'grid' ? "col-span-1 sm:col-span-2 lg:col-span-2 row-span-2" : ""}>
              <LinkCard 
                link={link} 
                viewMode={viewMode} 
                onToggleFavorite={(e) => { e.stopPropagation(); onToggleFavorite(link.id) }} 
                onUpdateLink={(updated) => onUpdateLink(link.id, updated)}
                onDeleteLink={() => onDeleteLink(link.id, link.image)}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
