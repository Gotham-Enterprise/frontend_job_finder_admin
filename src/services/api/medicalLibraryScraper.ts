import { apiGet, apiPost } from "./apiUtils";

export type ScraperRunTriggerSource = "manual" | "scheduled";
export type ScraperRunStatus = "pending" | "running" | "completed" | "failed";

export interface ScraperRunUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface ScraperRun {
  id: string;
  source: string;
  triggerSource: ScraperRunTriggerSource;
  status: ScraperRunStatus;
  triggeredByUser: ScraperRunUser | null;
  totalTopics: number | null;
  processedTopics: number;
  createdCount: number;
  updatedCount: number;
  failedCount: number;
  errorMessage: string | null;
  startedAt: string | null;
  finishedAt: string | null;
  createdAt: string;
}

export const triggerScraperRun = async (): Promise<ScraperRun> => {
  const response = await apiPost<{ success: boolean; data: ScraperRun }>(
    "/api/admin/medical-library/scraper-runs",
    {}
  );
  return response.data;
};

export const getScraperRuns = async (params?: {
  page?: number;
  limit?: number;
}): Promise<{ data: ScraperRun[]; metaData: { totalCount: number; page: number; limit: number; totalPages: number } }> => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append("page", params.page.toString());
  if (params?.limit) queryParams.append("limit", params.limit.toString());
  const queryString = queryParams.toString();
  return apiGet(`/api/admin/medical-library/scraper-runs${queryString ? `?${queryString}` : ""}`);
};

export const getScraperRun = async (id: string): Promise<ScraperRun> => {
  const response = await apiGet<{ success: boolean; data: ScraperRun }>(
    `/api/admin/medical-library/scraper-runs/${id}`
  );
  return response.data;
};
