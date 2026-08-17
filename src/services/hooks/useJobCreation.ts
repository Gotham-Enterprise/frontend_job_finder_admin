import { useQuery } from '@tanstack/react-query';
import { jobCreationApi } from '../api/jobCreation';

export const jobCreationQueryKeys = {
  all: ['job-creation'] as const,
  occupations: (includeAll = false) =>
    [...jobCreationQueryKeys.all, 'occupations', { includeAll }] as const,
};

export const useOccupationsWithSpecialties = (options?: { includeAll?: boolean }) => {
  const includeAll = options?.includeAll ?? false;
  return useQuery({
    queryKey: jobCreationQueryKeys.occupations(includeAll),
    queryFn: () => jobCreationApi.getOccupationsWithSpecialties({ includeAll }),
    staleTime: 1000 * 60 * 10,
    retry: (failureCount, error: Error) => {
      console.error('Error fetching occupations with specialties:', error);
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};
