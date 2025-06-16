import { useQuery } from '@tanstack/react-query';
import { clinicSizeApi } from '../api/clinicSize';

export const clinicSizeQueryKeys = {
  all: ['clinicSizes'] as const,
  lists: () => [...clinicSizeQueryKeys.all, 'list'] as const,
  list: () => [...clinicSizeQueryKeys.lists()] as const,
};

export const useClinicSizes = () => {
  return useQuery({
    queryKey: clinicSizeQueryKeys.list(),
    queryFn: () => {
      return clinicSizeApi.getClinicSizeList();
    },
    staleTime: 1000 * 60 * 10,
    retry: (failureCount, error: Error) => {
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};
