import { useQuery } from '@tanstack/react-query';
import { teamApi } from '../api/team';

export const teamQueryKeys = {
  all: ['team'] as const,
  lists: () => [...teamQueryKeys.all, 'list'] as const,
  list: (employerId: string) => [...teamQueryKeys.lists(), employerId] as const,
};

export const useTeamMembers = (employerId: string) => {
  return useQuery({
    queryKey: teamQueryKeys.list(employerId),
    queryFn: () => teamApi.getTeamMembers(employerId),
    enabled: !!employerId,
    staleTime: 1000 * 60 * 5,
    retry: (failureCount, error: Error) => {
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};
