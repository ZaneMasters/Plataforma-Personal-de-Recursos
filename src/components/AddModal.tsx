import { useState, useRef } from 'react';
import { X, Loader2, Image as ImageIcon } from 'lucide-react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../lib/firebase';
import { toast } from 'react-hot-toast';

interface AddModalProps {
  onClose: () => void;
  onAdd: (linkData: any) => void;
}

export function AddModal({ onClose, onAdd }: AddModalProps) {
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
        toast.loading('Subiendo imagen a la nube...', { id: toastId });
        const storageRef = ref(storage, `links/${Date.now()}_${imageFile.name}`);
        const snapshot = await uploadBytes(storageRef, imageFile);
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
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="bg-white rounded border border-slate-200 shadow-2xl w-full max-w-[600px] relative z-10 flex flex-col max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
          <h2 className="font-display font-bold text-lg text-slate-800">Añadir Nueva Referencia</h2>
          <button onClick={onClose} disabled={isUploading} className="text-slate-400 hover:text-slate-600 p-1 disabled:opacity-50"><X className="w-5 h-5"/></button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
          <div className="col-span-1 border-b border-slate-100 pb-5">
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Imagen de Portada</label>
            <div 
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`w-full h-36 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors overflow-hidden relative group
                ${imagePreview ? 'border-blue-300 bg-blue-50' : 'border-slate-300 bg-slate-50 hover:bg-slate-100 hover:border-slate-400'}`}
            >
              {imagePreview ? (
                <>
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <span className="text-white font-bold text-sm bg-black/50 px-3 py-1.5 rounded">Cambiar Imagen</span>
                  </div>
                </>
              ) : (
                <>
                  <ImageIcon className="w-8 h-8 text-slate-400 mb-2" />
                  <p className="text-sm font-semibold text-slate-600">Haz clic para subir o arrastra un archivo</p>
                  <p className="text-xs text-slate-500 mt-1">SVG, PNG, JPG (max. 800x400px)</p>
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
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">URL <span className="text-red-500">*</span></label>
              <input required type="url" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://..." className="w-full border border-slate-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-slate-500 text-slate-800 focus:shadow-sm transition-shadow" />
            </div>
            <div className="col-span-2">
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Título <span className="text-red-500">*</span></label>
              <input required type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Título de la referencia" className="w-full border border-slate-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-slate-500 text-slate-800 focus:shadow-sm transition-shadow" />
            </div>
            <div className="col-span-1">
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Categoría</label>
              <input type="text" value={category} onChange={e => setCategory(e.target.value)} placeholder="ej. Sistemas de Diseño" className="w-full border border-slate-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-slate-500 text-slate-800 focus:shadow-sm transition-shadow" />
            </div>
            <div className="col-span-1">
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Etiquetas</label>
              <input type="text" value={tags} onChange={e => setTags(e.target.value)} placeholder="Separadas por coma (ej. react, ui)" className="w-full border border-slate-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-slate-500 text-slate-800 focus:shadow-sm transition-shadow" />
            </div>
            <div className="col-span-2">
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Notas</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Descripción corta..." rows={3} className="w-full border border-slate-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-slate-500 text-slate-800 resize-none focus:shadow-sm transition-shadow" />
            </div>
          </div>

          <div className="mt-4 flex justify-end gap-3 border-t border-slate-100 pt-5">
            <button type="button" onClick={onClose} disabled={isUploading} className="px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors disabled:opacity-50">Cancelar</button>
            <button type="submit" disabled={isUploading} className="px-5 py-2 text-sm font-bold bg-slate-800 text-white rounded shadow-sm hover:bg-slate-700 active:scale-95 transition-all disabled:opacity-75 disabled:active:scale-100 flex items-center">
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
