import { useQuery } from '@tanstack/react-query';
import { idApprovalApi } from '../api/idApproval';

export const idApprovalQueryKeys = {
  all: ['idApprovals'] as const,
  lists: () => [...idApprovalQueryKeys.all, 'list'] as const,
  list: () => [...idApprovalQueryKeys.lists()] as const,
};

const staleTime = 1000 * 60 * 5; // 5 minutes
const retry = (failureCount: number, error: Error) => {
  if (error.message.includes('HTTP 401')) {
    return false; 
  }
  return failureCount < 3; 
}
const retryDelay = (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000);


export const useGetIdApprovals = () => {
  return useQuery({
    retry,
    retryDelay,
    staleTime,
    queryKey: idApprovalQueryKeys.list(),
    queryFn: () => {
      return idApprovalApi.getIdApprovals();
    },
  });
};