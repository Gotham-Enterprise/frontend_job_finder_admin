import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { supervisionEngagementApi } from "../api/supervisionEngagement";
import type { EngagementOverviewPeriod, EngagementRole } from "../types/supervisionEngagement";
import { errorUtils } from "../utils/errorUtils";

export const supervisionEngagementQueryKeys = {
  all: ["supervisionEngagement"] as const,
  detail: (role: EngagementRole, id: string) =>
    [...supervisionEngagementQueryKeys.all, role, id] as const,
  timeline: (conversationId: string, page: number) =>
    [...supervisionEngagementQueryKeys.all, "timeline", conversationId, page] as const,
  overview: (period: EngagementOverviewPeriod, timezone: string) =>
    [...supervisionEngagementQueryKeys.all, "overview", period, timezone] as const,
};

/** The admin's IANA timezone, so trend buckets match their calendar days. */
function browserTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}

const retryUnlessAuthOrMissing = (failureCount: number, error: Error) => {
  if (errorUtils.isAuthError(error) || errorUtils.isNotFoundError(error)) return false;
  return failureCount < 2;
};

export const useSupervisionEngagement = (role: EngagementRole, id: string) => {
  return useQuery({
    queryKey: supervisionEngagementQueryKeys.detail(role, id),
    queryFn: () => supervisionEngagementApi.getEngagement(role, id),
    enabled: !!id,
    staleTime: 1000 * 60,
    retry: retryUnlessAuthOrMissing,
  });
};

/** Paginated message timeline for one conversation; disabled while `conversationId` is null. */
export const useConversationTimeline = (conversationId: string | null, page: number) => {
  return useQuery({
    queryKey: supervisionEngagementQueryKeys.timeline(conversationId ?? "", page),
    queryFn: () => supervisionEngagementApi.getConversationTimeline(conversationId as string, page),
    enabled: !!conversationId,
    staleTime: 1000 * 60,
    placeholderData: keepPreviousData,
    retry: retryUnlessAuthOrMissing,
  });
};

/** Platform-wide dashboard data; keeps the previous period's data while a new one loads. */
export const useEngagementOverview = (period: EngagementOverviewPeriod) => {
  const timezone = browserTimezone();
  return useQuery({
    queryKey: supervisionEngagementQueryKeys.overview(period, timezone),
    queryFn: () => supervisionEngagementApi.getOverview(period, timezone),
    staleTime: 1000 * 60,
    placeholderData: keepPreviousData,
    retry: retryUnlessAuthOrMissing,
  });
};
