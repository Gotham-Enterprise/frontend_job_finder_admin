import { SubscriptionDetailsResponse } from '../types/subscription';
import { apiGet } from './apiUtils';

export const subscriptionApi = {
  async getSubscriptionDetails(employerId: string): Promise<SubscriptionDetailsResponse> {
    return apiGet<SubscriptionDetailsResponse>(`/api/admin/employers/subscription/details/${employerId}`);
  },
};
