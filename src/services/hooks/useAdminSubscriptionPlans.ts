import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { subscriptionPlanApi } from '../api/subscriptionPlan';
import { AdminPlanFilters, CustomPlanPayload } from '../types/subscriptionPlan';
import { showToast } from '../utils/toast';

export const subscriptionPlanQueryKeys = {
  all: ['admin-subscription-plans'] as const,
  list: (filters: AdminPlanFilters) => [...subscriptionPlanQueryKeys.all, filters] as const,
};

const errorMessage = (error: unknown, fallback: string) => {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
};

export const useAdminSubscriptionPlans = (filters: AdminPlanFilters) => {
  return useQuery({
    queryKey: subscriptionPlanQueryKeys.list(filters),
    queryFn: () => subscriptionPlanApi.getPlans(filters),
    staleTime: 0,
    refetchOnWindowFocus: false,
  });
};

export const useCreateCustomPlan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CustomPlanPayload) => subscriptionPlanApi.createPlan(payload),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: subscriptionPlanQueryKeys.all });
      showToast.success('Plan created', response.message || `${response.data.name} is ready to assign.`);
    },
    onError: (error: unknown) => {
      showToast.error('Plan not created', errorMessage(error, 'Failed to create the custom plan.'));
    },
  });
};

export const useUpdateCustomPlan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: CustomPlanPayload }) =>
      subscriptionPlanApi.updatePlan(id, payload),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: subscriptionPlanQueryKeys.all });
      showToast.success('Plan updated', response.message || `${response.data.name} was updated.`);
    },
    onError: (error: unknown) => {
      showToast.error('Plan not updated', errorMessage(error, 'Failed to update the custom plan.'));
    },
  });
};

export const useUpdateCustomPlanStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isActive }: { id: number; isActive: boolean }) =>
      subscriptionPlanApi.updateStatus(id, isActive),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: subscriptionPlanQueryKeys.all });
      showToast.success('Plan updated', response.message || 'Plan status updated.');
    },
    onError: (error: unknown) => {
      showToast.error('Plan not updated', errorMessage(error, 'Failed to update the plan status.'));
    },
  });
};
