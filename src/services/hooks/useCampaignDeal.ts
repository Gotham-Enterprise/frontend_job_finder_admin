import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createPaymentLink,
  getDeal,
  saveQuote,
  sendPaymentLink,
  sendQuote,
  simulatePayment,
  type CampaignDeal,
  type QuoteInput,
} from "../api/campaignDeals";
import { showToast } from "../utils/toast";

const key = (inquiryId: string) => ["campaign-deal", inquiryId] as const;

export const useCampaignDeal = (inquiryId: string | undefined) =>
  useQuery({ queryKey: key(inquiryId ?? ""), queryFn: () => getDeal(inquiryId as string), enabled: !!inquiryId });

// One mutation per step: the screen shows what the server says, and a failure says why.
export const useDealActions = (inquiryId: string) => {
  const queryClient = useQueryClient();
  const done = (message?: string) => (deal: CampaignDeal) => {
    queryClient.setQueryData(key(inquiryId), deal);
    // The inquiry's own status can change too (contacted, converted).
    queryClient.invalidateQueries({ queryKey: ["campaign-inquiries"] });
    if (message) showToast.success("Done", message);
  };
  const failed = (error: Error) => showToast.error("Could not do that", error.message || "Please try again.");

  const useStep = <T,>(fn: (arg: T) => Promise<CampaignDeal>, message?: string) =>
    useMutation({ mutationFn: fn, onSuccess: done(message), onError: failed });

  return {
    saveQuote: useStep((input: QuoteInput) => saveQuote(inquiryId, input), "Quote saved."),
    sendQuote: useStep((id: string) => sendQuote(id), "The quote was emailed to the customer."),
    createPaymentLink: useStep((id: string) => createPaymentLink(id), "Payment link created."),
    sendPaymentLink: useStep((id: string) => sendPaymentLink(id), "The payment link was emailed to the customer."),
    simulatePayment: useStep((id: string) => simulatePayment(id), "Marked as paid (test)."),
  };
};
