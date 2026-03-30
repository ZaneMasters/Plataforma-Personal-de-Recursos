import { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, Clock, Tag, X, Star, Edit2, Save, Image as ImageIcon, Loader2, Trash2 } from 'lucide-react';
import type { Link } from '../types';

import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../lib/firebase';
import { toast } from 'react-hot-toast';
import imageCompression from 'browser-image-compression';

interface LinkCardProps {
  link: Link;
  viewMode: 'grid' | 'list';
  onToggleFavorite: (e: React.MouseEvent) => void;
  onUpdateLink: (updatedData: Partial<Link>) => void;
  onDeleteLink: () => void;
  existingCategories?: string[];
  categoryColor?: string;
}

const AnimatedStarButton = ({ isFavorite, onClick }: { isFavorite: boolean | undefined; onClick: (e: React.MouseEvent) => void }) => {
  const [isBursting, setIsBursting] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isFavorite) {
      setIsBursting(true);
      setTimeout(() => setIsBursting(false), 800);
    }
    onClick(e);
  };

  const particleColors = [
    'text-amber-400', 
    'text-yellow-500', 
    'text-orange-400', 
    'text-pink-400', 
    'text-rose-400',
    'text-purple-400'
  ];

  return (
    <div className="relative">
      <button 
        onClick={handleClick}
        title={isFavorite ? "Quitar de Favoritos" : "Añadir a Favoritos"}
        className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors relative z-10 ${isFavorite ? 'bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 shadow-sm' : 'bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 hover:bg-surface-100 dark:hover:bg-surface-700'}`}
      >
        <Star className={`w-4 h-4 transition-colors ${isFavorite ? 'fill-amber-400 text-amber-500' : 'text-surface-400'}`} />
      </button>
      
      <AnimatePresence>
        {isBursting && (
          <div className="absolute inset-0 pointer-events-none z-0">
            {[...Array(6)].map((_, i) => {
              const angle = (i * 360) / 6 - 90; 
              const rad = (angle * Math.PI) / 180;
              const x = Math.cos(rad) * 45; 
              const y = Math.sin(rad) * 45;
              const colorClass = particleColors[i % particleColors.length];
              return (
                <motion.div
                  key={i}
                  initial={{ x: "-50%", y: "-50%", opacity: 1, scale: 0, rotate: 0 }}
                  animate={{ 
                    x: `calc(-50% + ${x}px)`, 
                    y: `calc(-50% + ${y}px)`, 
                    opacity: [1, 1, 0], 
                    scale: [0, 1.2, 0], 
                    rotate: [0, 180] 
                  }}
                  transition={{ duration: 0.7, ease: "easeOut" }}
                  className={`absolute top-1/2 left-1/2 ${colorClass}`}
                >
                  <Star className="w-3 h-3 fill-current" />
                </motion.div>
              );
            })}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export function LinkCard({ link, viewMode, onToggleFavorite, onUpdateLink, onDeleteLink, existingCategories = [], categoryColor }: LinkCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  // Custom Delete Modal Trigger
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Edit State
  const [editTitle, setEditTitle] = useState(link.title);
  const [editCategory, setEditCategory] = useState(link.category);
  const [editTags, setEditTags] = useState(link.tags.join(', '));
  const [editDesc, setEditDesc] = useState(link.description);
  const [editUrl, setEditUrl] = useState(link.url);

  // File Upload State
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isFeatured = link.isFavorite && viewMode === 'grid';

  const onCollapse = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setIsExpanded(false);
    setIsEditing(false);
    setShowDeleteConfirm(false);
    setImagePreview(null);
    setImageFile(null);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsUploading(true);
    const tId = toast.loading('Actualizando...');
    
    try {
      let imageUrl = link.image;
      
      if (imageFile) {
        if (!import.meta.env.VITE_FIREBASE_API_KEY) {
           toast.error("Requiere conexión a Firebase.", { id: tId });
           setIsUploading(false); return;
        }

        toast.loading('Optimizando imagen...', { id: tId });
        let fileToUpload: File | Blob = imageFile;
        let extension = imageFile.name.split('.').pop() || 'jpg';
        
        try {
          const options = {
            maxSizeMB: 0.15,
            maxWidthOrHeight: 800,
            useWebWorker: true,
            fileType: 'image/webp'
          };
          fileToUpload = await imageCompression(imageFile, options);
          extension = 'webp';
        } catch (compErr) {
          console.warn('Error comprimiendo la imagen. Subiendo original:', compErr);
        }

        toast.loading('Subiendo nueva imagen...', { id: tId });
        const storageRef = ref(storage, `links/${Date.now()}_img.${extension}`);
        const snapshot = await uploadBytes(storageRef, fileToUpload);
        imageUrl = await getDownloadURL(snapshot.ref);
      }

      await onUpdateLink({
        title: editTitle,
        category: editCategory,
        tags: editTags.split(',').map(t => t.trim()).filter(Boolean),
        description: editDesc,
        url: editUrl,
        image: imageUrl
      });
      setIsEditing(false);
      setImageFile(null);
      toast.dismiss(tId);
    } catch (err) {
      console.error(err);
      toast.error('Error al actualizar enlace.', { id: tId });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDeleteLink();
    setShowDeleteConfirm(false);
  };

  const renderInternalContent = (expanded: boolean) => (
    <>
      <motion.div 
        layoutId={`image-container-${link.id}`} 
        className={
          expanded ? 'w-full h-80 sm:h-96 relative shrink-0 bg-surface-100 dark:bg-surface-800 border-b border-surface-200 dark:border-surface-700' : 
          viewMode === 'grid' ? (isFeatured ? 'w-full h-48 relative shrink-0 bg-surface-100 dark:bg-surface-800 border-b border-surface-200 dark:border-surface-700' : 'w-full aspect-video relative shrink-0 bg-surface-100 dark:bg-surface-800 border-b border-surface-200 dark:border-surface-700') : 
          'w-24 h-full shrink-0 border-r border-surface-200 dark:border-surface-700 bg-surface-100 dark:bg-surface-800'
        }
      >
        <img src={imagePreview || link.image} alt={link.title} className="w-full h-full object-cover" />
        
        {expanded && (
          <div className="absolute top-6 right-6 flex items-center space-x-2 z-10">
            {!isEditing && !showDeleteConfirm && (
              <>
                <button 
                  className="bg-white/80 dark:bg-surface-800/80 hover:bg-white dark:hover:bg-surface-800 text-surface-700 dark:text-surface-300 hover:text-accent-600 dark:hover:text-accent-400 rounded border border-surface-200 dark:border-surface-700 shadow-sm p-2 backdrop-blur-md transition-all"
                  onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
                  title="Editar tarjeta"
                >
                  <Edit2 className="w-5 h-5" />
                </button>
                <button 
                  className="bg-white/80 dark:bg-surface-800/80 hover:bg-red-50 dark:hover:bg-red-900/30 text-surface-700 dark:text-surface-300 hover:text-red-500 rounded border border-surface-200 dark:border-surface-700 shadow-sm p-2 backdrop-blur-md transition-all"
                  onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(true); }}
                  title="Eliminar tarjeta"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </>
            )}
            <button 
               className="bg-white/80 dark:bg-surface-800/80 hover:bg-white dark:hover:bg-surface-800 text-surface-900 dark:text-surface-100 rounded border border-surface-200 dark:border-surface-700 shadow-sm p-2 backdrop-blur-md transition-all disabled:opacity-50"
               onClick={onCollapse}
               disabled={isUploading}
             >
               <X className="w-5 h-5" />
             </button>
          </div>
        )}
      </motion.div>

      <div className={`flex flex-col flex-1 ${expanded ? 'p-8 sm:p-12' : viewMode === 'grid' ? 'p-5' : 'py-3 px-5 justify-center'}`}>
        {!isEditing ? (
          // --- READ MODE ---
          <>
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 pr-4">
                {expanded && (
                  <div className="inline-block px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-surface-100 dark:bg-surface-800 text-surface-500 dark:text-surface-400 mb-3 border border-surface-200 dark:border-surface-700">
                    {link.category}
                  </div>
                )}
                <motion.h3 layoutId={`title-${link.id}`} className={`font-cookie text-surface-900 dark:text-surface-100 leading-tight ${expanded ? 'text-5xl sm:text-6xl mb-3' : isFeatured ? 'text-3xl' : 'text-2xl truncate max-w-xs'}`}>
                  {link.title}
                </motion.h3>
              </div>
              <div className="flex items-center space-x-2 shrink-0 relative z-10">
                <AnimatedStarButton isFavorite={link.isFavorite} onClick={onToggleFavorite} />
                {viewMode === 'grid' && !expanded && (
                  <a 
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="w-8 h-8 rounded-full bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 flex items-center justify-center text-surface-400 dark:text-surface-500 hover:bg-accent-50 dark:hover:bg-accent-900/30 hover:text-accent-600 dark:hover:text-accent-400 hover:border-accent-200 dark:hover:border-accent-700/50 transition-all shadow-sm"
                    title="Abrir enlace externo"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
            
            <motion.p
              layoutId={`desc-${link.id}`}
              className={`text-surface-600 dark:text-surface-400 font-medium ${expanded ? 'mb-8 text-lg leading-relaxed' : isFeatured ? 'text-sm mb-4 line-clamp-3' : 'text-xs mb-4 line-clamp-2'}`}
            >
              {link.description}
            </motion.p>

            <div className="mt-auto flex justify-between items-center">
              <motion.div layoutId={`tags-${link.id}`} className={`flex flex-wrap gap-1.5 ${expanded ? 'mb-4' : ''}`}>
                {link.tags.slice(0, expanded ? link.tags.length : isFeatured ? 3 : 1).map(tag => (
                  <span key={tag} className="inline-flex items-center px-1.5 py-0.5 rounded bg-surface-100 dark:bg-surface-800 text-[11px] font-semibold text-surface-500 dark:text-surface-400 border border-surface-200 dark:border-surface-700">
                    <Tag className="w-3 h-3 mr-1 opacity-40 hidden md:inline-block" />
                    {tag}
                  </span>
                ))}
                {!expanded && link.tags.length > (isFeatured ? 3 : 1) && (
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-medium text-surface-400 dark:text-surface-500">
                    +{link.tags.length - (isFeatured ? 3 : 1)}
                  </span>
                )}
              </motion.div>
              
              {!expanded && link.modifiedAt && (
                <div className="flex items-center text-surface-400 text-[11px] font-medium shrink-0 ml-4">
                  <Clock className="w-3 h-3 mr-1" />
                  {link.modifiedAt}
                </div>
              )}
            </div>
            
            {expanded && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.15, duration: 0.2 }}
                className="mt-8 border-t border-surface-100 pt-8 flex justify-between items-center"
              >
                <div className="flex items-center text-surface-500 dark:text-surface-400 text-sm font-medium">
                   <Clock className="w-4 h-4 mr-2 text-surface-400 dark:text-surface-500" /> Actualizado: {link.modifiedAt || 'Desconocido'}
                </div>
                <a 
                  href={link.url} 
                  target="_blank" 
                  rel="noreferrer"
                  className="inline-flex items-center px-6 py-2.5 bg-accent-600 hover:bg-accent-700 dark:bg-accent-500 dark:hover:bg-accent-600 text-white rounded font-bold text-sm shadow-sm active:scale-95 transition-all"
                  onClick={e => e.stopPropagation()}
                >
                  Acceder al Recurso <ExternalLink className="w-4 h-4 ml-2" />
                </a>
              </motion.div>
            )}
          </>
        ) : (
          // --- EDIT MODE ---
          <motion.div 
             initial={{ opacity: 0 }} 
             animate={{ opacity: 1 }} 
             className="flex flex-col gap-4 w-full"
             onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-2">
               <h3 className="font-cookie text-3xl text-surface-800 dark:text-surface-100">Editar Referencia</h3>
               <div 
                  className="px-4 py-2 border-2 border-dashed border-surface-300 dark:border-surface-600 rounded-lg flex items-center justify-center cursor-pointer hover:border-accent-400 hover:bg-accent-50/50 dark:hover:border-accent-500 dark:hover:bg-accent-900/30 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                  title="Subir Imagen Nueva"
                >
                  <ImageIcon className="w-4 h-4 text-surface-500 dark:text-surface-400 mr-2" />
                  <span className="text-xs font-bold text-surface-600 dark:text-surface-400">Cambiar Imagen</span>
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageChange} />
               </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-xs font-bold text-surface-600 dark:text-surface-300 uppercase tracking-widest mb-1.5" style={{letterSpacing:'0.12em'}}>Título</label>
                <input type="text" value={editTitle} onChange={e => setEditTitle(e.target.value)} className="w-full bg-white dark:bg-surface-900/50 border border-surface-200 dark:border-surface-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-accent-500 text-surface-800 dark:text-surface-100" />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-bold text-surface-600 dark:text-surface-300 uppercase tracking-widest mb-1.5" style={{letterSpacing:'0.12em'}}>URL</label>
                <input type="url" value={editUrl} onChange={e => setEditUrl(e.target.value)} className="w-full bg-white dark:bg-surface-900/50 border border-surface-200 dark:border-surface-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-accent-500 text-surface-800 dark:text-surface-100" />
              </div>
              <div className="col-span-1">
                <label className="block text-xs font-bold text-surface-600 dark:text-surface-300 uppercase tracking-widest mb-1.5" style={{letterSpacing:'0.12em'}}>Categoría</label>
                <input type="text" value={editCategory} onChange={e => setEditCategory(e.target.value)} className="w-full bg-white dark:bg-surface-900/50 border border-surface-200 dark:border-surface-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-accent-500 text-surface-800 dark:text-surface-100" />
                {existingCategories.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {existingCategories.map(cat => (
                      <button
                        key={cat}
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setEditCategory(cat); }}
                        className={`text-[10px] px-2 py-0.5 rounded-full border transition-colors font-medium ${
                          editCategory === cat 
                          ? 'bg-accent-100 dark:bg-accent-900/40 text-accent-700 dark:text-accent-300 border-accent-300 dark:border-accent-700' 
                          : 'bg-surface-50 dark:bg-surface-800 text-surface-500 dark:text-surface-400 border-surface-200 dark:border-surface-700 hover:border-accent-300 dark:hover:border-accent-700'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="col-span-1">
                <label className="block text-xs font-bold text-surface-600 dark:text-surface-300 uppercase tracking-widest mb-1.5" style={{letterSpacing:'0.12em'}}>Etiquetas (separadas por coma)</label>
                <input type="text" value={editTags} onChange={e => setEditTags(e.target.value)} className="w-full bg-white dark:bg-surface-900/50 border border-surface-200 dark:border-surface-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-accent-500 text-surface-800 dark:text-surface-100" />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-bold text-surface-600 dark:text-surface-300 uppercase tracking-widest mb-1.5" style={{letterSpacing:'0.12em'}}>Notas / Descripción</label>
                <textarea rows={4} value={editDesc} onChange={e => setEditDesc(e.target.value)} className="w-full bg-white dark:bg-surface-900/50 border border-surface-200 dark:border-surface-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-accent-500 text-surface-800 dark:text-surface-100 resize-none" />
              </div>
            </div>

            <div className="mt-6 border-t border-surface-100 dark:border-surface-700 pt-6 flex justify-end items-center gap-3">
              <button 
                className="px-5 py-2 text-sm font-medium text-surface-600 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800 rounded transition-colors disabled:opacity-50"
                onClick={() => setIsEditing(false)}
                disabled={isUploading}
              >
                Cancelar
              </button>
              <button 
                className="inline-flex items-center px-6 py-2 bg-accent-600 text-white rounded font-bold text-sm shadow-sm hover:bg-accent-700 active:scale-95 transition-all disabled:opacity-75 disabled:active:scale-100"
                onClick={handleSave}
                disabled={isUploading}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <><Save className="w-4 h-4 mr-2" /> Guardar Cambios</>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </>
  );

  return (
    <>
      <motion.div
        whileHover={{ y: -4 }}
        onClick={() => !isExpanded && setIsExpanded(true)}
        className={`bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 shadow-sm overflow-hidden cursor-pointer transition-shadow duration-300 hover:shadow-xl hover:z-10 rounded w-full 
          ${isFeatured ? 'col-span-1 sm:col-span-2 lg:col-span-2 row-span-2' : ''} 
          ${viewMode === 'list' ? 'flex items-center h-24' : 'flex flex-col h-full'}`
        }
        style={categoryColor ? (() => {
            const isDark = document.documentElement.classList.contains('dark');
            return {
              background: isDark
                ? `linear-gradient(145deg, ${categoryColor}72 0%, ${categoryColor}44 55%, ${categoryColor}22 100%)`
                : `linear-gradient(145deg, ${categoryColor}42 0%, ${categoryColor}22 55%, ${categoryColor}0e 100%)`
            };
          })() : undefined}
      >
        <div className="w-full h-full">
          {renderInternalContent(false)}
        </div>
      </motion.div>

      <AnimatePresence>
        {isExpanded && createPortal(
          <div className="fixed inset-0 z-[9990] flex items-center justify-center p-4 sm:p-6 lg:p-8">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="absolute inset-0 bg-surface-900/60 dark:bg-surface-900/85 backdrop-blur-sm"
              onClick={onCollapse}
            />

            {/* Modal panel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.93, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.93, y: 16 }}
              transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="bg-white dark:bg-surface-800 rounded-xl shadow-2xl overflow-hidden relative z-10 w-full max-w-4xl max-h-[90vh] flex flex-col"
            >
              {/* Delete confirm overlay */}
              <AnimatePresence>
                {showDeleteConfirm && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="absolute inset-0 bg-white/95 dark:bg-surface-800/95 backdrop-blur-sm z-[100] flex flex-col items-center justify-center p-8 text-center"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mb-6 border border-red-200 dark:border-red-900/50">
                      <Trash2 className="w-8 h-8" />
                    </div>
                    <h3 className="text-2xl font-bold text-surface-900 dark:text-surface-50 mb-2 font-display tracking-tight">¿Eliminar Definitivamente?</h3>
                    <p className="text-surface-500 dark:text-surface-400 mb-8 max-w-sm leading-relaxed text-sm">
                      Estás a punto de borrar &quot;{link.title}&quot;. Esta acción eliminará los datos y su imagen de tu base de datos y no se puede deshacer.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center gap-3">
                      <button
                        className="px-6 py-2.5 text-sm font-bold text-surface-600 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-700/50 rounded-lg transition-colors w-full sm:w-auto"
                        onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(false); }}
                      >
                        Cancelar
                      </button>
                      <button
                        className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded shadow-sm transition-all active:scale-95 w-full sm:w-auto"
                        onClick={handleDelete}
                      >
                        Sí, Descartar Enlace
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex-1 overflow-y-auto w-full flex flex-col relative h-full">
                {renderInternalContent(true)}
              </div>
            </motion.div>
          </div>,
          document.body
        )}
      </AnimatePresence>
    </>
  );
}
