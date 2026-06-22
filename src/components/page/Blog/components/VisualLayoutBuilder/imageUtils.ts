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

    return true;
  } catch {
    return false;
  }
};

export const isVideoUrl = (url: string): boolean => {
  if (!url?.trim()) return false;
  return /\.(mp4|webm|mov|avi|m4v|ogg)(\?.*)?$/i.test(url);
};

export interface MediaDimensionInput {
  width?: number;
  height?: number;
  widthUnit?: 'px' | '%';
  heightUnit?: 'px' | '%';
  borderRadius?: number;
}

export const DEFAULT_MEDIA_FILL_HEIGHT = 400;

/** True when media should span the full block width with no side padding (100% × 100%). */
export const isFullBleedMedia = (styles: MediaDimensionInput): boolean =>
  (styles.width ?? 100) === 100 &&
  (styles.widthUnit ?? '%') === '%' &&
  (styles.height ?? DEFAULT_MEDIA_FILL_HEIGHT) === 100 &&
  (styles.heightUnit ?? 'px') === '%';

/** Converts width/height settings to an explicit pixel height so % values scale smoothly (99% ≈ 396px, 100% = 400px). */
export const resolveMediaHeightPx = (styles: MediaDimensionInput): number | null => {
  const mediaHeight = styles.height ?? DEFAULT_MEDIA_FILL_HEIGHT;
  const heightUnit = styles.heightUnit ?? 'px';

  if (heightUnit === 'px') {
    return Math.min(mediaHeight, 600);
  }
  if (heightUnit === '%') {
    return Math.round((mediaHeight / 100) * DEFAULT_MEDIA_FILL_HEIGHT);
  }
  return null;
};

export const buildMediaDisplayStyles = (styles: MediaDimensionInput) => {
  const mediaWidth = styles.width ?? 100;
  const widthUnit = styles.widthUnit ?? '%';
  const borderRadius = styles.borderRadius ?? 8;
  const heightPx = resolveMediaHeightPx(styles);
  const fullBleed = isFullBleedMedia(styles);
  const fullWidth = mediaWidth === 100 && widthUnit === '%';

  const wrapperStyle: Record<string, string | number> = {
    width: widthUnit === '%' ? `${mediaWidth}%` : `${mediaWidth}px`,
    maxWidth: '100%',
  };

  const mediaStyle: Record<string, string | number> = {
    borderRadius: `${borderRadius}px`,
    objectFit: 'cover',
    display: 'block',
    maxWidth: '100%',
    width: widthUnit === '%' ? `${mediaWidth}%` : `${mediaWidth}px`,
  };

  if (heightPx !== null) {
    mediaStyle.height = `${heightPx}px`;
    wrapperStyle.minHeight = `${heightPx}px`;
  } else {
    mediaStyle.height = 'auto';
  }

  return { mediaStyle, wrapperStyle, fullBleed, fullWidth, heightPx };
};

/** Ad blocks always render full-width; size and alignment are not configurable. */
export const AD_MEDIA_BORDER_RADIUS = 8;

export { AD_MEDIA_LINK_CLASS } from '@/services/types/visualLayoutTypes';

export const buildAdMediaDisplayStyles = () => ({
  mediaStyle: {
    width: '100%',
    height: 'auto',
    maxWidth: '100%',
    display: 'block',
    borderRadius: `${AD_MEDIA_BORDER_RADIUS}px`,
  } as const,
  wrapperStyle: {
    width: '100%',
    maxWidth: '100%',
  } as const,
});

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
