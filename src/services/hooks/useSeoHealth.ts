import { useQuery } from "@tanstack/react-query";
import { seoHealthAPI } from "../api/seoHealthAPI";
import type { SeoHealthMetric } from "@/types/seo-health";

const SEO_STALE_TIME = Infinity;
const SEO_REFETCH_ON_MOUNT = false;
const SEO_REFETCH_ON_WINDOW_FOCUS = false;

export function useSeoHealth() {
  return useQuery({
    queryKey: ["seoHealth"],
    queryFn: () => seoHealthAPI.getHealth(),
    staleTime: SEO_STALE_TIME,
    refetchOnMount: SEO_REFETCH_ON_MOUNT,
    refetchOnWindowFocus: SEO_REFETCH_ON_WINDOW_FOCUS,
  });
}

export function useSchemaQuality() {
  return useQuery({
    queryKey: ["seoSchemaQuality"],
    queryFn: () => seoHealthAPI.getSchemaQuality(),
    staleTime: SEO_STALE_TIME,
    refetchOnMount: SEO_REFETCH_ON_MOUNT,
    refetchOnWindowFocus: SEO_REFETCH_ON_WINDOW_FOCUS,
  });
}

export function useHealthDetail(
  metric: SeoHealthMetric,
  params: { page?: number; issue?: string; filter?: string; daysFrom?: number; daysTo?: number } = {}
) {
  return useQuery({
    queryKey: ["seoHealthDetail", metric, params],
    queryFn: () => seoHealthAPI.getHealthDetail(metric, params),
    staleTime: 1000 * 60 * 2,
  });
}
