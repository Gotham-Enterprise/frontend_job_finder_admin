import { useQuery } from '@tanstack/react-query';
import { shiftTypeApi } from '../api/shiftType';

export const shiftTypeQueryKeys = {
  all: ['shiftTypes'] as const,
  lists: () => [...shiftTypeQueryKeys.all, 'list'] as const,
  list: () => [...shiftTypeQueryKeys.lists()] as const,
};

export const useShiftTypes = () => {
  return useQuery({
    queryKey: shiftTypeQueryKeys.list(),
    queryFn: () => {
      return shiftTypeApi.getShiftTypeList();
    },
    staleTime: 1000 * 60 * 10,
    retry: (failureCount, error: Error) => {
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};
