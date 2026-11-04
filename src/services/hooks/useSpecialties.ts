import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { specialtyApi } from '../api/specialty';
import { CreateSpecialtyPayload, UpdateSpecialtyPayload } from '../types/specialty';
import { occupationQueryKeys } from './useOccupations';
import { showToast } from '../utils/toast';

export const specialtyQueryKeys = {
  all: ['specialties'] as const,
  byOccupation: (occupationId: number) =>
    [...specialtyQueryKeys.all, 'occupation', occupationId] as const,
};

export const useSpecialtiesByOccupationQuery = (occupationId: number | null | undefined) => {
  return useQuery({
    queryKey: specialtyQueryKeys.byOccupation(occupationId || 0),
    queryFn: () => specialtyApi.getSpecialtiesByOccupation(occupationId as number),
    enabled: Boolean(occupationId && occupationId > 0),
    staleTime: 1000 * 60 * 2,
    refetchOnWindowFocus: false,
  });
};

export const useCreateSpecialty = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateSpecialtyPayload) => specialtyApi.createSpecialty(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: specialtyQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: occupationQueryKeys.all });
      showToast.success(
        'Specialization Created',
        `Specialization "${data.data?.name || 'New Specialization'}" was added successfully.`
      );
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message || error?.message || 'Failed to create specialization.';
      showToast.error('Creation Failed', errorMessage);
    },
  });
};

export const useUpdateSpecialty = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateSpecialtyPayload }) =>
      specialtyApi.updateSpecialty(id, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: specialtyQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: occupationQueryKeys.all });
      showToast.success(
        'Specialization Updated',
        `Specialization "${data.data?.name || ''}" was updated successfully.`
      );
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message || error?.message || 'Failed to update specialization.';
      showToast.error('Update Failed', errorMessage);
    },
  });
};

export const useDeleteSpecialty = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => specialtyApi.deleteSpecialty(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: specialtyQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: occupationQueryKeys.all });
      showToast.success('Specialization Deleted', 'The specialization was deleted successfully.');
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message || error?.message || 'Failed to delete specialization.';
      showToast.error('Delete Failed', errorMessage);
    },
  });
};

