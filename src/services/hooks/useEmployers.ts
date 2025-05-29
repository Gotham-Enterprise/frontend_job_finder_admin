import { useQuery } from '@tanstack/react-query';
import { employerApi } from '../api/employer';
import { EmployerFilters } from '../types/employer';

export const employerQueryKeys = {
  all: ['employers'] as const,
  lists: () => [...employerQueryKeys.all, 'list'] as const,
  list: (filters: EmployerFilters) => [...employerQueryKeys.lists(), filters] as const,
  details: () => [...employerQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...employerQueryKeys.details(), id] as const,
  states: () => [...employerQueryKeys.all, 'states'] as const,
};

export const useEmployers = (filters: EmployerFilters = {}) => {
  return useQuery({
    queryKey: employerQueryKeys.list(filters),
    queryFn: () => {
      return employerApi.getEmployers(filters);
    },
    staleTime: 1000 * 60 * 5, 
    retry: (failureCount, error: Error) => {
      console.error('Error fetching employers:', error);
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};
