import { useQuery } from "@tanstack/react-query";
import { activityLogsApi } from "../api/activityLogs";
import { ActivityLogsFilters } from "../types/activityLog";

// ─────────────────────────────────────────────────────────────────────────────
// Query key factory
// ─────────────────────────────────────────────────────────────────────────────

export const activityLogQueryKeys = {
  all: ["activityLogs"] as const,
  jobSeeker: (userId: string, filters: ActivityLogsFilters) =>
    [...activityLogQueryKeys.all, "jobSeeker", userId, filters] as const,
  employer: (companyId: string, filters: ActivityLogsFilters) =>
    [...activityLogQueryKeys.all, "employer", companyId, filters] as const,
};

// ─────────────────────────────────────────────────────────────────────────────
// Hooks
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Fetches the unified activity timeline for a job seeker (own logs + impersonation events).
 */
export function useJobSeekerActivityLogs(
  userId: string,
  filters: ActivityLogsFilters = {},
) {
  return useQuery({
    queryKey: activityLogQueryKeys.jobSeeker(userId, filters),
    queryFn: () => activityLogsApi.getJobSeekerActivityLogs(userId, filters),
    enabled: !!userId,
    staleTime: 0, // always fetch fresh data — logs are write-once and time-sensitive
    retry: (failureCount, error: Error) => {
      if (error.message.includes("HTTP 401") || error.message.includes("HTTP 403")) {
        return false;
      }
      return failureCount < 2;
    },
  });
}

/**
 * Fetches the unified activity timeline for all users of a company (employer logs + impersonation events).
 */
export function useEmployerActivityLogs(
  companyId: string,
  filters: ActivityLogsFilters = {},
) {
  return useQuery({
    queryKey: activityLogQueryKeys.employer(companyId, filters),
    queryFn: () => activityLogsApi.getEmployerActivityLogs(companyId, filters),
    enabled: !!companyId,
    staleTime: 0,
    retry: (failureCount, error: Error) => {
      if (error.message.includes("HTTP 401") || error.message.includes("HTTP 403")) {
        return false;
      }
      return failureCount < 2;
    },
  });
}
