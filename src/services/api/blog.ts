import { BlogFilters, BlogPostsResponse, BlogPost } from '../types/blog';
import { apiGet, apiDelete, apiPost, apiPut } from './apiUtils';
import { CategoryWithSubCategories, ApiResponse } from '@/services/types/subCategoryTypes';

export interface CategoryFilters {
  keywords?: string;
  page?: number;
  limit?: number;
}

export interface CategoryCreateData {
  name: string;
  description: string;
  subCategories: Array<{ name: string }>;
}

export interface CategoryUpdateData {
  name: string;
  description: string;
  subCategories: Array<{ name: string }>;
}

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

  async getCategories(filters?: CategoryFilters): Promise<ApiResponse<CategoryWithSubCategories[]>> {
    const queryParams = new URLSearchParams();
    
    if (filters?.keywords) queryParams.append('keywords', filters.keywords);
    if (filters?.page) queryParams.append('page', filters.page.toString());
    if (filters?.limit) queryParams.append('limit', filters.limit.toString());
    
    const endpoint = `/api/admin/blogs/category${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    return apiGet<ApiResponse<CategoryWithSubCategories[]>>(endpoint);
  },

  async createCategory(categoryData: CategoryCreateData): Promise<ApiResponse<CategoryWithSubCategories>> {
    const endpoint = '/api/admin/blogs/category';
    
    return apiPost<ApiResponse<CategoryWithSubCategories>>(endpoint, categoryData);
  },

  async updateCategory(categoryId: string, categoryData: CategoryUpdateData): Promise<ApiResponse<CategoryWithSubCategories>> {
    const endpoint = `/api/admin/blogs/category/${categoryId}`;
    
    return apiPut<ApiResponse<CategoryWithSubCategories>>(endpoint, categoryData);
  },

  async deleteCategory(categoryId: string): Promise<ApiResponse<any>> {
    const endpoint = `/api/admin/blogs/category/${categoryId}`;
    
    return apiDelete<ApiResponse<any>>(endpoint);
  },

  async deleteBulkCategories(categoryIds: string[]): Promise<ApiResponse<any>> {
    const endpoint = '/api/admin/blogs/category';
    
    return apiDelete<ApiResponse<any>>(endpoint, {
      body: { categoryIds }
    });
  }
};
