import { useCallback, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { DocumentVerificationDetailResponse, UseDocumentVerificationDetailLogic } from "@/services/types/documentVerification";
import { documentVerificationQueryKeys, useDocumentVerificationUpdateStatus } from "@/services/hooks/useDocumentVerification";

export const useDocumentVerificationDetailLogic = (
  data: DocumentVerificationDetailResponse
): UseDocumentVerificationDetailLogic => {
  const queryClient = useQueryClient();
  const { kind, id, verificationStatus } = data.data;

  const [displayReview, setDisplayReview] = useState<boolean>(false);

  const { mutate: updateStatus, isPending: isUpdating, isSuccess: isStatusUpdated } = useDocumentVerificationUpdateStatus();

  const isPendingStatus = verificationStatus === "pending";

  const onToggleReview = useCallback(() => {
    setDisplayReview((prev) => !prev);
  }, []);
  const onUpdateStatus = useCallback(
    (status: "verified" | "rejected", rejectionReason?: string) => {
      updateStatus(
        { kind, id, status, rejectionReason },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: documentVerificationQueryKeys.detail(kind, id) });
            queryClient.invalidateQueries({ queryKey: documentVerificationQueryKeys.lists() });
            onToggleReview();
          },
        }
      );
    },
    [kind, id, updateStatus, onToggleReview, queryClient]
  );

  return {
    document: data.data,
    isLoading: isUpdating,
    isPendingStatus,
    isStatusUpdated,
    displayReview,
    onToggleReview,
    onUpdateStatus,
  };
};
