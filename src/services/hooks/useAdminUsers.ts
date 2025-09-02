import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminUsersApi, CreateAdminUserRequest, UpdateAdminUserRequest, DeleteUsersRequest, CreateRoleRequest } from '@/services/api/adminUsers';
import { showToast } from '@/services/utils/toast';

export const useAdminUsers = (page: number = 1, limit: number = 10) => {
  return useQuery({
    queryKey: ['adminUsers', page, limit],
    queryFn: async () => {
      try {
        const response = await adminUsersApi.getUsers(page, limit);
        return response;
      } catch (error: any) {
       
        throw error;
      }
    },
    select: (data) => data,
    staleTime: 5 * 60 * 1000,
    retry: (failureCount, error: any) => {

      if (error?.status === 500) {
        return false;
      }
      return failureCount < 2;
    },
  });
};

export const useCreateAdminUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userData: CreateAdminUserRequest) => adminUsersApi.createUser(userData),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
        showToast.success('Success', 'User created successfully');
      } else {
        showToast.error('Error', 'Failed to create user');
      }
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to create user';
      showToast.error('Error', message);
    },
  });
};

export const useUpdateAdminUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, userData }: { userId: string; userData: UpdateAdminUserRequest }) =>
      adminUsersApi.updateUser(userId, userData),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
        showToast.success('Success', 'User updated successfully');
      } else {
        showToast.error('Error', 'Failed to update user');
      }
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to update user';
      showToast.error('Error', message);
    },
  });
};

export const useDeleteAdminUsers = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userIds: string[]) => adminUsersApi.deleteUsers(userIds),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
        showToast.success('Success', response.message || 'Users deleted successfully');
      } else {
        showToast.error('Error', 'Failed to delete users');
      }
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to delete users';
      showToast.error('Error', message);
    },
  });
};

export const useAdminRoles = () => {
  return useQuery({
    queryKey: ['adminRoles'],
    queryFn: async () => {
      try {
        return await adminUsersApi.getRoles();
      } catch (error) {
        console.warn('Roles API not available, using mock data:', error);
        return {
          success: true,
          data: [
            { id: 1, roleName: 'Super Admin', access: {} },
            { id: 2, roleName: 'Manager', access: {} },
            { id: 3, roleName: 'User', access: {} },
            { id: 4, roleName: 'Content Creator', access: {} },
            { id: 5, roleName: 'Viewer', access: {} }
          ]
        };
      }
    },
    select: (data) => data.data,
    staleTime: 10 * 60 * 1000,
  });
};

export const useCreateRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (roleData: CreateRoleRequest) => adminUsersApi.createRole(roleData),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ['adminRoles'] });
        showToast.success('Success', 'Role created successfully');
      } else {
        showToast.error('Error', 'Failed to create role');
      }
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to create role';
      showToast.error('Error', message);
    },
  });
};
