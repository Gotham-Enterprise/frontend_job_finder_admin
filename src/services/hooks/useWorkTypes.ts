import { useQuery } from '@tanstack/react-query';
import { workTypeApi } from '../api/workType';

export const workTypeQueryKeys = {
  all: ['workTypes'] as const,
  lists: () => [...workTypeQueryKeys.all, 'list'] as const,
  list: () => [...workTypeQueryKeys.lists()] as const,
};

export const useWorkTypes = () => {
  return useQuery({
    queryKey: workTypeQueryKeys.list(),
    queryFn: () => {
      return workTypeApi.getWorkTypeList();
    },
    staleTime: 1000 * 60 * 10,
    retry: (failureCount, error: Error) => {
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};
