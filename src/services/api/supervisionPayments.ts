import {
  BillingWeekFilters,
  BillingWeekResponse,
  BillingWeeksResponse,
  LateEntryInput,
  ResolveDisputeInput,
  SupervisorInAppPayments,
  PaymentsSummaryResponse,
} from "../types/supervisionPayments";
import { apiGet, apiPost } from "./apiUtils";

export const supervisionPaymentsApi = {
  async getBillingWeeks(filters: BillingWeekFilters = {}): Promise<BillingWeeksResponse> {
    const queryParams = new URLSearchParams();
    if (filters.page) queryParams.append("page", filters.page.toString());
    if (filters.limit) queryParams.append("limit", filters.limit.toString());
    if (filters.keyword) queryParams.append("keyword", filters.keyword);
    if (filters.status) queryParams.append("status", filters.status);
    if (filters.prepayStatus) queryParams.append("prepayStatus", filters.prepayStatus);
    if (filters.needsAttention) queryParams.append("needsAttention", "true");
    return apiGet<BillingWeeksResponse>(
      `/api/supervision/admin/billing-weeks?${queryParams.toString()}`,
    );
  },

  async getPaymentsSummary(): Promise<PaymentsSummaryResponse> {
    return apiGet<PaymentsSummaryResponse>(`/api/supervision/admin/billing-weeks/summary`);
  },

  async getBillingWeek(id: string): Promise<BillingWeekResponse> {
    return apiGet<BillingWeekResponse>(`/api/supervision/admin/billing-weeks/${id}`);
  },

  async resolveDispute(id: string, input: ResolveDisputeInput): Promise<BillingWeekResponse> {
    return apiPost<BillingWeekResponse>(`/api/supervision/admin/billing-weeks/${id}/resolve`, input);
  },

  async addLateEntry(id: string, input: LateEntryInput): Promise<BillingWeekResponse> {
    return apiPost<BillingWeekResponse>(
      `/api/supervision/admin/billing-weeks/${id}/late-entries`,
      input,
    );
  },

  async retryLateEntryCharge(id: string, sessionId: string): Promise<BillingWeekResponse> {
    return apiPost<BillingWeekResponse>(
      `/api/supervision/admin/billing-weeks/${id}/late-entries/${sessionId}/retry-charge`,
    );
  },

  async getSupervisorInAppPayments(
    supervisorId: string,
  ): Promise<{ success: boolean; data: SupervisorInAppPayments }> {
    return apiGet(`/api/supervision/admin/supervisors/${supervisorId}/in-app-payments`);
  },
};
