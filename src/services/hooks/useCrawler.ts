import { useQuery } from "@tanstack/react-query";
import { crawlerAPI } from "../api/crawlerAPI";

export function useCrawlerDashboard(params?: { period?: string; crawlerType?: string; seoPageType?: string; httpStatus?: string }) {
  return useQuery({
    queryKey: ["crawler", "dashboard", params],
    queryFn: () => crawlerAPI.getDashboard(params),
    refetchInterval: 60000,
  });
}

export function useCrawlerRequests(params?: { period?: string; crawlerType?: string; seoPageType?: string; httpStatus?: string; url?: string; limit?: string; offset?: string }) {
  return useQuery({
    queryKey: ["crawler", "requests", params],
    queryFn: () => crawlerAPI.getRequests(params),
    refetchInterval: 30000,
  });
}

export function useCrawlerAlerts(params?: { period?: string }) {
  return useQuery({
    queryKey: ["crawler", "alerts", params],
    queryFn: () => crawlerAPI.getAlerts(params),
    refetchInterval: 60000,
  });
}

export function useCrawlerHealth(params?: { period?: string }) {
  return useQuery({
    queryKey: ["crawler", "health", params],
    queryFn: () => crawlerAPI.getCrawlerHealth(params),
    refetchInterval: 60000,
  });
}

// CloudWatch WAF-powered hooks
export function useCwDashboard(params?: { period?: string }) {
  return useQuery({
    queryKey: ["crawler", "cw", "dashboard", params],
    queryFn: () => crawlerAPI.getCwDashboard(params),
    refetchInterval: 120000,
  });
}

export function useCwRequests(params?: { period?: string; limit?: string }) {
  return useQuery({
    queryKey: ["crawler", "cw", "requests", params],
    queryFn: () => crawlerAPI.getCwRequests(params),
    refetchInterval: 60000,
  });
}

export function useCwAlerts(params?: { period?: string }) {
  return useQuery({
    queryKey: ["crawler", "cw", "alerts", params],
    queryFn: () => crawlerAPI.getCwAlerts(params),
    refetchInterval: 120000,
  });
}
