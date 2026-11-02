import { useQuery } from "@tanstack/react-query";
import { supervisorApi } from "@/services/api/supervisor";
import { authUtils } from "@/services/utils/authUtils";

export interface PendingSupervisorCounts {
  supervisors: number;
  medicalDirectors: number;
}

const pendingCount = async (group: "supervisors" | "medicalDirectors") => {
  const response = await supervisorApi.getSupervisors({
    page: 1,
    limit: 1,
    verificationStatus: "PENDING",
    group,
  });
  return response?.metaData?.totalCount ?? 0;
};

/** Pending verifications, counted separately for the Supervisors and Medical Directors pages. */
export const usePendingSupervisorCount = () => {
  const isAuthenticated = typeof window !== "undefined" ? authUtils.isAuthenticated() : false;

  return useQuery<PendingSupervisorCounts>({
    queryKey: ["pending-supervisor-count"],
    queryFn: async () => {
      try {
        const [supervisors, medicalDirectors] = await Promise.all([
          pendingCount("supervisors"),
          pendingCount("medicalDirectors"),
        ]);
        return { supervisors, medicalDirectors };
      } catch (error) {
        console.error("[PendingSupervisorCount] Error fetching count:", error);
        return { supervisors: 0, medicalDirectors: 0 };
      }
    },
    enabled: isAuthenticated,
    placeholderData: { supervisors: 0, medicalDirectors: 0 },
    refetchInterval: 60000,
    refetchOnWindowFocus: true,
    staleTime: 30000,
  });
};
