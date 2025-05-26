import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { jobSeekerApi } from '../api/jobSeeker';
import { JobSeekerFilters, JobSeeker } from '../types/jobSeeker';

export const jobSeekerQueryKeys = {
  all: ['jobSeekers'] as const,
  lists: () => [...jobSeekerQueryKeys.all, 'list'] as const,
  list: (filters: JobSeekerFilters) => [...jobSeekerQueryKeys.lists(), filters] as const,
  details: () => [...jobSeekerQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...jobSeekerQueryKeys.details(), id] as const,
  stats: () => [...jobSeekerQueryKeys.all, 'stats'] as const,
};

export const useJobSeekers = (filters: JobSeekerFilters = {}) => {
  return useQuery({
    queryKey: jobSeekerQueryKeys.list(filters),
    queryFn: () => {
      return jobSeekerApi.getJobSeekers(filters);
    },
    staleTime: 1000 * 60 * 5, 
    retry: (failureCount, error: Error) => {
    
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};



