import { useState, useEffect, useCallback } from "react";
import { dashboardApi } from "@/services/api/dashboard";
import {
  TrendType,
  DailyTrendData,
  MonthlyTrendData,
  QuarterlyTrendData,
  ApplicationTrendParams,
} from "@/services/types/dashboard";

interface UseApplicationTrendsReturn {
  data: (DailyTrendData | MonthlyTrendData | QuarterlyTrendData)[] | null;
  loading: boolean;
  error: string | null;
  fetchTrends: (params: ApplicationTrendParams) => Promise<void>;
}

export const useApplicationTrends = (): UseApplicationTrendsReturn => {
  const [data, setData] = useState<(DailyTrendData | MonthlyTrendData | QuarterlyTrendData)[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTrends = useCallback(async (params: ApplicationTrendParams) => {
    try {
      setLoading(true);
      setError(null);

      const response = await dashboardApi.getApplicationTrend(params);

      if (response.success && response.data) {
        setData(response.data);
      } else {
        setError("Failed to fetch application trend data");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred while fetching trend data");
    } finally {
      setLoading(false);
    }
  }, []);

  // Load monthly data by default (current year)
  useEffect(() => {
    fetchTrends({
      type: "monthly",
      year: new Date().getFullYear(),
    });
  }, [fetchTrends]);

  return {
    data,
    loading,
    error,
    fetchTrends,
  };
};
