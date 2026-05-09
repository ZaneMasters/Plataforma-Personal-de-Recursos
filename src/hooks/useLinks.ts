import { useState, useEffect } from 'react';
import { collection, onSnapshot, setDoc, doc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';
import type { User } from 'firebase/auth';
import { db, storage } from '../lib/firebase';
import { toast } from 'react-hot-toast';
import { mockLinks } from '../data/mockData';
import type { Link } from '../types';
import * as XLSX from 'xlsx';

export const useLinks = (user: User | null) => {
  const [links, setLinks] = useState<Link[]>([]);

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
      const fbLinks = snapshot.docs.map(document => {
        const data = document.data();
        return { 
          ...data, 
          id: document.id,
          subcategory: data.subcategory || data.tags?.[0] || '',
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

  const handleAddLink = async (newLink: Link) => {
    if (!import.meta.env.VITE_FIREBASE_API_KEY) {
      setLinks(prev => [newLink, ...prev]);
      toast.success('¡Referencia añadida localmente!');
      return;
    }
    
    if (!user) return;

    try {
      const { id, ...data } = newLink;
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
    const data = links.map(link => ({
      'Título': link.title,
      'URL': link.url,
      'Categoría': link.category,
      'Subcategoría': link.subcategory || '',
      'Descripción': link.description,
      'Favorito': link.isFavorite ? 'Sí' : 'No'
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Links Backup");

    XLSX.writeFile(workbook, "linkvault_backup.xlsx");
    toast.success("¡Respaldo XLSX descargado!");
  };

  return {
    links,
    handleAddLink,
    handleDeleteLink,
    handleToggleFavorite,
    handleUpdateLink,
    handleExport
  };
};
