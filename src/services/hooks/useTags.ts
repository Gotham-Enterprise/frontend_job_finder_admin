import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tagApi, NewTag, BulkDeleteTagsPayload } from '../api/tag';

export const tagQueryKeys = {
  all: ['tags'] as const,
  lists: () => [...tagQueryKeys.all, 'list'] as const,
  list: () => [...tagQueryKeys.lists()] as const,
  dropdown: () => [...tagQueryKeys.all, 'dropdown'] as const,
};

export const useTags = () => {
  return useQuery({
    queryKey: tagQueryKeys.list(),
    queryFn: () => tagApi.getTags(),
    staleTime: 1000 * 60 * 5,
    retry: (failureCount, error: Error) => {
      if (error.message.includes('HTTP 401')) {
        return false;
      }
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

export const useCreateTag = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: NewTag) => tagApi.createTag(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tagQueryKeys.lists() });
    },
    onError: (error) => {
      console.error('Failed to create tag:', error);
    },
  });
};

export const useUpdateTag = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: NewTag }) => tagApi.updateTag(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tagQueryKeys.lists() });
    },
    onError: (error) => {
      console.error('Failed to update tag:', error);
    },
  });
};

export const useDeleteTag = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (tagId: string) => tagApi.deleteTag(tagId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tagQueryKeys.lists() });
    },
    onError: (error) => {
      console.error('Failed to delete tag:', error);
    },
  });
};

export const useBulkDeleteTags = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (payload: BulkDeleteTagsPayload) => tagApi.bulkDeleteTags(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tagQueryKeys.lists() });
    },
    onError: (error) => {
      console.error('Failed to bulk delete tags:', error);
    },
  });
};

export const useTagsForDropdown = () => {
  return useQuery({
    queryKey: tagQueryKeys.dropdown(),
    queryFn: async () => {
      try {
        const data = await tagApi.getTagsForDropdown();
        
        if (data.success) {
          return data.data;
        } else {
          throw new Error('Failed to fetch tags for dropdown');
        }
      } catch (error: any) {
        console.error('Error fetching tags for dropdown:', error);
        throw error;
      }
    },
    staleTime: 1000 * 60 * 5, 
    gcTime: 1000 * 60 * 10, 
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        return false;
      }
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    refetchOnWindowFocus: false,
  });
};
