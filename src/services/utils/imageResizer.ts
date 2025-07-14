
export interface ResizeOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp';
  maintainAspectRatio?: boolean;
}

export interface ProcessedImage {
  file: File;
  dataUrl: string;
  dimensions: {
    width: number;
    height: number;
  };
  size: number;
}

export class ImageResizer {
  static async resizeImage(file: File, options: ResizeOptions = {}): Promise<ProcessedImage> {
    return new Promise((resolve, reject) => {
      const {
        width = 800,
        height = 600,
        quality = 0.8,
        format = 'jpeg',
        maintainAspectRatio = true
      } = options;

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        try {
       
          const { newWidth, newHeight } = this.calculateDimensions(
            img.width,
            img.height,
            width,
            height,
            maintainAspectRatio
          );

          canvas.width = newWidth;
          canvas.height = newHeight;

          ctx?.drawImage(img, 0, 0, newWidth, newHeight);

          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Failed to create blob from canvas'));
                return;
              }

              const resizedFile = new File([blob], file.name, {
                type: `image/${format}`,
                lastModified: Date.now()
              });

              const dataUrl = canvas.toDataURL(`image/${format}`, quality);

              resolve({
                file: resizedFile,
                dataUrl,
                dimensions: { width: newWidth, height: newHeight },
                size: blob.size
              });
            },
            `image/${format}`,
            quality
          );
        } catch (error) {
          reject(error);
        }
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };

      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  }


  static async createThumbnails(file: File): Promise<{
    small: ProcessedImage;
    medium: ProcessedImage;
    large: ProcessedImage;
    original: ProcessedImage;
  }> {
    const [small, medium, large, original] = await Promise.all([
      this.resizeImage(file, { width: 150, height: 150, quality: 0.8 }),
      this.resizeImage(file, { width: 400, height: 300, quality: 0.85 }),
      this.resizeImage(file, { width: 800, height: 600, quality: 0.9 }),
      this.resizeImage(file, { width: 1200, height: 900, quality: 0.95 })
    ]);

    return { small, medium, large, original };
  }

  static async optimizeForWeb(file: File): Promise<ProcessedImage> {
  
    let quality = 0.85;
    let maxWidth = 1200;

    if (file.size > 2 * 1024 * 1024) {
      quality = 0.75;
      maxWidth = 1000;
    } else if (file.size > 1 * 1024 * 1024) {
      quality = 0.8;
      maxWidth = 1100;
    }

    return this.resizeImage(file, {
      width: maxWidth,
      quality,
      format: 'jpeg',
      maintainAspectRatio: true
    });
  }

  private static calculateDimensions(
    originalWidth: number,
    originalHeight: number,
    targetWidth: number,
    targetHeight: number,
    maintainAspectRatio: boolean
  ): { newWidth: number; newHeight: number } {
    if (!maintainAspectRatio) {
      return { newWidth: targetWidth, newHeight: targetHeight };
    }

    const aspectRatio = originalWidth / originalHeight;

   
    if (originalWidth <= targetWidth && originalHeight <= targetHeight) {
      return { newWidth: originalWidth, newHeight: originalHeight };
    }

    let newWidth = targetWidth;
    let newHeight = targetWidth / aspectRatio;

    if (newHeight > targetHeight) {
      newHeight = targetHeight;
      newWidth = targetHeight * aspectRatio;
    }

    return {
      newWidth: Math.round(newWidth),
      newHeight: Math.round(newHeight)
    };
  }


  static validateImage(file: File): { isValid: boolean; error?: string } {

    if (!file.type.startsWith('image/')) {
      return { isValid: false, error: 'File must be an image' };
    }

   
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return { isValid: false, error: 'Image size must be less than 10MB' };
    }

   
    const supportedFormats = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!supportedFormats.includes(file.type)) {
      return { isValid: false, error: 'Unsupported image format. Use JPEG, PNG, WebP, or GIF' };
    }

    return { isValid: true };
  }

  static getImageDimensions(file: File): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => {
        resolve({ width: img.width, height: img.height });
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };

      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  }


  static async convertFormat(
    file: File, 
    targetFormat: 'jpeg' | 'png' | 'webp',
    quality: number = 0.9
  ): Promise<ProcessedImage> {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    return new Promise((resolve, reject) => {
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        
        ctx?.drawImage(img, 0, 0);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to convert image format'));
              return;
            }

            const convertedFile = new File([blob], 
              file.name.replace(/\.[^/.]+$/, `.${targetFormat}`), {
              type: `image/${targetFormat}`,
              lastModified: Date.now()
            });

            const dataUrl = canvas.toDataURL(`image/${targetFormat}`, quality);

            resolve({
              file: convertedFile,
              dataUrl,
              dimensions: { width: img.width, height: img.height },
              size: blob.size
            });
          },
          `image/${targetFormat}`,
          quality
        );
      };

      img.onerror = () => reject(new Error('Failed to load image'));

      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  }
}

export const RESIZE_PRESETS = {
  thumbnail: { width: 150, height: 150, quality: 0.8 },
  small: { width: 300, height: 200, quality: 0.85 },
  medium: { width: 600, height: 400, quality: 0.9 },
  large: { width: 1200, height: 800, quality: 0.95 },
  hero: { width: 1920, height: 1080, quality: 0.95 },
  square: { width: 500, height: 500, quality: 0.9, maintainAspectRatio: false },
  banner: { width: 1200, height: 300, quality: 0.9, maintainAspectRatio: false }
};


export const processImageForBlog = async (file: File, preset: keyof typeof RESIZE_PRESETS = 'large'): Promise<ProcessedImage> => {
  const validation = ImageResizer.validateImage(file);
  if (!validation.isValid) {
    throw new Error(validation.error);
  }

  return ImageResizer.resizeImage(file, RESIZE_PRESETS[preset]);
};
