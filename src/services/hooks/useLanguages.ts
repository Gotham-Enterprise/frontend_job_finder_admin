import { useQuery } from '@tanstack/react-query';
import { languageApi } from '../api/language';

export const languageQueryKeys = {
  all: ['languages'] as const,
  lists: () => [...languageQueryKeys.all, 'list'] as const,
  list: () => [...languageQueryKeys.lists()] as const,
};

export const useLanguages = () => {
  return useQuery({
    queryKey: languageQueryKeys.list(),
    queryFn: () => {
      return languageApi.getLanguageList();
    },
    staleTime: 1000 * 60 * 10,
    retry: (failureCount, error: Error) => {
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};
