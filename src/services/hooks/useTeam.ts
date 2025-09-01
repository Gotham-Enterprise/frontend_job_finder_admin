import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { teamApi } from '../api/team';
import { showToast } from '../utils/toast';

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

export const useAddTeamMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ employerId, formData }: { employerId: string; formData: FormData }) => 
      teamApi.addTeamMember(employerId, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamQueryKeys.all });
    },
  });
};

export const useUpdateTeamMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, employerUserId, formData }: { id: string; employerUserId: string; formData: FormData }) => 
      teamApi.updateTeamMember(id, employerUserId, formData),
    onSuccess: () => {

      queryClient.invalidateQueries({ queryKey: teamQueryKeys.all });
    },
  });
};

export const useUpdateTeamMemberStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ employerId, teamMemberId, status }: { 
      employerId: string; 
      teamMemberId: string; 
      status: 'active' | 'inactive'; 
    }) => {
      return teamApi.updateTeamMemberStatus(employerId, teamMemberId, { status });
    },
    onSuccess: (_, { status }) => {
      queryClient.invalidateQueries({ queryKey: teamQueryKeys.all });
      const action = status === 'active' ? 'activated' : 'deactivated';
      showToast.success('Status Updated', `Team member has been ${action} successfully.`);
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || error?.message || 'Failed to update team member status';
      showToast.error('Update Failed', message);
    },
  });
};
