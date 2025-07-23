import { useMutation, useQueryClient } from '@tanstack/react-query';
import { blogApi } from '../api/blog';

export const useBulkDeleteCategories = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (categoryIds: string[]) => blogApi.deleteBulkCategories(categoryIds),
    onSuccess: () => {
      // Invalidate categories queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: (error) => {
      console.error('Failed to bulk delete categories:', error);
    },
  });
};
