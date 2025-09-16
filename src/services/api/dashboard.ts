import { apiGet } from "./apiUtils";
import { DashboardDetailsResponse } from "../types/dashboard";

export const dashboardApi = {
  getDetailsCount: async (): Promise<DashboardDetailsResponse> => {
    return apiGet<DashboardDetailsResponse>("/api/admin/dashboard/details-count");
  },
};