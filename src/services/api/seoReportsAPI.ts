import { apiGet } from "./apiUtils";
import type { SeoReportsResponse, DuplicateJobsResponse, BotLogsResponse } from "@/types/seo-reports";

class SeoReportsAPI {
  async getSeoReports(): Promise<SeoReportsResponse> {
    return apiGet<SeoReportsResponse>("/api/admin/analytics/seo-reports");
  }

  async getDuplicateJobs(): Promise<DuplicateJobsResponse> {
    return apiGet<DuplicateJobsResponse>("/api/admin/analytics/duplicate-jobs");
  }

  async getBotLogs(): Promise<BotLogsResponse> {
    return apiGet<BotLogsResponse>("/api/admin/analytics/bot-logs");
  }
}

export const seoReportsAPI = new SeoReportsAPI();
