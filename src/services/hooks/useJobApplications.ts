import { useQuery, useMutation } from '@tanstack/react-query';
import { jobApplicationApi } from '../api/jobApplication';
import { JobApplicationFilters } from '../types/jobApplication';

export const jobApplicationQueryKeys = {
  all: ['jobApplications'] as const,
  lists: () => [...jobApplicationQueryKeys.all, 'list'] as const,
  list: (filters: JobApplicationFilters) => [...jobApplicationQueryKeys.lists(), filters] as const,
  details: () => [...jobApplicationQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...jobApplicationQueryKeys.details(), id] as const,
};

export const useJobApplications = (filters: JobApplicationFilters = {}) => {
  return useQuery({
    queryKey: jobApplicationQueryKeys.list(filters),
    queryFn: () => {
      return jobApplicationApi.getJobApplications(filters);
    },
    staleTime: 1000 * 60 * 5, 
    retry: (failureCount, error: Error) => {
      if (error.message.includes('HTTP 401')) {
        return false;
      }
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

export const useJobApplicationDetails = (id: string) => {
  return useQuery({
    queryKey: jobApplicationQueryKeys.detail(id),
    queryFn: () => jobApplicationApi.getJobApplicationById(id),
    enabled: !!id, 
    staleTime: 1000 * 60 * 5,
    retry: (failureCount, error: Error) => {
      if (error.message.includes('HTTP 401')) {
        return false;
      }
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

export const useViewApplicationResume = () => {
  return useMutation({
    mutationFn: (resumeObjectKey: string) => jobApplicationApi.viewResume(resumeObjectKey),
    onError: (error) => {
      console.error('Failed to view resume:', error);
    },
  });
};
