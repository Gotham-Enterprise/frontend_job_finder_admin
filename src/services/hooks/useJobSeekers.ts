import { useQuery, useMutation } from '@tanstack/react-query';
import { jobSeekerApi } from '../api/jobSeeker';
import { JobSeekerFilters } from '../types/jobSeeker';

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
      if (error.message.includes('HTTP 401')) {
        return false;
      }
      console.error('Error fetching job seekers:', error);
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

export const useJobSeekerDetails = (id: string) => {
  return useQuery({
    queryKey: jobSeekerQueryKeys.detail(id),
    queryFn: () => jobSeekerApi.getJobSeekerById(id),
    enabled: !!id, 
    staleTime: 1000 * 60 * 5,
    retry: (failureCount, error: Error) => {
  
      if (error.message.includes('HTTP 401')) {
        console.error('Authentication error - not retrying:', error);
        return false;
      }
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

export const useViewResume = () => {
  return useMutation({
    mutationFn: (resumeId: string) => jobSeekerApi.viewResume(resumeId),
    onError: (error) => {
      console.error('Failed to view resume:', error);
    },
  });
};



