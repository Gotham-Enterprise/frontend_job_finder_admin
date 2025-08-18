import { useMutation, useQuery } from '@tanstack/react-query';
import { batchUpdateIdApprovalStatus, idApprovalApi, updateIdApprovalStatus } from '../api/idApproval';
import { IdApprovalBatchUpdate, IdApprovalFilters, IdApprovalStatusUpdate } from '../types/idApproval';

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


export const useGetIdApprovals = (filters: IdApprovalFilters) => {
  return useQuery({
    retry,
    retryDelay,
    staleTime,
    queryKey: idApprovalQueryKeys.list(),
    queryFn: () => {
      return idApprovalApi.getIdApprovals(filters);
    },
  });
};

export const useIdApprovalUpdateStatus = () => {
  return useMutation({
    mutationFn: (data: IdApprovalStatusUpdate) => updateIdApprovalStatus(data),
  });
};

export const useIdApprovalBatchUpdateStatus = () => {
  return useMutation({
    mutationFn: (data: IdApprovalBatchUpdate) => batchUpdateIdApprovalStatus(data),
  });
};