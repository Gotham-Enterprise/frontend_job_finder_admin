import { BlogPayload, BlogValidationResult } from '@/types/blog';
import { formatPayloadForApi, validateBlogPayload } from '@/lib/blogPayloadUtils';

export interface BlogApiResponse {
  success: boolean;
  data?: any;
  message?: string;
  errors?: string[];
}

export interface BlogApiConfig {
  baseUrl: string;
  apiKey?: string;
  timeout?: number;
}

export class BlogApiService {
  private config: BlogApiConfig;

  constructor(config: BlogApiConfig) {
    this.config = {
      timeout: 10000,
      ...config
    };
  }

  private async makeRequest(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    data?: any
  ): Promise<BlogApiResponse> {
    try {
      const url = `${this.config.baseUrl}${endpoint}`;
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };

      if (this.config.apiKey) {
        headers['Authorization'] = `Bearer ${this.config.apiKey}`;
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

      const response = await fetch(url, {
        method,
        headers,
        body: data ? JSON.stringify(data) : undefined,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      const responseData = await response.json();

      if (!response.ok) {
        return {
          success: false,
          message: responseData.message || `HTTP ${response.status}: ${response.statusText}`,
          errors: responseData.errors || []
        };
      }

      return {
        success: true,
        data: responseData
      };
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          return {
            success: false,
            message: 'Request timeout',
            errors: ['The request took too long to complete']
          };
        }
        return {
          success: false,
          message: error.message,
          errors: [error.message]
        };
      }
      return {
        success: false,
        message: 'An unknown error occurred',
        errors: ['Unknown error']
      };
    }
  }

  async saveBlog(payload: BlogPayload): Promise<BlogApiResponse> {
    const validation = validateBlogPayload(payload);
    
    if (!validation.isValid) {
      return {
        success: false,
        message: 'Validation failed',
        errors: validation.errors
      };
    }

    const apiPayload = formatPayloadForApi(payload);
    return this.makeRequest('/api/blogs', 'POST', apiPayload);
  }

  async updateBlog(id: string, payload: BlogPayload): Promise<BlogApiResponse> {
    const validation = validateBlogPayload(payload);
    
    if (!validation.isValid) {
      return {
        success: false,
        message: 'Validation failed',
        errors: validation.errors
      };
    }

    const apiPayload = formatPayloadForApi(payload);
    return this.makeRequest(`/api/blogs/${id}`, 'PUT', apiPayload);
  }

  async publishBlog(payload: BlogPayload): Promise<BlogApiResponse> {
    const publishPayload = {
      ...payload,
      metadata: {
        ...payload.metadata,
        status: 'published' as const
      },
      timestamps: {
        ...payload.timestamps,
        published: new Date().toISOString()
      }
    };

    return this.saveBlog(publishPayload);
  }

  async draftBlog(payload: BlogPayload): Promise<BlogApiResponse> {
    const draftPayload = {
      ...payload,
      metadata: {
        ...payload.metadata,
        status: 'draft' as const
      }
    };

    return this.saveBlog(draftPayload);
  }

  async getBlog(id: string): Promise<BlogApiResponse> {
    return this.makeRequest(`/api/blogs/${id}`);
  }

  async listBlogs(params?: {
    page?: number;
    limit?: number;
    status?: string;
    category?: string;
    tag?: string;
  }): Promise<BlogApiResponse> {
    const queryParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, String(value));
        }
      });
    }

    const endpoint = `/api/blogs${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.makeRequest(endpoint);
  }

  async deleteBlog(id: string): Promise<BlogApiResponse> {
    return this.makeRequest(`/api/blogs/${id}`, 'DELETE');
  }
}

export const createBlogApiService = (config: BlogApiConfig) => {
  return new BlogApiService(config);
};
