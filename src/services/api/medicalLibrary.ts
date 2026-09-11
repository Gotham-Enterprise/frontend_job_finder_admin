import { apiGet, apiPost, apiPut, apiDelete } from "./apiUtils";

export interface MedicalLibraryFilters {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  sortBy?: string;
  sortOrder?: string;
}

export interface MedicalLibrarySection {
  id: string;
  label: string;
  html: string;
}

export interface MedicalLibraryTab {
  tabName: string;
  sections: MedicalLibrarySection[];
}

export interface MedicalLibraryContent {
  tabs: MedicalLibraryTab[];
}

export interface MedicalLibraryTopic {
  id: string;
  slug: string;
  title: string;
  category: string;
  description?: string;
  status?: string;
  content?: MedicalLibraryContent;
  createdAt: string;
  updatedAt: string;
}

export interface MedicalLibraryTopicsResponse {
  success: boolean;
  data: MedicalLibraryTopic[];
  metaData: {
    totalCount: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface MedicalLibraryCreateData {
  title: string;
  slug: string;
  category: string;
  description?: string;
  status?: string;
  content?: MedicalLibraryContent;
}

export const medicalLibraryApi = {
  async getTopics(filters: MedicalLibraryFilters = {}): Promise<MedicalLibraryTopicsResponse> {
    const queryParams = new URLSearchParams();
    if (filters.page) queryParams.append("page", filters.page.toString());
    if (filters.limit) queryParams.append("limit", filters.limit.toString());
    if (filters.search) queryParams.append("search", filters.search);
    if (filters.category) queryParams.append("category", filters.category);
    if (filters.sortBy) queryParams.append("sortBy", filters.sortBy);
    if (filters.sortOrder) queryParams.append("sortOrder", filters.sortOrder);

    return apiGet<MedicalLibraryTopicsResponse>(`/api/admin/medical-library?${queryParams.toString()}`);
  },

  async getTopicById(id: string): Promise<{ success: boolean; data: MedicalLibraryTopic }> {
    return apiGet(`/api/admin/medical-library/${id}`);
  },

  async createTopic(data: MedicalLibraryCreateData): Promise<{ success: boolean; data: MedicalLibraryTopic }> {
    return apiPost(`/api/admin/medical-library`, data);
  },

  async updateTopic(
    id: string,
    data: Partial<MedicalLibraryCreateData>
  ): Promise<{ success: boolean; data: MedicalLibraryTopic }> {
    return apiPut(`/api/admin/medical-library/${id}`, data);
  },

  async deleteTopic(id: string): Promise<{ success: boolean; message: string }> {
    return apiDelete(`/api/admin/medical-library/${id}`);
  },
};
