import { SubscriptionDetailsResponse, PricingPlansResponse, PlanInterval, SubscriptionPurchaseRequest, SubscriptionPurchaseResponse } from '../types/subscription';
import { apiGet, apiPost } from './apiUtils';

export const subscriptionApi = {
  async getSubscriptionDetails(employerId: string): Promise<SubscriptionDetailsResponse> {
    return apiGet<SubscriptionDetailsResponse>(`/api/admin/employers/subscription/details/${employerId}`);
  },

  async getSubscriptionPlans(interval: PlanInterval = 'MONTHLY'): Promise<PricingPlansResponse> {
    return apiGet<PricingPlansResponse>(`/api/categories/subscriptionPlans?interval=${interval}`);
  },

  async purchaseSubscription(purchaseData: SubscriptionPurchaseRequest): Promise<SubscriptionPurchaseResponse> {
    return apiPost<SubscriptionPurchaseResponse>('/api/admin/subscriptions/purchase', purchaseData);
  },
};
