import { useQuery } from '@tanstack/react-query';
import { employerApi } from '../api/employer';
import { employerQueryKeys } from './useEmployers';

export const useEmployerStates = () => {
  return useQuery({
    queryKey: employerQueryKeys.states(),
    queryFn: () => {
      return employerApi.getEmployerStates();
    },
    staleTime: 1000 * 60 * 10, 
    retry: (failureCount, error: Error) => {
      console.error('Error fetching employer states:', error);
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};
