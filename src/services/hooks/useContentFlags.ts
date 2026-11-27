import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getContentFlags, reviewContentFlag, type FlagStatus } from "../api/campaignModeration";
import { showToast } from "../utils/toast";

export const useContentFlags = (params: { status: FlagStatus; page: number; limit: number }) =>
  useQuery({ queryKey: ["campaign-content-flags", params], queryFn: () => getContentFlags(params), placeholderData: keepPreviousData });

export const useReviewContentFlag = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, decision, note }: { id: string; decision: "APPROVE" | "UPHOLD"; note?: string }) => reviewContentFlag(id, { decision, note }),
    onSuccess: (_flag, { decision }) => {
      queryClient.invalidateQueries({ queryKey: ["campaign-content-flags"] });
      showToast.success(
        "Done",
        decision === "APPROVE" ? "Approved. The customer was emailed and can resubmit." : "The flag stands. The customer needs to edit the message.",
      );
    },
    onError: (error: Error) => showToast.error("Could not do that", error.message || "Please try again."),
  });
};
