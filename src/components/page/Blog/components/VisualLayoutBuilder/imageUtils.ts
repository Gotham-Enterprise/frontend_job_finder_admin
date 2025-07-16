export const validateImageUrl = (url: string): boolean => {
  if (!url?.trim()) return false;
  
  try {
    const urlObj = new URL(url);
    
    if (!['http:', 'https:', 'data:'].includes(urlObj.protocol)) {
      return false;
    }
    

    if (urlObj.protocol === 'data:') {
      return url.startsWith('data:image/');
    }

    const pathname = urlObj.pathname.toLowerCase();
    const hasImageExtension = /\.(jpg|jpeg|png|gif|svg|webp|bmp|tiff|ico)(\?.*)?$/i.test(pathname);

    const imageHostingPatterns = [
      /unsplash\.com/,
      /pexels\.com/,
      /pixabay\.com/,
      /imgur\.com/,
      /cloudinary\.com/,
      /amazonaws\.com/,
      /googleusercontent\.com/,
      /githubusercontent\.com/
    ];
    
    const isFromImageHost = imageHostingPatterns.some(pattern => pattern.test(urlObj.hostname));
    
    return hasImageExtension || isFromImageHost;
  } catch {
    return false;
  }
};

export const generateImagePlaceholder = (width: number = 400, height: number = 300, text: string = 'Image'): string => {
  return `data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"%3E%3Crect width="100%25" height="100%25" fill="%23374151"/%3E%3Ctext x="50%25" y="50%25" font-family="Arial" font-size="16" fill="%239CA3AF" text-anchor="middle" dy=".3em"%3E${encodeURIComponent(text)}%3C/text%3E%3C/svg%3E`;
};

export const isImageUrlAccessible = async (url: string): Promise<boolean> => {
  try {
    const response = await fetch(url, { method: 'HEAD', mode: 'no-cors' });
    return response.ok;
  } catch {
    return false;
  }
};
