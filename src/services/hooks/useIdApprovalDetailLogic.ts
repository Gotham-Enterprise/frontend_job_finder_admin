import { useCallback, useState } from "react";

import { IdApproval, IdApprovalDetailResponse, UseIdApprovalDetailLogic } from "@/services/types/idApproval";
import { idApprovalQueryKeys, useUnlockAccount, useIdApprovalUpdateStatus } from "@/services/hooks/useIdApproval";
import { useQueryClient } from "@tanstack/react-query";

export const useIdApprovalDetailLogic = (data: IdApprovalDetailResponse): UseIdApprovalDetailLogic => {
  const queryClient = useQueryClient();
  const { id, activityLogs, profile, status, securityQuestions } = data.data;

  const [displayReview, setDisplayReview] = useState<boolean>(false);

  const { mutate: unlock, isPending, isSuccess: isUnlocked } = useUnlockAccount();
  const { mutate: updateStatus, isPending: isUpdating, isSuccess: isStatusUpdated } = useIdApprovalUpdateStatus();

  const isLoading = isPending || isUpdating;
  const isPendingStatus = status === "pending";

  const onUnlockAccount = useCallback(() => {
    unlock(id, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: idApprovalQueryKeys.detail(id) });
      },
    });
  }, [id, unlock, queryClient]);
  const onToggleReview = useCallback(() => {
    setDisplayReview((prev) => !prev);
  }, []);
  const onUpdateStatus = useCallback(
    (status: IdApproval["status"]) => {
      updateStatus(
        { id, status },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: idApprovalQueryKeys.detail(id) });
          },
        }
      );
    },
    [id, updateStatus, queryClient]
  );

  return {
    id: data.data.id,
    isLocked: profile.isLocked,
    status,
    profile,
    securityQuestions,
    activityLogs,
    isLoading,
    isUnlocked,
    displayReview,
    isPendingStatus,
    isStatusUpdated,
    onUnlockAccount,
    onToggleReview,
    onUpdateStatus,
  };
};
