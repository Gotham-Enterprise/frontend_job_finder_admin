import { useQuery } from "@tanstack/react-query";
import { seoHealthAPI } from "../api/seoHealthAPI";
import type { SeoHealthMetric } from "@/types/seo-health";

export function useSeoHealth() {
  return useQuery({
    queryKey: ["seoHealth"],
    queryFn: () => seoHealthAPI.getHealth(),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
}

export function useSchemaQuality() {
  return useQuery({
    queryKey: ["seoSchemaQuality"],
    queryFn: () => seoHealthAPI.getSchemaQuality(),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
}

export function useHealthDetail(
  metric: SeoHealthMetric,
  params: { page?: number; issue?: string; filter?: string; days?: number } = {}
) {
  return useQuery({
    queryKey: ["seoHealthDetail", metric, params],
    queryFn: () => seoHealthAPI.getHealthDetail(metric, params),
    staleTime: 1000 * 60 * 2,
  });
}
