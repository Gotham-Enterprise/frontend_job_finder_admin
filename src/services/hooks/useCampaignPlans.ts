import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createCampaignPlan, getCampaignPlans, updateCampaignPlan, type PlanInput } from "../api/campaignPlans";
import { showToast } from "../utils/toast";

const KEY = ["campaign-plans"] as const;

export const useCampaignPlans = () => useQuery({ queryKey: KEY, queryFn: getCampaignPlans });

export const useSaveCampaignPlan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id?: string; input: PlanInput }) => (id ? updateCampaignPlan(id, input) : createCampaignPlan(input)),
    onSuccess: (plan, { id }) => {
      queryClient.invalidateQueries({ queryKey: KEY });
      showToast.success("Saved", id ? `${plan.name} was updated.` : `${plan.name} was created. It stays hidden until you switch it on.`);
    },
    onError: (error: Error) => showToast.error("Could not save", error.message || "Please try again."),
  });
};

export const useTogglePlan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => updateCampaignPlan(id, { isActive }),
    onSuccess: (plan) => {
      queryClient.invalidateQueries({ queryKey: KEY });
      showToast.success(plan.isActive ? "Plan is live" : "Plan hidden", plan.isActive ? `${plan.name} can now be bought.` : `${plan.name} can no longer be bought. Current subscribers are not affected.`);
    },
    onError: (error: Error) => showToast.error("Could not do that", error.message || "Please try again."),
  });
};
