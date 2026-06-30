import { apiGet } from "./apiUtils";

export type InsuranceType = "MALPRACTICE" | "HEALTH" | "LIFE";
export type InsuranceFormType = "PL_INDIVIDUAL" | "PL_GROUP";
export type InsuranceSubmissionStatus = "PAYABLE" | "REVIEW_SUBMITTED";

export interface InsuranceUserSummary {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
}

export interface InsuranceSubmissionRecord {
  id: string;
  formId: string;
  formType: InsuranceFormType;
  partnerSlug: string;
  insuranceType: InsuranceType;
  status: InsuranceSubmissionStatus;
  userId: string | null;
  customerId: string;
  createdAt: string;
  updatedAt: string;
  user: InsuranceUserSummary | null;
}

export interface InsuranceRedirectRecord {
  id: string;
  partnerSlug: string;
  insuranceType: InsuranceType;
  userId: string | null;
  redirectedAt: string;
  user: InsuranceUserSummary | null;
}

export interface InsurancePagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface InsuranceSubmissionsSummary {
  total: number;
  payableCount: number;
  reviewSubmittedCount: number;
}

export interface InsuranceRedirectsSummary {
  total: number;
  byPartner: { partnerSlug: string; count: number }[];
  byInsuranceType: { insuranceType: InsuranceType; count: number }[];
}

export interface InsuranceSubmissionsResponse {
  success: boolean;
  records: InsuranceSubmissionRecord[];
  pagination: InsurancePagination;
  summary: InsuranceSubmissionsSummary;
}

export interface InsuranceRedirectsResponse {
  success: boolean;
  records: InsuranceRedirectRecord[];
  pagination: InsurancePagination;
  summary: InsuranceRedirectsSummary;
}

export interface InsuranceSubmissionsParams {
  page?: number;
  limit?: number;
  partnerSlug?: string;
  insuranceType?: InsuranceType;
  status?: InsuranceSubmissionStatus;
  formType?: InsuranceFormType;
  startDate?: string;
  endDate?: string;
}

export interface InsuranceRedirectsParams {
  page?: number;
  limit?: number;
  partnerSlug?: string;
  insuranceType?: InsuranceType;
  startDate?: string;
  endDate?: string;
}

function buildQueryString(
  params?: InsuranceSubmissionsParams | InsuranceRedirectsParams
) {
  if (!params) return "";
  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      queryParams.append(key, String(value));
    }
  });
  const queryString = queryParams.toString();
  return queryString ? `?${queryString}` : "";
}

export const getInsuranceSubmissions = async (
  params?: InsuranceSubmissionsParams
): Promise<InsuranceSubmissionsResponse> => {
  return apiGet<InsuranceSubmissionsResponse>(
    `/api/admin/insurance/submissions${buildQueryString(params)}`
  );
};

export const getInsuranceRedirects = async (
  params?: InsuranceRedirectsParams
): Promise<InsuranceRedirectsResponse> => {
  return apiGet<InsuranceRedirectsResponse>(
    `/api/admin/insurance/redirects${buildQueryString(params)}`
  );
};
