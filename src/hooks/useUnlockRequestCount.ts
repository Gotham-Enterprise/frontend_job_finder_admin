import { useQuery } from "@tanstack/react-query";
import { idApprovalApi } from "@/services/api/idApproval";
import { authUtils } from "@/services/utils/authUtils";

export const useUnlockRequestCount = () => {
  const isAuthenticated = typeof window !== "undefined" ? authUtils.isAuthenticated() : false;

  return useQuery({
    queryKey: ["unlock-request-count"],
    queryFn: async () => {
      try {
        const response = await idApprovalApi.getIdApprovals({
          page: 1,
          limit: 1,
          status: "pending",
        });
        const count = response?.metaData?.totalCount ?? 0;
        return count;
      } catch (error) {
        console.error("[UnlockRequestCount] Error fetching count:", error);
        return 0;
      }
    },
    enabled: isAuthenticated, // Only run query if user is authenticated
    placeholderData: 0, // Show 0 while loading instead of undefined
    refetchInterval: 60000, // Refetch every 60 seconds
    refetchOnWindowFocus: true,
    staleTime: 30000, // Consider data stale after 30 seconds
  });
};
