import { useQuery } from "@tanstack/react-query";
import { idApprovalApi } from "@/services/api/idApproval";
import { authUtils } from "@/services/utils/authUtils";

export const useUnlockRequestCount = () => {
  const isAuthenticated = typeof window !== "undefined" ? authUtils.isAuthenticated() : false;

  return useQuery({
    queryKey: ["unlock-request-count"],
    queryFn: async () => {
      const response = await idApprovalApi.getIdApprovals({
        page: 1,
        limit: 1,
        status: "pending",
      });
      return response.metaData.totalCount;
    },
    enabled: isAuthenticated, // Only run query if user is authenticated
    refetchInterval: 60000, // Refetch every 60 seconds
    refetchOnWindowFocus: true,
    staleTime: 30000, // Consider data stale after 30 seconds
  });
};
