import { useState, useEffect, useCallback } from "react";
import { dashboardApi } from "@/services/api/dashboard";
import {
  TrendType,
  DailyTrendData,
  MonthlyTrendData,
  QuarterlyTrendData,
  BlogAnalyticsParams,
  BlogViewCountData,
} from "@/services/types/dashboard";

interface UseBlogAnalyticsReturn {
  analyticsData: (DailyTrendData | MonthlyTrendData | QuarterlyTrendData)[] | null;
  viewCountData: BlogViewCountData | null;
  loading: boolean;
  error: string | null;
  fetchAnalytics: (params: BlogAnalyticsParams) => Promise<void>;
  fetchViewCount: (params: { month: number; year: number }) => Promise<void>;
}

export const useBlogAnalytics = (): UseBlogAnalyticsReturn => {
  const [analyticsData, setAnalyticsData] = useState<(DailyTrendData | MonthlyTrendData | QuarterlyTrendData)[] | null>(
    null
  );
  const [viewCountData, setViewCountData] = useState<BlogViewCountData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async (params: BlogAnalyticsParams) => {
    try {
      setLoading(true);
      setError(null);

      const response = await dashboardApi.getBlogAnalytics(params);

      if (response.success && response.data) {
        setAnalyticsData(response.data);
      } else {
        setError("Failed to fetch blog analytics data");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred while fetching blog analytics data");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchViewCount = useCallback(async (params: { month: number; year: number }) => {
    try {
      setLoading(true);
      setError(null);

      const response = await dashboardApi.getBlogViewCount(params);

      if (response.success && response.data?.viewCount) {
        setViewCountData(response.data.viewCount);
      } else {
        setError("Failed to fetch blog view count data");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred while fetching blog view count data");
    } finally {
      setLoading(false);
    }
  }, []);

  // Load default data (current month and year)
  useEffect(() => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;

    // Fetch both analytics and view count data
    fetchAnalytics({
      type: "monthly",
      year: currentYear,
    });

    fetchViewCount({
      month: currentMonth,
      year: currentYear,
    });
  }, [fetchAnalytics, fetchViewCount]);

  return {
    analyticsData,
    viewCountData,
    loading,
    error,
    fetchAnalytics,
    fetchViewCount,
  };
};
