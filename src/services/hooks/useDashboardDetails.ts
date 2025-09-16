import { useState, useEffect } from "react";
import { dashboardApi } from "@/services/api/dashboard";
import { DashboardDetailsData } from "@/services/types/dashboard";

interface UseDashboardDetailsReturn {
  data: DashboardDetailsData | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useDashboardDetails = (): UseDashboardDetailsReturn => {
  const [data, setData] = useState<DashboardDetailsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await dashboardApi.getDetailsCount();
      
      if (response.success && response.data) {
        setData(response.data);
      } else {
        setError("Failed to fetch dashboard data");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred while fetching dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
};