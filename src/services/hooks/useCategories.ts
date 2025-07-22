import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { blogApi } from '@/services/api/blog';
import { showToast } from '@/services/utils/toast';

export const categoryQueryKeys = {
  all: ['categories'] as const,
  lists: () => [...categoryQueryKeys.all, 'list'] as const,
  list: (filters?: { keywords?: string }) => {
    const serializedFilters = filters ? JSON.stringify(filters, Object.keys(filters).sort()) : 'all';
    return [...categoryQueryKeys.lists(), serializedFilters] as const;
  },
};

interface CategoryData {
  name: string;
  description: string;
  subCategories: Array<{ name: string }>;
}

export const useCategories = (filters?: { keywords?: string }) => {
  return useQuery({
    queryKey: categoryQueryKeys.list(filters),
    queryFn: async () => {
      try {
        const data = await blogApi.getCategories(filters);
        
        if (data.success) {
          return {
            categories: data.data,
            metaData: data.metaData
          };
        } else {
          throw new Error('Failed to fetch categories');
        }
      } catch (error: any) {
        console.error('Error fetching categories:', error);
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

export const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (categoryData: CategoryData) => blogApi.createCategory(categoryData),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: categoryQueryKeys.all });
      
      showToast.success(
        'Category Created!', 
        `Category "${data.data?.name || 'New category'}" has been created successfully.`
      );
    },
    onError: (error: any) => {
      console.error('Error creating category:', error);
      
      let errorMessage = 'Failed to create category. Please try again.';
      
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      showToast.error('Creation Failed', errorMessage);
    },
  });
};


export const useUpdateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ categoryId, categoryData }: { categoryId: string; categoryData: CategoryData }) => 
      blogApi.updateCategory(categoryId, categoryData),
    onSuccess: (data, variables) => {
    
      queryClient.invalidateQueries({ queryKey: categoryQueryKeys.all });
      
      showToast.success(
        'Category Updated!', 
        `Category "${data.data?.name || 'Category'}" has been updated successfully.`
      );
    },
    onError: (error: any) => {
      console.error('Error updating category:', error);
      
      let errorMessage = 'Failed to update category. Please try again.';
      
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      showToast.error('Update Failed', errorMessage);
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (categoryId: string) => blogApi.deleteCategory(categoryId),
    onSuccess: () => {
     
      queryClient.invalidateQueries({ queryKey: categoryQueryKeys.all });
      
      showToast.success(
        'Category Deleted!', 
        'Category has been deleted successfully.'
      );
    },
    onError: (error: any) => {
      console.error('Error deleting category:', error);
      
      let errorMessage = 'Failed to delete category. Please try again.';
      
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      showToast.error('Deletion Failed', errorMessage);
    },
  });
};

export const useCategoriesWithMutations = (filters?: { keywords?: string }) => {
  const categoriesQuery = useCategories(filters);
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const deleteMutation = useDeleteCategory();
  const queryClient = useQueryClient();

  const refetchCategories = () => {
    queryClient.invalidateQueries({ queryKey: categoryQueryKeys.all });
  };

  const searchCategories = (keywords: string) => {
   
    queryClient.invalidateQueries({ 
      queryKey: categoryQueryKeys.list({ keywords }) 
    });
  };

  return {
  
    categories: categoriesQuery.data?.categories || [],
    metaData: categoriesQuery.data?.metaData,
    
    isLoading: categoriesQuery.isLoading,
    isFetching: categoriesQuery.isFetching,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,

    error: categoriesQuery.error?.message || null,
    createError: createMutation.error?.message || null,
    updateError: updateMutation.error?.message || null,
    deleteError: deleteMutation.error?.message || null,

    createCategory: createMutation.mutate,
    updateCategory: updateMutation.mutate,
    deleteCategory: deleteMutation.mutate,
    refetchCategories,
    searchCategories,

    refetch: categoriesQuery.refetch,
    isSuccess: categoriesQuery.isSuccess,
    isError: categoriesQuery.isError,
  };
};
