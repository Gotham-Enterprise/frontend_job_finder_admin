import { BlogFilters, BlogPostsResponse, BlogPost } from '../types/blog';
import { apiGet, apiDelete } from './apiUtils';

export const blogApi = {
  async getBlogPosts(filters: BlogFilters = {}): Promise<BlogPostsResponse> {
    const queryParams = new URLSearchParams();
    
    if (filters.page) queryParams.append('page', filters.page.toString());
    if (filters.limit) queryParams.append('limit', filters.limit.toString());
    if (filters.search) queryParams.append('search', filters.search);
    if (filters.status) queryParams.append('status', filters.status);
    if (filters.category) queryParams.append('category', filters.category);
    if (filters.tag) queryParams.append('tag', filters.tag);
    if (filters.author) queryParams.append('author', filters.author);
    if (filters.sortBy) queryParams.append('sortBy', filters.sortBy);
    if (filters.sortOrder) queryParams.append('sortOrder', filters.sortOrder);

    const endpoint = `/api/admin/blog/posts?${queryParams.toString()}`;
    
    return apiGet<BlogPostsResponse>(endpoint);
  },

  async getBlogPostById(id: string): Promise<BlogPost> {
    const response = await apiGet<{ data: BlogPost }>(`/api/admin/blog/posts/${id}`);
    return response.data;
  },

  async deleteBlogPost(id: string): Promise<void> {
    return apiDelete<void>(`/api/admin/blog/posts/${id}`);
  },

  async deleteBlogPosts(ids: string[]): Promise<void> {
    return apiDelete<void>('/api/admin/blog/posts/bulk-delete', {
      body: { postIds: ids }
    });
  },
};
