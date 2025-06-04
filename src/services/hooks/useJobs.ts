import { useQuery } from '@tanstack/react-query';
import { jobAPI } from '../api/job';
import { JobDetailsFilters } from '../types/job';

export const useJobDetails = (jobId: string, filters?: JobDetailsFilters) => {
  return useQuery({
    queryKey: ['job-details', jobId, filters],
    queryFn: () => jobAPI.getJobDetails(jobId, filters),
    enabled: !!jobId,
    staleTime: 5 * 60 * 1000, 
    gcTime: 10 * 60 * 1000,
  });
};
