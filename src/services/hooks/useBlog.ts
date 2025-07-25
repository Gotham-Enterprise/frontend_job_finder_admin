import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { blogApi } from '../api/blog';
import { BlogFilters } from '../types/blog';

export const blogQueryKeys = {
  all: ['blog'] as const,
  lists: () => [...blogQueryKeys.all, 'list'] as const,
  list: (filters: BlogFilters) => [...blogQueryKeys.lists(), filters] as const,
  details: () => [...blogQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...blogQueryKeys.details(), id] as const,
  stats: () => [...blogQueryKeys.all, 'stats'] as const,
};

export const useBlogPosts = (filters: BlogFilters = {}) => {
  return useQuery({
    queryKey: blogQueryKeys.list(filters),
    queryFn: () => {
      return blogApi.getBlogPosts(filters);
    },
    staleTime: 1000 * 60 * 5, 
    retry: (failureCount, error: Error) => {
      if (error.message.includes('HTTP 401')) {
        return false;
      }
      console.error('Error fetching blog posts:', error);
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

export const useBlogPostDetails = (id: string) => {
  return useQuery({
    queryKey: blogQueryKeys.detail(id),
    queryFn: () => blogApi.getBlogPostById(id),
    enabled: !!id, 
    staleTime: 1000 * 60 * 5,
    retry: (failureCount, error: Error) => {
      if (error.message.includes('HTTP 401')) {
        console.error('Authentication error - not retrying:', error);
        return false;
      }
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

export const useDeleteBlogPost = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (postId: string) => blogApi.deleteBlogPost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: blogQueryKeys.lists() });
    },
    onError: (error) => {
      console.error('Failed to delete blog post:', error);
    },
  });
};

export const useBulkDeleteBlogPosts = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (postIds: string[]) => blogApi.deleteBlogPosts(postIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: blogQueryKeys.lists() });
    },
    onError: (error) => {
      console.error('Failed to bulk delete blog posts:', error);
    },
  });
};

export const useUpdateBlogPost = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => blogApi.updateBlogPost(id, data),
    onSuccess: () => {
      // Invalidate both the list and individual post details
      queryClient.invalidateQueries({ queryKey: blogQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: blogQueryKeys.details() });
    },
    onError: (error) => {
      console.error('Failed to update blog post:', error);
    },
  });
};

export const useCreateBlogPost = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: any) => blogApi.createBlog(data),
    onSuccess: () => {
      // Invalidate the list to show the new post
      queryClient.invalidateQueries({ queryKey: blogQueryKeys.lists() });
    },
    onError: (error) => {
      console.error('Failed to create blog post:', error);
    },
  });
};
