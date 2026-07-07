import { apiGet } from "./apiUtils";

export interface IndexingLog {
  id: string;
  source: string;
  status: string;
  urlsTotal: number;
  urlsSucceeded: number;
  urlsFailed: number;
  errors: string[] | null;
  metadata: Record<string, any> | null;
  createdAt: string;
}

export interface IndexingLogSummary {
  today: {
    googleIndexingApi: { submitted: number; succeeded: number; failed: number };
    indexnow: { submitted: number; succeeded: number; failed: number };
    revalidation: { count: number };
  };
  totalAllTime: {
    googleIndexingApi: { submitted: number; succeeded: number; failed: number };
    indexnow: { submitted: number; succeeded: number; failed: number };
    revalidation: { count: number };
  };
}

export interface IndexingLogsResponse {
  success: boolean;
  data: {
    logs: IndexingLog[];
    total: number;
    page: number;
    totalPages: number;
    summary: IndexingLogSummary;
  };
}

export interface IndexingLogsFilters {
  page?: number;
  limit?: number;
  source?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}

export const indexingLogsApi = {
  async getLogs(filters: IndexingLogsFilters = {}): Promise<IndexingLogsResponse> {
    const queryParams = new URLSearchParams();
    if (filters.page) queryParams.append("page", filters.page.toString());
    if (filters.limit) queryParams.append("limit", filters.limit.toString());
    if (filters.source) queryParams.append("source", filters.source);
    if (filters.status) queryParams.append("status", filters.status);
    if (filters.startDate) queryParams.append("startDate", filters.startDate);
    if (filters.endDate) queryParams.append("endDate", filters.endDate);
    const endpoint = `/api/admin/indexing-logs?${queryParams.toString()}`;
    return apiGet<IndexingLogsResponse>(endpoint);
  },
};
