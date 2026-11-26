import { useQuery } from "@tanstack/react-query";
import { supervisorApi } from "@/services/api/supervisor";
import { authUtils } from "@/services/utils/authUtils";

const PRECEPTOR_TYPE_NAME = "Preceptor";

export interface PendingSupervisorCounts {
  /** Pending supervisors excluding Preceptors (the Supervisor sidebar badge). */
  supervisors: number;
  /** Pending Preceptors (the Preceptor sidebar badge). */
  preceptors: number;
}

const EMPTY: PendingSupervisorCounts = { supervisors: 0, preceptors: 0 };

async function countPending(filters: { supervisorType?: string; excludeSupervisorType?: string }): Promise<number> {
  const response = await supervisorApi.getSupervisors({
    page: 1,
    limit: 1,
    verificationStatus: "PENDING",
    ...filters,
  });
  return response?.metaData?.totalCount ?? 0;
}

export const usePendingSupervisorCount = () => {
  const isAuthenticated = typeof window !== "undefined" ? authUtils.isAuthenticated() : false;

  return useQuery<PendingSupervisorCounts>({
    queryKey: ["pending-supervisor-count"],
    queryFn: async () => {
      try {
        const [supervisors, preceptors] = await Promise.all([
          countPending({ excludeSupervisorType: PRECEPTOR_TYPE_NAME }),
          countPending({ supervisorType: PRECEPTOR_TYPE_NAME }),
        ]);
        return { supervisors, preceptors };
      } catch (error) {
        console.error("[PendingSupervisorCount] Error fetching count:", error);
        return EMPTY;
      }
    },
    enabled: isAuthenticated,
    placeholderData: EMPTY,
    refetchInterval: 60000,
    refetchOnWindowFocus: true,
    staleTime: 30000,
  });
};
