import { useQuery } from '@tanstack/react-query';
import { jobCreationApi } from '../api/jobCreation';

export const jobCreationQueryKeys = {
  all: ['job-creation'] as const,
  occupations: () => [...jobCreationQueryKeys.all, 'occupations'] as const,
};

export const useOccupationsWithSpecialties = () => {
  return useQuery({
    queryKey: jobCreationQueryKeys.occupations(),
    queryFn: () => jobCreationApi.getOccupationsWithSpecialties(),
    staleTime: 1000 * 60 * 10,
    retry: (failureCount, error: Error) => {
      console.error('Error fetching occupations with specialties:', error);
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};
