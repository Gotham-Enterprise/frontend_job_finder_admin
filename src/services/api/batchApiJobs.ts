import { apiGet } from "./apiUtils";

export interface BatchApiJob {
  id: string;
  title: string;
  createdAt: string;
  originalPost: { id: string; title: string } | null;
  batch: { batchId: string; status: string } | null;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  } | null;
  occupation: { name: string } | null;
}

export interface BatchApiJobsResponse {
  success: boolean;
  data: BatchApiJob[];
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

export interface BatchApiJobDetailResponse {
  success: boolean;
  data: Record<string, unknown>;
}

export interface BatchApiJobsFilters {
  page?: number;
  limit?: number;
}

export const batchApiJobsApi = {
  async getJobs(filters: BatchApiJobsFilters = {}): Promise<BatchApiJobsResponse> {
    const queryParams = new URLSearchParams();
    if (filters.page) queryParams.append("page", filters.page.toString());
    if (filters.limit) queryParams.append("limit", filters.limit.toString());
    const endpoint = `/api/admin/batch-api-jobs?${queryParams.toString()}`;
    const res = await apiGet<BatchApiJobsResponse>(endpoint);
    return res;
  },

  async getJobById(id: string): Promise<BatchApiJobDetailResponse> {
    return apiGet<BatchApiJobDetailResponse>(`/api/admin/batch-api-jobs/${id}`);
  },
};
