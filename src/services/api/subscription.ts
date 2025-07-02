import { SubscriptionDetailsResponse, PricingPlansResponse, PlanInterval } from '../types/subscription';
import { apiGet } from './apiUtils';

export const subscriptionApi = {
  async getSubscriptionDetails(employerId: string): Promise<SubscriptionDetailsResponse> {
    return apiGet<SubscriptionDetailsResponse>(`/api/admin/employers/subscription/details/${employerId}`);
  },

  async getSubscriptionPlans(interval: PlanInterval = 'MONTHLY'): Promise<PricingPlansResponse> {
    return apiGet<PricingPlansResponse>(`/api/categories/subscriptionPlans?interval=${interval}`);
  },
};
