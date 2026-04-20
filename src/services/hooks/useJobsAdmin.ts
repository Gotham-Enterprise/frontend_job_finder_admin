import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { jobsAdminApi } from "../api/jobsAdmin";
import { JobsAdminFilters } from "../types/jobsAdmin";

export const jobsAdminQueryKeys = {
  all: ["jobsAdmin"] as const,
  lists: () => [...jobsAdminQueryKeys.all, "list"] as const,
  list: (filters: JobsAdminFilters) => [...jobsAdminQueryKeys.lists(), filters] as const,
  details: () => [...jobsAdminQueryKeys.all, "detail"] as const,
  detail: (id: string) => [...jobsAdminQueryKeys.details(), id] as const,
  occupations: () => [...jobsAdminQueryKeys.all, "occupations"] as const,
};

export const useJobsAdmin = (filters: JobsAdminFilters = {}) => {
  return useQuery({
    queryKey: jobsAdminQueryKeys.list(filters),
    queryFn: () => {
      return jobsAdminApi.getJobs(filters);
    },
    staleTime: 0,
    gcTime: 1000 * 60 * 5,
    retry: (failureCount, error: Error) => {
      if (error.message.includes("HTTP 401")) {
        return false;
      }
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

export const useJobsAdminDetails = (id: string) => {
  return useQuery({
    queryKey: jobsAdminQueryKeys.detail(id),
    queryFn: () => jobsAdminApi.getJobById(id),
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

export const useJobsAdminOccupations = () => {
  return useQuery({
    queryKey: jobsAdminQueryKeys.occupations(),
    queryFn: () => jobsAdminApi.getOccupations(),
    staleTime: 1000 * 60 * 10,
    retry: (failureCount, error: Error) => {
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

export const useSoftDeleteJob = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => jobsAdminApi.softDeleteJob(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: jobsAdminQueryKeys.lists() });
    },
  });
};
