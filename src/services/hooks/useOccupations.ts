import { useQuery } from '@tanstack/react-query';
import { occupationApi } from '../api/occupation';

export const occupationQueryKeys = {
  all: ['occupations'] as const,
  lists: () => [...occupationQueryKeys.all, 'list'] as const,
  list: () => [...occupationQueryKeys.lists()] as const,
};

export const useOccupations = () => {
  return useQuery({
    queryKey: occupationQueryKeys.list(),
    queryFn: () => {
      return occupationApi.getOccupationList();
    },
    staleTime: 1000 * 60 * 10,
    retry: (failureCount, error: Error) => {
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};
