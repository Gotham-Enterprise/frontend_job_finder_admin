import { useQuery } from '@tanstack/react-query';
import { stateApi } from '../api/state';

export const stateQueryKeys = {
  all: ['states'] as const,
  lists: () => [...stateQueryKeys.all, 'list'] as const,
  list: () => [...stateQueryKeys.lists()] as const,
};

export const useStates = () => {
  return useQuery({
    queryKey: stateQueryKeys.list(),
    queryFn: () => {
      return stateApi.getStateList();
    },
    staleTime: 1000 * 60 * 10,
    retry: (failureCount, error: Error) => {
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};
