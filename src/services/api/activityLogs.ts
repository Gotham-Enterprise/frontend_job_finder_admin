import { apiGet } from "./apiUtils";
import { ActivityLogsFilters, ActivityLogsResponse } from "../types/activityLog";

function buildQuery(filters: ActivityLogsFilters): string {
  const params = new URLSearchParams();
  if (filters.page) params.append("page", filters.page.toString());
  if (filters.limit) params.append("limit", filters.limit.toString());
  if (filters.startDate) params.append("startDate", filters.startDate);
  if (filters.endDate) params.append("endDate", filters.endDate);
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export const activityLogsApi = {
  /**
   * GET /api/admin/jobseekers/:id/activity-logs
   * Returns the job seeker's own activity logs merged with admin impersonation events.
   */
  getJobSeekerActivityLogs(
    userId: string,
    filters: ActivityLogsFilters = {},
  ): Promise<ActivityLogsResponse> {
    return apiGet<ActivityLogsResponse>(
      `/api/admin/jobseekers/${userId}/activity-logs${buildQuery(filters)}`,
    );
  },

  /**
   * GET /api/admin/employers/:companyId/activity-logs
   * Returns all employer activity logs for the company merged with admin impersonation events.
   */
  getEmployerActivityLogs(
    companyId: string,
    filters: ActivityLogsFilters = {},
  ): Promise<ActivityLogsResponse> {
    return apiGet<ActivityLogsResponse>(
      `/api/admin/employers/${companyId}/activity-logs${buildQuery(filters)}`,
    );
  },
};
