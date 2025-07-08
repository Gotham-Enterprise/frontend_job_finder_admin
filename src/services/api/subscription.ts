import { SubscriptionDetailsResponse, PricingPlansResponse, PlanInterval, SubscriptionPurchaseRequest, SubscriptionPurchaseResponse, CouponVerificationResponse } from '../types/subscription';
import { apiGet, apiPost, apiPut } from './apiUtils';

export const subscriptionApi = {
  async getSubscriptionDetails(employerId: string): Promise<SubscriptionDetailsResponse> {
    return apiGet<SubscriptionDetailsResponse>(`/api/admin/employers/subscription/details/${employerId}`);
  },

  async getSubscriptionByCompanyId(companyId: string): Promise<SubscriptionDetailsResponse> {
    return apiGet<SubscriptionDetailsResponse>(`/api/admin/subscriptions/company/${companyId}`);
  },

  async getSubscriptionPlans(interval: PlanInterval = 'MONTHLY'): Promise<PricingPlansResponse> {
    return apiGet<PricingPlansResponse>(`/api/categories/subscriptionPlans?interval=${interval}`);
  },

  async verifyCoupon(couponRedemptionCode: string): Promise<CouponVerificationResponse> {
    return apiGet<CouponVerificationResponse>(`/api/admin/coupons/verify/${couponRedemptionCode}`);
  },

  async purchaseSubscription(purchaseData: SubscriptionPurchaseRequest): Promise<SubscriptionPurchaseResponse> {
    return apiPost<SubscriptionPurchaseResponse>('/api/admin/subscriptions/purchase', purchaseData);
  },

  async cancelSubscription(companyId: string): Promise<{ success: boolean; message: string }> {
    return apiPut<{ success: boolean; message: string }>(`/api/admin/subscriptions/cancel/${companyId}`);
  },
};
