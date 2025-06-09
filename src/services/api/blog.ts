import { BlogFilters, BlogPostsResponse, BlogPost } from '../types/blog';
import { authUtils } from '../utils/authUtils';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const blogApi = {
  async getBlogPosts(filters: BlogFilters = {}): Promise<BlogPostsResponse> {
    try {
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

      const url = `${API_URL}/api/admin/blog/posts?${queryParams.toString()}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: authUtils.getAuthHeaders(),
        credentials: 'include',
      });

 
      
      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  },

  async getBlogPostById(id: string): Promise<BlogPost> {
    try {
      const url = `${API_URL}/api/admin/blog/posts/${id}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: authUtils.getAuthHeaders(),
        credentials: 'include',
      });

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (parseError) {
          try {
            const errorText = await response.text();
            if (errorText) errorMessage = errorText;
          } catch (textError) {
            console.error('Could not get error response text:', textError);
          }
        }
        
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error fetching blog post details:', error);
      throw error;
    }
  },

  async deleteBlogPost(id: string): Promise<void> {
    try {
      const url = `${API_URL}/api/admin/blog/posts/${id}`;
      
      const response = await fetch(url, {
        method: 'DELETE',
        headers: authUtils.getAuthHeaders(),
        credentials: 'include',
      });

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (parseError) {
          try {
            const errorText = await response.text();
            if (errorText) errorMessage = errorText;
          } catch (textError) {
            console.error('Could not get error response text:', textError);
          }
        }
        
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Error deleting blog post:', error);
      throw error;
    }
  },

  async deleteBlogPosts(ids: string[]): Promise<void> {
    try {
      const url = `${API_URL}/api/admin/blog/posts/bulk-delete`;
      
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          ...authUtils.getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ postIds: ids }),
      });

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (parseError) {
          try {
            const errorText = await response.text();
            if (errorText) errorMessage = errorText;
          } catch (textError) {
            console.error('Could not get error response text:', textError);
          }
        }
        
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Error bulk deleting blog posts:', error);
      throw error;
    }
  },
};
