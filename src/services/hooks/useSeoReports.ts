import { useQuery } from "@tanstack/react-query";
import { seoReportsAPI } from "../api/seoReportsAPI";

const SEO_STALE_TIME = Infinity;
const SEO_REFETCH_ON_MOUNT = false;
const SEO_REFETCH_ON_WINDOW_FOCUS = false;

export function useSeoReports() {
  return useQuery({
    queryKey: ["seoReports"],
    queryFn: () => seoReportsAPI.getSeoReports(),
    staleTime: SEO_STALE_TIME,
    refetchOnMount: SEO_REFETCH_ON_MOUNT,
    refetchOnWindowFocus: SEO_REFETCH_ON_WINDOW_FOCUS,
  });
}

export function useDuplicateJobs() {
  return useQuery({
    queryKey: ["seoDuplicateJobs"],
    queryFn: () => seoReportsAPI.getDuplicateJobs(),
    staleTime: SEO_STALE_TIME,
    refetchOnMount: SEO_REFETCH_ON_MOUNT,
    refetchOnWindowFocus: SEO_REFETCH_ON_WINDOW_FOCUS,
  });
}

export function useBotLogs() {
  return useQuery({
    queryKey: ["seoBotLogs"],
    queryFn: () => seoReportsAPI.getBotLogs(),
    staleTime: SEO_STALE_TIME,
    refetchOnMount: SEO_REFETCH_ON_MOUNT,
    refetchOnWindowFocus: SEO_REFETCH_ON_WINDOW_FOCUS,
  });
}

export function useAffiliateJobs(page: number, limit: number) {
  return useQuery({
    queryKey: ["seoAffiliateJobs", page, limit],
    queryFn: () => seoReportsAPI.getAffiliateJobs(page, limit),
    staleTime: SEO_STALE_TIME,
    refetchOnMount: SEO_REFETCH_ON_MOUNT,
    refetchOnWindowFocus: SEO_REFETCH_ON_WINDOW_FOCUS,
  });
}
