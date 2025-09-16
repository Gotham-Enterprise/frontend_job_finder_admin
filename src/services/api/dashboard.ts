import { apiGet } from "./apiUtils";
import {
  DashboardDetailsResponse,
  ApplicationTrendResponse,
  DailyTrendData,
  MonthlyTrendData,
  QuarterlyTrendData,
  ApplicationTrendParams,
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
};
