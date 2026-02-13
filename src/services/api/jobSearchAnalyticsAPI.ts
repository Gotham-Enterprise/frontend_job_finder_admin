import { apiRequest } from "./apiUtils";
import type {
  JobSearchStatistics,
  KeywordTrend,
  FilterUsage,
  LocationAnalytics,
  SearchTrend,
  RecentSearch,
} from "@/types/job-search-analytics";

class JobSearchAnalyticsAPI {
  private baseURL = "/api/admin/job-search-analytics";

  async getStatistics(hours: number = 24): Promise<{ success: boolean; data: JobSearchStatistics }> {
    return apiRequest(`${this.baseURL}/statistics?hours=${hours}`);
  }

  async getTopKeywords(limit: number = 20): Promise<{
    success: boolean;
    data: Array<{ keyword: string; count: number }>;
  }> {
    return apiRequest(`${this.baseURL}/keywords/top?limit=${limit}`);
  }

  async getKeywordTrends(
    keyword: string,
    hours: number = 168
  ): Promise<{
    success: boolean;
    data: KeywordTrend;
  }> {
    return apiRequest(`${this.baseURL}/keywords/${encodeURIComponent(keyword)}/trends?hours=${hours}`);
  }

  async getFilterUsage(): Promise<{ success: boolean; data: FilterUsage[] }> {
    return apiRequest(`${this.baseURL}/filters`);
  }

  async getLocationAnalytics(): Promise<{ success: boolean; data: LocationAnalytics }> {
    return apiRequest(`${this.baseURL}/locations`);
  }

  async getSearchTrends(days: number = 30): Promise<{ success: boolean; data: SearchTrend[] }> {
    return apiRequest(`${this.baseURL}/trends?days=${days}`);
  }

  async getRecentSearches(
    page: number = 1,
    limit: number = 50
  ): Promise<{
    success: boolean;
    data: RecentSearch[];
    metaData: {
      page: number;
      limit: number;
      totalCount: number;
      totalPages: number;
    };
  }> {
    return apiRequest(`${this.baseURL}/recent?page=${page}&limit=${limit}`);
  }
}

export const jobSearchAnalyticsAPI = new JobSearchAnalyticsAPI();
