import { MediaItem, MediaType } from '@/services/types/mediaTypes';

export const validateMediaType = (file: File, type: MediaType): boolean => {
  const mimeType = file.type.toLowerCase();
  
  if (type === 'IMAGE') {
    return mimeType.startsWith('image/');
  }
  
  if (type === 'VIDEO') {
    return mimeType.startsWith('video/');
  }
  
  return false;
};

export const getFileExtension = (fileName: string): string => {
  return fileName.split('.').pop()?.toLowerCase() || '';
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const isValidImageType = (file: File): boolean => {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  return validTypes.includes(file.type.toLowerCase());
};

export const isValidVideoType = (file: File): boolean => {
  const validTypes = ['video/mp4', 'video/webm', 'video/mov', 'video/avi'];
  return validTypes.includes(file.type.toLowerCase());
};

export const createObjectUrl = (file: File): string => {
  return URL.createObjectURL(file);
};

export const revokeObjectUrl = (url: string): void => {
  URL.revokeObjectURL(url);
};

export const filterMediaByType = (media: MediaItem[], type: MediaType): MediaItem[] => {
  return media.filter(item => {
    const extension = getFileExtension(item.fileName);
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    const videoExtensions = ['mp4', 'webm', 'mov', 'avi'];
    
    if (type === 'IMAGE') {
      return imageExtensions.includes(extension);
    }
    
    if (type === 'VIDEO') {
      return videoExtensions.includes(extension);
    }
    
    return false;
  });
};

export const generateThumbnail = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (file.type.startsWith('image/')) {
      const url = createObjectUrl(file);
      resolve(url);
    } else if (file.type.startsWith('video/')) {
      const video = document.createElement('video');
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      video.addEventListener('loadedmetadata', () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        video.currentTime = 1;
      });
      
      video.addEventListener('seeked', () => {
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const thumbnailUrl = canvas.toDataURL();
          resolve(thumbnailUrl);
        } else {
          reject(new Error('Canvas context not available'));
        }
      });
      
      video.addEventListener('error', reject);
      video.src = createObjectUrl(file);
    } else {
      reject(new Error('Unsupported file type'));
    }
  });
};
