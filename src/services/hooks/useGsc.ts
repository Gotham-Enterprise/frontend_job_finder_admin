import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { gscAPI } from "../api/gscAPI";

const GSC_STALE_TIME = 1000 * 60 * 5;
const GSC_REFETCH_ON_MOUNT = false;
const GSC_REFETCH_ON_WINDOW_FOCUS = false;

export function useGscStatus() {
  return useQuery({
    queryKey: ["gsc", "status"],
    queryFn: () => gscAPI.getStatus(),
    staleTime: GSC_STALE_TIME,
    refetchOnMount: GSC_REFETCH_ON_MOUNT,
    refetchOnWindowFocus: GSC_REFETCH_ON_WINDOW_FOCUS,
  });
}

export function useGscProperties() {
  return useQuery({
    queryKey: ["gsc", "properties"],
    queryFn: () => gscAPI.listProperties(),
    staleTime: GSC_STALE_TIME,
    refetchOnMount: GSC_REFETCH_ON_MOUNT,
    refetchOnWindowFocus: GSC_REFETCH_ON_WINDOW_FOCUS,
  });
}

export function useGscAnalyticsSummary(params: { startDate?: string; endDate?: string; range?: string } = {}) {
  return useQuery({
    queryKey: ["gsc", "analytics", "summary", params.startDate, params.endDate, params.range],
    queryFn: () => gscAPI.getAnalyticsSummary(params),
    staleTime: GSC_STALE_TIME,
    refetchOnMount: GSC_REFETCH_ON_MOUNT,
    refetchOnWindowFocus: GSC_REFETCH_ON_WINDOW_FOCUS,
  });
}

export function useGscAnalytics(params: {
  propertyId?: string;
  startDate?: string;
  endDate?: string;
  aggregate?: string;
  query?: string;
  page?: string;
} = {}) {
  return useQuery({
    queryKey: ["gsc", "analytics", params],
    queryFn: () => gscAPI.getAnalytics(params),
    staleTime: GSC_STALE_TIME,
    refetchOnMount: GSC_REFETCH_ON_MOUNT,
    refetchOnWindowFocus: GSC_REFETCH_ON_WINDOW_FOCUS,
  });
}

export function useGscSitemaps(propertyId?: string) {
  return useQuery({
    queryKey: ["gsc", "sitemaps", propertyId],
    queryFn: () => gscAPI.getSitemaps({ propertyId }),
    staleTime: GSC_STALE_TIME,
    refetchOnMount: GSC_REFETCH_ON_MOUNT,
    refetchOnWindowFocus: GSC_REFETCH_ON_WINDOW_FOCUS,
  });
}

export function useGscSyncHistory(propertyId?: string) {
  return useQuery({
    queryKey: ["gsc", "syncHistory", propertyId],
    queryFn: () => gscAPI.getSyncHistory(propertyId),
    staleTime: GSC_STALE_TIME,
    refetchOnMount: GSC_REFETCH_ON_MOUNT,
    refetchOnWindowFocus: GSC_REFETCH_ON_WINDOW_FOCUS,
  });
}

export function useGscUpdateSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ key, value }: { key: string; value: string }) => gscAPI.updateSettings(key, value),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gsc", "status"] });
    },
  });
}

export function useGscTriggerSync() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (propertyId?: string) => gscAPI.triggerSync(propertyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gsc"] });
    },
  });
}

export function useGscSyncSitemaps() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => gscAPI.syncSitemaps(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gsc", "sitemaps"] });
      queryClient.invalidateQueries({ queryKey: ["gsc", "properties"] });
    },
  });
}

export function useGscSubmitSitemap() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ siteUrl, feedPath }: { siteUrl: string; feedPath: string }) => gscAPI.submitSitemap(siteUrl, feedPath),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gsc", "sitemaps"] });
    },
  });
}
