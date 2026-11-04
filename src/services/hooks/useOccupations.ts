import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { occupationApi } from '../api/occupation';
import {
  OccupationQueryParams,
  CreateOccupationPayload,
  UpdateOccupationPayload,
} from '../types/occupation';
import { showToast } from '../utils/toast';

export const occupationQueryKeys = {
  all: ['occupations'] as const,
  lists: () => [...occupationQueryKeys.all, 'list'] as const,
  list: (params?: OccupationQueryParams) =>
    [...occupationQueryKeys.lists(), params ? JSON.stringify(params) : 'all'] as const,
  detail: (id: number) => [...occupationQueryKeys.all, 'detail', id] as const,
};

// Legacy hook kept for backward compatibility with LinkModal
export const useOccupations = () => {
  return useQuery({
    queryKey: occupationQueryKeys.list(),
    queryFn: () => occupationApi.getOccupationList(),
    staleTime: 1000 * 60 * 10,
    retry: (failureCount, error: Error) => {
      console.error('Error fetching occupations:', error);
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

export const useOccupationsQuery = (params: OccupationQueryParams = {}) => {
  return useQuery({
    queryKey: occupationQueryKeys.list(params),
    queryFn: () => occupationApi.getOccupations(params),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 2,
    refetchOnWindowFocus: false,
  });
};

export const useOccupationById = (id: number) => {
  return useQuery({
    queryKey: occupationQueryKeys.detail(id),
    queryFn: () => occupationApi.getOccupationById(id),
    enabled: Boolean(id),
  });
};

export const useCreateOccupation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateOccupationPayload) => occupationApi.createOccupation(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: occupationQueryKeys.all });
      showToast.success(
        'Occupation Created',
        `Occupation "${data.data?.name || 'New Occupation'}" was created successfully.`
      );
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message || error?.message || 'Failed to create occupation.';
      showToast.error('Creation Failed', errorMessage);
    },
  });
};

export const useUpdateOccupation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateOccupationPayload }) =>
      occupationApi.updateOccupation(id, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: occupationQueryKeys.all });
      showToast.success(
        'Occupation Updated',
        `Occupation "${data.data?.name || ''}" was updated successfully.`
      );
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message || error?.message || 'Failed to update occupation.';
      showToast.error('Update Failed', errorMessage);
    },
  });
};

export const useDeleteOccupation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => occupationApi.deleteOccupation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: occupationQueryKeys.all });
      showToast.success('Occupation Deleted', 'The occupation was deleted successfully.');
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message || error?.message || 'Failed to delete occupation.';
      showToast.error('Delete Failed', errorMessage);
    },
  });
};
