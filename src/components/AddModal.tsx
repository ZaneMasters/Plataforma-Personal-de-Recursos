import { useState, useRef } from 'react';
import { X, Loader2, Image as ImageIcon } from 'lucide-react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../lib/firebase';
import { toast } from 'react-hot-toast';
import imageCompression from 'browser-image-compression';

interface AddModalProps {
  onClose: () => void;
  onAdd: (linkData: any) => void;
  existingCategories?: string[];
}

export function AddModal({ onClose, onAdd, existingCategories = [] }: AddModalProps) {
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState('');
  
  // Image Upload State
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url || !title) return;
    
    setIsUploading(true);
    const toastId = toast.loading('Guardando referencia...');
    
    try {
      let imageUrl = "https://images.unsplash.com/photo-1542435503-956c469947f6?auto=format&fit=crop&q=80&w=1000"; // fallback
      
      if (imageFile) {
        if (!import.meta.env.VITE_FIREBASE_API_KEY) {
          toast.error("Para subir imágenes propias, Firebase debe estar activado.", { id: toastId });
          setIsUploading(false);
          return;
        }
        
        toast.loading('Optimizando imagen...', { id: toastId });
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

        toast.loading('Subiendo imagen a la nube...', { id: toastId });
        const storageRef = ref(storage, `links/${Date.now()}_img.${extension}`);
        const snapshot = await uploadBytes(storageRef, fileToUpload);
        imageUrl = await getDownloadURL(snapshot.ref);
      }
      
      const newLink = {
        id: Math.random().toString(36).substring(7),
        url,
        title,
        description,
        category: category || 'Sin Categoría',
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
        image: imageUrl, 
        modifiedAt: "Justo ahora",
        isFavorite: false
      };
  
      await onAdd(newLink);
      toast.success('¡Referencia añadida con éxito!', { id: toastId });
      onClose();
    } catch (error) {
      console.error("Error creating reference:", error);
      toast.error('Revisa tu conexión o configuración de Firebase.', { id: toastId });
      setIsUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-surface-900/60 dark:bg-surface-900/80 backdrop-blur-sm" onClick={onClose} />
      <div className="bg-white dark:bg-surface-800 rounded border border-surface-200 dark:border-surface-700 shadow-2xl w-full max-w-[600px] relative z-10 flex flex-col max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-surface-100 dark:border-surface-700 bg-surface-50/50 dark:bg-surface-800/50">
          <h2 className="font-cookie text-3xl text-surface-800 dark:text-surface-100">Añadir Nueva Referencia</h2>
          <button onClick={onClose} disabled={isUploading} className="text-surface-400 dark:text-surface-500 hover:text-surface-600 dark:hover:text-surface-300 p-1 disabled:opacity-50 transition-colors"><X className="w-5 h-5"/></button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
          <div className="col-span-1 border-b border-surface-100 dark:border-surface-700 pb-5">
              <label className="block text-xs font-bold text-surface-600 dark:text-surface-300 uppercase tracking-widest mb-1.5" style={{letterSpacing:'0.12em'}}>Imagen de Portada</label>
            <div 
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`w-full h-36 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors overflow-hidden relative group
                ${imagePreview ? 'border-accent-300 bg-accent-50 dark:bg-accent-900/30 dark:border-accent-800' : 'border-surface-300 dark:border-surface-600 bg-surface-50 dark:bg-surface-900/50 hover:bg-surface-100 dark:hover:bg-surface-800 hover:border-surface-400 dark:hover:border-surface-500'}`}
            >
              {imagePreview ? (
                <>
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-surface-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <span className="text-white font-bold text-sm bg-black/50 px-3 py-1.5 rounded">Cambiar Imagen</span>
                  </div>
                </>
              ) : (
                <>
                  <ImageIcon className="w-8 h-8 text-surface-400 dark:text-surface-500 mb-2" />
                  <p className="text-sm font-semibold text-surface-600 dark:text-surface-300">Haz clic para subir o arrastra un archivo</p>
                  <p className="text-xs text-surface-500 dark:text-surface-400 mt-1">SVG, PNG, JPG (max. 800x400px)</p>
                </>
              )}
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*"
                onChange={handleImageChange}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-bold text-surface-600 dark:text-surface-300 uppercase tracking-widest mb-1.5" style={{letterSpacing:'0.12em'}}>URL <span className="text-red-500">*</span></label>
              <input required type="url" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://..." className="w-full bg-white dark:bg-surface-900/50 border border-surface-200 dark:border-surface-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-accent-500 text-surface-800 dark:text-surface-100 focus:shadow-sm transition-shadow" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-bold text-surface-600 dark:text-surface-300 uppercase tracking-widest mb-1.5" style={{letterSpacing:'0.12em'}}>Título <span className="text-red-500">*</span></label>
              <input required type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Título de la referencia" className="w-full bg-white dark:bg-surface-900/50 border border-surface-200 dark:border-surface-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-accent-500 text-surface-800 dark:text-surface-100 focus:shadow-sm transition-shadow" />
            </div>
            <div className="col-span-1">
              <label className="block text-xs font-bold text-surface-600 dark:text-surface-300 uppercase tracking-widest mb-1.5" style={{letterSpacing:'0.12em'}}>Categoría</label>
              <input type="text" value={category} onChange={e => setCategory(e.target.value)} placeholder="ej. Sistemas de Diseño" className="w-full bg-white dark:bg-surface-900/50 border border-surface-200 dark:border-surface-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-accent-500 text-surface-800 dark:text-surface-100 focus:shadow-sm transition-shadow" />
              {existingCategories.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {existingCategories.map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      className={`text-[10px] px-2 py-0.5 rounded-full border transition-colors font-medium ${
                        category === cat 
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
              <label className="block text-xs font-bold text-surface-600 dark:text-surface-300 uppercase tracking-widest mb-1.5" style={{letterSpacing:'0.12em'}}>Etiquetas</label>
              <input type="text" value={tags} onChange={e => setTags(e.target.value)} placeholder="Separadas por coma (ej. react, ui)" className="w-full bg-white dark:bg-surface-900/50 border border-surface-200 dark:border-surface-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-accent-500 text-surface-800 dark:text-surface-100 focus:shadow-sm transition-shadow" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-bold text-surface-600 dark:text-surface-300 uppercase tracking-widest mb-1.5" style={{letterSpacing:'0.12em'}}>Notas</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Descripción corta..." rows={3} className="w-full bg-white dark:bg-surface-900/50 border border-surface-200 dark:border-surface-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-accent-500 text-surface-800 dark:text-surface-100 resize-none focus:shadow-sm transition-shadow" />
            </div>
          </div>

          <div className="mt-4 flex justify-end gap-3 border-t border-surface-100 dark:border-surface-700 pt-5">
            <button type="button" onClick={onClose} disabled={isUploading} className="px-4 py-2 text-sm font-medium text-surface-500 dark:text-surface-400 hover:text-surface-800 dark:hover:text-surface-200 transition-colors disabled:opacity-50">Cancelar</button>
            <button type="submit" disabled={isUploading} className="px-5 py-2 text-sm font-bold bg-accent-600 hover:bg-accent-700 dark:bg-accent-500 dark:hover:bg-accent-600 text-white rounded shadow-sm active:scale-95 transition-all disabled:opacity-75 disabled:active:scale-100 flex items-center">
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Subiendo...
                </>
              ) : (
                'Guardar Referencia'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
