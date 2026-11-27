import { apiGet, apiPost, apiPut } from "./apiUtils";

// The monthly plans employers can buy themselves (self-serve). A new plan stays hidden until it is switched on.
// Changing a plan never changes what existing subscribers get.

export interface CampaignPlan {
  id: string;
  name: string;
  summary: string;
  emailCredits: number;
  smsCredits: number;
  priceInCents: number;
  currency: string;
  features: string[];
  isPopular: boolean;
  isActive: boolean;
  sortOrder: number;
  /** Customers currently paying for this plan. */
  subscribers: number;
  createdAt: string;
  updatedAt: string;
}

export type PlanInput = Partial<Pick<CampaignPlan, "name" | "summary" | "emailCredits" | "smsCredits" | "priceInCents" | "features" | "isPopular" | "isActive" | "sortOrder">>;

const BASE = "/api/admin/campaign-plans";

export const getCampaignPlans = async (): Promise<CampaignPlan[]> => (await apiGet<{ data: { plans: CampaignPlan[] } }>(BASE)).data.plans;
export const createCampaignPlan = async (input: PlanInput): Promise<CampaignPlan> => (await apiPost<{ data: { plan: CampaignPlan } }>(BASE, input)).data.plan;
export const updateCampaignPlan = async (id: string, input: PlanInput): Promise<CampaignPlan> => (await apiPut<{ data: { plan: CampaignPlan } }>(`${BASE}/${id}`, input)).data.plan;
