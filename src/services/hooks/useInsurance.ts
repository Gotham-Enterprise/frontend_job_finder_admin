import { useQuery } from "@tanstack/react-query";
import {
  getInsuranceSubmissions,
  getInsuranceRedirects,
  InsuranceSubmissionsParams,
  InsuranceRedirectsParams,
} from "../api/insurance";

export const insuranceQueryKeys = {
  all: ["insurance"] as const,
  submissions: (filters: InsuranceSubmissionsParams) =>
    [...insuranceQueryKeys.all, "submissions", filters] as const,
  redirects: (filters: InsuranceRedirectsParams) =>
    [...insuranceQueryKeys.all, "redirects", filters] as const,
};

export const useInsuranceSubmissions = (
  params?: InsuranceSubmissionsParams,
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: insuranceQueryKeys.submissions(params || {}),
    queryFn: () => getInsuranceSubmissions(params),
    enabled: options?.enabled !== false,
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 5,
  });
};

export const useInsuranceRedirects = (
  params?: InsuranceRedirectsParams,
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: insuranceQueryKeys.redirects(params || {}),
    queryFn: () => getInsuranceRedirects(params),
    enabled: options?.enabled !== false,
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 5,
  });
};
