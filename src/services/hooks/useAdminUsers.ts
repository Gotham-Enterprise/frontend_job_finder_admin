import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminUsersApi, CreateAdminUserRequest, UpdateAdminUserRequest, DeleteUsersRequest, CreateRoleRequest } from '@/services/api/adminUsers';
import { showToast } from '@/services/utils/toast';

export const useAdminUsers = () => {
  return useQuery({
    queryKey: ['adminUsers'],
    queryFn: async () => {
      try {
        console.log('Attempting to fetch from API...');
        const response = await adminUsersApi.getUsers();
        console.log('API Response:', response);
        return response;
      } catch (error: any) {
        console.error('API Error:', error);
        
        // If it's a 500 error or network error, use mock data
        if (error?.status === 500 || error?.code === 'NETWORK_ERROR' || !error?.response) {
          console.warn('Backend API unavailable (500 error or network issue), using mock data');
          
          // Return mock data with same structure as API
          return {
            success: true,
            data: [
              {
                userId: '1',
                email: 'john.doe@company.com',
                name: 'John Doe',
                role: 'admin',
                status: 'active' as const,
                avatarUrl: undefined,
                access: {
                  'Tickets': { add: true, edit: true, view: true, delete: true },
                  'Job Seekers': { add: true, edit: true, view: true, delete: true },
                  'Employers': { add: true, edit: true, view: true, delete: true },
                  'Applications': { add: true, edit: true, view: true, delete: true },
                  'Coupons': { add: true, edit: true, view: true, delete: true },
                  'Blog': { add: true, edit: true, view: true, delete: true },
                  'Careers': { add: true, edit: true, view: true, delete: true }
                }
              },
              {
                userId: '2',
                email: 'jane.smith@company.com',
                name: 'Jane Smith',
                role: 'manager',
                status: 'active' as const,
                avatarUrl: undefined,
                access: {
                  'Tickets': { add: true, edit: true, view: true, delete: false },
                  'Job Seekers': { add: true, edit: true, view: true, delete: false },
                  'Employers': { add: true, edit: true, view: true, delete: false },
                  'Applications': { add: true, edit: true, view: true, delete: false },
                  'Coupons': { add: false, edit: false, view: true, delete: false },
                  'Blog': { add: true, edit: true, view: true, delete: false },
                  'Careers': { add: true, edit: true, view: true, delete: false }
                }
              },
              {
                userId: '3',
                email: 'bob.wilson@company.com',
                name: 'Bob Wilson',
                role: 'user',
                status: 'inactive' as const,
                avatarUrl: undefined,
                access: {
                  'Tickets': { add: false, edit: false, view: true, delete: false },
                  'Job Seekers': { add: false, edit: false, view: true, delete: false },
                  'Employers': { add: false, edit: false, view: true, delete: false },
                  'Applications': { add: false, edit: false, view: true, delete: false },
                  'Coupons': { add: false, edit: false, view: false, delete: false },
                  'Blog': { add: false, edit: false, view: true, delete: false },
                  'Careers': { add: false, edit: false, view: true, delete: false }
                }
              }
            ]
          };
        }
        
        // Re-throw other errors
        throw error;
      }
    },
    select: (data) => data.data,
    staleTime: 5 * 60 * 1000,
    retry: (failureCount, error: any) => {
      // Don't retry on 500 errors - use mock data instead
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
