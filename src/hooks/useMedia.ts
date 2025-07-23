import { useState, useEffect, useCallback, useMemo } from 'react';
import { blogApi } from '@/services/api/blog';
import { MediaItem, MediaFilters, MediaType, MediaUploadData } from '@/services/types/mediaTypes';
import { validateMediaType, filterMediaByType } from '@/utils/mediaUtils';

interface UseMediaOptions {
  initialFilters?: MediaFilters;
  autoFetch?: boolean;
}

interface UseMediaReturn {
  media: MediaItem[];
  images: MediaItem[];
  videos: MediaItem[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
    totalCount: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  fetchMedia: (filters?: MediaFilters) => Promise<void>;
  uploadMedia: (file: File, type: MediaType) => Promise<MediaItem | null>;
  deleteMediaItem: (id: string) => Promise<boolean>;
  deleteMultipleMedia: (ids: string[]) => Promise<boolean>;
  updateFilters: (newFilters: Partial<MediaFilters>) => void;
  refreshMedia: () => Promise<void>;
}

export const useMedia = (options: UseMediaOptions = {}): UseMediaReturn => {
  const { initialFilters = {}, autoFetch = true } = options;
  
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<MediaFilters>(initialFilters);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalPages: 1,
    totalCount: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  const images = useMemo(() => filterMediaByType(media, 'IMAGE'), [media]);
  const videos = useMemo(() => filterMediaByType(media, 'VIDEO'), [media]);

  const fetchMedia = useCallback(async (customFilters?: MediaFilters) => {
    setLoading(true);
    setError(null);
    
    try {
      const currentFilters = customFilters || filters;
      const response = await blogApi.getMedia(currentFilters);
      
      setMedia(response.data);
      setPagination({
        page: response.metaData.page,
        limit: response.metaData.limit,
        totalPages: response.metaData.totalPages,
        totalCount: response.metaData.totalCount,
        hasNextPage: response.metaData.hasNextPage,
        hasPreviousPage: response.metaData.hasPreviousPage,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch media');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const uploadMedia = useCallback(async (file: File, type: MediaType): Promise<MediaItem | null> => {
    if (!validateMediaType(file, type)) {
      setError(`Invalid file type for ${type}`);
      return null;
    }

    setLoading(true);
    setError(null);
    
    try {
      const uploadData: MediaUploadData = {
        mediaUpload: file,
        type,
      };
      
      const response = await blogApi.uploadMedia(uploadData);
    
      if (!response || !response.data) {
      
        await fetchMedia();
    
        const basicMediaItem: MediaItem = {
          id: `temp-${Date.now()}`,
          url: URL.createObjectURL(file),
          fileName: file.name,
          objectKey: `temp-${file.name}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        return basicMediaItem;
      }
      
      const newMediaItem = response.data;
      
      setMedia(prev => [newMediaItem, ...prev]);
      setPagination(prev => ({
        ...prev,
        totalCount: prev.totalCount + 1,
      }));
      
      return newMediaItem;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload media');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteMediaItem = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      await blogApi.deleteMediaItem(id);
      
      setMedia(prev => prev.filter(item => item.id !== id));
      setPagination(prev => ({
        ...prev,
        totalCount: prev.totalCount - 1,
      }));
      
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete media');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteMultipleMedia = useCallback(async (ids: string[]): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      await blogApi.deleteMultipleMedia(ids);
      
      setMedia(prev => prev.filter(item => !ids.includes(item.id)));
      setPagination(prev => ({
        ...prev,
        totalCount: prev.totalCount - ids.length,
      }));
      
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete media items');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateFilters = useCallback((newFilters: Partial<MediaFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const refreshMedia = useCallback(() => fetchMedia(), [fetchMedia]);

  useEffect(() => {
    if (autoFetch) {
      fetchMedia();
    }
  }, [fetchMedia, autoFetch]);

  useEffect(() => {
    fetchMedia();
  }, [filters]);

  return {
    media,
    images,
    videos,
    loading,
    error,
    pagination,
    fetchMedia,
    uploadMedia,
    deleteMediaItem,
    deleteMultipleMedia,
    updateFilters,
    refreshMedia,
  };
};
