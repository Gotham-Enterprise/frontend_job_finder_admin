import { apiGet, apiPost } from "./apiUtils";
import type { SeoReportsResponse, DuplicateJobsResponse, BotLogsResponse, AffiliateJobsResponse } from "@/types/seo-reports";

class SeoReportsAPI {
  async getSeoReports(): Promise<SeoReportsResponse> {
    return apiGet<SeoReportsResponse>("/api/admin/analytics/seo-reports");
  }

  async getDuplicateJobs(): Promise<DuplicateJobsResponse> {
    return apiGet<DuplicateJobsResponse>("/api/admin/analytics/duplicate-jobs");
  }

  async refreshDuplicateJobs(): Promise<DuplicateJobsResponse> {
    return apiPost<DuplicateJobsResponse>("/api/admin/analytics/duplicate-jobs/refresh");
  }

  async getBotLogs(): Promise<BotLogsResponse> {
    return apiGet<BotLogsResponse>("/api/admin/analytics/bot-logs");
  }

  async getAffiliateJobs(page = 1, limit = 50): Promise<AffiliateJobsResponse> {
    return apiGet<AffiliateJobsResponse>(`/api/admin/analytics/affiliate-jobs?page=${page}&limit=${limit}`);
  }
}

export const seoReportsAPI = new SeoReportsAPI();
