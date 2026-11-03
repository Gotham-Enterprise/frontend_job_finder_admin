import {
  MonthlyPeriodFilters,
  MonthlyPeriodMessagesResponse,
  MonthlyPeriodResponse,
  MonthlyPeriodsResponse,
  ResolveMonthlyDisputeInput,
} from "../types/supervisionMonthlyPayments";
import { apiGet, apiPost } from "./apiUtils";

/** In-app monthly billing (Medical Director retainers), apart from the hourly billing weeks. */
export const supervisionMonthlyPaymentsApi = {
  async getPeriods(filters: MonthlyPeriodFilters = {}): Promise<MonthlyPeriodsResponse> {
    const queryParams = new URLSearchParams();
    if (filters.page) queryParams.append("page", filters.page.toString());
    if (filters.limit) queryParams.append("limit", filters.limit.toString());
    if (filters.keyword) queryParams.append("keyword", filters.keyword);
    if (filters.status) queryParams.append("status", filters.status);
    if (filters.needsAttention) queryParams.append("needsAttention", "true");
    return apiGet<MonthlyPeriodsResponse>(`/api/supervision/admin/monthly-periods?${queryParams.toString()}`);
  },

  async getPeriod(id: string): Promise<MonthlyPeriodResponse> {
    return apiGet<MonthlyPeriodResponse>(`/api/supervision/admin/monthly-periods/${id}`);
  },

  /** A disputed month's hire chat. Each call is recorded with the admin's name. */
  async getPeriodMessages(id: string): Promise<MonthlyPeriodMessagesResponse> {
    return apiGet<MonthlyPeriodMessagesResponse>(`/api/supervision/admin/monthly-periods/${id}/messages`);
  },

  async resolveDispute(id: string, input: ResolveMonthlyDisputeInput): Promise<MonthlyPeriodResponse> {
    return apiPost<MonthlyPeriodResponse>(`/api/supervision/admin/monthly-periods/${id}/resolve`, input);
  },
};
