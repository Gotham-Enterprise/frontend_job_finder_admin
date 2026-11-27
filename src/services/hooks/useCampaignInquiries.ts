import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CampaignInquiryFilters,
  cancelCreditTopup,
  getCreditTopup,
  resendCreditTopup,
  sendCreditTopup,
  simulateCreditTopupPaid,
  getCampaignInquiries,
  getCampaignInquiryStats,
  grantInquiryCredits,
  updateCampaignInquiry,
} from "../api/campaignInquiries";
import { showToast } from "../utils/toast";

const keys = {
  all: ["campaign-inquiries"] as const,
  list: (filters: CampaignInquiryFilters) => ["campaign-inquiries", "list", filters] as const,
  stats: ["campaign-inquiries", "stats"] as const,
};

export const useCampaignInquiries = (filters: CampaignInquiryFilters) =>
  useQuery({ queryKey: keys.list(filters), queryFn: () => getCampaignInquiries(filters), placeholderData: keepPreviousData });

export const useCampaignInquiryStats = () =>
  useQuery({ queryKey: keys.stats, queryFn: getCampaignInquiryStats });

export const useUpdateCampaignInquiry = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...changes }: { id: string } & Parameters<typeof updateCampaignInquiry>[1]) =>
      updateCampaignInquiry(id, changes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.all });
      showToast.success("Saved", "The inquiry has been updated.");
    },
    onError: (error: Error) => showToast.error("Could not save", error.message || "Please try again."),
  });
};

export const useGrantInquiryCredits = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...input }: { id: string } & Parameters<typeof grantInquiryCredits>[1]) => grantInquiryCredits(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.all });
      showToast.success("Credits added", "The customer was emailed and the request is closed.");
    },
    onError: (error: Error) => showToast.error("Could not add credits", error.message || "Please try again."),
  });
};

// The one-off top-up with a payment link, for one request.
export const useCreditTopup = (inquiryId: string | undefined, enabled = true) =>
  useQuery({ queryKey: ["campaign-inquiries", "topup", inquiryId], queryFn: () => getCreditTopup(inquiryId as string), enabled: !!inquiryId && enabled });

export const useCreditTopupActions = (inquiryId: string) => {
  const queryClient = useQueryClient();
  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["campaign-inquiries"] });
  };
  const failed = (error: Error) => showToast.error("Could not do that", error.message || "Please try again.");
  return {
    send: useMutation({
      mutationFn: (input: Parameters<typeof sendCreditTopup>[1]) => sendCreditTopup(inquiryId, input),
      onSuccess: () => { refresh(); showToast.success("Payment link sent", "The customer was emailed a one-time payment link."); },
      onError: failed,
    }),
    resend: useMutation({
      mutationFn: () => resendCreditTopup(inquiryId),
      onSuccess: () => { refresh(); showToast.success("Sent again", "The payment link was emailed again."); },
      onError: failed,
    }),
    cancel: useMutation({
      mutationFn: () => cancelCreditTopup(inquiryId),
      onSuccess: () => { refresh(); showToast.success("Link withdrawn", "The payment link no longer works."); },
      onError: failed,
    }),
    simulate: useMutation({
      mutationFn: () => simulateCreditTopupPaid(inquiryId),
      onSuccess: () => { refresh(); showToast.success("Marked as paid (test)", "The credits were added."); },
      onError: failed,
    }),
  };
};
