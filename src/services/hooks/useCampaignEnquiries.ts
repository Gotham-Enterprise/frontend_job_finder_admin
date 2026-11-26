import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CampaignEnquiryFilters,
  cancelCreditTopup,
  getCreditTopup,
  resendCreditTopup,
  sendCreditTopup,
  simulateCreditTopupPaid,
  getCampaignEnquiries,
  getCampaignEnquiryStats,
  grantEnquiryCredits,
  updateCampaignEnquiry,
} from "../api/campaignEnquiries";
import { showToast } from "../utils/toast";

const keys = {
  all: ["campaign-enquiries"] as const,
  list: (filters: CampaignEnquiryFilters) => ["campaign-enquiries", "list", filters] as const,
  stats: ["campaign-enquiries", "stats"] as const,
};

export const useCampaignEnquiries = (filters: CampaignEnquiryFilters) =>
  useQuery({ queryKey: keys.list(filters), queryFn: () => getCampaignEnquiries(filters), placeholderData: keepPreviousData });

export const useCampaignEnquiryStats = () =>
  useQuery({ queryKey: keys.stats, queryFn: getCampaignEnquiryStats });

export const useUpdateCampaignEnquiry = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...changes }: { id: string } & Parameters<typeof updateCampaignEnquiry>[1]) =>
      updateCampaignEnquiry(id, changes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.all });
      showToast.success("Saved", "The enquiry has been updated.");
    },
    onError: (error: Error) => showToast.error("Could not save", error.message || "Please try again."),
  });
};

export const useGrantEnquiryCredits = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...input }: { id: string } & Parameters<typeof grantEnquiryCredits>[1]) => grantEnquiryCredits(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.all });
      showToast.success("Credits added", "The customer was emailed and the request is closed.");
    },
    onError: (error: Error) => showToast.error("Could not add credits", error.message || "Please try again."),
  });
};

// The one-off top-up with a payment link, for one request.
export const useCreditTopup = (enquiryId: string | undefined, enabled = true) =>
  useQuery({ queryKey: ["campaign-enquiries", "topup", enquiryId], queryFn: () => getCreditTopup(enquiryId as string), enabled: !!enquiryId && enabled });

export const useCreditTopupActions = (enquiryId: string) => {
  const queryClient = useQueryClient();
  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["campaign-enquiries"] });
  };
  const failed = (error: Error) => showToast.error("Could not do that", error.message || "Please try again.");
  return {
    send: useMutation({
      mutationFn: (input: Parameters<typeof sendCreditTopup>[1]) => sendCreditTopup(enquiryId, input),
      onSuccess: () => { refresh(); showToast.success("Payment link sent", "The customer was emailed a one-time payment link."); },
      onError: failed,
    }),
    resend: useMutation({
      mutationFn: () => resendCreditTopup(enquiryId),
      onSuccess: () => { refresh(); showToast.success("Sent again", "The payment link was emailed again."); },
      onError: failed,
    }),
    cancel: useMutation({
      mutationFn: () => cancelCreditTopup(enquiryId),
      onSuccess: () => { refresh(); showToast.success("Link withdrawn", "The payment link no longer works."); },
      onError: failed,
    }),
    simulate: useMutation({
      mutationFn: () => simulateCreditTopupPaid(enquiryId),
      onSuccess: () => { refresh(); showToast.success("Marked as paid (test)", "The credits were added."); },
      onError: failed,
    }),
  };
};
