import { apiGet } from "./apiUtils";

export interface OpenAiBatchJob {
  id: string;
  batchId: string;
  status: string;
  inputFileId: string;
  outputFileId: string | null;
  endpoint: string;
  completionWindow: string;
  recordCount: number;
  errorMessage: string | null;
  indexingMetadata: IndexingMetadata | null;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
}

export interface IndexingMetadata {
  submitted: number;
  succeeded: number;
  failed: number;
  quotaExceeded: boolean;
  errors: string[];
}

export interface OpenAiBatchListResponse {
  success: boolean;
  data: OpenAiBatchJob[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface OpenAiBatchDetailResponse {
  success: boolean;
  data: OpenAiBatchJob;
}

export const getOpenAiBatches = async (params?: {
  page?: number;
  limit?: number;
  status?: string;
}): Promise<OpenAiBatchListResponse> => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append("page", params.page.toString());
  if (params?.limit) queryParams.append("limit", params.limit.toString());
  if (params?.status) queryParams.append("status", params.status);
  const queryString = queryParams.toString();
  return apiGet(`/api/admin/openai/batches${queryString ? `?${queryString}` : ""}`);
};

export const getOpenAiBatchDetail = async (id: string): Promise<OpenAiBatchDetailResponse> => {
  return apiGet(`/api/admin/openai/batches/${id}`);
};
