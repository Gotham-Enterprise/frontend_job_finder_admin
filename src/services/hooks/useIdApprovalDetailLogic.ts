import { IdApprovalDetailResponse } from "@/services/types/idApproval";

export const useIdApprovalDetailLogic = (data: IdApprovalDetailResponse) => {
  const { activityLogs, profile, status, securityQuestions } = data.data;

  return {
    id: data.data.id,
    isLocked: profile.isLocked,
    status,
    profile,
    securityQuestions,
    activityLogs,
  };
};
