import { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, X, Edit2, Trash2, FolderMinus } from 'lucide-react';
import type { Link } from '../types';

import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../lib/firebase';
import { toast } from 'react-hot-toast';
import { AnimatedStarButton } from './ui/AnimatedStarButton';
import { ConfirmModal } from './ui/ConfirmModal';
import { LinkCardEdit } from './LinkCardEdit';
import { compressImage } from '../lib/imageUtils';

interface LinkCardProps {
  link: Link;
  viewMode: 'grid' | 'list';
  onToggleFavorite: (e: React.MouseEvent) => void;
  onUpdateLink: (updatedData: Partial<Link>) => void;
  onDeleteLink: () => void;
  existingCategories?: string[];
  categoryColor?: string;
}



export function LinkCard({ link, viewMode, onToggleFavorite, onUpdateLink, onDeleteLink, existingCategories = [], categoryColor }: LinkCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Custom Delete Modal Trigger
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Edit State
  const [editTitle, setEditTitle] = useState(link.title);
  const [editCategory, setEditCategory] = useState(link.category);
  const [editSubcategory, setEditSubcategory] = useState(link.subcategory || '');
  const [editDesc, setEditDesc] = useState(link.description);
  const [editUrl, setEditUrl] = useState(link.url);

  // File Upload State
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

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
        const { file, extension } = await compressImage(imageFile);

        toast.loading('Subiendo nueva imagen...', { id: tId });
        const storageRef = ref(storage, `links/${Date.now()}_img.${extension}`);
        const snapshot = await uploadBytes(storageRef, file);
        imageUrl = await getDownloadURL(snapshot.ref);
      }

      await onUpdateLink({
        title: editTitle,
        category: editCategory,
        subcategory: editSubcategory.trim(),
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
    <div className={expanded ? 'flex flex-col w-full h-full' : viewMode === 'list' ? 'flex flex-row items-stretch w-full h-full' : 'flex flex-col w-full h-full'}>
      <div
        className={
          expanded
            ? 'w-full shrink-0 bg-surface-50 dark:bg-surface-900 border-b border-surface-200 dark:border-surface-700 flex items-center justify-center px-6 py-4 relative'
            : viewMode === 'grid'
              ? (isFeatured
                ? 'w-full h-52 shrink-0 bg-surface-50 dark:bg-surface-900 border-b border-surface-200 dark:border-surface-700 flex items-center justify-center overflow-hidden p-2'
                : 'w-full aspect-video shrink-0 bg-surface-50 dark:bg-surface-900 border-b border-surface-200 dark:border-surface-700 flex items-center justify-center overflow-hidden p-2')
              : 'w-24 h-24 shrink-0 border-r border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-900 flex items-center justify-center overflow-hidden p-1'
        }
        style={{ backgroundImage: 'radial-gradient(circle, var(--tw-gradient-stops))', backgroundSize: '8px 8px' }}
      >
        <img
          src={imagePreview || link.image}
          alt={link.title}
          className={expanded
            ? 'max-w-full max-h-72 sm:max-h-96 w-auto h-auto object-contain rounded shadow-md'
            : viewMode === 'list'
              ? 'w-full h-full object-contain'
              : 'w-full h-full object-contain'
          }
        />
      </div>

      <div className={`flex flex-col flex-1 min-w-0 ${expanded ? 'p-8 sm:p-12 relative' : viewMode === 'grid' ? 'p-5' : 'py-3 px-4 justify-center'}`}>
        {expanded && (
          <div className="absolute top-6 right-6 sm:top-8 sm:right-8 flex items-center space-x-2 z-10">
            {!isEditing && !showDeleteConfirm && (
              <>
                <button
                  className="bg-white dark:bg-surface-800 hover:bg-surface-50 dark:hover:bg-surface-700 text-surface-700 dark:text-surface-300 hover:text-accent-600 dark:hover:text-accent-400 rounded border border-surface-200 dark:border-surface-700 shadow-sm p-2 transition-all"
                  onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
                  title="Editar tarjeta"
                >
                  <Edit2 className="w-5 h-5" />
                </button>
                <button
                  className="bg-white dark:bg-surface-800 hover:bg-red-50 dark:hover:bg-red-900/30 text-surface-700 dark:text-surface-300 hover:text-red-500 rounded border border-surface-200 dark:border-surface-700 shadow-sm p-2 transition-all"
                  onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(true); }}
                  title="Eliminar tarjeta"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </>
            )}
            <button
              className="bg-white dark:bg-surface-800 hover:bg-surface-50 dark:hover:bg-surface-700 text-surface-900 dark:text-surface-100 rounded border border-surface-200 dark:border-surface-700 shadow-sm p-2 transition-all disabled:opacity-50"
              onClick={onCollapse}
              disabled={isUploading}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
        {!isEditing ? (
          // --- READ MODE ---
          <>
            {/* Título */}
            <div className="flex-1 min-w-0 mb-3">
              {expanded && (
                <div className="inline-block px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-surface-100 dark:bg-surface-800 text-surface-500 dark:text-surface-400 mb-3 border border-surface-200 dark:border-surface-700">
                  {link.category}
                </div>
              )}
              <h3 className={`font-cookie text-surface-900 dark:text-surface-100 ${expanded ? 'leading-normal text-5xl sm:text-6xl mb-3 whitespace-normal pb-3 pr-24' : 'leading-tight truncate ' + (isFeatured ? 'text-3xl' : 'text-2xl')}`}>
                {link.title}
              </h3>
            </div>

            {/* Descripción solo en grid/expanded */}
            {viewMode !== 'list' && (
              <p className={`text-surface-600 dark:text-surface-400 font-medium ${expanded ? 'mb-8 text-lg leading-relaxed' : isFeatured ? 'text-sm mb-3 line-clamp-3' : 'text-xs mb-3 line-clamp-2'}`}>
                {link.description}
              </p>
            )}

            {/* Barra inferior — subcategoría + iconos acción */}
            {!expanded && (
              <div className="mt-auto flex items-center justify-between gap-2">
                {viewMode !== 'list' && link.subcategory && (
                  <div className="flex flex-wrap gap-1.5 min-w-0">
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-surface-100 dark:bg-surface-800 text-[11px] font-semibold text-surface-500 dark:text-surface-400 border border-surface-200 dark:border-surface-700">
                      <FolderMinus className="w-3 h-3 mr-1 opacity-40 hidden md:inline-block" />
                      {link.subcategory}
                    </span>
                  </div>
                )}
                <div className="flex items-center space-x-2 shrink-0 relative z-10 ml-auto">
                  <AnimatedStarButton isFavorite={link.isFavorite} onClick={onToggleFavorite} />
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
                </div>
              </div>
            )}

            {/* Subcategoría en modo expandido */}
            {expanded && link.subcategory && (
              <div className="flex flex-wrap gap-1.5 mb-4">
                <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-surface-100 dark:bg-surface-800 text-[11px] font-semibold text-surface-500 dark:text-surface-400 border border-surface-200 dark:border-surface-700">
                  <FolderMinus className="w-3 h-3 mr-1 opacity-40 hidden md:inline-block" />
                  {link.subcategory}
                </span>
              </div>
            )}

            {expanded && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.15, duration: 0.2 }}
                className="mt-8 border-t border-surface-100 pt-8 flex justify-end items-center"
              >
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
          <LinkCardEdit 
            editTitle={editTitle}
            setEditTitle={setEditTitle}
            editUrl={editUrl}
            setEditUrl={setEditUrl}
            editCategory={editCategory}
            setEditCategory={setEditCategory}
            editSubcategory={editSubcategory}
            setEditSubcategory={setEditSubcategory}
            editDesc={editDesc}
            setEditDesc={setEditDesc}
            existingCategories={existingCategories}
            handleImageChange={handleImageChange}
            handleSave={handleSave}
            setIsEditing={setIsEditing}
            isUploading={isUploading}
          />
        )}
      </div>
    </div>
  );

  return (
    <>
      <motion.div
        whileHover={{ y: -4 }}
        onClick={() => !isExpanded && setIsExpanded(true)}
        className={`bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 shadow-sm overflow-hidden cursor-pointer transition-shadow duration-300 hover:shadow-xl hover:z-10 rounded w-full 
          ${isFeatured ? 'col-span-1 sm:col-span-2 lg:col-span-2 row-span-2' : ''} 
          ${viewMode === 'list' ? 'flex items-stretch h-24' : 'flex flex-col h-full'}`
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
        {!isExpanded && renderInternalContent(false)}
      </motion.div>

      {createPortal(
        <AnimatePresence>
          {isExpanded && (
            <div className="fixed inset-0 z-[9990] flex items-center justify-center p-4 sm:p-6 lg:p-8">
              {/* Backdrop */}
              <motion.div
                key="backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
                className="absolute inset-0 bg-surface-900/60 dark:bg-surface-900/85 backdrop-blur-sm"
                onClick={onCollapse}
              />

              {/* Modal panel */}
              <motion.div
                key="modal"
                initial={{ opacity: 0, scale: 0.93, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.93, y: 16 }}
                transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="bg-white dark:bg-surface-800 rounded-xl shadow-2xl overflow-hidden relative z-10 w-full max-w-4xl max-h-[90vh] flex flex-col"
              >
                <ConfirmModal 
                  isOpen={showDeleteConfirm}
                  title="¿Eliminar Definitivamente?"
                  description={`Estás a punto de borrar "${link.title}". Esta acción eliminará los datos y su imagen de tu base de datos y no se puede deshacer.`}
                  onCancel={(e) => { e.stopPropagation(); setShowDeleteConfirm(false); }}
                  onConfirm={handleDelete}
                />

                <div className="flex-1 overflow-y-auto w-full flex flex-col relative h-full">
                  {renderInternalContent(true)}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}
