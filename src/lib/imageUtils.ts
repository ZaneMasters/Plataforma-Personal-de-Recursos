import imageCompression from 'browser-image-compression';

export const compressImage = async (imageFile: File): Promise<{ file: File | Blob, extension: string }> => {
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

  return { file: fileToUpload, extension };
};
