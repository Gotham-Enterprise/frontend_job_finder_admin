import { useQuery } from '@tanstack/react-query';
import { workFacilityApi } from '../api/workFacility';

export const workFacilityQueryKeys = {
  all: ['workFacilities'] as const,
  lists: () => [...workFacilityQueryKeys.all, 'list'] as const,
  list: () => [...workFacilityQueryKeys.lists()] as const,
};

export const useWorkFacilities = () => {
  return useQuery({
    queryKey: workFacilityQueryKeys.list(),
    queryFn: () => {
      return workFacilityApi.getWorkFacilityList();
    },
    staleTime: 1000 * 60 * 10,
    retry: (failureCount, error: Error) => {
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};
