import { useQuery } from "@tanstack/react-query";
import { seoReportsAPI } from "../api/seoReportsAPI";

export function useSeoReports() {
  return useQuery({
    queryKey: ["seoReports"],
    queryFn: () => seoReportsAPI.getSeoReports(),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
}

export function useDuplicateJobs() {
  return useQuery({
    queryKey: ["seoDuplicateJobs"],
    queryFn: () => seoReportsAPI.getDuplicateJobs(),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
}

export function useBotLogs() {
  return useQuery({
    queryKey: ["seoBotLogs"],
    queryFn: () => seoReportsAPI.getBotLogs(),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
}
