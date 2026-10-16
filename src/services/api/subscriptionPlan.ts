import { apiGet, apiPatch, apiPost } from './apiUtils';
import { PricingPlansResponse, PlanInterval } from '../types/subscription';
import {
  AdminPlanFilters,
  AdminPlanListResponse,
  AdminPlanMutationResponse,
  CustomPlanPayload,
} from '../types/subscriptionPlan';

const buildListQuery = (filters: AdminPlanFilters) => {
  const params = new URLSearchParams();
  params.set('kind', filters.kind);
  params.set('page', String(filters.page || 1));
  params.set('limit', String(filters.limit || 20));
  if (filters.keyword) params.set('keyword', filters.keyword);
  if (filters.interval) params.set('interval', filters.interval);
  if (filters.sortBy) params.set('sortBy', filters.sortBy);
  if (filters.sortOrder) params.set('sortOrder', filters.sortOrder);
  return params.toString();
};

export const subscriptionPlanApi = {
  async getPlans(filters: AdminPlanFilters): Promise<AdminPlanListResponse> {
    return apiGet<AdminPlanListResponse>(`/api/admin/subscription-plans?${buildListQuery(filters)}`);
  },

  async getCheckoutPlans(interval: PlanInterval = 'MONTHLY'): Promise<PricingPlansResponse> {
    return apiGet<PricingPlansResponse>(`/api/admin/subscription-plans/checkout?interval=${interval}`);
  },

  async createPlan(payload: CustomPlanPayload): Promise<AdminPlanMutationResponse> {
    return apiPost<AdminPlanMutationResponse>('/api/admin/subscription-plans', payload);
  },

  async updatePlan(id: number, payload: CustomPlanPayload): Promise<AdminPlanMutationResponse> {
    return apiPatch<AdminPlanMutationResponse>(`/api/admin/subscription-plans/${id}`, payload);
  },

  async updateStatus(id: number, isActive: boolean): Promise<AdminPlanMutationResponse> {
    return apiPatch<AdminPlanMutationResponse>(`/api/admin/subscription-plans/${id}/status`, { isActive });
  },
};
