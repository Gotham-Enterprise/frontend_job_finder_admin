import { useQuery } from "@tanstack/react-query";
import { supervisorApi } from "@/services/api/supervisor";
import { authUtils } from "@/services/utils/authUtils";

export const usePendingSupervisorCount = () => {
  const isAuthenticated = typeof window !== "undefined" ? authUtils.isAuthenticated() : false;

  return useQuery({
    queryKey: ["pending-supervisor-count"],
    queryFn: async () => {
      try {
        const response = await supervisorApi.getSupervisors({
          page: 1,
          limit: 1,
          verificationStatus: "PENDING",
        });
        return response?.metaData?.totalCount ?? 0;
      } catch (error) {
        console.error("[PendingSupervisorCount] Error fetching count:", error);
        return 0;
      }
    },
    enabled: isAuthenticated,
    placeholderData: 0,
    refetchInterval: 60000,
    refetchOnWindowFocus: true,
    staleTime: 30000,
  });
};
