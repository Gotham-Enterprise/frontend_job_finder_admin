import { apiGet, apiPost, apiPut, apiDelete } from './apiUtils';

export interface Tag {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface NewTag {
  name: string;
  description: string;
}

export interface TagsResponse {
  success: boolean;
  data: Tag[];
  metaData: {
    page: number;
    limit: number;
    totalPages: number;
    totalCount: number;
    currentPageTotalItems: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface CreateTagResponse {
  success: boolean;
  data?: Tag;
  message?: string;
}

export interface UpdateTagResponse {
  success: boolean;
  data?: Tag;
  message?: string;
}

export interface DeleteTagResponse {
  success: boolean;
  message?: string;
}

export interface BulkDeleteTagsPayload {
  tagIds: string[];
}

export interface TagFilters {
  keywords?: string;
  page?: number;
  limit?: number;
}

export const tagApi = {
  async getTags(filters?: TagFilters): Promise<TagsResponse> {
    const queryParams = new URLSearchParams();
    
    if (filters?.keywords) queryParams.append('keywords', filters.keywords);
    if (filters?.page) queryParams.append('page', filters.page.toString());
    if (filters?.limit) queryParams.append('limit', filters.limit.toString());
    
    const endpoint = `/api/admin/blogs/tag${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    return apiGet<TagsResponse>(endpoint);
  },

  async getTagsForDropdown(): Promise<TagsResponse> {
    const queryParams = new URLSearchParams();
    queryParams.append('limit', '0'); // Get maximum allowed tags
    
    const endpoint = `/api/admin/blogs/tag?${queryParams.toString()}`;
    
    return apiGet<TagsResponse>(endpoint);
  },

  async createTag(data: NewTag): Promise<CreateTagResponse> {
    return apiPost<CreateTagResponse>('/api/admin/blogs/tag', data);
  },

  async updateTag(id: string, data: NewTag): Promise<UpdateTagResponse> {
    return apiPut<UpdateTagResponse>(`/api/admin/blogs/tag/${id}`, data);
  },

  async deleteTag(id: string): Promise<DeleteTagResponse> {
    return apiDelete<DeleteTagResponse>(`/api/admin/blogs/tag/${id}`);
  },

  async bulkDeleteTags(payload: BulkDeleteTagsPayload): Promise<DeleteTagResponse> {
    return apiDelete<DeleteTagResponse>('/api/admin/blogs/tag', {
      body: payload
    });
  },
};
