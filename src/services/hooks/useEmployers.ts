import { useQuery } from "@tanstack/react-query";
import { employerApi } from "../api/employer";
import { EmployerFilters } from "../types/employer";
import { apiDelete } from "@/services/api/apiUtils";

export const employerQueryKeys = {
  all: ["employers"] as const,
  lists: () => [...employerQueryKeys.all, "list"] as const,
  list: (filters: EmployerFilters) => [...employerQueryKeys.lists(), filters] as const,
  details: () => [...employerQueryKeys.all, "detail"] as const,
  detail: (id: string) => [...employerQueryKeys.details(), id] as const,
  states: () => [...employerQueryKeys.all, "states"] as const,
  applicant: (id: string) => [...employerQueryKeys.all, "applicant", id] as const,
  reviews: (id: string) => [...employerQueryKeys.all, "reviews", id] as const,
};

export const useEmployers = (filters: EmployerFilters = {}) => {
  return useQuery({
    queryKey: employerQueryKeys.list(filters),
    queryFn: () => {
      return employerApi.getEmployers(filters);
    },
    staleTime: 1000 * 60 * 5,
    retry: (failureCount, error: Error) => {
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

export const useEmployerDetails = (id: string) => {
  return useQuery({
    queryKey: employerQueryKeys.detail(id),
    queryFn: () => employerApi.getEmployerById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
    retry: 1,
    retryDelay: 1000,
  });
};

export const useApplicantDetails = (id: string) => {
  return useQuery({
    queryKey: employerQueryKeys.applicant(id),
    queryFn: () => employerApi.getApplicantById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
    retry: (failureCount, error: Error) => {
      if (error.message.includes("HTTP 401")) {
        return false;
      }
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

export const useCompanyReviews = (id: string) => {
  return useQuery({
    queryKey: employerQueryKeys.reviews(id),
    queryFn: () => employerApi.getCompanyReviews(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
    retry: (failureCount, error: Error) => {
      if (error.message.includes("HTTP 401")) {
        return false;
      }
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

type DeleteCompanyReviewResponse = {
  success: boolean;
  message: string;
};

export const deleteCompanyReview = async (
  companyId: string,
  reviewId: string
): Promise<DeleteCompanyReviewResponse> => {
  return apiDelete(`/api/admin/employers/${companyId}/${reviewId}/review`);
};
