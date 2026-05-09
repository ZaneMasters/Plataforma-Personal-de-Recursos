import { useRef } from 'react';
import { motion } from 'framer-motion';
import { Save, Image as ImageIcon, Loader2 } from 'lucide-react';

interface LinkCardEditProps {
  editTitle: string;
  setEditTitle: (val: string) => void;
  editUrl: string;
  setEditUrl: (val: string) => void;
  editCategory: string;
  setEditCategory: (val: string) => void;
  editSubcategory: string;
  setEditSubcategory: (val: string) => void;
  editDesc: string;
  setEditDesc: (val: string) => void;
  existingCategories: string[];
  handleImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSave: (e: React.MouseEvent) => void;
  setIsEditing: (val: boolean) => void;
  isUploading: boolean;
}

export const LinkCardEdit = ({
  editTitle, setEditTitle,
  editUrl, setEditUrl,
  editCategory, setEditCategory,
  editSubcategory, setEditSubcategory,
  editDesc, setEditDesc,
  existingCategories,
  handleImageChange,
  handleSave,
  setIsEditing,
  isUploading
}: LinkCardEditProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
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
          <label className="block text-xs font-bold text-surface-600 dark:text-surface-300 uppercase tracking-widest mb-1.5" style={{ letterSpacing: '0.12em' }}>Título</label>
          <input type="text" value={editTitle} onChange={e => setEditTitle(e.target.value)} className="w-full bg-white dark:bg-surface-900/50 border border-surface-200 dark:border-surface-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-accent-500 text-surface-800 dark:text-surface-100" />
        </div>
        <div className="col-span-2">
          <label className="block text-xs font-bold text-surface-600 dark:text-surface-300 uppercase tracking-widest mb-1.5" style={{ letterSpacing: '0.12em' }}>URL</label>
          <input type="url" value={editUrl} onChange={e => setEditUrl(e.target.value)} className="w-full bg-white dark:bg-surface-900/50 border border-surface-200 dark:border-surface-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-accent-500 text-surface-800 dark:text-surface-100" />
        </div>
        <div className="col-span-1">
          <label className="block text-xs font-bold text-surface-600 dark:text-surface-300 uppercase tracking-widest mb-1.5" style={{ letterSpacing: '0.12em' }}>Categoría</label>
          <input type="text" value={editCategory} onChange={e => setEditCategory(e.target.value)} className="w-full bg-white dark:bg-surface-900/50 border border-surface-200 dark:border-surface-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-accent-500 text-surface-800 dark:text-surface-100" />
          {existingCategories.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {existingCategories.map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setEditCategory(cat); }}
                  className={`text-[10px] px-2 py-0.5 rounded-full border transition-colors font-medium ${editCategory === cat
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
          <label className="block text-xs font-bold text-surface-600 dark:text-surface-300 uppercase tracking-widest mb-1.5" style={{ letterSpacing: '0.12em' }}>Subcategoría</label>
          <input type="text" value={editSubcategory} onChange={e => setEditSubcategory(e.target.value)} className="w-full bg-white dark:bg-surface-900/50 border border-surface-200 dark:border-surface-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-accent-500 text-surface-800 dark:text-surface-100" />
        </div>
        <div className="col-span-2">
          <label className="block text-xs font-bold text-surface-600 dark:text-surface-300 uppercase tracking-widest mb-1.5" style={{ letterSpacing: '0.12em' }}>Notas / Descripción</label>
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
  );
};
