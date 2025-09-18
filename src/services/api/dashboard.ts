import { apiGet } from "./apiUtils";
import {
  DashboardDetailsResponse,
  ApplicationTrendResponse,
  DailyTrendData,
  MonthlyTrendData,
  QuarterlyTrendData,
  ApplicationTrendParams,
  ApplicationCategoryParams,
  ApplicationCategoryResponse,
  BlogViewCountResponse,
  BlogAnalyticsParams,
  BlogAnalyticsResponse,
} from "../types/dashboard";

export const dashboardApi = {
  getDetailsCount: async (): Promise<DashboardDetailsResponse> => {
    return apiGet<DashboardDetailsResponse>("/api/admin/dashboard/details-count");
  },

  getApplicationTrend: async <T = DailyTrendData | MonthlyTrendData | QuarterlyTrendData>(
    params: ApplicationTrendParams
  ): Promise<ApplicationTrendResponse<T>> => {
    const { type, year, month } = params;

    let endpoint = `/api/admin/dashboard/application-trend?type=${type}&year=${year}`;

    if (type === "daily" && month !== undefined) {
      endpoint += `&month=${month}`;
    }

    return apiGet<ApplicationTrendResponse<T>>(endpoint);
  },

  getApplicationCategory: async <T = DailyTrendData | MonthlyTrendData | QuarterlyTrendData>(
    params: ApplicationCategoryParams
  ): Promise<ApplicationCategoryResponse<T>> => {
    const { type, year, month, occupationId } = params;

    let endpoint = `/api/admin/dashboard/application-category?type=${type}&year=${year}&occupationId=${occupationId}`;

    if (type === "daily" && month !== undefined) {
      endpoint += `&month=${month}`;
    }

    return apiGet<ApplicationCategoryResponse<T>>(endpoint);
  },

  getBlogViewCount: async (params: { month: number; year: number }): Promise<BlogViewCountResponse> => {
    const { month, year } = params;
    return apiGet<BlogViewCountResponse>(`/api/admin/blogs/view-count?month=${month}&year=${year}`);
  },

  getBlogAnalytics: async <T = DailyTrendData | MonthlyTrendData | QuarterlyTrendData>(
    params: BlogAnalyticsParams
  ): Promise<BlogAnalyticsResponse<T>> => {
    const { type, year, month } = params;

    let endpoint = `/api/admin/blogs/view-analytics?type=${type}&year=${year}`;

    if (type === "daily" && month !== undefined) {
      endpoint += `&month=${month}`;
    }

    return apiGet<BlogAnalyticsResponse<T>>(endpoint);
  },
};
