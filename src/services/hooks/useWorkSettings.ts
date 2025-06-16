import { useQuery } from '@tanstack/react-query';
import { workSettingsApi } from '../api/workSettings';

export const workSettingsQueryKeys = {
  all: ['workSettings'] as const,
  lists: () => [...workSettingsQueryKeys.all, 'list'] as const,
  list: () => [...workSettingsQueryKeys.lists()] as const,
};

export const useWorkSettings = () => {
  return useQuery({
    queryKey: workSettingsQueryKeys.list(),
    queryFn: () => {
      return workSettingsApi.getWorkSettingsList();
    },
    staleTime: 1000 * 60 * 10,
    retry: (failureCount, error: Error) => {
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};
