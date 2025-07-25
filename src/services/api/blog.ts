import { BlogFilters, BlogPostsResponse, BlogPost } from '../types/blog';
import { apiGet, apiDelete, apiPost, apiPut } from './apiUtils';
import { CategoryWithSubCategories, ApiResponse } from '@/services/types/subCategoryTypes';
import { MediaFilters, MediaResponse, MediaUploadResponse, MediaUploadData, MediaDeleteData } from '../types/mediaTypes';

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
    if (filters.search) queryParams.append('keywords', filters.search);
    if (filters.status) queryParams.append('status', filters.status);
    if (filters.category) queryParams.append('category', filters.category);
    if (filters.tag) queryParams.append('tag', filters.tag);
    if (filters.author) queryParams.append('author', filters.author);
    if (filters.sortBy) queryParams.append('sortBy', filters.sortBy);
    if (filters.sortOrder) queryParams.append('sortOrder', filters.sortOrder);

    const endpoint = `/api/admin/blogs?${queryParams.toString()}`;
    
    return apiGet<BlogPostsResponse>(endpoint);
  },

  async getBlogPostById(id: string): Promise<BlogPost> {
    const response = await apiGet<{ data: BlogPost }>(`/api/admin/blogs/${id}`);
    return response.data;
  },

  async deleteBlogPost(id: string): Promise<void> {
    return apiDelete<void>('/api/admin/blogs/multiple', {
      body: { blogIds: [id] }
    });
  },

  async deleteBlogPosts(ids: string[]): Promise<void> {
    return apiDelete<void>('/api/admin/blogs/multiple', {
      body: { blogIds: ids }
    });
  },

  async deleteBlogsByCategory(categoryIds: string[]): Promise<void> {
    return apiDelete<void>('/api/admin/blogs/category', {
      body: { categoryIds }
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

  async getCategoriesForDropdown(): Promise<ApiResponse<CategoryWithSubCategories[]>> {
    const queryParams = new URLSearchParams();
    queryParams.append('limit', '0');
    
    const endpoint = `/api/admin/blogs/category?${queryParams.toString()}`;
    
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
  },

  async getMedia(filters: MediaFilters = {}): Promise<MediaResponse> {
    const queryParams = new URLSearchParams();
    
    if (filters.page) queryParams.append('page', filters.page.toString());
    if (filters.limit) queryParams.append('limit', filters.limit.toString());
    if (filters.type) queryParams.append('type', filters.type);

    const endpoint = `/api/admin/blogs/media?${queryParams.toString()}`;
    
    return apiGet<MediaResponse>(endpoint);
  },

  async uploadMedia(data: MediaUploadData): Promise<MediaUploadResponse> {
    const formData = new FormData();
    formData.append('mediaUpload', data.mediaUpload);
    formData.append('type', data.type);

    const endpoint = '/api/admin/blogs/media';

    try {
      const response = await apiPost<MediaUploadResponse>(endpoint, formData);
      return response;
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  },

  async updateMedia(id: string, data: MediaUploadData): Promise<MediaUploadResponse> {
    const formData = new FormData();
    formData.append('mediaUpload', data.mediaUpload);
    formData.append('type', data.type);

    const endpoint = `/api/admin/blogs/media/${id}`;
    return apiPut<MediaUploadResponse>(endpoint, formData);
  },

  async deleteMedia(data: MediaDeleteData): Promise<{ success: boolean }> {
    const endpoint = '/api/admin/blogs/media';
    
    return apiDelete<{ success: boolean }>(endpoint, {
      body: data,
    });
  },

  async deleteMediaItem(id: string): Promise<{ success: boolean }> {
    return this.deleteMedia({ mediaIds: [id] });
  },

  async deleteMultipleMedia(ids: string[]): Promise<{ success: boolean }> {
    return this.deleteMedia({ mediaIds: ids });
  },

  async createBlog(blogData: any): Promise<{ success: boolean; data?: any; message?: string; errors?: any }> {
    const endpoint = '/api/admin/blogs';
    
    try {
      const response = await apiPost<{ success: boolean; data?: any; message?: string }>(endpoint, blogData);
      return response;
    } catch (error) {
      console.error('Create blog error:', error);
      throw error;
    }
  }
};
